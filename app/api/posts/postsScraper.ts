import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPost {
  author: string;
  //   activity: string;
  //   body: string;
  //   before_seemore: string;
  //   media: ImagePost[];
  //   number_of_comments: number;
  //   number_of_likes: number; // get more details on it required user interaction
  //   number_of_shares: number;
}

export default async function handler(url: string) {
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

    // Step 1: Find the <article> that contains an <h1>
    const targetSection = $("section")
      .filter((_, el) => {
        return $(el).find("h1").length > 0;
      })
      .first();

    // Step 2: Within this section, find the element with the desired class
    const targetElement = targetSection.find(
      ".base-main-feed-card__entity-lockup"
    );

    // Step 3: Extract and clean the text
    const extractedText = targetElement.text().trim();

    const postInfo: ScrapedPost = {
      author: extractedText,
    };

    return postInfo;
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      success: false,
      error: "An unknown error occurred",
    };
  }
}
