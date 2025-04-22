import { NextRequest, NextResponse } from "next/server";
import handler from "./postsScraper";

// Handle POST requests for scraping
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();

    // should validate the url if possible

    // Check if URL exists in the request body
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Call your scraper function
    const results = await handler(body.url);

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
