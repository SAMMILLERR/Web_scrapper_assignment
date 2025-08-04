import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import { join } from 'path';

export interface ScrapedData {
  title: string;
  headings: string[];
  paragraphs: string[];
  links: { href: string; text: string }[];
}

@Injectable()
export class ScraperService {
  /** 
   * Fetches HTML, parses it, and returns structured data.
   */
  async scrape(url: string): Promise<ScrapedData> {
    let html: string;
    try {
      const response = await axios.get<string>(url);
      html = response.data;
    } catch (err: any) {
      throw new HttpException(
        `Failed to fetch URL ${url}: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
     console.log('HTML length:', html.length);
    // Load into cheerio
    const $ = cheerio.load(html);

    // Extract title
    const title = $('head > title').text().trim();

    // Extract headings using a for loop
    const headings: string[] = [];
    const headingElements = $('h1, h2, h3, h4, h5, h6').get();
    for (let i = 0; i < headingElements.length; i++) {
      const elem = headingElements[i];
      const text = $(elem).text().trim();
      if (text) {
        headings.push(text);
      }
    }

    // Extract paragraphs using a for loop
    const paragraphs: string[] = [];
    const paragraphElements = $('p').get();
    for (let i = 0; i < paragraphElements.length; i++) {
      const elem = paragraphElements[i];
      const text = $(elem).text().trim();
      if (text) {
        paragraphs.push(text);
      }
    }

    // Extract links using a for loop
    const links: { href: string; text: string }[] = [];
    const linkElements = $('a[href]').get();
    for (let i = 0; i < linkElements.length; i++) {
      const elem = linkElements[i];
      const href = $(elem).attr('href') || '';
      const text = $(elem).text().trim();
      links.push({ href, text });
    }

    return { title, headings, paragraphs, links };
  }

 async scrapeAndSave(url: string): Promise<{ message: string; filePath: string }> {
    // 1. Scrape the data
    const data = await this.scrape(url);

    // 2. Build the target file path
    const fileName = 'scraped-data.json';
    const filePath = join(process.cwd(), fileName);

    // 3. Serialize with 2-space indentation
    const json = JSON.stringify(data, null, 2);

    // 4. Write to disk
    try {
      await fs.writeFile(filePath, json, 'utf8');
    } catch (err) {
      throw new HttpException(
        `Failed to write file ${fileName}: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 5. Return success message
    return {
      message: `Data successfully written to ${fileName}`,
      filePath,
    };
  }
}
