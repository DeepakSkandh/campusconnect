import { Link } from "react-router";
import { Bell, CalendarDays, ChevronRight, ClipboardList, HandHeart, type LucideIcon } from "lucide-react";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationKind } from "@/types/domain";

const kindIcon: Record<NotificationKind, LucideIcon> = {
  booking: ClipboardList,
  event: CalendarDays,
  volunteer: HandHeart,
  system: Bell,
};

export function NotificationList({ items, compact = false }: { items: AppNotification[]; compact?: boolean }) {
  return (
    <ul className="divide-y">
      {items.map((item) => {
        const Icon = kindIcon[item.kind];
        const content = (
          <>
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm text-foreground", !item.read && "font-semibold")}>
                {!item.read && <span className="sr-only">Unread: </span>}
                {item.title}
              </p>
              {!compact && <p className="mt-0.5 text-sm text-muted-foreground">{item.body}</p>}
              <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</p>
            </div>
            {item.link && <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />}
            {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />}
          </>
        );
        return (
          <li key={item.id}>
            {item.link ? (
              <Link to={item.link} className="flex gap-3 px-1 py-3 transition-colors hover:bg-accent/60">
                {content}
              </Link>
            ) : (
              <div className="flex gap-3 px-1 py-3">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
