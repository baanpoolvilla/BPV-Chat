import * as React from 'react';
import { cn } from '@/utils/cn';
import { ConversationStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'open' | 'pending' | 'resolved' | 'archived' | 'line' | 'facebook' | 'instagram' | 'tiktok';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-primary border border-primary',
      bot: 'bg-blue-100 text-blue-800',
      open: 'bg-blue-100 text-blue-800',
      pending: 'bg-orange-100 text-orange-800',
      human: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-600',
      line: 'bg-[#06c755]/10 text-[#06c755]',
      facebook: 'bg-[#1877f2]/10 text-[#1877f2]',
      instagram: 'bg-[#e4405f]/10 text-[#e4405f]',
      tiktok: 'bg-gray-100 text-gray-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold transition-colors',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export function StatusBadge({ status }: { status: ConversationStatus }) {
  const statusConfig: Record<ConversationStatus, { label: string; variant: BadgeProps['variant'] }> = {
    open:     { label: 'กำลังสนทนา', variant: 'open' },
    pending:  { label: 'รอตอบ', variant: 'pending' },
    resolved: { label: 'เสร็จสิ้น', variant: 'resolved' },
    archived: { label: 'เก็บแล้ว', variant: 'archived' },
  };

  const config = statusConfig[status] ?? statusConfig.open;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { Badge };
