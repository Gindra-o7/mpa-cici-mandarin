import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import { getArticles, saveArticles, getUploadDir } from "../../utils/data";

export const prerender = false;

const UPLOAD_DIR = getUploadDir();

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const GET: APIRoute = async () => {
  const articles = getArticles();
  return new Response(JSON.stringify(articles), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const data: Record<string, any> = {};

    // Get slug early to create directory
    const slug = formData.get("slug")?.toString();

    // Process form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Handle file upload
        if (value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          // Sanitize filename and add timestamp to avoid collisions
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(value.name);
          // Simple sanitize
          const safeName = path.basename(value.name, ext).replace(/[^a-z0-9]/gi, "_");
          const filename = `${safeName}-${uniqueSuffix}${ext}`;

          // Determine upload directory: uses slug if available, else root
          const targetDir = slug ? path.join(UPLOAD_DIR, slug) : UPLOAD_DIR;

          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const filePath = path.join(targetDir, filename);

          fs.writeFileSync(filePath, buffer);

          const publicUrl = slug ? `/uploads/articles/${slug}/${filename}` : `/uploads/articles/${filename}`;

          // If key starts with 'block_img_', it belongs to a content block
          data[key] = publicUrl;
        }
      } else {
        data[key] = value;
      }
    }

    // Reconstruct contentBlocks if present
    if (data.contentBlocksJSON) {
      try {
        let blocks = JSON.parse(data.contentBlocksJSON);
        // Map uploaded images to their blocks
        blocks = blocks.map((block: any) => {
          if (block.type === "image" && block.fileKey && data[block.fileKey]) {
            // Replace temporary ID with actual uploaded URL
            return { ...block, value: data[block.fileKey] };
          }
          return block;
        });
        data.contentBlocks = blocks;
        delete data.contentBlocksJSON; // Cleanup
      } catch (e) {
        console.error("Failed to parse contentBlocksJSON", e);
      }
    }

    // Validate required fields
    if (!data.slug || !data.title || (!data.content && !data.contentBlocks)) {
      return new Response("Missing required fields", { status: 400 });
    }

    const articles = getArticles();

    // Check if slug exists
    const existingIndex = articles.findIndex((a: any) => a.slug === data.slug);
    if (existingIndex >= 0) {
      // Update existing.
      articles[existingIndex] = { ...articles[existingIndex], ...data };
    } else {
      articles.push(data as any);
    }

    if (saveArticles(articles)) {
      return new Response(JSON.stringify({ success: true, slug: data.slug }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response("Failed to save data file", { status: 500 });
    }
  } catch (error) {
    console.error("Error saving article:", error);
    return new Response("Internal Server Error: " + error, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400 });
    }

    const articles = getArticles();
    const newArticles = articles.filter((a: any) => a.slug !== slug);

    if (articles.length === newArticles.length) {
      return new Response("Article not found", { status: 404 });
    }

    if (saveArticles(newArticles)) {
      // Optional: Delete article directory if exists
      const articleDir = path.join(UPLOAD_DIR, slug);
      if (fs.existsSync(articleDir)) {
        fs.rmSync(articleDir, { recursive: true, force: true });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Failed to save database file", { status: 500 });
  } catch (error) {
    console.error("Error deleting article:", error);
    return new Response("Internal Server Error: " + error, { status: 500 });
  }
};
