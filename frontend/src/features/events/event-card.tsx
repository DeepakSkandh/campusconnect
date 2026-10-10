import { HandHeart, Users } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { dateBlock, formatRange } from "@/lib/format";
import { EVENT_CATEGORY_LABELS, type CampusEvent } from "@/types/domain";

export function EventCard({ event }: { event: CampusEvent }) {
  const { day, month } = dateBlock(event.start);

  return (
    <article className="flex gap-4 rounded-lg border bg-card p-4 shadow-sm sm:p-5">
      <div
        className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground"
        aria-hidden
      >
        <span className="text-xl leading-none font-semibold">{day}</span>
        <span className="text-xs tracking-wide uppercase">{month}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
          <StatusBadge kind="event" status={event.status} />
        </div>
        <h3 className="font-semibold">{event.title}</h3>
        <p className="text-sm text-muted-foreground">{formatRange(event.start, event.end)}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            By {event.organizerName} · {event.hostDepartmentName}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" aria-hidden /> {event.expectedAttendance} expected
          </span>
          {event.openVolunteerSlots > 0 && (
            <span className="flex items-center gap-1 font-medium text-primary">
              <HandHeart className="size-3.5" aria-hidden /> {event.openVolunteerSlots} volunteer{" "}
              {event.openVolunteerSlots === 1 ? "slot" : "slots"} open
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
