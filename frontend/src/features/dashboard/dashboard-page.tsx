import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PortalTile } from "@/components/common/portal-tile";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_TILES } from "@/config/navigation";
import { useAuth, useCurrentUser } from "@/features/auth/use-auth";
import { useApprovalQueue, useMyBookings } from "@/features/bookings/api";
import { useEvents } from "@/features/events/api";
import { useNotifications } from "@/features/notifications/api";
import { NotificationList } from "@/features/notifications/notification-list";
import { useVolunteerOpportunities } from "@/features/skills/api";
import { dateBlock, formatRange } from "@/lib/format";

function Stat({ label, value, to }: { label: string; value: number | undefined; to: string }) {
  return (
    <Link to={to} className="group rounded-md border bg-muted/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent">
      <p className="text-2xl font-semibold text-primary">{value ?? "–"}</p>
      <p className="text-xs text-muted-foreground group-hover:text-accent-foreground">{label}</p>
    </Link>
  );
}

function StudentStats() {
  const bookings = useMyBookings();
  const opportunities = useVolunteerOpportunities();
  const pending = bookings.data?.filter((b) => b.status === "pending").length;
  const openRoles = opportunities.data?.filter((o) => o.slotsFilled < o.slotsTotal).length;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Stat label="Bookings awaiting approval" value={pending} to="/bookings" />
      <Stat label="Open volunteer roles" value={openRoles} to="/skills" />
    </div>
  );
}

function AdminStats() {
  const queue = useApprovalQueue();
  return (
    <div className="grid gap-3">
      <Stat label="Requests to review" value={queue.data?.length} to="/admin/approvals" />
    </div>
  );
}

function UpcomingEvents() {
  const events = useEvents({});
  const now = Date.now();
  const upcoming =
    events.data?.filter((e) => e.status === "approved" && new Date(e.start).getTime() > now).slice(0, 3) ?? [];

  if (events.isPending) return <LoadingState label="Loading events…" className="py-6" />;
  if (events.isError) return <ErrorState error={events.error} onRetry={() => events.refetch()} className="py-6" />;
  if (upcoming.length === 0) return <EmptyState title="No upcoming events" className="py-6" />;

  return (
    <ul className="space-y-3">
      {upcoming.map((event) => {
        const { day, month } = dateBlock(event.start);
        return (
          <li key={event.id} className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-md bg-secondary text-secondary-foreground" aria-hidden>
              <span className="text-sm leading-none font-semibold">{day}</span>
              <span className="text-[10px] uppercase">{month}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="truncate text-xs text-muted-foreground">{formatRange(event.start, event.end)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function AlertsCard() {
  const notifications = useNotifications();
  return (
    <Card className="gap-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Alerts</CardTitle>
        <Link to="/notifications" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="max-h-72 overflow-y-auto">
        {notifications.isPending ? (
          <LoadingState className="py-6" />
        ) : notifications.isError ? (
          <ErrorState error={notifications.error} onRetry={() => notifications.refetch()} className="py-6" />
        ) : notifications.data.length === 0 ? (
          <EmptyState title="No alerts" className="py-6" />
        ) : (
          <NotificationList items={notifications.data.slice(0, 6)} compact />
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const user = useCurrentUser();
  const { hasRole } = useAuth();
  const tiles = DASHBOARD_TILES.filter((tile) => !tile.roles || hasRole(...tile.roles));
  const isAdmin = hasRole("dept_admin", "campus_admin");

  return (
    <>
      <p className="mb-3 text-sm font-medium text-primary">
        Welcome! {user.fullName.toUpperCase()}
        {user.rollNumber && ` (${user.rollNumber})`}
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Coming up on campus</CardTitle>
            <Link to="/events" className="flex items-center gap-1 text-xs text-primary hover:underline">
              All events <ArrowRight className="size-3" aria-hidden />
            </Link>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-[1fr_auto]">
            <UpcomingEvents />
            <div className="md:w-64">{isAdmin ? <AdminStats /> : <StudentStats />}</div>
          </CardContent>
        </Card>

        <AlertsCard />
      </div>

      <h2 className="sr-only">Shortcuts</h2>
      <nav aria-label="Shortcuts" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <PortalTile key={tile.to} to={tile.to} label={tile.label} icon={tile.icon} description={tile.description} />
        ))}
      </nav>
    </>
  );
}
