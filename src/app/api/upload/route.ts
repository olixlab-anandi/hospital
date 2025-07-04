import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { promisify } from "util";
import Busboy from "busboy";
import { ReadableStream as NodeReadableStream } from "stream/web";
import { randomUUID } from "crypto";

const writeFile = promisify(fs.writeFile);

type UploadedFile = {
  file: Buffer;
  filename: string;
  mimeType: string;
};

// Parses multiple files from form-data
function parseFormData(req: NextRequest): Promise<UploadedFile[]> {
  return new Promise((resolve) => {
    const busboy = Busboy({ headers: Object.fromEntries(req.headers) });
    const files: UploadedFile[] = [];

    busboy.on("file", (_, file, info) => {
      const fileBuffer: Buffer[] = [];
      const fileName = info.filename;
      const mimeType = info.mimeType;

      file.on("data", (data) => {
        fileBuffer.push(data);
      });

      file.on("end", () => {
        files.push({
          file: Buffer.concat(fileBuffer),
          filename: fileName,
          mimeType,
        });
      });
    });

    busboy.on("finish", () => {
      resolve(files);
    });

    if (req.body) {
      Readable.fromWeb(req.body as NodeReadableStream).pipe(busboy);
    } else {
      busboy.end();
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    //  Get reportId from query string
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const files = await parseFormData(req);

    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "service-account.json"),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    const drive = google.drive({ version: "v3", auth });

    //  Step 1: Find or create root "hospital" folder
    let hospitalFolderId = "";
    const hospitalQuery = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='hospital' and trashed=false`,
      fields: "files(id, name)",
    });

    if (hospitalQuery.data.files && hospitalQuery.data.files.length > 0) {
      hospitalFolderId = hospitalQuery.data.files[0].id!;
    } else {
      const hospitalFolder = await drive.files.create({
        requestBody: {
          name: "hospital",
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      });
      hospitalFolderId = hospitalFolder.data.id!;
    }

    const results = [];

    for (const { file, filename, mimeType } of files) {
      //  Determine folder name based on type
      let folderName = "";
      let fileType = "";
      if (mimeType.startsWith("image/")) {
        folderName = "Uploaded_Images";
        fileType = "image";
      } else if (mimeType === "application/pdf") {
        folderName = "Uploaded_PDFs";
        fileType = "pdf";
      } else if (mimeType.startsWith("video/")) {
        folderName = "Uploaded_Videos";
        fileType = "video";
      } else {
        results.push({ filename, error: "Unsupported file type" });
        continue;
      }

      //  Step 2: Find/create subfolder inside hospital
      let subfolderId = "";
      const subfolderQuery = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${hospitalFolderId}' in parents and trashed=false`,
        fields: "files(id, name)",
      });

      if (subfolderQuery.data.files && subfolderQuery.data.files.length > 0) {
        subfolderId = subfolderQuery.data.files[0].id!;
      } else {
        const subfolder = await drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [hospitalFolderId],
          },
          fields: "id",
        });
        subfolderId = subfolder.data.id!;
      }

      // 🏷 Generate unique file name: <reportId>_<type>_<uuid>.<ext>
      const fileExt = path.extname(filename);
      const uniqueName = `${reportId}_${fileType}_${randomUUID()}${fileExt}`;

      //  Save file temporarily
      const tempPath = path.join(process.cwd(), "uploads", uniqueName);
      await writeFile(tempPath, file);

      //  Upload to Google Drive
      const uploadRes = await drive.files.create({
        requestBody: {
          name: uniqueName,
          parents: [subfolderId],
        },
        media: {
          mimeType,
          body: fs.createReadStream(tempPath),
        },
        fields: "id, webViewLink, webContentLink",
      });

      //  Make file public
      await drive.permissions.create({
        fileId: uploadRes.data.id!,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      //  Delete temp file
      fs.unlinkSync(tempPath);
      results.push({
        originalName: filename,
        storedName: uniqueName,
        type: fileType,
        id: uploadRes.data.id,
        viewLink: uploadRes.data.webViewLink,
        downloadLink: uploadRes.data.webContentLink,
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
