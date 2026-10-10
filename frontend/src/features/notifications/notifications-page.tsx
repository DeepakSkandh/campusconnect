import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "./api";
import { NotificationList } from "./notification-list";

export function NotificationsPage() {
  const notifications = useNotifications();

  return (
    <>
      <PageHeader title="Notifications" description="Updates on your bookings, events and volunteer applications." />
      <Card className="py-2">
        <CardContent>
          {notifications.isPending ? (
            <LoadingState />
          ) : notifications.isError ? (
            <ErrorState error={notifications.error} onRetry={() => notifications.refetch()} />
          ) : notifications.data.length === 0 ? (
            <EmptyState title="You're all caught up" description="New updates will appear here." />
          ) : (
            <NotificationList items={notifications.data} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
