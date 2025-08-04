import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [ScraperModule],
  controllers: [],   // we’ll add our controller in Module 5
  providers: [],
})
export class AppModule {}
