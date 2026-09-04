'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  fieldPathLabel,
  resolveFieldPath,
  type FieldDef,
} from '@/lib/workspace/field-tree';
import {
  clauseNeedsValue,
  clauseOpLabel,
  clauseSummary,
  defaultClauseOp,
  opsForField,
  type WorkspaceClauseOp,
  type WorkspaceQueryClause,
} from '@/lib/workspace/query-clauses';
import type { WorkspaceSchema } from '@/lib/workspace/types';
import { FilterTrigger } from './ToolbarTriggers';
import { FieldPicker } from './FieldPicker';
import { FieldGlyph } from './FieldGlyph';
import {
  MENU_PANEL,
  MenuFooter,
  MenuList,
  MenuRow,
  MenuSectionLabel,
} from './CommandMenu';
import { cn } from '@/lib/utils';

type FilterStep =
  | { kind: 'list' }
  | { kind: 'pick' }
  | { kind: 'value'; path: string; field: FieldDef; index?: number };

export function FilterMenu({
  schema,
  objectId,
  clauses,
  onChange,
}: {
  schema: WorkspaceSchema;
  objectId: string;
  clauses: WorkspaceQueryClause[];
  onChange: (clauses: WorkspaceQueryClause[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FilterStep>({ kind: 'list' });

  const openMenu = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep(clauses.length === 0 ? { kind: 'pick' } : { kind: 'list' });
    }
  };

  return (
    <Popover open={open} onOpenChange={openMenu}>
      <FilterTrigger
        activeCount={clauses.length}
        onClear={() => onChange([])}
      />
      <PopoverContent
        align="start"
        sideOffset={8}
        className={MENU_PANEL}
      >
        {step.kind === 'pick' ? (
          <FieldPicker
            schema={schema}
            objectId={objectId}
            mode="filter"
            onSelect={(path, field) => setStep({ kind: 'value', path, field })}
          />
        ) : null}
        {step.kind === 'value' ? (
          <ClauseEditor
            schema={schema}
            objectId={objectId}
            path={step.path}
            field={step.field}
            initial={step.index != null ? clauses[step.index] : undefined}
            onBack={() =>
              setStep(clauses.length === 0 ? { kind: 'pick' } : { kind: 'list' })
            }
            onApply={(clause) => {
              if (step.index != null) {
                onChange(
                  clauses.map((item, index) =>
                    index === step.index ? clause : item
                  )
                );
              } else {
                onChange([...clauses, clause]);
              }
              setStep({ kind: 'list' });
              setOpen(false);
            }}
          />
        ) : null}
        {step.kind === 'list' ? (
          <div>
            <MenuSectionLabel>Filters</MenuSectionLabel>
            <MenuList>
              {clauses.map((clause, index) => {
                const resolved = resolveFieldPath(schema, objectId, clause.path);
                return (
                  <div key={`${clause.path}-${index}`} className="flex items-center">
                    <MenuRow
                      icon={
                        resolved ? (
                          <FieldGlyph icon={resolved.field.icon} />
                        ) : undefined
                      }
                      label={clauseSummary(schema, objectId, clause)}
                      onClick={() => {
                        if (!resolved) return;
                        setStep({
                          kind: 'value',
                          path: clause.path,
                          field: resolved.field,
                          index,
                        });
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Remove filter"
                      className="mr-1 flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() =>
                        onChange(clauses.filter((_, item) => item !== index))
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </MenuList>
            <MenuFooter>
              <MenuRow
                icon={<Plus className="size-3.5" />}
                label="Add filter"
                onClick={() => setStep({ kind: 'pick' })}
              />
            </MenuFooter>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function ClauseEditor({
  schema,
  objectId,
  path,
  field,
  initial,
  onBack,
  onApply,
}: {
  schema: WorkspaceSchema;
  objectId: string;
  path: string;
  field: FieldDef;
  initial?: WorkspaceQueryClause;
  onBack: () => void;
  onApply: (clause: WorkspaceQueryClause) => void;
}) {
  const ops = opsForField(field);
  const [op, setOp] = useState<WorkspaceClauseOp>(
    initial?.op ?? defaultClauseOp(field.type)
  );
  const [text, setText] = useState(
    typeof initial?.value === 'string' || typeof initial?.value === 'number'
      ? String(initial.value)
      : ''
  );
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(initial?.value)
      ? initial.value.map(String)
      : typeof initial?.value === 'string' && initial.value
        ? [initial.value]
        : []
  );
  const [boolValue, setBoolValue] = useState(
    initial?.value === false ? false : true
  );

  const options = useMemo(() => field.options ?? [], [field.options]);

  const apply = () => {
    if (!clauseNeedsValue(op)) {
      onApply({ path, op, value: null });
      return;
    }
    if (field.type === 'boolean') {
      onApply({ path, op, value: boolValue });
      return;
    }
    if (field.type === 'select' || field.type === 'multi_select') {
      onApply({ path, op, value: selected });
      return;
    }
    if (field.type === 'number') {
      const numeric = Number(text);
      onApply({
        path,
        op,
        value: Number.isFinite(numeric) ? numeric : text.trim(),
      });
      return;
    }
    onApply({ path, op, value: text.trim() });
  };

  return (
    <div>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          ←
        </button>
        <FieldGlyph icon={field.icon} />
        <span className="truncate font-medium">
          {fieldPathLabel(schema, objectId, path)}
        </span>
      </div>
      <div className="space-y-2 p-2">
        <div className="flex flex-wrap gap-1">
          {ops.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setOp(item)}
              className={cn(
                'h-7 rounded-md px-2 text-[11px]',
                op === item
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {clauseOpLabel(item)}
            </button>
          ))}
        </div>

        {clauseNeedsValue(op) &&
        (field.type === 'text' ||
          field.type === 'email' ||
          field.type === 'date' ||
          field.type === 'number') ? (
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            type={
              field.type === 'date'
                ? 'date'
                : field.type === 'number'
                  ? 'number'
                  : 'text'
            }
            placeholder={field.type === 'date' ? 'YYYY-MM-DD' : 'Value…'}
            className="h-8 text-xs"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                apply();
              }
            }}
          />
        ) : null}

        {clauseNeedsValue(op) && field.type === 'boolean' ? (
          <div className="grid grid-cols-2 gap-1">
            {[true, false].map((item) => (
              <button
                key={String(item)}
                type="button"
                onClick={() => setBoolValue(item)}
                className={cn(
                  'h-8 rounded-md text-xs',
                  boolValue === item
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {item ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        ) : null}

        {clauseNeedsValue(op) &&
        (field.type === 'select' || field.type === 'multi_select') ? (
          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
            {options.map((option) => {
              const active = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSelected((current) =>
                      active
                        ? current.filter((item) => item !== option.value)
                        : [...current, option.value]
                    )
                  }
                  className={cn(
                    'flex h-8 items-center rounded-md px-2 text-left text-xs',
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={apply}
          className="flex h-8 w-full cursor-pointer items-center justify-center rounded-md bg-foreground text-xs font-medium text-background"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
