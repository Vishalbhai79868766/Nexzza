# NEXZZA Gaming Community

A responsive gaming community website with news dialogs and a real membership application API.

## Structure

- `app/page.tsx`: homepage, news, application form, and optional browser tool for preparing a form without submitting it.
- `app/api/applications/route.ts`: bounded JSON requests, server validation, and prepared D1 insertion.
- `lib/application-schema.ts`: shared validation and supported games/platforms.
- `db/schema.ts` and `drizzle/`: database schema and migrations.
- `public/images/`: original generated portal artwork.

Applications are private. There is no public applicant listing, email delivery, game server connection, or account creation. Repeated email addresses retain the first application. Applications can be reviewed in the Site database’s applications table.

## Development

Use the Sites project’s selected package manager and runtime profile. Run the Sites installation and build helpers, generate migrations with the db:generate script after schema changes, and use the supervised Sites preview for browser checks. Production publishing applies the tracked migrations before deploying the Worker. Runtime data, credentials, and local preview state are excluded from source control.

## Verification

Production build and TypeScript validation passed. Browser checks covered news dialogs, game selection, required fields, and successful application submission. Database inspection confirmed a repeated submission retained exactly one record. Optional WebMCP validation was unavailable because the preview browser did not expose modelContext.
