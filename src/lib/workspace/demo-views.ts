import type { SavedView } from '@/lib/workspace/views';

export const DEMO_VIEWS: SavedView[] = [
  {
    id: 'people-active',
    objectId: 'people',
    name: 'Active',
    icon: 'sparkles',
    iconColor: 'emerald',
    visibility: 'collaborative',
    filters: {
      clauses: [{ path: 'status', op: 'in', value: ['active'] }],
    },
  },
  {
    id: 'people-new',
    objectId: 'people',
    name: 'New',
    icon: 'user-plus',
    iconColor: 'sky',
    visibility: 'collaborative',
    filters: {
      clauses: [{ path: 'status', op: 'in', value: ['new'] }],
    },
  },
  {
    id: 'companies-software',
    objectId: 'companies',
    name: 'Software',
    icon: 'zap',
    iconColor: 'violet',
    visibility: 'collaborative',
    filters: {
      clauses: [{ path: 'category', op: 'in', value: ['software'] }],
    },
  },
];

export function demoViewsFor(objectId: string): SavedView[] {
  return DEMO_VIEWS.filter((view) => view.objectId === objectId);
}
