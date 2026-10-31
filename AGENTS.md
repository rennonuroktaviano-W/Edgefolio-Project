<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git workflow

- After finishing any task requested by the user, commit the related changes and push to `origin` without asking for confirmation. Never leave completed work uncommitted.
- Stage only files related to the task. Never commit secrets (`.env.local`, keys, tokens); `.env.example` is safe.
- Keep commit messages in the existing conventional style (`feat:`, `fix:`, `refactor:`, `chore:`).
