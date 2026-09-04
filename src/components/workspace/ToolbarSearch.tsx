'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';

function useModKLabel() {
  const [label, setLabel] = useState('⌘K');
  useEffect(() => {
    const mac = /Mac|iPhone|iPad/.test(navigator.userAgent);
    setLabel(mac ? '⌘K' : 'Ctrl+K');
  }, []);
  return label;
}

export function ToolbarSearch({
  value,
  onChange,
  placeholder,
  onOpenCommand,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onOpenCommand?: () => void;
}) {
  const shortcut = useModKLabel();

  return (
    <div className="relative">
      <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 w-56 pr-12 pl-8 text-xs"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenCommand}
          aria-label={`Open command palette (${shortcut})`}
          className="absolute top-1/2 right-1.5 inline-flex h-5 -translate-y-1/2 cursor-pointer items-center rounded border bg-muted px-0 hover:bg-accent hover:text-foreground"
        >
          <Kbd className="h-5 border-0 bg-transparent px-1.5 font-mono text-[10px]">
            {shortcut}
          </Kbd>
        </button>
      )}
    </div>
  );
}
