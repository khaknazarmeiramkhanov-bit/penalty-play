# Project Rules

- Never commit real `.env` files.
- Always commit `.env.example` when environment variables change.
- Ready-to-copy local env handoff files must be named `VERCEL_ENV_IMPORT.local.env` and `VERCEL_ENV_VALUES.local.md`; keep them local-only and confirm they are ignored by git.
- Do not leak API keys, tokens, database URLs, private keys, service-role keys, or other secrets in chat, docs, logs, or commits.
- Public frontend variables such as `VITE_*`, `NEXT_PUBLIC_*`, or similar are visible in the browser; never put private secrets there.
- Supabase anon/public keys may be used in frontend variables. Supabase service-role keys must stay backend/server-only.
- Gemini API keys must stay backend/server-only and must not use `VITE_*`.
- For Gemini features, default to `gemini-2.5-flash-lite` unless there is a clear product reason to use a different model.
- Do not require `SUPABASE_SERVICE_ROLE_KEY` unless the project actually needs backend admin privileges.
- Remote font CSS imports can break Lightning CSS/Vite builds; prefer document/head font links when needed.
- App database tables must exist in Supabase before Vercel/local runtime can query them.
- Do not change unrelated app logic unless required for deployment.
- Prefer minimal, correct Vercel config.
