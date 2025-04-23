import { NextRequest, NextResponse } from "next/server";
import handler from "./postsScraper";

// Handle POST requests for scraping
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();

    // Check if URL exists in the request body
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate the URL format
    try {
      new URL(body.url);
    } catch (_) {
      return NextResponse.json(
        { success: false, error: "Invalid url" },
        { status: 400 }
      );
    }

    // Check if the URL is a valid HTTP/HTTPS URL
    const url = new URL(body.url);
    if (!["https:"].includes(url.protocol)) {
      return NextResponse.json(
        { success: false, error: "Only HTTPS protocols is supported" },
        { status: 400 }
      );
    }

    // Check if the URL is from a specific domain
    const allowedDomains = process.env.ALLOWED_DOMAINS_FOR_IT?.split(",") ?? [];
    if (!allowedDomains.includes(url.hostname)) {
      return NextResponse.json(
        { error: "Domain not supported" },
        { status: 400 }
      );
    }

    url.search = ""; // Remove query params

    // Call your scraper function
    const results = await handler(url.toString());

    // Return the results
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
