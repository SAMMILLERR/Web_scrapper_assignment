import { IsNotEmpty, IsUrl } from 'class-validator';
import { IsSafeUrl } from '../validators/is-safe-url';

export class ScrapeDto {
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsSafeUrl({ message: 'URL must be HTTPS and not point to a private address' })
  url: string;
}
