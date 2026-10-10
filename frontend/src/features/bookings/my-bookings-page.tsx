import { Link } from "react-router";
import { Info } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, formatRange } from "@/lib/format";
import { useMyBookings } from "./api";

export function MyBookingsPage() {
  const bookings = useMyBookings();

  return (
    <>
      <PageHeader title="My bookings" description="Every booking request you have made, newest first." />

      <div className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          A booking is only <strong>confirmed</strong> once the owning department approves it. Pending requests may
          expire if they are not approved in time.
        </p>
      </div>

      {bookings.isPending ? (
        <LoadingState label="Loading your bookings…" />
      ) : bookings.isError ? (
        <ErrorState error={bookings.error} onRetry={() => bookings.refetch()} />
      ) : bookings.data.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Find a lab, room or piece of equipment to get started."
          action={
            <Button asChild size="sm">
              <Link to="/resources">Browse resources</Link>
            </Button>
          }
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Resource</th>
                  <th scope="col" className="px-4 py-3 font-medium">When</th>
                  <th scope="col" className="px-4 py-3 font-medium">Purpose</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.data.map((b) => (
                  <tr key={b.id} className="align-top">
                    <td className="px-4 py-3">
                      <Link to={`/resources/${b.resourceId}`} className="font-medium text-primary hover:underline">
                        {b.resourceName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {b.departmentName}
                        {b.quantity > 1 && ` · ${b.quantity} units`}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatRange(b.start, b.end)}</td>
                    <td className="px-4 py-3">
                      {b.purpose}
                      {b.eventTitle && <p className="text-xs text-muted-foreground">For: {b.eventTitle}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="booking" status={b.status} />
                      {b.status === "pending" && b.expiresAt && (
                        <p className="mt-1 text-xs text-muted-foreground">Expires {formatDateTime(b.expiresAt)}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
