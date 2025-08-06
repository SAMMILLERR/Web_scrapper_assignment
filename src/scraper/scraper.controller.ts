import { Body, Post, Get, Controller, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScrapeDto } from './dto/scrape.dto';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('scrape')
  async scrapePost(@Body() dto: ScrapeDto): Promise<{ message: string; filePath: string }> {
    const { url } = dto;

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
  @Get('health')
getHealth() {
  return { status: 'ok', uptime: process.uptime() };
}
}
