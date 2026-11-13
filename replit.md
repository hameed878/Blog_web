# Crush — Self-Made Entrepreneurs

A public editorial blog with a secure admin studio for writing, editing, publishing, and deleting stories.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/crush-blog/` — public magazine, article pages, Clerk sign-in, and editorial studio
- `artifacts/api-server/src/routes/posts.ts` — public article API and admin post management
- `lib/db/src/schema/blog-posts.ts` — persistent blog post schema
- `lib/api-spec/openapi.yaml` — source of truth for the post API and generated client hooks

## Architecture decisions

- Clerk handles authentication; admin access is checked server-side against the verified primary email.
- Blog body HTML is sanitized by the API before saving and rendered only from that sanitized content.
- Post data is persisted in PostgreSQL; drafts are never returned from public post endpoints.

## Product

- Visitors can browse published entrepreneur stories and read full articles.
- The editor can create, save drafts, publish, edit, feature, search, filter, and delete posts.
- The article editor provides Word-like rich text formatting through TipTap.

## User preferences

- Keep the editorial direction close to the supplied Crush reference page.
- The admin account is `malikhkm123@gmail.com`; never store a password in app code.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
