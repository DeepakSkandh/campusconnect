import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { Compass, TriangleAlert } from "lucide-react";
import { StateMessage } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <StateMessage
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={
        <Button asChild size="sm">
          <Link to="/">Go to dashboard</Link>
        </Button>
      }
    />
  );
}

/** Rendered by the router when a page throws while rendering. */
export function RouteErrorPage() {
  const error = useRouteError();
  if (import.meta.env.DEV) console.error(error);

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "An unexpected error occurred. Reload the page, and report it if it keeps happening.";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <StateMessage
        icon={TriangleAlert}
        tone="danger"
        title="Something went wrong"
        description={description}
        action={
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        }
      />
    </div>
  );
}
