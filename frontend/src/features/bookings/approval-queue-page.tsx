import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRange, formatRelative } from "@/lib/format";
import { useApprovalQueue } from "./api";

export function ApprovalQueuePage() {
  const queue = useApprovalQueue();

  return (
    <>
      <PageHeader
        title="Booking approvals"
        description="Pending requests for resources your department owns, oldest first."
      />

      {queue.isPending ? (
        <LoadingState label="Loading approval queue…" />
      ) : queue.isError ? (
        <ErrorState error={queue.error} onRetry={() => queue.refetch()} />
      ) : queue.data.length === 0 ? (
        <EmptyState title="Nothing to review" description="New booking requests will appear here." />
      ) : (
        <ul className="space-y-3">
          {queue.data.map((b) => (
            <li key={b.id}>
              <Card className="py-4">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold">{b.resourceName}</p>
                    <p className="text-sm">{formatRange(b.start, b.end)}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.requestedByName} · {b.purpose}
                      {b.eventTitle && ` · ${b.eventTitle}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Requested {formatRelative(b.requestedAt)}</p>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled>
                        <X /> Reject
                      </Button>
                      <Button size="sm" disabled>
                        <Check /> Approve
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">Approval actions open in Phase 2</span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
