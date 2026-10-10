import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CalendarClock, Info } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/common/query-states";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_NAMES } from "@/lib/format";
import { RESOURCE_CATEGORY_LABELS, type Resource } from "@/types/domain";
import { useResource } from "./api";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function OperatingHours({ resource }: { resource: Resource }) {
  // Show Monday first; days without an entry are closed.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Operating hours</caption>
      <tbody className="divide-y">
        {order.map((day) => {
          const slot = resource.operatingHours.find((h) => h.dayOfWeek === day);
          return (
            <tr key={day}>
              <th scope="row" className="py-1.5 text-left font-normal text-muted-foreground">
                {DAY_NAMES[day]}
              </th>
              <td className="py-1.5 text-right">{slot ? `${slot.opens} – ${slot.closes}` : "Closed"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ResourceDetailPage() {
  const { resourceId = "" } = useParams();
  const resource = useResource(resourceId);

  if (resource.isPending) return <LoadingState label="Loading resource…" />;
  if (resource.isError) return <ErrorState error={resource.error} onRetry={() => resource.refetch()} />;

  const r = resource.data;
  const bookable = r.status === "active";

  return (
    <>
      <Button asChild variant="link" className="mb-2 h-auto px-0">
        <Link to="/resources">
          <ArrowLeft /> All resources
        </Link>
      </Button>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{RESOURCE_CATEGORY_LABELS[r.category]}</Badge>
            <StatusBadge kind="resource" status={r.status} />
          </div>
          <h1 className="text-2xl font-semibold text-primary">{r.name}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{r.description}</p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Button disabled>
            <CalendarClock /> Request booking
          </Button>
          <span className="text-xs text-muted-foreground">Booking requests open in Phase 2</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Department">{r.departmentName}</Detail>
              <Detail label="Location">{r.location}</Detail>
              <Detail label={r.capacityModel === "pooled" ? "Units in pool" : "Capacity"}>
                {r.capacityModel === "pooled" ? r.unitCount : `${r.capacity} people`}
              </Detail>
              <Detail label="Booking type">
                {r.capacityModel === "pooled"
                  ? "Shared pool: each booking takes some units"
                  : "Exclusive: one booking per time slot"}
              </Detail>
              <Detail label="Approval">{r.requiresApproval ? "Department approval required" : "Auto-confirmed"}</Detail>
              <Detail label="Who can book">{r.eligibility}</Detail>
            </dl>

            {r.equipment.length > 0 && (
              <>
                <h4 className="mt-6 mb-2 text-sm font-semibold">Equipment in this space</h4>
                <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                  {r.equipment.map((item) => (
                    <li key={item.name} className="flex justify-between rounded-md bg-muted px-3 py-1.5">
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating hours</CardTitle>
            <CardDescription>India Standard Time</CardDescription>
          </CardHeader>
          <CardContent>
            <OperatingHours resource={r} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 rounded-md border border-dashed bg-muted/50 p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>
                {bookable
                  ? "The availability calendar arrives in Phase 2. It will be computed by the server from operating hours, existing bookings and maintenance closures, never guessed in the browser."
                  : "This resource is not accepting bookings right now."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
