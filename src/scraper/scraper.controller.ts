import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('scrape')
  async scrapePost(@Body('url') url: string): Promise<{ message: string; filePath: string }> {
    if (!url) {
      throw new BadRequestException('URL is required in request body');
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    return await this.scraperService.scrapeAndSave(url);
  }
}
