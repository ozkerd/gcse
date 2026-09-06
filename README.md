# gcse.primerllm.com — AI Adaptive GCSE Learning Platform

`gcse.primerllm.com` is an end-to-end AI-powered adaptive GCSE revision, diagnostic testing, target grade tracking, and dynamic question generation platform built for Cloudflare Workers & Pages.

---

## 🌟 Key Features

1. **Student Dashboard & Target Grade Engine**: Set target grade goals (Grade 1–9), view daily revision progress, streak tracking, and estimated current level.
2. **Diagnostic Placement Engine**: 10-15 question baseline test that evaluates current student grade and builds a custom revision timetable.
3. **Adaptive AI Question Engine**: Continuously analyzes correct/incorrect answers, isolates knowledge gaps, and dynamically synthesizes fresh exam-style questions (with LaTeX formulas and mark schemes).
4. **"Daha Fazla Bilgi" (Deep Conceptual Analysis)**: Instant educational breakdown providing concept overviews, step-by-step solutions, common GCSE exam pitfalls, examiner tips, and interactive micro-practice checks.
5. **Question Crawler & Ingestion Tool**: Python ingestion script (`scripts/crawler/scrape_questions.py`) to crawl external question banks or parse past papers into Cloudflare D1.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Lucide Icons + KaTeX (LaTeX Math Rendering)
- **Backend / Edge**: Cloudflare Workers / Cloudflare Pages (`@cloudflare/next-on-pages`)
- **Database**: Cloudflare D1 (Edge SQLite) + Drizzle ORM
- **Deployment & Subdomain**: `gcse.primerllm.com` via Cloudflare DNS

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

## ☁️ Deployment to Cloudflare & Domain Binding (`gcse.primerllm.com`)

### 1. Build and Preview Cloudflare Pages
```bash
npm run pages:build
npm run preview
```

### 2. Deploy to Cloudflare Pages / Workers
```bash
npx wrangler pages deploy .vercel/output/static --project-name gcse-primerllm
```

### 3. Subdomain Setup in Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** $\rightarrow$ **Workers & Pages**.
2. Select `gcse-primerllm`.
3. Go to **Custom Domains** $\rightarrow$ Add `gcse.primerllm.com`.
4. Cloudflare automatically handles SSL/TLS and routes traffic to the Worker!

---

## 🐍 Web Crawler & Past Paper Ingestion

To scrape or ingest external GCSE past papers into JSON/D1 format:

```bash
python3 scripts/crawler/scrape_questions.py --file path/to/past_paper.txt --subject maths --output parsed_maths.json
```
