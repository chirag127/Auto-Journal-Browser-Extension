# Auto-Journal Installation Guide

This guide will walk you through the process of installing and setting up the Auto-Journal browser extension and backend.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)
- [Git](https://git-scm.com/downloads)
- A Gemini API key from [Google AI Studio](https://ai.google.dev/)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/chirag127/Auto-Journal-Browser-Extension.git
cd Auto-Journal-Browser-Extension
```

### 2. Install Dependencies

Install all dependencies for both the backend and extension:

```bash
npm run install:all
```

### 3. Configure the Backend

Create a `.env` file in the `backend` directory based on the provided `.env.example`:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file and add your MongoDB connection string and Gemini API key:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/auto-journal
# For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/auto-journal

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# CORS Configuration
ALLOWED_ORIGINS=chrome-extension://your-extension-id,http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret_for_future_auth
```

### 4. Start the Backend Server

Start the backend server:

```bash
cd ..  # Return to the root directory
npm start
```

The server should now be running at http://localhost:3000.

### 5. Install the Browser Extension

#### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click "Load unpacked" and select the `extension` folder from the cloned repository
4. The Auto-Journal extension should now be installed and visible in your extensions list

#### Firefox (Coming Soon)

Support for Firefox is planned for a future release.

#### Edge

1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode" by toggling the switch in the left sidebar
3. Click "Load unpacked" and select the `extension` folder from the cloned repository
4. The Auto-Journal extension should now be installed and visible in your extensions list

### 6. Configure the Extension

1. Click on the Auto-Journal extension icon in your browser toolbar
2. Go to the settings tab (gear icon)
3. Configure your preferences:
   - Enable/disable logging
   - Enable/disable content capture
   - Configure blacklisted domains

## Troubleshooting

### Backend Issues

- **MongoDB Connection Error**: Make sure MongoDB is running and the connection string in `.env` is correct
- **API Key Error**: Verify your Gemini API key is valid and properly formatted
- **Port Already in Use**: Change the PORT value in `.env` if port 3000 is already in use

### Extension Issues

- **Extension Not Loading**: Make sure you selected the correct folder when loading the unpacked extension
- **API Connection Error**: Ensure the backend server is running and accessible
- **Storage Error**: Try clearing the extension's storage and restarting the browser

## Next Steps

- Browse the web and see your activity logged in the journal
- Highlight text on webpages to save important snippets
- Search and filter your journal entries
- Export your journal data for backup

For more information, refer to the [README.md](README.md) file.
