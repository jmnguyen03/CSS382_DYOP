# PISAN-Suggest.md

*Produced by Claude.AI on 2026-05-29*

## Project Overview

The repository contains a React + Vite + TypeScript single-page web app titled "CourseRegistry / Academic Course Registration Hub" (see `app/components/Layout.tsx` and `app/pages/Home.tsx`). It reads `departments` and `courses` rows from a Supabase project (`app/lib/supabaseClient.ts`) and renders a generic university course catalog: department list, department detail, and course detail with a non-persistent "Add to Academic Schedule" button. There is no UW-specific data, no AI code path, and no live deployment configuration in the repo.

## Evaluation Against Assignment Specification

Evaluation based only on what is visible in the GitHub repository.

### UW Community Impact (10 pts)

Weak as presented. Nothing in the codebase is UW-specific: hero text says "university catalog," dummy seed in `app/data/courses.ts` references generic departments (Computer Science, Math, English, Physics, History) with placeholder professors like "Dr. Sarah Johnson". There is no mention of UW Bothell, CSS, time schedule, MyPlan, DegreeAudit, advising, or any UW community service. The footer says "University Course Registration Management Hub." A grader cannot infer what UW problem this solves without an explanatory README or website, neither of which exists (`README.md` is two lines telling the reader to run `npm i` and `npm run dev`).

### AI Integration (15 pts)

Not present. A grep across the whole tree for `openai`, `anthropic`, `langchain`, `gemini`, `huggingface`, `transformers`, `embedding`, `rag`, and `llm` returns zero hits in source code (only the previous instructor feedback file mentions them). `package.json` lists no AI/LLM SDK and no vector store client. The only backend integration is `@supabase/supabase-js` used as a plain REST/Postgres CRUD layer (`app/pages/Home.tsx`, `Departments.tsx`, `DepartmentDetail.tsx`, `CourseDetail.tsx`). Per the rubric this is not even "sidecar," it is absent. This is currently the single largest scoring gap.

### Technical Execution (25 pts)

Below expectations for this point in the term. Concrete observations:

- **Routing is duplicated and inconsistent.** `app/App.tsx` defines a full set of routes (`/`, `course/:id`, `departments`, `departments/:name`, `textbooks` redirect, `*`). A second file `app/routes.tsx` defines a *different* route map (`/courses/:id` vs `course/:id`, `/departments/:id` vs `:name`) and is never imported. `App.tsx` is what main.tsx renders, but the live links in `Departments.tsx` point to `/departments/${dept.id}` while `App.tsx` declares `departments/:name`. So clicking a department card likely renders the wrong page or 404s.
- **Two react-router imports mixed.** `App.tsx` and `Layout.tsx` import from `react-router` while every page imports from `react-router-dom`. That works by accident with react-router v7 but is sloppy.
- **Type safety holes.** Several places use `as unknown as Course[]` to coerce Supabase results (`Home.tsx:39`, `CourseDetail.tsx:44`). Generate types from Supabase instead.
- **Dead seed data.** `app/data/courses.ts` is a hardcoded list of 6 courses with textbooks and professors that no component imports. Leftover scaffolding.
- **Layout export mismatch risk.** `app/App.tsx` uses `import { Layout }` (named) but `app/components/Layout.tsx` uses `export default`. Likely a runtime error on first load unless TS is silently coercing; verify in browser.
- **Tiny `main.tsx`** at repo root references `./styles/index.css` which does not exist in the tree shown. Build will fail.
- **No tests, no linter config, no CI** (`.github/workflows/` is absent).
- **No deployment config** (no `vercel.json`, `netlify.toml`, Dockerfile, or GitHub Pages workflow).
- **Secret hygiene.** `.env.local` is checked in. `.gitignore` is 13 bytes and probably does not cover it. Even if the key is a public anon key, committing `.env.local` is bad practice; rotate and ignore it.

### Project Web Presence (15 pts)

No deployed URL is listed anywhere in `README.md` or any other file. No project website exists in the repo. The README provides no explanation of why this project exists, who it serves, the architecture, or the AI design. For full credit here you need (1) a live URL and (2) a public "About / How it works" page or README that explains the why and the how.

### Milestones & Planning (20 pts)

Commit history is minimal and shows no iterative milestone evidence. Six commits total across all authors and branches: `first commit`, `Initial commit: Set up website boilerplate and configure gitignore`, `Initial commit: Fresh blank slate`, `supabase connection setup`, `connected supabase`, and the prior instructor-feedback commit. Two distinct contributors are visible (`jmnguyen03`, `vowels52`), which is consistent with a 2-3 person team, but there is no commit reflecting feature milestones, AI integration, UI iteration, or testing. There is also no PROPOSAL, ROADMAP, SPEC, or MILESTONE document anywhere in the repo.

### Peer Review (15 pts)

Not evaluable from the repository alone; depends on teammate survey responses.

## Suggested Improvements & New Features

### UI / UX

- Replace the generic "Academic Course Registration Hub" branding and the placeholder counts ("450+ Courses", "120+ Staff", "32 Majors" in `Home.tsx`) with real UW Bothell / UW CSS data, or remove them. Inflated numbers undermine credibility.
- Fix the broken "Back to Listings" link in `CourseDetail.tsx:81` (`to={`/departments/${course.departments?.code ? '' : ''}`}` is meaningless) and reconcile the route mismatch between `App.tsx` (`departments/:name`) and the `Link`s that pass an `id`.
- Add a real search box on the Home and Departments pages: currently the only way to find a course is to drill down department-by-department.
- Make "Add to Academic Schedule" persist (Supabase row, localStorage, or auth-gated) and provide a "My Schedule" page; today it is local React state on `CourseDetail.tsx:29`.
- Tighten the prose. Phrases like "lecture abstract has been published for this curriculum track entry section" and "Compiling database registry..." read like LLM filler. Use natural advising-office language.

### New Features (and how AI could be central, not sidecar)

- **AI prerequisite-and-path planner.** Given a student's completed courses, have an LLM with structured tool calls over the `courses`/`departments` tables produce a quarter-by-quarter plan to a CSS degree, citing prerequisite rows. This is meaningful AI: the model orchestrates retrieval + reasoning, and the UI displays the plan.
- **Natural-language catalog search backed by embeddings.** Embed each course description (pgvector in Supabase), let the user type "I want a class about distributed systems that meets the senior elective requirement," return top-k with explanations. Replaces the static "Featured" grid on `Home.tsx`.
- **AI syllabus summarizer.** Pull `syllabus_abstract` (already in the schema based on `CourseDetail.tsx:39`) and produce a TL;DR, weekly topic outline, and "what you will be able to do" list. Cache results in Supabase so it is not regenerated per view.
- **Conflict / load advisor.** Given selected courses, an AI agent checks for time conflicts, credit overload, and prereq gaps, and explains its reasoning. Not a chatbot; a structured action panel.
- **Course-Q&A grounded RAG.** Ask "is CSS 343 a good prep for CSS 487?" and answer with citations to descriptions and prerequisites stored in Supabase. Show retrieved chunks to demonstrate non-hallucination.

### Code Quality / Technical

- Delete `app/routes.tsx` or make it the single source of truth and have `App.tsx` import it. Right now two route maps exist and only one is used.
- Standardize on a single router import (`react-router-dom`) and a single `Layout` export style (default vs named); the `import { Layout }` in `App.tsx` against `export default` in `Layout.tsx` is a bug.
- Remove the unused `app/data/courses.ts` seed or wire it into a fixture.
- Generate Supabase types with `supabase gen types typescript` and drop the `as unknown as Course[]` casts.
- Remove `.env.local` from git, add `.env*` to `.gitignore`, and rotate the anon key. Document required env vars in the README.
- Add a real `README.md` with: problem statement, who it serves (UW community), live URL, architecture diagram, env setup, and "how AI is used."
- Add a CI workflow under `.github/workflows/` that runs `vite build` and a typecheck on PRs, and add a deploy step to Vercel/Netlify/Cloudflare Pages so reviewers can click a live link.
- Confirm `main.tsx` actually loads (`./styles/index.css` is referenced but no `styles/` directory is visible). Either add the file or remove the import.
- Add `eslint` + `prettier` configs and a `lint` script; the codebase is small enough that this is a 30-minute fix and will catch the router-import drift automatically.
