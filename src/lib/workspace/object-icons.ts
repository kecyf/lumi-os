import {
  Building2,
  CircleDollarSign,
  Inbox,
  LayoutGrid,
  Users,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  people: Users,
  contacts: Users,
  companies: Building2,
  leads: Inbox,
  deals: CircleDollarSign,
};

export function objectIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? LayoutGrid;
}
