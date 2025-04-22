import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPost {
  author: string;
  activity: string;
  //   body: string;
  //   before_seemore: string;
  //   media: ImagePost[];
  //   number_of_comments: number;
  //   number_of_likes: number; // get more details on it required user interaction
  //   number_of_shares: number;
}

// interface ImagePost {
//   image_url: string;
//   image_alt: string;
// }

export default async function handler(url: string): Promise<ScrapedPost> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 10000, // 10 seconds timeout for the request
    });

    const $ = cheerio.load(response.data);

    // Get info from a specific html structure

    // Find the <article> that contains an <h1>
    const targetSection = $("section")
      .filter((_, el) => {
        return $(el).find("h1").length > 0;
      })
      .first();

    // Get the name and the activity
    const targetElement = targetSection
      .find(".base-main-feed-card__entity-lockup")
      .first();

    const author = targetElement
      .find("a")
      .filter((_, el) => {
        return $(el).text().trim() !== "";
      })
      .text()
      .trim();

    const activity = targetElement.find("p").first().text().trim();

    return {
      author,
      activity,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Axios-specific error (e.g., network issues, non-2xx response)
      throw new Error(`Axios error: ${error.message}`);
    } else if (error instanceof Error) {
      // Generic JS error
      throw new Error(`Unexpected error: ${error.message}`);
    } else {
      // Fallback if error is not an Error object
      throw new Error("An unknown error occurred");
    }
  }
}
