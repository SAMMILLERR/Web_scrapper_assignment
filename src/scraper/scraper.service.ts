import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly logger = new Logger(ScraperService.name);

  constructor(private readonly configService: ConfigService) {}

  /** 
   * Fetches HTML, parses it, and returns structured data.
   */
  async scrape(url: string): Promise<ScrapedData> {
    this.logger.log(`Starting scrape operation for URL: ${url}`);
    
    const timeout = this.configService.get<number>('scraper.timeout') || 5000;
    const userAgent = this.configService.get<string>('scraper.userAgent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    
    this.logger.debug(`Using timeout: ${timeout}ms, User-Agent: ${userAgent}`);
    
    let html: string;
    try {
      this.logger.debug(`Making HTTP request to: ${url}`);
      const response = await axios.get<string>(url, {
        headers: {
          'User-Agent': userAgent,
        },
        timeout,
      });
      html = response.data;
      this.logger.log(`Successfully fetched HTML content (${html.length} characters) from: ${url}`);
    } catch (err: any) {
      this.logger.error(`Failed to fetch URL ${url}: ${err.message}`, err.stack);
      throw new HttpException(
        `Failed to fetch URL ${url}: ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.debug('Loading HTML content into Cheerio parser');
    // Load into cheerio
    const $ = cheerio.load(html);

    this.logger.debug('Extracting page title');
    // Extract title
    const title = $('head > title').text().trim();
    this.logger.debug(`Found title: "${title}"`);

    this.logger.debug('Extracting headings (h1-h6)');
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
    this.logger.debug(`Found ${headings.length} headings`);

    this.logger.debug('Extracting paragraphs');
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
    this.logger.debug(`Found ${paragraphs.length} paragraphs`);

    this.logger.debug('Extracting links');
    // Extract links using a for loop
    const links: { href: string; text: string }[] = [];
    const linkElements = $('a[href]').get();
    for (let i = 0; i < linkElements.length; i++) {
      const elem = linkElements[i];
      const href = $(elem).attr('href') || '';
      const text = $(elem).text().trim();
      links.push({ href, text });
    }
    this.logger.debug(`Found ${links.length} links`);

    const result = { title, headings, paragraphs, links };
    this.logger.log(`Successfully scraped content from ${url} - Title: "${title}", Headings: ${headings.length}, Paragraphs: ${paragraphs.length}, Links: ${links.length}`);
    
    return result;
  }

 async scrapeAndSave(url: string): Promise<{ message: string; filePath: string }> {
    this.logger.log(`Starting scrapeAndSave operation for URL: ${url}`);
    
    // 1. Scrape the data
    const data = await this.scrape(url);

    // 2. Build a safe, unique filename
    this.logger.debug('Building filename from URL');
    const siteUrl = new URL(url);
    const hostname = siteUrl.hostname.replace(/[^a-zA-Z0-9.-]/g, '-'); // Sanitize
    const timestamp = Date.now();
    const fileName = `scraped-${hostname}-${timestamp}.json`;
    this.logger.debug(`Generated filename: ${fileName}`);

    // 3. Build the target file path
    const filePath = join(process.cwd(), 'scraped', fileName);
    this.logger.debug(`Target file path: ${filePath}`);

    // 4. Serialize the scraped data
    this.logger.debug('Serializing scraped data to JSON');
    const json = JSON.stringify(data, null, 2);
    this.logger.debug(`JSON size: ${json.length} characters`);

    // 5. Write to disk safely
    try {
      this.logger.debug(`Writing data to file: ${filePath}`);
      
      // Ensure the scraped directory exists
      const scrapedDir = join(process.cwd(), 'scraped');
      await fs.mkdir(scrapedDir, { recursive: true });
      this.logger.debug(`Ensured directory exists: ${scrapedDir}`);
      
      await fs.writeFile(filePath, json, 'utf8');
      this.logger.log(`Successfully saved scraped data to: ${fileName}`);
    } catch (err: any) {
      this.logger.error(`Failed to write file ${fileName}: ${err.message}`, err.stack);
      throw new HttpException(
        `Failed to write file ${fileName}: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 6. Return a message
    const result = {
      message: `Data successfully written to ${fileName}`,
      filePath,
    };
    
    this.logger.log(`Completed scrapeAndSave operation for ${url} - File: ${fileName}`);
    return result;
  }
}
