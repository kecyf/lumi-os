# Lumi OS

Open-source workspace OS — objects, properties, views, records.

**Lumi** is the agent. **Lumi OS** is the workspace that agent (and any human) operates. Together: Notion + Airtable + Attio + Pipedrive, plus 2026-class agents (Cursor, Claude Code, Hermes).

This is a pre-v1 prototype. The first slice is a schema-driven grid.

## Status

- Kernel types + JSONB schema draft
- Grid chrome ported from a private Feedcast admin CRM prototype (generic layer only)
- Demo objects (`people`, `companies`) on one schema-driven `GridHub` — no Feedcast schema, no production data

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · JSONB-ready schema

## Develop

Requires [Bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`).

```bash
bun install
bun run dev
```

Open `/` — demo workspace, People / Companies, saved views, filter / sort / columns, ⌘K.

## Model

```
workspaces → objects → properties
                    → records (values jsonb)
                    → views   (filters / sorts / columns jsonb)
```

CRM (people, companies, deals) is a **template**, not the kernel. Feedcast can be a tenant later. So can a personal workspace.

## Naming

| Name | Meaning |
|---|---|
| Lumi | The agent (`kecyf/lumi`, `~/.lumi`) |
| Lumi OS | This product (`kecyf/lumi-os`) |

Vision and decisions live in [kvncyf-os/projects/lumi-os](https://github.com/kecyf/kvncyf-os/blob/main/projects/lumi-os/README.md).

## License

MIT. Chrome was adapted from a private Feedcast admin prototype and stripped of domain code.
