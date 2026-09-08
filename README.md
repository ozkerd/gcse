# gcse mate — AI Adaptive GCSE Learning Platform

`gcse mate` is an end-to-end AI-powered adaptive GCSE revision, diagnostic testing, target grade tracking, and dynamic question generation platform.

---

## 🌟 Key Features

1. **Student Dashboard & Target Grade Engine**: Set target grade goals (Grade 1–9), view daily revision progress, streak tracking, and estimated current level.
2. **Diagnostic Placement Engine**: 10-15 question baseline test that evaluates current student grade and builds a custom revision timetable.
3. **Adaptive AI Question Engine**: Continuously analyzes correct/incorrect answers, isolates knowledge gaps, and dynamically synthesizes fresh exam-style questions (with LaTeX formulas and mark schemes).
4. **Deep Conceptual Analysis**: Instant educational breakdown providing concept overviews, step-by-step solutions, common GCSE exam pitfalls, examiner tips, and interactive micro-practice checks.
5. **Question Crawler & Ingestion Tool**: Ingestion script to crawl question banks or parse past papers into database.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + KaTeX (LaTeX Math Rendering)
- **Backend / Edge**: Serverless & Edge API Routes
- **Database**: D1 / SQLite + Drizzle ORM
- **Deployment**: Edge Platform

---

## 🚀 Local Development Setup

```bash
# Navigate to project folder
cd gcse-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## ☁️ Deployment & Production Build

### 1. Build and Preview
```bash
npm run build
npm run start
```

### 2. Edge Deploy
```bash
npm run pages:build
```

---

## 🐍 Web Crawler & Past Paper Ingestion

To scrape or ingest external GCSE past papers into JSON/D1 format:

```bash
python3 scripts/crawler/scrape_questions.py --file path/to/past_paper.txt --subject maths --output parsed_maths.json
```
