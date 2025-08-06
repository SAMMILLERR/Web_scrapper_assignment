import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ScraperService } from './scraper.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScraperService', () => {
  let service: ScraperService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'scraper.timeout': 5000,
                'scraper.userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'output.fileName': 'scraped-data.json',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should scrape basic HTML successfully', async () => {
    const mockHtml = `
      <html>
        <head><title>Test</title></head>
        <body>
          <h1>Heading</h1>
          <p>Paragraph</p>
          <a href="https://example.com">Link</a>
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await service.scrape('https://test.com');

    expect(mockedAxios.get).toHaveBeenCalledWith('https://test.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      timeout: 5000,
    });

    expect(result).toEqual(
      expect.objectContaining({
        title: 'Test',
        headings: expect.arrayContaining(['Heading']),
        paragraphs: expect.arrayContaining(['Paragraph']),
        links: expect.arrayContaining([
          { href: 'https://example.com', text: 'Link' },
        ]),
      }),
    );
  });

  it('should throw HttpException if axios fails', async () => {
    const errorMessage = 'Network down';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

    await expect(service.scrape('https://bad.com')).rejects.toThrow(
      `Failed to fetch URL https://bad.com: ${errorMessage}`
    );
  });

  it('should handle empty HTML gracefully', async () => {
    const mockHtml = '<html><head></head><body></body></html>';
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await service.scrape('https://empty.com');

    expect(result).toEqual({
      title: '',
      headings: [],
      paragraphs: [],
      links: [],
    });
  });

  it('should handle HTML with multiple headings and paragraphs', async () => {
    const mockHtml = `
      <html>
        <head><title>Multi Content</title></head>
        <body>
          <h1>First Heading</h1>
          <h2>Second Heading</h2>
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <a href="/relative">Relative Link</a>
          <a href="https://absolute.com">Absolute Link</a>
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await service.scrape('https://multi.com');

    expect(result.title).toBe('Multi Content');
    expect(result.headings).toHaveLength(2);
    expect(result.paragraphs).toHaveLength(2);
    expect(result.links).toHaveLength(2);
    expect(result.headings).toContain('First Heading');
    expect(result.headings).toContain('Second Heading');
  });

  it('should filter out empty text content', async () => {
    const mockHtml = `
      <html>
        <head><title>Test Filter</title></head>
        <body>
          <h1>Valid Heading</h1>
          <h2>   </h2>
          <h3></h3>
          <p>Valid paragraph</p>
          <p>   </p>
          <p></p>
          <a href="https://example.com">Valid Link</a>
          <a href="https://empty.com">   </a>
        </body>
      </html>
    `;

    mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

    const result = await service.scrape('https://filter.com');

    expect(result.headings).toEqual(['Valid Heading']);
    expect(result.paragraphs).toEqual(['Valid paragraph']);
    expect(result.links).toHaveLength(2); // Both links are included, but one has empty text
  });

});
