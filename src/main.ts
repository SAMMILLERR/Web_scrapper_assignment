import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on http://localhost:3000');
  console.log('API Endpoint:');
  console.log('- POST /scraper/scrape');
  console.log('  Body: { "url": "https://example.com" }');
  console.log('');
  console.log('File saved to: ' + process.cwd() + '\\scraped-data.json');
}
bootstrap();
