'use client';

import { useMemo, useState } from 'react';
import {
  childFieldCount,
  entityFields,
  fieldById,
  flattenFields,
  joinFieldPath,
  objectLabel,
  parentFieldPath,
  type FieldDef,
} from '@/lib/workspace/field-tree';
import type { WorkspaceSchema } from '@/lib/workspace/types';
import {
  MenuEmpty,
  MenuList,
  MenuRow,
  MenuSearch,
} from './CommandMenu';
import { FieldGlyph } from './FieldGlyph';

export type FieldPickerMode = 'filter' | 'sort';

export function FieldPicker({
  schema,
  objectId,
  mode,
  onSelect,
}: {
  schema: WorkspaceSchema;
  objectId: string;
  mode: FieldPickerMode;
  onSelect: (path: string, field: FieldDef) => void;
}) {
  const [query, setQuery] = useState('');
  const [path, setPath] = useState('');

  const currentObjectId = useMemo(() => {
    if (!path) return objectId;
    const parts = path.split('.');
    let current = objectId;
    for (const part of parts) {
      const field = fieldById(schema, current, part);
      if (!field?.relation) return current;
      current = field.relation;
    }
    return current;
  }, [schema, objectId, path]);

  const currentField = useMemo(() => {
    if (!path) return null;
    const id = path.split('.').at(-1);
    if (!id) return null;
    const parent = parentFieldPath(path);
    let owner = objectId;
    if (parent) {
      const parts = parent.split('.');
      for (const part of parts) {
        const field = fieldById(schema, owner, part);
        if (!field?.relation) break;
        owner = field.relation;
      }
    }
    return fieldById(schema, owner, id) ?? null;
  }, [schema, objectId, path]);

  const trimmed = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

  const rows = useMemo(() => {
    if (trimmed) {
      const scope = path ? currentObjectId : objectId;
      const prefix = path;
      return flattenFields(schema, scope, mode, prefix, [], 1)
        .filter((item) => {
          const hay = [item.field.label, ...item.trail.map((field) => field.label)]
            .join(' ')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{M}/gu, '');
          return hay.includes(trimmed);
        })
        .slice(0, 40);
    }

    return entityFields(schema, currentObjectId)
      .filter((field) => (mode === 'sort' ? field.sortable : field.filterable))
      .map((field) => ({
        path: joinFieldPath(path, field.id),
        field,
        trail: [field],
      }));
  }, [schema, currentObjectId, objectId, mode, path, trimmed]);

  const placeholder = path
    ? `Search a ${objectLabel(schema, currentObjectId)} attribute…`
    : `Search a ${objectLabel(schema, objectId)} attribute…`;

  return (
    <div>
      <MenuSearch
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
        onBack={
          path
            ? () => {
                setPath(parentFieldPath(path));
                setQuery('');
              }
            : undefined
        }
      />
      {currentField ? (
        <div className="border-b px-1 py-1">
          <MenuRow
            icon={<FieldGlyph icon={currentField.icon} />}
            label={currentField.label}
            active
            onClick={() => onSelect(path, currentField)}
          />
        </div>
      ) : null}
      <MenuList>
        {rows.length === 0 ? (
          <MenuEmpty>No fields</MenuEmpty>
        ) : (
          rows.map((row) => {
            const isRelation = row.field.type === 'relation' && row.field.relation;
            const label =
              trimmed && row.trail.length > 1
                ? row.trail.map((field) => field.label).join(' · ')
                : row.field.label;
            return (
              <MenuRow
                key={row.path}
                icon={<FieldGlyph icon={row.field.icon} />}
                label={label}
                count={
                  isRelation && row.field.relation
                    ? childFieldCount(schema, row.field.relation)
                    : undefined
                }
                chevron={Boolean(isRelation)}
                onClick={() => {
                  if (isRelation && !trimmed) {
                    setPath(row.path);
                    setQuery('');
                    return;
                  }
                  onSelect(row.path, row.field);
                }}
              />
            );
          })
        )}
      </MenuList>
    </div>
  );
}
