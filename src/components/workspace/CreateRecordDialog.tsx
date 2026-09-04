'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ObjectDef, WorkspaceRecord } from '@/lib/workspace/types';

function emptyValues(object: ObjectDef): Record<string, string> {
  return Object.fromEntries(object.fields.map((field) => [field.id, '']));
}

export function CreateRecordDialog({
  open,
  onOpenChange,
  object,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object: ObjectDef;
  onCreate: (record: WorkspaceRecord) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => emptyValues(object));
  const fields = object.fields.filter(
    (field) =>
      field.type === 'text' ||
      field.type === 'email' ||
      field.type === 'select' ||
      field.type === 'number' ||
      field.type === 'date'
  );

  const reset = () => setValues(emptyValues(object));

  const submit = () => {
    const now = new Date().toISOString();
    const parsed: Record<string, unknown> = {};
    for (const field of object.fields) {
      const raw = values[field.id]?.trim() ?? '';
      if (!raw) continue;
      parsed[field.id] = field.type === 'number' ? Number(raw) : raw;
    }
    onCreate({
      id: crypto.randomUUID(),
      values: parsed,
      created_at: now,
      updated_at: now,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New record</DialogTitle>
          <DialogDescription>
            Add a record to {object.name.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {fields.map((field) => (
            <label key={field.id} className="grid gap-1.5">
              <span className="text-xs font-medium text-foreground">{field.name}</span>
              {field.type === 'select' ? (
                <select
                  value={values[field.id] ?? ''}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.id]: event.target.value }))
                  }
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select…</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={
                    field.type === 'email'
                      ? 'email'
                      : field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : 'text'
                  }
                  value={values[field.id] ?? ''}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.id]: event.target.value }))
                  }
                  placeholder={field.name}
                />
              )}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={!values[object.primaryField]?.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
