import fs from "node:fs";
import path from "node:path";

// Define the environment-aware data directory
// In Docker, ENV should be set. Locally, fall back to src/data.
const DATA_DIR_ENV = process.env.DATA_DIR || path.join(process.cwd(), "src/data");
const ARTICLES_FILE = path.join(DATA_DIR_ENV, "articles.json");

// Fallback path (the fixed file inside the container/project)
// In Docker/Prod: /app/src/data/articles.json
const SOURCE_FILE = path.join(process.cwd(), "src/data/articles.json");

export interface Article {
  slug: string;
  title: string;
  publishDate: string;
  coverImage?: string;
  heroImage?: string;
  topic?: string;
  author?: string;
  openingText?: string;
  closingText?: string;
  content?: string;
  contentBlocks?: any[];
  references?: string;
  [key: string]: any;
}

/**
 * Reads all articles.
 * Priority:
 * 1. Persistent file (DATA_DIR/articles.json) - User edits/new posts
 * 2. Source file (src/data/articles.json) - Initial bundled data
 */
export function getArticles(): Article[] {
  try {
    // 1. Try Persistent File
    if (fs.existsSync(ARTICLES_FILE)) {
      const fileContent = fs.readFileSync(ARTICLES_FILE, "utf-8");
      return JSON.parse(fileContent);
    }

    // 2. Try Source File (Fallback for fresh deploy)
    // Only if Persistent doesn't exist yet
    if (fs.existsSync(SOURCE_FILE)) {
      console.log("Loading default articles from source...");
      const fileContent = fs.readFileSync(SOURCE_FILE, "utf-8");
      // Optional: We could auto-copy to persistent here, but let's just return to read.
      // Saving will trigger the write to persistent later.
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading articles:", error);
  }
  return [];
}

/**
 * Writes articles to the persistent JSON file.
 */
export function saveArticles(articles: Article[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR_ENV)) {
      fs.mkdirSync(DATA_DIR_ENV, { recursive: true });
    }
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving articles:", error);
    return false;
  }
}

/**
 * Helper to get the absolute path for uploads (for API usage)
 */
export function getUploadDir(): string {
  // Check if we are in production (dist/server) -> client is in ../../client
  // But process.cwd() is usually /app in Docker.
  // We use the env var set in docker-compose for reliability.
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public/uploads/articles");
}
