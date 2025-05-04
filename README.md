# 📘 Auto-Journal Browser Extension

AI-powered browsing activity logger and summarizer that helps you remember and organize what you learn online.

## ✨ Description

Auto-Journal is an AI-powered browser extension that passively logs your browsing activity, summarizes content using Gemini 2.0 Flash Lite, and organizes it into a searchable personal knowledge journal. It helps knowledge workers track what they've read, reflect on it, and extract key insights from their daily web browsing.

## 🚀 Live Demo

Visit our website: [https://chirag127.github.io/Auto-Journal-Browser-Extension](https://chirag127.github.io/Auto-Journal-Browser-Extension)

## 🧪 Features

- **Auto-Logging**: Automatically logs page visits, titles, and timestamps
- **AI Summarization**: Uses Gemini 2.0 Flash Lite to summarize visited pages
- **Highlight & Save**: Save selected text as thoughts or snippets with AI-generated notes
- **Journal View**: Searchable daily journal of browsing activity
- **Tags & Categorization**: Auto-tags pages and supports manual categorization
- **Privacy Controls**: Private by default with domain blacklisting and pause functionality

## 🛠️ Tech Stack / Tools Used

- **Frontend**: Browser Extension (Manifest V3) with HTML, CSS, and Vanilla JS
- **Backend**: Express.js server with MongoDB for storage
- **AI**: Gemini 2.0 Flash Lite API for content summarization
- **Tools**: Node.js, npm, Git

## Project Structure

```
Auto-Journal-Browser-Extension/
├── extension/                # Browser extension source
│   ├── manifest.json        # Extension configuration
│   ├── background.js        # Background script for tracking and API communication
│   ├── content.js           # Content script for page data extraction and highlighting
│   ├── popup.html           # HTML structure for the popup UI
│   ├── popup.js             # JavaScript for popup functionality
│   ├── styles.css           # CSS for styling the popup and highlights
│   ├── icons/               # Extension icons
│   ├── utils/               # Utility functions
│   │   ├── storage.js       # Storage utility
│   │   ├── api.js           # API communication utility
│   │   └── dom.js           # DOM manipulation utility
│   └── components/          # UI components
├── backend/                  # Node.js backend
│   ├── server.js            # Main Express.js server
│   ├── config/              # Configuration files
│   │   ├── db.js            # MongoDB connection
│   │   └── gemini.js        # Gemini API configuration
│   ├── routes/              # API routes
│   │   ├── logRoutes.js     # Routes for logging browsing data
│   │   ├── summaryRoutes.js # Routes for AI summarization
│   │   ├── journalRoutes.js # Routes for journal retrieval
│   │   └── tagRoutes.js     # Routes for tag management
│   ├── controllers/         # Route controllers
│   │   ├── logController.js     # Controller for logging functionality
│   │   ├── summaryController.js # Controller for summarization
│   │   ├── journalController.js # Controller for journal management
│   │   └── tagController.js     # Controller for tag management
│   ├── models/              # MongoDB schemas
│   │   ├── journalEntry.js  # Schema for journal entries
│   │   ├── tag.js           # Schema for tags and categories
│   │   └── user.js          # Schema for user data (future)
│   ├── utils/               # Utility functions
│   │   ├── tagging.js       # Tag management utilities
│   │   └── textProcessing.js # Text processing utilities
│   └── middleware/          # Express middleware
│       └── errorHandler.js  # Error handling middleware
├── .env.example             # Example environment variables
└── README.md                # Project documentation
```

## 📦 Installation Instructions

### Extension

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder

### Backend

1. Navigate to the `backend` folder
2. Run `npm install` to install dependencies
3. Create a `.env` file based on `.env.example`
4. Run `npm start` to start the server

## 🔧 Usage

1. **Browse Normally**: Auto-Journal works in the background, automatically logging pages you visit and generating summaries.
2. **Highlight Text**: Select any text on a webpage, right-click, and choose "Save to Auto-Journal" to save it as a highlight.
3. **View Your Journal**: Click the Auto-Journal icon in your browser toolbar to open the popup and view your journal entries.
4. **Search and Filter**: Use the search bar and filters to find specific entries by keyword, tag, or date.
5. **Manage Privacy**: Use the settings tab to blacklist domains, toggle logging, or manage your data.

## 📸 Screenshots

_Coming soon_

## Development

### Prerequisites

- Node.js and npm
- MongoDB (local or Atlas)
- Gemini API key

### Setup

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Configure environment variables in `.env`
4. Start the development server: `npm run dev`

## API Endpoints

### Logging

- `POST /api/log` - Log a page visit
- `GET /api/log/stats` - Get logging statistics

### Summarization

- `POST /api/summarize` - Summarize page content
- `POST /api/summarize/highlight` - Summarize highlighted text

### Journal

- `GET /api/journal` - Get all journal entries
- `GET /api/journal/search` - Search journal entries
- `GET /api/journal/:url` - Get a specific journal entry by URL
- `DELETE /api/journal/:url` - Delete a journal entry
- `POST /api/journal/highlight` - Add a highlight to a journal entry

### Tags

- `GET /api/tags` - Get all tags
- `PATCH /api/tags/:url` - Update tags for a journal entry
- `GET /api/tags/categories` - Get all tag categories

## Data Models

### Journal Entry

```javascript
{
  userId: String,  // For future multi-user support
  url: String,
  title: String,
  favicon: String,  // Store favicon URL for visual identification
  visitTime: Date,
  content: {
    text: String,  // First 500-1000 words of content
    summary: String,  // AI-generated summary
  },
  highlights: [{
    text: String,
    note: String,  // AI-generated note or user note
    timestamp: Date
  }],
  tags: [String],
  category: String,
  domain: String,  // Extracted from URL for filtering
  isPrivate: Boolean  // Flag for privacy control
}
```

## Future Enhancements

- GPT-style chatbot that can answer "What did I read last week about AI?"
- Auto-export to GitHub
- Mood/tone detection of content consumed
- Graph view of reading connections (à la Roam/Obsidian)
- OAuth2 login support for syncing across devices

## 🙌 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🪪 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
