# Lumi OS

Agnostic workspace: objects, properties, views, records.

## Do

- Keep the kernel generic. A second object must not need a new hub component.
- English-only in this repo.
- Persistence: metadata tables + JSONB `records.values`.

## Do not

- Do not import Feedcast domain (merchants, Enola, parcours, pipelines, `app_*`, `crm_*`).
- Do not fork Feedcast production schema or copy prod data.
- Do not merge this repo with `kecyf/lumi` (the agent). Lumi operates Lumi OS; they stay separate.
- Do not add per-entity hubs (`PeopleHub`, `DealsHub`). One `GridHub` driven by schema.

## Layout

```
src/lib/workspace/     kernel (schema, clauses, views, column catalog)
src/components/workspace/   grid chrome
supabase/              SQL schema (not wired to a project yet)
```

Prototype chrome was harvested from `feedcast-io/admin` (`feat/crm-airtable-foundation`) and stripped. When in doubt, rewrite rather than re-couple.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
