'use client';

import {
  AtSign,
  Briefcase,
  Building2,
  Calendar,
  Circle,
  CircleDollarSign,
  Globe,
  Hash,
  Inbox,
  List,
  Mail,
  MapPin,
  Phone,
  Store,
  Tag,
  Type,
  User,
} from 'lucide-react';
import type { FieldIconId } from '@/lib/workspace/field-tree';
import { cn } from '@/lib/utils';

const ICONS: Record<FieldIconId, typeof User> = {
  hash: Hash,
  text: Type,
  mail: Mail,
  user: User,
  building: Building2,
  briefcase: Briefcase,
  phone: Phone,
  tag: Tag,
  globe: Globe,
  flag: MapPin,
  calendar: Calendar,
  coins: CircleDollarSign,
  inbox: Inbox,
  deal: CircleDollarSign,
  list: List,
  shop: Store,
  circle: Circle,
};

export function FieldGlyph({
  icon,
  className,
}: {
  icon: FieldIconId;
  className?: string;
}) {
  const Icon = ICONS[icon] ?? Type;
  return <Icon className={cn('size-3.5', className)} aria-hidden />;
}

export function AtGlyph({ className }: { className?: string }) {
  return <AtSign className={cn('size-3.5', className)} aria-hidden />;
}
