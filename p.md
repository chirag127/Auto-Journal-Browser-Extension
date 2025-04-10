Here’s a **Product Requirements Document (PRD)** for **Idea #13: Auto-Journal – AI-powered Browsing Activity Logger & Summarizer** as a browser extension:

---

## 📝 Product Requirements Document (PRD)

---

### 📌 Title
**Auto-Journal** – AI-powered Browsing Activity Logger & Summarizer

---

### 📣 Problem Statement
Modern knowledge workers consume vast amounts of content daily across websites, blogs, tutorials, and documentation. However, most of this information is quickly forgotten or lost. Users have no easy way to track what they've read, reflect on it, or extract key insights.

---

### 🎯 Objective
Build a cross-browser extension that passively logs user browsing activity, summarizes the content using AI, and organizes it into a searchable personal knowledge journal stored in MongoDB.

---

### 🔍 Key Features

#### 1. **Auto-Logging**
- Logs page visits, titles, and timestamps automatically.
- Optionally captures the first 500–1000 words of visible text.

#### 2. **AI Summarization**
- Uses **Gemini 2.0 Flash Lite** to summarize each visited page.
- Runs summarization on backend via Express.js API.

#### 3. **Highlight & Save**
- Allows users to highlight any text and save it as a “thought” or snippet.
- AI generates a short note or summary from the highlight.

#### 4. **Journal View**
- Displays a daily journal of what was browsed with timestamps, page titles, and summaries.
- Searchable by keyword, tag, or date.

#### 5. **Tags & Categorization**
- Auto-tags pages using content categories (e.g., Tech, Health, Design).
- Users can manually tag or re-categorize entries.

#### 6. **Privacy Controls**
- Private by default — no syncing to cloud unless explicitly enabled.
- Toggle to pause logging or exclude specific domains (e.g., bank, email).

---

### 🧱 Tech Stack

#### Frontend (Browser Extension)
- **Manifest V3** (compatible with Chrome, Firefox, Edge)
- HTML + CSS + Vanilla JS
- Uses `content_scripts` to detect page loads and extract data
- Uses `chrome.storage` (or `browser.storage` for Firefox) for local cache
- Sends data to backend via `fetch` (secured)

#### Backend (AI + Storage)
- **Express.js** server
- **Gemini 2.0 Flash Lite** API for summarization
- **MongoDB** (hosted on MongoDB Atlas or Render) for persistent journal storage
- RESTful endpoints:
  - `POST /log`: receives browsing data
  - `POST /summarize`: runs AI summarization
  - `GET /journal`: retrieves logs for the user
  - `PATCH /tags`: update tags on entries

---

### 📁 Project Structure

```
auto-journal/
├── extension/            # Browser extension source
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   └── styles.css
├── backend/              # Node.js backend
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── utils/
└── README.md
```

---

### 🔐 Security & Privacy
- No sensitive user data (passwords, personal messages) is logged.
- Whitelist/blacklist system to control logging.
- Only summarized + selected content stored.
- Future OAuth2 login support for syncing across devices.

---

### 📅 Milestones

| Milestone | Description | ETA |
|----------|-------------|-----|
| M1 | Browser extension logs visited pages + sends to backend | Week 1 |
| M2 | Backend integrates with Gemini API and stores in MongoDB | Week 2 |
| M3 | Journal view and popup UI | Week 3 |
| M4 | Highlight + AI summary of selected text | Week 4 |
| M5 | Tags, search, and privacy controls | Week 5 |
| M6 | Testing and cross-browser support (Edge, Firefox) | Week 6 |

---

### 🧪 other Goals
- GPT-style chatbot that can answer “What did I read last week about AI?”
- Auto-export to github
- Mood/tone detection of content consumed
- Graph view of reading connections (à la Roam/Obsidian)
