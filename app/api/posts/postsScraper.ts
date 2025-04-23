import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPost {
  author: string;
  activity: string;
  body: string;
  //   before_seemore: string; // same has the body?
  images?: ImagePost[];
  //   number_of_comments: number;
  //   number_of_likes: number; // get more details on it required user interaction
  //   number_of_shares: number;
}

interface ImagePost {
  image_url: string;
  image_alt?: string;
}

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

    // Get the body text
    const body = targetSection
      .find("p.attributed-text-segment-list__content")
      .first()
      .text()
      .trim();

    // Get the images
    const rawImages: ImagePost[] = targetSection
      .find(".w-main-feed-card-media img")
      .map((_, el) => {
        let image_url = $(el).attr("src") || "";
        image_url = image_url.replace(/&amp;/g, "&");
        return {
          image_url,
          image_alt: $(el).attr("alt") || undefined,
        };
      })
      .get();

    // Filter out truly "empty" images
    const images = rawImages.filter((img) => img.image_url !== "");

    return {
      author,
      activity,
      body,
      ...(images.length > 0 && { images }),
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios specific errors
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        throw new Error(
          `HTTP error ${error.response.status}: ${error.response.statusText}`
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error("Network error: No response received from server");
      } else {
        // Something happened in setting up the request
        throw new Error(`Request error: ${error.message}`);
      }
    } else if (error instanceof Error) {
      // For non-Axios errors, pass through the error message
      throw error; // Rethrow the original error to preserve stack trace
    } else {
      // For unknown errors
      throw new Error(`Unknown error: ${String(error)}`);
    }
  }
}
