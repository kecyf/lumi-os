import { cn } from '@/lib/utils';
import {
  viewIconColorClass,
  viewIconComponent,
} from '@/lib/workspace/view-icons';

export function ViewGlyph({
  icon,
  color,
  className,
}: {
  icon?: string | null;
  color?: string | null;
  className?: string;
}) {
  const Icon = viewIconComponent(icon);
  return (
    <Icon
      className={cn('size-3.5', viewIconColorClass(color), className)}
      aria-hidden
    />
  );
}
