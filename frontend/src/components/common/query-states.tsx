import type { ReactNode } from "react";
import { Inbox, LoaderCircle, TriangleAlert, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/*
 * Every data view renders exactly one of: loading, error, empty, or content.
 * Using these shared components keeps those states consistent across pages.
 */

interface StateMessageProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}

export function StateMessage({ icon: Icon, title, description, action, tone = "neutral", className }: StateMessageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          tone === "danger" ? "bg-red-50 text-destructive" : "bg-secondary text-primary",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="max-w-md space-y-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn("flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground", className)}>
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return <StateMessage icon={Inbox} title={title} description={description} action={action} className={className} />;
}

function describeError(error: unknown): { title: string; description: string } {
  if (isApiError(error)) {
    if (error.isForbidden) return { title: "Access denied", description: "You don't have permission to view this." };
    if (error.isNotFound) return { title: "Not found", description: "It may have been removed or you may not have access." };
    if (error.isUnauthenticated) return { title: "Session expired", description: "Please sign in again." };
    return { title: "Something went wrong", description: error.message };
  }
  return { title: "Something went wrong", description: "Check your connection and try again." };
}

export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  const { title, description } = describeError(error);
  return (
    <StateMessage
      icon={TriangleAlert}
      tone="danger"
      title={title}
      description={description}
      className={className}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
