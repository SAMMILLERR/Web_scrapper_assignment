# Web Scraper API - NestJS

A RESTful API built with NestJS that scrapes web pages and extracts structured data including titles, headings, paragraphs, and links. The scraped data can be saved to a local JSON file.

## 🚀 Features

- **Web Scraping**: Extract structured data from any webpage
- **Data Extraction**: Captures titles, headings (h1-h6), paragraphs, and links
- **File Storage**: Automatically saves scraped data to a JSON file
- **Error Handling**: Robust error handling for invalid URLs and network issues
- **Clean Architecture**: Built with NestJS modular structure

## 🛠️ Tech Stack

- **Framework**: NestJS
- **HTTP Client**: Axios
- **HTML Parser**: Cheerio
- **Runtime**: Node.js
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- NestJS CLI (optional): `npm install -g @nestjs/cli`

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd web-scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```

4. **Verify the application is running**
   ```
   Application should be running on http://localhost:3000
   ```

## 📚 API Documentation

### Endpoint

**POST** `/scraper/scrape`

Scrapes a webpage and saves the extracted data to a local JSON file.

#### Request

- **Method**: POST
- **URL**: `http://localhost:3000/scraper/scrape`
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "url": "https://example.com"
}
```

#### Response

```json
{
  "message": "Data successfully written to scraped-data.json",
  "filePath": "/path/to/your/project/scraped-data.json"
}
```

#### Error Responses

**400 Bad Request** - Missing or invalid URL
```json
{
  "statusCode": 400,
  "message": "URL is required in request body"
}
```

**502 Bad Gateway** - Failed to fetch webpage
```json
{
  "statusCode": 502,
  "message": "Failed to fetch URL https://example.com: Network Error"
}
```

## 📁 Output File Structure

The scraped data is saved to `scraped-data.json` in the project root with the following structure:

```json
{
  "title": "Page Title",
  "headings": [
    "Main Heading",
    "Subheading 1",
    "Subheading 2"
  ],
  "paragraphs": [
    "First paragraph content...",
    "Second paragraph content..."
  ],
  "links": [
    {
      "href": "https://example.com/link1",
      "text": "Link Text 1"
    },
    {
      "href": "https://example.com/link2",
      "text": "Link Text 2"
    }
  ]
}
```

## 🧪 Testing

### Using Postman

1. **Set up the request**:
   - Method: `POST`
   - URL: `http://localhost:3000/scraper/scrape`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "url": "https://example.com"
     }
     ```

2. **Send the request** and verify:
   - You receive a success response
   - A `scraped-data.json` file is created in the project root
   - The file contains the extracted data

### Using cURL

```bash
curl -X POST http://localhost:3000/scraper/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## 📂 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
└── scraper/
    ├── scraper.controller.ts  # API endpoint controller
    ├── scraper.service.ts     # Business logic service
    ├── scraper.service.spec.ts # Unit tests
    └── scraper.module.ts      # Scraper module
```

## 🔍 What Gets Scraped

The scraper extracts the following elements from web pages:

- **Title**: The `<title>` tag content
- **Headings**: All heading tags (h1, h2, h3, h4, h5, h6)
- **Paragraphs**: All `<p>` tag content
- **Links**: All `<a>` tags with href attributes (both URL and link text)

## ⚠️ Limitations

- **Static Content Only**: Works best with server-side rendered HTML
- **JavaScript-Heavy Sites**: May not capture content loaded dynamically with JavaScript
- **Rate Limiting**: Some websites may block automated requests
- **Authentication**: Cannot scrape login-protected content
- **Anti-Bot Protection**: Sites with Cloudflare or similar protection may block requests

