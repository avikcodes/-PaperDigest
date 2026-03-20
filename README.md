# PaperDigest

> Paste any arXiv link. Get the full picture in seconds.

No more reading 40-page papers to know if they're worth your time.
PaperDigest reads the paper and gives you everything you need in one clean summary card.

![demo](demo.gif)

---

## The Problem

Every day researchers and developers share arXiv papers on X, Reddit, and HN.
You want to know if the paper is relevant to you.
But reading the abstract is not enough and reading the full paper takes hours.

**PaperDigest solves this in under 10 seconds.**

---

## What You Get

For any arXiv paper you get:

| Section | What it tells you |
|---------|------------------|
| 🔍 Problem | What problem does this paper solve |
| ⚙️ Method | What approach or technique did they use |
| 📊 Results | What were the key findings |
| ⚠️ Limitations | What are the limitations |
| ⭐ Should I read this? | Score out of 10 with reason |

---

## How It Works
```
User pastes arXiv URL
        ↓
Extract paper ID from URL
        ↓
Fetch title + abstract from arXiv public API
        ↓
Send abstract to Groq (llama-3.1-8b-instant)
        ↓
Parse structured JSON response
        ↓
Render beautiful summary card
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Model | llama-3.1-8b-instant via Groq |
| Paper Data | arXiv Public API (no key needed) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Groq API key (free at console.groq.com)

### Installation
```bash
git clone https://github.com/avikcodes/PaperDigest
cd PaperDigest/paperdigest
npm install
```

### Setup
```bash
cp .env.example .env.local
```

Add your Groq API key to `.env.local`:
```
GROQ_API_KEY=your_key_here
```

### Run
```bash
npm run dev
```

Open `http://localhost:3000`

---

## Usage

1. Go to arxiv.org and find any paper
2. Copy the URL — example: `https://arxiv.org/abs/2301.07041`
3. Paste it into PaperDigest
4. Click **Digest Paper**
5. Read the summary in 10 seconds

---

## Project Structure
```
paperdigest/
├── app/
│   ├── api/
│   │   └── digest/
│   │       └── route.ts      ← API route: fetches paper + calls Groq
│   ├── page.tsx              ← Main UI
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── arxiv.ts              ← arXiv API integration + XML parser
├── .env.example
└── README.md
```

---

## API Reference

### POST `/api/digest`

**Request:**
```json
{
  "url": "https://arxiv.org/abs/2301.07041"
}
```

**Response:**
```json
{
  "title": "Paper title here",
  "problem": "What problem this solves...",
  "method": "What approach they used...",
  "results": "Key findings...",
  "limitations": "What are the limitations...",
  "score": 8,
  "score_reason": "Why this score..."
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

---

## Roadmap

- [x] arXiv paper fetching
- [x] AI-powered structured summary
- [x] Should I read this score
- [ ] Support for PDF uploads
- [ ] Browser extension
- [ ] Batch digest multiple papers
- [ ] Export summary as PDF

---

## Part of 30 Projects

This is **Project 2 of 30** in my open-source build sprint.

I'm building 30 open-source AI tools for developers and researchers from March to December 2026.

→ Follow the journey on X: [@avikcodes](https://x.com/avikcodes)  
→ All projects: [github.com/avikcodes](https://github.com/avikcodes)

---

## License

MIT — free to use, modify, and distribute.
