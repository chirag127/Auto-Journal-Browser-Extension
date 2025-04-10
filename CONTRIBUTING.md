# Contributing to Auto-Journal

Thank you for considering contributing to Auto-Journal! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser and extension version

### Suggesting Enhancements

If you have an idea for an enhancement, please create an issue with the following information:

- A clear, descriptive title
- A detailed description of the enhancement
- Any relevant mockups or examples
- Why this enhancement would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js and npm
- MongoDB (local or Atlas)
- Gemini API key

### Setup

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Create a `.env` file in the `backend` directory based on `.env.example`
4. Start the development server: `npm run dev`

### Extension Development

1. Make changes to the extension code
2. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension` folder

### Backend Development

1. Make changes to the backend code
2. The server will automatically restart when changes are detected (using nodemon)
3. Test your changes with `npm run test:backend`

## Project Structure

```
Auto-Journal-Browser-Extension/
├── extension/                # Browser extension source
│   ├── manifest.json        # Extension configuration
│   ├── background.js        # Background script
│   ├── content.js           # Content script
│   ├── popup.html           # Popup UI
│   ├── popup.js             # Popup functionality
│   ├── styles.css           # Styles
│   ├── icons/               # Extension icons
│   ├── utils/               # Utility functions
│   └── components/          # UI components
├── backend/                  # Node.js backend
│   ├── server.js            # Main server file
│   ├── config/              # Configuration
│   ├── routes/              # API routes
│   ├── controllers/         # Route controllers
│   ├── models/              # MongoDB schemas
│   ├── utils/               # Utility functions
│   └── middleware/          # Express middleware
└── README.md                # Project documentation
```

## Coding Guidelines

- Follow the existing code style
- Write clear, descriptive commit messages
- Add comments for complex logic
- Write tests for new functionality
- Update documentation as needed

## License

By contributing to Auto-Journal, you agree that your contributions will be licensed under the project's MIT License.
