import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("🔥 UPLOAD ROUTE LOADED");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    console.log("🔥 ENV EMAIL:", clientEmail);
    console.log("🔥 ENV KEY EXIST:", !!privateKey);

    if (!clientEmail || !privateKey) {
      throw new Error("Missing Google Drive credentials");
    }

    // File -> Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Buffer -> Stream (🔥 FIX CỐT LÕI)
    const stream = Readable.from(buffer);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    const uploadRes = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: stream, // ✅ PHẢI LÀ STREAM
      },
    });

    const fileId = uploadRes.data.id;
    if (!fileId) {
      throw new Error("Failed to upload file to Drive");
    }

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

    return NextResponse.json({
      provider: "google-drive",
      fileId,
      url: fileUrl,
      mimeType: file.type,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
