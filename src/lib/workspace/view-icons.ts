import {
  Archive,
  Bookmark,
  Building2,
  CircleAlert,
  CircleCheck,
  Clock,
  Flame,
  Globe,
  Heart,
  Inbox,
  LayoutGrid,
  Leaf,
  List,
  Moon,
  Rocket,
  Sparkles,
  Star,
  Tag,
  Target,
  Undo2,
  UserMinus,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const VIEW_ICONS = [
  { id: 'layout-grid', icon: LayoutGrid },
  { id: 'users', icon: Users },
  { id: 'user-plus', icon: UserPlus },
  { id: 'user-minus', icon: UserMinus },
  { id: 'flame', icon: Flame },
  { id: 'clock', icon: Clock },
  { id: 'star', icon: Star },
  { id: 'heart', icon: Heart },
  { id: 'tag', icon: Tag },
  { id: 'building-2', icon: Building2 },
  { id: 'globe', icon: Globe },
  { id: 'zap', icon: Zap },
  { id: 'inbox', icon: Inbox },
  { id: 'circle-alert', icon: CircleAlert },
  { id: 'circle-check', icon: CircleCheck },
  { id: 'archive', icon: Archive },
  { id: 'bookmark', icon: Bookmark },
  { id: 'target', icon: Target },
  { id: 'rocket', icon: Rocket },
  { id: 'sparkles', icon: Sparkles },
  { id: 'leaf', icon: Leaf },
  { id: 'moon', icon: Moon },
  { id: 'list', icon: List },
  { id: 'undo-2', icon: Undo2 },
] as const;

export type ViewIconId = (typeof VIEW_ICONS)[number]['id'];

export const VIEW_ICON_COLORS = [
  { id: 'zinc', className: 'text-zinc-500' },
  { id: 'emerald', className: 'text-emerald-600' },
  { id: 'sky', className: 'text-sky-600' },
  { id: 'blue', className: 'text-blue-600' },
  { id: 'violet', className: 'text-violet-600' },
  { id: 'rose', className: 'text-rose-600' },
  { id: 'amber', className: 'text-amber-600' },
  { id: 'orange', className: 'text-orange-600' },
] as const;

export type ViewIconColor = (typeof VIEW_ICON_COLORS)[number]['id'];

const ICON_ALIASES: Record<string, ViewIconId> = {
  grid: 'layout-grid',
  spark: 'sparkles',
  check: 'circle-check',
  undo: 'undo-2',
};

const ICON_IDS = new Set<string>(VIEW_ICONS.map((item) => item.id));
const COLOR_IDS = new Set<string>(VIEW_ICON_COLORS.map((item) => item.id));

export function isViewIconId(value: string | null | undefined): value is ViewIconId {
  return Boolean(value && ICON_IDS.has(value));
}

export function isViewIconColor(
  value: string | null | undefined
): value is ViewIconColor {
  return Boolean(value && COLOR_IDS.has(value));
}

export function resolveViewIconId(value: string | null | undefined): ViewIconId {
  const aliased = ICON_ALIASES[value ?? ''] ?? value;
  return isViewIconId(aliased) ? aliased : 'layout-grid';
}

export function resolveViewIconColor(
  value: string | null | undefined
): ViewIconColor {
  return isViewIconColor(value) ? value : 'emerald';
}

export function viewIconComponent(value: string | null | undefined): LucideIcon {
  const id = resolveViewIconId(value);
  return VIEW_ICONS.find((item) => item.id === id)?.icon ?? LayoutGrid;
}

export function viewIconColorClass(value: string | null | undefined): string {
  const id = resolveViewIconColor(value);
  return (
    VIEW_ICON_COLORS.find((item) => item.id === id)?.className ??
    'text-emerald-600'
  );
}
