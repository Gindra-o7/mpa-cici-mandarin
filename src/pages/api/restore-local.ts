export const prerender = false;

import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import unzipper from "unzipper";
import { Readable } from "stream";

const SECRET_CODE = import.meta.env.ADMIN_SECRET_CODE || "CICI2026";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("backup") as File;
  const adminCode = request.headers.get("X-Admin-Code");

  if (adminCode !== SECRET_CODE) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!file) {
    return new Response(JSON.stringify({ success: false, message: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temporary directory for extraction
    const tempDir = path.join(process.cwd(), "temp-restore-" + Date.now());
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save buffer to a temp file
    const tempZipPath = path.join(tempDir, "backup.zip");
    fs.writeFileSync(tempZipPath, buffer);

    // Extract
    await fs
      .createReadStream(tempZipPath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    // Move files to destination
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "src/data");
    let uploadDir = process.env.UPLOAD_DIR;

    if (!uploadDir) {
      uploadDir = path.join(process.cwd(), "public/uploads/articles");
      if (!fs.existsSync(uploadDir)) {
        // creating if not exist, although it should be handled by logic below
        // Actually better to define where it SHOULD be if not existing
        uploadDir = path.join(process.cwd(), "public/uploads/articles");
      }
    }

    // Helper to copy directory content
    const copyDir = (src: string, dest: string) => {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      if (fs.existsSync(src)) {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    };

    // Restore data directory
    const extractedDataDir = path.join(tempDir, "data");
    if (fs.existsSync(extractedDataDir)) {
      copyDir(extractedDataDir, dataDir);
    }

    // Restore uploads directory
    const extractedUploadsDir = path.join(tempDir, "uploads");
    if (fs.existsSync(extractedUploadsDir)) {
      copyDir(extractedUploadsDir, uploadDir);
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Backup restored successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Restore error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Restore failed: " + (error.message || "Unknown error"),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
