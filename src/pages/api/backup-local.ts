export const prerender = false;

import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";
import { Readable } from "stream";

const SECRET_CODE = import.meta.env.ADMIN_SECRET_CODE || "CICI2026";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const adminCode = url.searchParams.get("code");

  if (adminCode !== SECRET_CODE) {
    return new Response("Unauthorized", { status: 401 });
  }

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `cici-mandarin-${timestamp}.zip`;

  const stream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk) => {
        controller.enqueue(chunk);
      });

      archive.on("end", () => {
        controller.close();
      });

      archive.on("error", (err) => {
        controller.error(err);
      });
    },
  });

  // Start archiving
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "src/data");
  let uploadDir = process.env.UPLOAD_DIR;

  if (!uploadDir) {
    uploadDir = path.join(process.cwd(), "public/uploads/articles");
    if (!fs.existsSync(uploadDir)) {
      uploadDir = path.join(process.cwd(), "uploads");
    }
  }

  if (fs.existsSync(dataDir)) {
    archive.directory(dataDir, "data");
  }

  if (fs.existsSync(uploadDir)) {
    archive.directory(uploadDir, "uploads");
  }

  archive.finalize();

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
