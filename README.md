# CourseShelf

Free, legal textbook access for UW Bothell — powered by AI.

**Live site:** https://courseshelf-rho.vercel.app
**Repository:** https://github.com/jmnguyen03/CSS382_DYOP

---

## Team

| Name | GitHub |
|---|---|
| Julia Nguyen | [@jmnguyen03](https://github.com/jmnguyen03) |
| Taggart Vowels | [@vowels52](https://github.com/vowels52) |
| Vanshika Singh | [@vans2004](https://github.com/vans2004) |

---

## UW Community Impact

UWB students need textbooks they often can't afford. Finding free, legal copies means searching OpenStax, library reserves, and course pages across multiple disconnected sites — with no guarantee a free version exists for their specific course.

CourseShelf solves this by combining the UWB course catalog with scraped open-access textbook data (OpenStax and similar sources), then using AI semantic search to surface the most relevant free resource for any course or query. Students can browse by department, search by course code or topic, and directly access free legal copies — without the guesswork.

---

## AI Integration

The AI feature is a **semantic search engine** over course descriptions and textbook resources, built on vector embeddings stored in Supabase via `pgvector`.

**How it works:**

1. **Embedding pipeline** — Course descriptions and textbook metadata are embedded using Sentence-Transformers and stored as `vector` columns in Supabase (`courses.embedding`, `resources.embedding`).
2. **Query embedding** — When a user searches, the query is embedded using the same model.
3. **Similarity search** — A cosine similarity lookup against the pgvector index returns the top matching courses and resources, ranked by semantic relevance rather than keyword overlap.
4. **Results** — Displayed alongside the standard catalog view. Matching textbook sources link directly to free, legal copies (OpenStax, open library, etc.).

This is embedded in the main search experience — not a sidecar chatbot. The search bar on the home page triggers the semantic pipeline when a user's query exceeds a minimum length, falling back to keyword search for short queries.

The database schema includes `embedding vector`, `content_hash`, `freely_readable boolean`, and `last_check_at` columns to support freshness checks and deduplication across scraped resources.

---

## Features

- **Semantic search** — AI-powered search across courses and free textbook resources
- **Course catalog** — Full UWB course listings seeded from the official catalog, browsable by department
- **Department & major explorer** — Browse UWB's schools (BUS, EDU, IAS, NHS, STEM) and their courses
- **Professor directory** — Faculty listings linked to their departments and courses
- **Free textbook links** — Scraped open-access resources (OpenStax and others) matched to courses
- **My Schedule** — Log in and save courses to a personal quarter-by-quarter schedule
- **Submission form** — Students can submit free resource links for courses not yet covered
- **Auth** — Account creation and login via Supabase

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| UI components | Radix UI, MUI, Lucide icons |
| Routing | React Router v7 |
| Backend / DB | Supabase (PostgreSQL + pgvector + Auth) |
| AI / Embeddings | Sentence-Transformers (embedding pipeline) |
| Scraping | OpenStax scraper → Supabase |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema and pgvector extension applied

### Environment variables

Create a `.env.local` file in the project root (do **not** commit this file):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Install and run

```bash
npm i
npm run dev
```

Dev server runs at `http://localhost:5173`.

---

## Project Structure

```
app/
  pages/        # Route-level components (Home, Courses, Departments, Professors, Schedule, etc.)
  components/   # Shared layout and UI primitives
  context/      # Auth context (Supabase session)
  data/         # Static seed / fixture data
  lib/          # Supabase client setup
  routes.tsx    # App router configuration
index.html
main.tsx
vite.config.ts
```

---

## Milestone History

| Week | Milestone | Status |
|---|---|---|
| 7 | Repo setup, Supabase schema design, Figma mockups | Done |
| 8 | UI built, Supabase client connected, routing fixed | Done |
| 9 | UWB catalog data seeded, department pages, search, schedule | Done |
| 10 | Login/signup, auth-gated schedule persistence, final deployment | Done |
