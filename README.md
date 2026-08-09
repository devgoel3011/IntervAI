<<<<<<< HEAD
# IntervAI
AI-powered technical interviewer that conducts adaptive, multi-turn interviews based on your ABTalks AI Cohort progress — built for the ABTalks Vibe Code Hackathon.
=======
# AI Interview Agent — Gemini Free Tier

A Next.js/Vercel-ready adaptive technical interviewer grounded in the supplied 31-day AI Cohort curriculum and candidate profiles.

## Gemini setup — no OpenAI billing

This build uses the Gemini Developer API with `gemini-3.6-flash`. Google currently lists Gemini 2.5 Flash as **free of charge on the Standard Free Tier**, subject to rate limits. The free tier is separate from paid Google Cloud billing.

Create a Gemini API key in Google AI Studio:

https://aistudio.google.com/apikey

Then create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.6-flash
```

Do not put the key in client-side code or commit `.env.local`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## API

`POST /api/interview` supports the required session initialization and subsequent candidate messages.

## Cost

- No OpenAI key is required.
- No OpenAI billing is required.
- Gemini 2.5 Flash currently has a free Standard tier.
- Free-tier rate limits still apply; repeated testing can produce HTTP 429 responses.
- Google notes that free-tier usage may be used to improve its products; check Google's current terms if that matters for your submission.

## Optional Supabase

Without Supabase, sessions are kept in server memory. For a single-machine demo this is sufficient. For deployment, add:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Vercel

Add `GEMINI_API_KEY` and `GEMINI_MODEL` to the Vercel project environment variables. Note that a free Gemini API quota is subject to Google's current limits.
>>>>>>> 07ae1e0 (Initial folder upload)
