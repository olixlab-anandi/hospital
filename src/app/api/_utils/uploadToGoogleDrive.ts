import { google } from "googleapis";
import path from "path";
import { Readable } from "stream";
import dotenv from "dotenv";
dotenv.config();

type UploadInput = {
  file: Buffer;
  filename: string;
  mimeType: string;
  id: string; // e.g., userId or patientId
};
const uploadToGoogleDrive = async ({
  file,
  filename,
  mimeType,
  id,
}: UploadInput) => {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : "",
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  let hospitalFolderId = "";
  const hospitalQuery = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='hospital' and trashed=false`,
    fields: "files(id, name)",
  });

  if (hospitalQuery.data.files?.length) {
    hospitalFolderId = hospitalQuery.data.files[0].id!;
  } else {
    const folder = await drive.files.create({
      requestBody: {
        name: "hospital",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    hospitalFolderId = folder.data.id!;
  }

  let profileFolderId = "";
  const profileQuery = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='profilePicture' and '${hospitalFolderId}' in parents and trashed=false`,
    fields: "files(id, name)",
  });
  console.log(profileQuery.data.files?.length, profileQuery);
  if (profileQuery.data.files?.length) {
    profileFolderId = profileQuery.data.files[0].id!;
  } else {
    const folder = await drive.files.create({
      requestBody: {
        name: "profilePicture",
        mimeType: "application/vnd.google-apps.folder",
        parents: [hospitalFolderId],
      },
      fields: "id",
    });
    profileFolderId = folder.data.id!;
  }

  const ext = path.extname(filename);
  const uniqueName = `${id}${ext}`;

  const existingFileRes = await drive.files.list({
    q: `'${profileFolderId}' in parents and name='${uniqueName}' and trashed=false`,
    fields: "files(id, name)",
  });

  if (existingFileRes.data.files?.length) {
    const oldFileId = existingFileRes.data.files[0].id!;
    await drive.files.delete({ fileId: oldFileId });
  }

  const uploaded = await drive.files.create({
    requestBody: {
      name: uniqueName,
      parents: [profileFolderId],
    },
    media: {
      mimeType,
      body: Readable.from(file),
    },
    fields: "id, webViewLink, webContentLink",
  });

  await drive.permissions.create({
    fileId: uploaded.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    originalName: filename,
    storedName: uniqueName,
    type: mimeType,
    id: uploaded.data.id,
    viewLink: uploaded.data.webViewLink,
    downloadLink: uploaded.data.webContentLink,
  };
};

export default uploadToGoogleDrive;

