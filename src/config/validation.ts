import { plainToInstance, Transform } from 'class-transformer';
import { IsNumber, IsString, IsOptional, Min, Max, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT?: number = 3001;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1000)
  @Max(30000)
  SCRAPER_TIMEOUT?: number = 5000;

  @IsOptional()
  @IsString()
  USER_AGENT?: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  RATE_LIMIT_MAX_REQUESTS?: number = 5;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1000)
  RATE_LIMIT_WINDOW_MS?: number = 60000;

  @IsOptional()
  @IsString()
  OUTPUT_FILE_NAME?: string = 'scraped-data.json';
}

export function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }
  return validatedConfig;
}
