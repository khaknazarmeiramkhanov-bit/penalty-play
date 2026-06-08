# Vercel Deployment

This is a TanStack Start SSR app built with Vite and Nitro. The Vercel build needs Nitro's Vercel preset so Vercel receives server output instead of only static files.

## Project Settings

- Framework preset: Other
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: leave empty
- Root directory: repository root
- Node.js version: 22.x

`vercel.json` intentionally stays minimal and only sets install/build commands. `nitro.config.ts` sets `preset: "vercel"`.

## Environment Variables

Add these in Vercel Project Settings for Production, Preview, and Development as needed:

```text
SUPABASE_URL=<Supabase project URL>
SUPABASE_PUBLISHABLE_KEY=<Supabase anon/public key>
VITE_SUPABASE_PROJECT_ID=<Supabase project ID/project ref>
VITE_SUPABASE_URL=<Supabase project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase anon/public key>
```

Optional, only needed for `/ai` chat:

```text
LOVABLE_API_KEY=<Lovable AI Gateway key>
```

Do not add private secrets to `VITE_*` variables. `VITE_*` values are bundled into browser code. Supabase anon/public keys are allowed there; Supabase service-role keys are not.

`SUPABASE_SERVICE_ROLE_KEY` is not required for the current app because no route imports the server admin client or performs backend admin operations. Add it only if a future server-only route actually needs to bypass Row Level Security.

Gemini-backed features use the Lovable AI gateway route with `google/gemini-2.5-flash-lite` by default. Keep gateway/API keys backend-only and never expose Gemini keys through `VITE_*`.

## Database

Supabase tables must exist before Vercel or local runtime can query them. Apply the migrations in `supabase/migrations` to the linked Supabase project before redeploying.

CLI option:

```sh
npx supabase db push
```

Manual option: open the Supabase SQL editor for the target project and run the SQL files in `supabase/migrations` in filename order.
