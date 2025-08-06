import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly requestLogs = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(private readonly configService: ConfigService) {
    this.maxRequests = this.configService.get<number>('scraper.maxRequests') || 5;
    this.windowMs = this.configService.get<number>('scraper.windowMs') || 60000;
    
    this.logger.log(`Rate limiter initialized - Max requests: ${this.maxRequests}, Window: ${this.windowMs / 1000}s`);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Better IP detection
    const ip = req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress || 
               (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
               'unknown';
    
    const now = Date.now();
    const timestamps = this.requestLogs.get(ip) || [];

    // Keep only timestamps within window
    const recent = timestamps.filter(t => now - t < this.windowMs);

    // Add current request timestamp
    recent.push(now);

    this.logger.debug(`Rate limit check for IP: ${ip} - ${recent.length}/${this.maxRequests} requests in window`);

    if (recent.length > this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip} - ${recent.length} requests in ${this.windowMs / 1000}s window`);
      throw new HttpException(
        `Rate limit exceeded. Max ${this.maxRequests} requests per ${this.windowMs / 1000}s.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    this.requestLogs.set(ip, recent);
    this.logger.debug(`Rate limit passed for IP: ${ip} - allowing request`);
    next();
  }
}
