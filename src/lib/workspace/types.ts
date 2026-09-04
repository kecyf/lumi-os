export type PropertyType =
  | 'text'
  | 'email'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'number'
  | 'boolean'
  | 'relation'
  | 'lookup';

export type PropertyOption = {
  value: string;
  label: string;
};

export type PropertyDef = {
  id: string;
  name: string;
  type: PropertyType;
  filterable?: boolean;
  sortable?: boolean;
  lookup?: string;
  options?: readonly PropertyOption[];
  relation?: string;
};

export type ObjectDef = {
  id: string;
  name: string;
  slug: string;
  primaryField: string;
  fields: PropertyDef[];
};

export type WorkspaceSchema = {
  workspace: { id: string; name: string };
  objects: ObjectDef[];
};

export type WorkspaceRecord = {
  id: string;
  values: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  archived_at?: string | null;
};
