#!/usr/bin/env bun

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LUMI_SUPABASE_PROJECT_REF, LUMI_SUPABASE_URL } from '../src/lib/supabase/project';

type ApiKeyRow = {
  name?: string;
  type?: string;
  api_key?: string;
  key?: string;
  id?: string;
};

function asRows(payload: unknown): ApiKeyRow[] {
  if (Array.isArray(payload)) return payload as ApiKeyRow[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const field of ['keys', 'api_keys', 'data']) {
      if (Array.isArray(record[field])) return record[field] as ApiKeyRow[];
    }
  }
  return [];
}

function keyValue(row: ApiKeyRow): string {
  return row.api_key ?? row.key ?? '';
}

function pickKey(rows: ApiKeyRow[], testers: Array<(row: ApiKeyRow, value: string) => boolean>): string {
  for (const tester of testers) {
    const match = rows.find((row) => tester(row, keyValue(row)));
    if (match) {
      const value = keyValue(match);
      if (value) return value;
    }
  }
  return '';
}

const projectRef =
  process.env.SUPABASE_PROJECT_REF ??
  process.env.SUPABASE_PROJECT_ID ??
  LUMI_SUPABASE_PROJECT_REF;

const raw = await Bun.stdin.text();
const rows = asRows(JSON.parse(raw));

const publishable = pickKey(rows, [
  (_row, value) => value.startsWith('sb_publishable_'),
  (row) => row.type === 'publishable',
  (row) => row.name === 'anon' || row.name === 'publishable',
]);

const secret = pickKey(rows, [
  (_row, value) => value.startsWith('sb_secret_'),
  (row) => row.type === 'secret',
  (row) => row.name === 'service_role' || row.name === 'secret',
]);

if (!publishable || !secret) {
  console.error('Could not find publishable and secret API keys in CLI output.');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? LUMI_SUPABASE_URL;
const contents = [
  `NEXT_PUBLIC_SUPABASE_URL=${url}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable}`,
  `SUPABASE_SECRET_KEY=${secret}`,
  `SUPABASE_PROJECT_REF=${projectRef}`,
  '',
].join('\n');

const dest = resolve(process.cwd(), '.env.local');
writeFileSync(dest, contents, { mode: 0o600 });
console.log('Wrote .env.local from linked Supabase project.');
