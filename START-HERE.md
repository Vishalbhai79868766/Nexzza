# NEXZZA — full website source

This archive contains the complete tracked source of your NEXZZA gaming community website: frontend, backend API, database schema and migrations, UI components, images, and configuration files.

## Main files

| Location | Purpose |
| --- | --- |
| `app/page.tsx` | Homepage, community notes, join form |
| `app/globals.css` | Theme and responsive styling |
| `app/layout.tsx` | Page title, description, favicon |
| `app/api/applications/route.ts` | Backend that validates and saves applications |
| `lib/application-schema.ts` | Shared validation and game/platform options |
| `db/schema.ts` | Database table definition |
| `db/index.ts` | Server-side database connection |
| `drizzle/` | SQL migration and migration history |
| `components/ui/` | Reusable interface components |
| `public/` | Hero artwork and favicon |
| `package.json` and `pnpm-lock.yaml` | Dependencies and commands |
| `scripts/`, `build/`, `vite.config.ts` | Development and production build setup |

## Run on your computer

You need Node.js 22.13 or later. Extract the ZIP, open a terminal inside the `NEXZZA` folder, then run:

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm build
```

Initialize the local database once, before testing the join form:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clear_invisible_woman.sql
```

Then start the development website:

```sh
pnpm dev
```

Open the local URL printed in your terminal (the portable development setup uses port 5173). Keep the terminal running. Stop with Ctrl+C.

Do not reapply the initial migration to a database that already has the applications table. After a schema change, generate a new migration with `pnpm db:generate` and apply that new migration.

The `install:ci` command is intended for the managed build environment; use the `pnpm install` command above on your own computer.

## Hosting and GitHub

This is a React/TypeScript website using Vinext and a Cloudflare Workers-compatible backend with a D1 database. It is not a plain HTML-only website. Uploading the source to GitHub stores the code; GitHub Pages alone will not run this backend.

The included `.openai/hosting.json` belongs to the existing deployed Site. It contains deployment identifiers, not login credentials. An independent deployment needs its own hosting and database configuration.

When copying files to a GitHub repository, include the configuration files and the lockfile. Never upload tokens, private environment files, dependency folders, or local database files. The included `.gitignore` excludes those normal local outputs.

## Included and excluded

All 104 tracked project files are included unchanged, plus this guide. Installed packages (`node_modules`), generated build output (`dist`), Git history, caches, credentials, and local or live application records are not included. Dependencies and build output are recreated by the commands above.

The join form saves applications; it does not send emails, create user accounts, or connect to a game server. Repeated email addresses keep the original application. There is no public endpoint that lists applicants.

The hosted project passed a production build, TypeScript checks, and browser tests for community notes and application submission. Database checks confirmed duplicate prevention. These local setup instructions are based on the included scripts; a fresh installation on your computer has not been tested.
