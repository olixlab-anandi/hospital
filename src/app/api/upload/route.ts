import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import Busboy from "busboy";
import path from "path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { ReadableStream as NodeReadableStream } from "stream/web";

dotenv.config();

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
      // Convert web ReadableStream to Node.js Readable if possible
      if (typeof Readable.fromWeb === "function") {
        const stream = req.body as NodeReadableStream<Uint8Array>;
        Readable.fromWeb(stream).pipe(busboy);
      } else {
        // Fallback for environments without Readable.fromWeb
        const reader = (
          req.body as globalThis.ReadableStream<Uint8Array>
        ).getReader();
        const nodeStream = new Readable({
          async read() {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(value);
            }
          },
        });
        nodeStream.pipe(busboy);
      }
    } else {
      busboy.end();
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const files = await parseFormData(req);

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY
        ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : "",
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Step 1: Find or create root "hospital" folder
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

      // Step 2: Find/create subfolder inside hospital
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

      // 🏷 Generate unique file name
      const fileExt = path.extname(filename);
      const uniqueName = `${reportId}_${fileType}_${randomUUID()}${fileExt}`;

      // 📤 Upload buffer directly to Google Drive
      const uploadRes = await drive.files.create({
        requestBody: {
          name: uniqueName,
          parents: [subfolderId],
        },
        media: {
          mimeType,
          body: Readable.from(file), // stream directly from buffer
        },
        fields: "id, webViewLink, webContentLink",
      });

      // 🌍 Make file public
      await drive.permissions.create({
        fileId: uploadRes.data.id!,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

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
