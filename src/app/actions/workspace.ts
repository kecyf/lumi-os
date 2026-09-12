'use server';

import { insertRecord, replaceViews } from '@/lib/workspace/persist';
import type { WorkspaceRecord } from '@/lib/workspace/types';
import type { SavedView } from '@/lib/workspace/views';

export async function createRecordAction(
  objectSlug: string,
  values: Record<string, unknown>
): Promise<{ ok: true; record: WorkspaceRecord } | { ok: false; error: string }> {
  try {
    const record = await insertRecord(objectSlug, values);
    return { ok: true, record };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create record',
    };
  }
}

export async function saveViewsAction(
  objectSlug: string,
  views: SavedView[]
): Promise<{ ok: true; views: SavedView[] } | { ok: false; error: string }> {
  try {
    const saved = await replaceViews(objectSlug, views);
    return { ok: true, views: saved };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to save views',
    };
  }
}
