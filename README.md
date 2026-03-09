# TexForge Frontend

A web-based LaTeX editor with real-time PDF preview, built with Next.js and Supabase.

## Live Demo

**Try it now**: https://texforge-frontend-lsmd.onrender.com

- Sign in with Google
- Create a LaTeX project
- Compile and preview your PDF
- Share with others via view-only links

## Features

- Google OAuth authentication
- Create, edit, and delete LaTeX projects
- CodeMirror 6 editor with LaTeX syntax highlighting
- Real-time PDF compilation via backend service
- Autosave with debounced updates
- Compile requests use inline editor buffer (no stale DB read race)
- Latest compile wins: stale compile requests are cancelled client-side
- View-only sharing via shareable links resolved by the backend service
- PDF download
- Premium app-shell UI with semantic tokens, glass surfaces, and gradient accents
- Motion-enhanced interactions with reduced-motion compliance
- Optional route-scoped 3D accents on login/dashboard with capability fallbacks

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Framer Motion
- three + @react-three/fiber + @react-three/drei
- CodeMirror 6
- Supabase (Auth, Database, Storage)

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase project with Google OAuth configured
- TexForge backend running (for compilation)

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create `.env.local` from the example:
   ```bash
   cp .env.local.example .env.local
   ```

3. Update `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_COMPILER_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

### Enable Google OAuth

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials (from Google Cloud Console)
4. Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Required Tables

The backend sets up these tables, but ensure they exist:

- `projects` - stores LaTeX projects
- `compiles` - stores compilation history
- `shares` - stores share tokens

### Storage Bucket

- `project-pdfs` - private bucket for compiled PDFs

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Redirect to dashboard/login
│   ├── login/              # Google OAuth login
│   ├── dashboard/          # Project list
│   ├── editor/[id]/        # LaTeX editor
│   ├── share/[token]/      # View-only shared PDF (data resolved via backend)
│   └── auth/               # Auth callbacks
├── components/
│   ├── ui/                 # shadcn components
│   ├── editor/             # CodeMirror editor
│   ├── visual-effects/     # Route-scoped 3D accents
│   ├── pdf-viewer.tsx      # PDF iframe display
│   ├── error-log.tsx       # Compile error display
│   ├── project-list.tsx    # Dashboard project grid
│   └── share-dialog.tsx    # Share link generator
├── hooks/
│   ├── use-project.ts      # Single project CRUD
│   ├── use-projects.ts     # Project list
│   ├── use-compile.ts      # Compilation state
│   ├── use-autosave.ts     # Debounced autosave
│   └── use-share.ts        # Share link generation
└── lib/
    ├── supabase/           # Supabase clients
    ├── types.ts            # TypeScript types
    └── utils.ts            # Utility functions

UI documentation:
- `UI_GUIDELINES.md` - token usage, component patterns, motion, and accessibility rules
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `NEXT_PUBLIC_COMPILER_URL` | Yes | Backend compiler service URL |

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Lint
pnpm lint

# Run tests
pnpm test
```

## Compile Behavior

- Editor text in memory is the source of truth for compile requests.
- The compile hook sends `{ project_id, tex }` so compile does not wait for autosave writes.
- On editor open, the app loads and displays the latest successful compiled PDF (if available).
- Duplicate compile requests for identical payloads are coalesced client-side.
- Newer compile requests abort stale in-flight requests.
- PDF preview URL adds a cache-bust query parameter using `compiled_at` to force iframe refresh when path remains unchanged.

## Share Behavior

- Share links remain read-only and never trigger compilation on open.
- The share page resolves the token through the backend service, which returns a signed URL for the latest successful compile when one exists.
- If the project has not been compiled successfully yet, the share page shows an empty state instead of compiling on demand.

## UI System and Interaction Model

- Global visual tokens are defined in `src/app/globals.css` and surfaced through Tailwind theme extensions.
- Reusable layout and display patterns live in `src/components/` (`page-shell`, `section-header`, `stat-card`, `empty-state`).
- Core primitive components in `src/components/ui/*` have consistent focus rings, elevation, and state styling.
- Motion uses Framer Motion with graceful static fallbacks when users prefer reduced motion.
- 3D visuals are route-scoped (login/dashboard only) and gated by capability checks (motion preference, viewport size, hardware hints, WebGL support).
- Editor and share workflows prioritize readability and speed over visual effects.

## Testing

This repo uses Vitest + Testing Library for unit and hook tests.

```bash
# Run all tests once
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

UI testing conventions:
- Add focused tests for visual-state hooks and UX guards (example: reduced-motion behavior in `use-visual-effects.test.ts`).
- Keep assertions behavior-oriented (text/state/ARIA) rather than snapshot-heavy visual assertions.
- When adding motion logic, include at least one reduced-motion branch test.

## Reduced-Motion and 3D Fallbacks

- `use-visual-effects` is the single capability gate for motion and 3D behavior.
- If `prefers-reduced-motion: reduce` is enabled, motion and 3D accents are disabled.
- If the device is constrained (small viewport, low hardware concurrency/device memory, or data-saver), 3D accents are disabled.
- If WebGL is unavailable, static gradient backgrounds are used automatically.
- 3D rendering is paused when the browser tab is hidden to reduce background work.

## Deployment

### Render (Current Setup)

The app is currently deployed on Render as a Node.js web service:

1. Connect your GitHub repository to Render
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_COMPILER_URL` (your backend URL)
   - `NEXT_PUBLIC_SITE_URL` (your frontend URL, for auth redirects)
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

### Vercel (Alternative)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Post-Deployment

Remember to:
- Update `NEXT_PUBLIC_COMPILER_URL` to your production backend URL
- Add your production domain to Supabase OAuth redirect URLs
- Add your production domain to Google Cloud Console OAuth settings
