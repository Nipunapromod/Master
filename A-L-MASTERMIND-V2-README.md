# A/L Mastermind 2.0

A mobile-first learning workspace for Sri Lankan G.C.E. Advanced Level students. This upgrade is an App Router / TypeScript foundation with a working demo dashboard, browser-persisted tasks and marks, quiz practice, a focus timer, a server-side AI coach endpoint, Supabase auth wiring, SQL schema, and PWA install support.

## Start locally

1. Install Node.js 20.9 or newer.
2. Copy .env.example to .env.local.
3. Run npm install.
4. Run npm run dev and open http://localhost:3000.

The app works in demo mode without external credentials. In demo mode, tasks and marks are stored in this browser only. Add Supabase environment variables and apply supabase/schema.sql to enable cloud auth and database persistence. Add OPENAI_API_KEY to the server environment to enable live AI responses.

## Environment variables

- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL.
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon/publishable key.
- OPENAI_API_KEY: server-only AI provider key. Never expose it to the browser.
- OPENAI_MODEL: optional server-side model name.
- NEXT_PUBLIC_APP_URL: app URL used for auth redirects.

## Deployment

Connect this branch/repository to Vercel and use the root directory. Configure the same environment variables in Vercel Project Settings. Preview deploys should be tested before merging the branch into main. This change is on feature/a-l-mastermind-v2; it intentionally does not overwrite the production branch.

## Working in this first implementation

- Responsive dashboard navigation for desktop and mobile.
- Subject overview for Combined Mathematics, Physics, and Chemistry.
- Task create/complete/delete, stored locally in demo mode.
- Marks entry, percentage calculation, and responsive performance chart.
- Sample MCQ interaction and answer feedback.
- Pomodoro focus timer.
- AI Coach UI calling a server endpoint; secure live API mode when OPENAI_API_KEY is configured, otherwise a clear demo fallback.
- Supabase email/password, email signup, reset-password, and Google OAuth wiring in the auth page.
- PWA manifest and versioned service worker.
- Normalized starter SQL schema with RLS policies.

## Production work still required

Before launch to students, configure and verify Supabase redirect URLs, run the SQL schema in a staging project, add reviewed syllabus/content data and legally distributable papers, add automated tests, run accessibility/performance checks on real phones, and test every auth/provider flow with deployed environment variables. Sample content is illustrative, not an official complete Sri Lankan syllabus dataset.