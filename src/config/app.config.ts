export interface AppConfig {
  port: number;
  scraper: {
    timeout: number;
    userAgent: string;
    maxRequests: number;
    windowMs: number;
  };
  output: {
    fileName: string;
  };
}

export const appConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  scraper: {
    timeout: parseInt(process.env.SCRAPER_TIMEOUT || '5000', 10),
    userAgent: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },
  output: {
    fileName: process.env.OUTPUT_FILE_NAME || 'scraped-data.json',
  },
});
