import { cn } from "@/lib/utils";
import type { BookingStatus, EventStatus, ResourceStatus, VolunteerApplicationStatus } from "@/types/domain";

/*
 * One place that decides how every lifecycle status looks.
 * Rule from the spec: only "approved" bookings are presented as confirmed.
 */

type Tone = "neutral" | "info" | "warning" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

const dotClasses: Record<Tone, string> = {
  neutral: "bg-slate-400",
  info: "bg-sky-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  danger: "bg-red-500",
};

type StatusConfig<S extends string> = Record<S, { label: string; tone: Tone }>;

const bookingStatus: StatusConfig<BookingStatus> = {
  pending: { label: "Pending approval", tone: "warning" },
  approved: { label: "Confirmed", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
};

const eventStatus: StatusConfig<EventStatus> = {
  draft: { label: "Draft", tone: "neutral" },
  submitted: { label: "Submitted", tone: "info" },
  pending_approval: { label: "Pending approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  completed: { label: "Completed", tone: "info" },
};

const resourceStatus: StatusConfig<ResourceStatus> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "neutral" },
  under_maintenance: { label: "Under maintenance", tone: "warning" },
};

const volunteerStatus: StatusConfig<VolunteerApplicationStatus> = {
  applied: { label: "Applied", tone: "info" },
  invited: { label: "Invited", tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "neutral" },
  selected: { label: "Selected", tone: "success" },
  rejected: { label: "Not selected", tone: "danger" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};

type StatusBadgeProps =
  | { kind: "booking"; status: BookingStatus; className?: string }
  | { kind: "event"; status: EventStatus; className?: string }
  | { kind: "resource"; status: ResourceStatus; className?: string }
  | { kind: "volunteer"; status: VolunteerApplicationStatus; className?: string };

function lookup(props: StatusBadgeProps) {
  switch (props.kind) {
    case "booking":
      return bookingStatus[props.status];
    case "event":
      return eventStatus[props.status];
    case "resource":
      return resourceStatus[props.status];
    case "volunteer":
      return volunteerStatus[props.status];
  }
}

export function StatusBadge(props: StatusBadgeProps) {
  const { label, tone } = lookup(props);
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses[tone],
        props.className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClasses[tone])} aria-hidden />
      {label}
    </span>
  );
}
