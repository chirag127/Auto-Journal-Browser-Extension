# Auto-Journal API Documentation

This document provides detailed information about the Auto-Journal API endpoints, request/response formats, and authentication.

## Base URL

All API endpoints are relative to the base URL:

```
https://auto-journal-browser-extension.onrender.com/api
```

## Authentication

Authentication is not currently implemented but will be added in a future version. The API will use JWT (JSON Web Tokens) for authentication.

## API Endpoints

### Logging

#### Log a Page Visit

```
POST /log
```

Logs a page visit to the journal.

**Request Body:**

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "text": "This is the page content...",
  "favicon": "https://example.com/favicon.ico"
}
```

**Response:**

```json
{
  "message": "Journal entry created",
  "entry": {
    "url": "https://example.com",
    "title": "Example Domain",
    "domain": "example.com",
    "favicon": "https://example.com/favicon.ico",
    "content": {
      "text": "This is the page content...",
      "summary": ""
    },
    "highlights": [],
    "tags": [],
    "category": "",
    "isPrivate": false,
    "visitTime": "2025-04-10T14:30:00.000Z",
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2025-04-10T14:30:00.000Z",
    "updatedAt": "2025-04-10T14:30:00.000Z"
  }
}
```

#### Get Logging Statistics

```
GET /log/stats
```

Gets statistics about logged pages.

**Response:**

```json
{
  "totalEntries": 42,
  "domainStats": [
    {
      "_id": "example.com",
      "count": 10
    },
    {
      "_id": "github.com",
      "count": 8
    }
  ],
  "categoryStats": [
    {
      "_id": "Technology",
      "count": 15
    },
    {
      "_id": "Business",
      "count": 7
    }
  ],
  "dayStats": [
    {
      "_id": {
        "year": 2025,
        "month": 4,
        "day": 10
      },
      "count": 12
    }
  ]
}
```

### Summarization

#### Summarize Page Content

```
POST /summarize
```

Summarizes page content using Gemini AI.

**Request Body:**

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "text": "This is the page content..."
}
```

**Response:**

```json
{
  "summary": "This is an AI-generated summary of the page content.",
  "tags": ["example", "domain", "web"],
  "category": "Technology",
  "entry": {
    "url": "https://example.com",
    "title": "Example Domain",
    "content": {
      "text": "This is the page content...",
      "summary": "This is an AI-generated summary of the page content."
    },
    "tags": ["example", "domain", "web"],
    "category": "Technology"
  }
}
```

#### Summarize Highlighted Text

```
POST /summarize/highlight
```

Summarizes highlighted text.

**Request Body:**

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "text": "This is the highlighted text..."
}
```

**Response:**

```json
{
  "note": "This is an AI-generated note about the highlight.",
  "highlight": {
    "text": "This is the highlighted text...",
    "note": "This is an AI-generated note about the highlight.",
    "timestamp": "2025-04-10T14:35:00.000Z"
  },
  "message": "Highlight added to journal entry"
}
```

### Journal

#### Get Journal Entries

```
GET /journal
```

Gets all journal entries.

**Query Parameters:**

- `limit` (optional): Maximum number of entries to return (default: 50)
- `skip` (optional): Number of entries to skip (for pagination) (default: 0)
- `sort` (optional): Field to sort by (default: 'visitTime')
- `order` (optional): Sort order ('asc' or 'desc') (default: 'desc')

**Response:**

```json
{
  "entries": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "content": {
        "text": "This is the page content...",
        "summary": "This is an AI-generated summary of the page content."
      },
      "highlights": [],
      "tags": ["example", "domain", "web"],
      "category": "Technology",
      "visitTime": "2025-04-10T14:30:00.000Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "skip": 0
}
```

#### Search Journal Entries

```
GET /journal/search
```

Searches journal entries.

**Query Parameters:**

- `q` (optional): Search query
- `tags` (optional): Comma-separated list of tags to filter by
- `category` (optional): Category to filter by
- `domain` (optional): Domain to filter by
- `startDate` (optional): Start date for date range filter (ISO format)
- `endDate` (optional): End date for date range filter (ISO format)
- `limit` (optional): Maximum number of entries to return (default: 50)
- `skip` (optional): Number of entries to skip (for pagination) (default: 0)

**Response:**

```json
{
  "entries": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "content": {
        "text": "This is the page content...",
        "summary": "This is an AI-generated summary of the page content."
      },
      "highlights": [],
      "tags": ["example", "domain", "web"],
      "category": "Technology",
      "visitTime": "2025-04-10T14:30:00.000Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "skip": 0
}
```

#### Get Journal Entry by URL

```
GET /journal/:url
```

Gets a specific journal entry by URL.

**URL Parameters:**

- `url`: URL-encoded URL of the journal entry

**Response:**

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "content": {
    "text": "This is the page content...",
    "summary": "This is an AI-generated summary of the page content."
  },
  "highlights": [],
  "tags": ["example", "domain", "web"],
  "category": "Technology",
  "visitTime": "2025-04-10T14:30:00.000Z"
}
```

#### Delete Journal Entry

```
DELETE /journal/:url
```

Deletes a journal entry.

**URL Parameters:**

- `url`: URL-encoded URL of the journal entry to delete

**Response:**

```json
{
  "message": "Journal entry deleted"
}
```

#### Add Highlight to Journal Entry

```
POST /journal/highlight
```

Adds a highlight to a journal entry.

**Request Body:**

```json
{
  "url": "https://example.com",
  "text": "This is the highlighted text...",
  "note": "This is a note about the highlight."
}
```

**Response:**

```json
{
  "highlight": {
    "text": "This is the highlighted text...",
    "note": "This is a note about the highlight.",
    "timestamp": "2025-04-10T14:35:00.000Z"
  },
  "message": "Highlight added to journal entry"
}
```

### Tags

#### Get All Tags

```
GET /tags
```

Gets all tags.

**Response:**

```json
[
  {
    "name": "example",
    "category": "Technology",
    "count": 10
  },
  {
    "name": "domain",
    "category": "Technology",
    "count": 8
  },
  {
    "name": "web",
    "category": "Technology",
    "count": 15
  }
]
```

#### Update Tags for a Journal Entry

```
PATCH /tags/:url
```

Updates tags for a journal entry.

**URL Parameters:**

- `url`: URL-encoded URL of the journal entry

**Request Body:**

```json
{
  "tags": ["example", "domain", "web", "reference"]
}
```

**Response:**

```json
{
  "message": "Tags updated",
  "entry": {
    "url": "https://example.com",
    "title": "Example Domain",
    "tags": ["example", "domain", "web", "reference"]
  }
}
```

#### Get All Tag Categories

```
GET /tags/categories
```

Gets all tag categories.

**Response:**

```json
[
  "Technology",
  "Business",
  "Health",
  "Science",
  "Education",
  "Entertainment"
]
```

## Error Responses

All API endpoints return appropriate HTTP status codes and error messages in case of failure.

**Example Error Response:**

```json
{
  "error": "Server error",
  "message": "Journal entry not found"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to 100 requests per 15-minute window.

## CORS

The API implements CORS (Cross-Origin Resource Sharing) to allow requests from the browser extension. The allowed origins are configured in the `.env` file.
