import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL === 'debug' 
      ? ['error', 'warn', 'log', 'debug', 'verbose'] 
      : ['error', 'warn', 'log'],
  });
  
  // Enable trust proxy for proper IP detection
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3001;
  
  await app.listen(port);
  
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📡 API Endpoint: POST http://localhost:${port}/scraper/scrape`);
  logger.log(`📝 Log Level: ${process.env.LOG_LEVEL || 'log'}`);
}
bootstrap();
