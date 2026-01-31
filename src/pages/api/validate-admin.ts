export const prerender = false;

import type { APIRoute } from "astro";

const SECRET_CODE = import.meta.env.ADMIN_SECRET_CODE || "CICI2026"; // Fallback if env not loaded yet

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { code } = body;

    if (code === SECRET_CODE) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Invalid code" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
