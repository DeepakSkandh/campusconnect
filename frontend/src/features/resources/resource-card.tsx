import { Link } from "react-router";
import { Building2, CircleCheck, Clock, MapPin, Package, Users } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { RESOURCE_CATEGORY_LABELS, type Resource } from "@/types/domain";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Badge variant="secondary">{RESOURCE_CATEGORY_LABELS[resource.category]}</Badge>
          <h3 className="font-semibold text-foreground group-hover:text-primary">{resource.name}</h3>
        </div>
        {resource.status !== "active" && <StatusBadge kind="resource" status={resource.status} />}
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>

      <dl className="mt-auto grid gap-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 shrink-0 text-primary/70" aria-hidden />
          <dt className="sr-only">Department</dt>
          <dd className="truncate">{resource.departmentName}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary/70" aria-hidden />
          <dt className="sr-only">Location</dt>
          <dd className="truncate">{resource.location}</dd>
        </div>
        <div className="flex items-center gap-2">
          {resource.capacityModel === "pooled" ? (
            <>
              <Package className="size-4 shrink-0 text-primary/70" aria-hidden />
              <dt className="sr-only">Units</dt>
              <dd>{resource.unitCount} units in pool</dd>
            </>
          ) : (
            <>
              <Users className="size-4 shrink-0 text-primary/70" aria-hidden />
              <dt className="sr-only">Capacity</dt>
              <dd>Seats {resource.capacity}</dd>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {resource.requiresApproval ? (
            <Clock className="size-4 shrink-0 text-primary/70" aria-hidden />
          ) : (
            <CircleCheck className="size-4 shrink-0 text-primary/70" aria-hidden />
          )}
          <dt className="sr-only">Approval</dt>
          <dd>{resource.requiresApproval ? "Needs department approval" : "No approval needed"}</dd>
        </div>
      </dl>
    </Link>
  );
}
