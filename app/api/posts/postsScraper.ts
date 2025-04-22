import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPost {
  h1: string[];
  //   author: string;
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
      /*
    // from claude ai
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    // from a tutorial
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    */
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

    // Extract the <h1> elements to run the minimum test
    const h1Elements: string[] = [];
    $("h1").each((_, element) => {
      h1Elements.push($(element).text().trim());
    });

    const postInfo: ScrapedPost = {
      h1: h1Elements,
    };

    return postInfo;
  } catch (error) {
    console.error("Scraping error:", error);
    return {
      error: "An unknown error occurred",
    };
  }
}
