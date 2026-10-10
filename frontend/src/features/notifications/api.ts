import { useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { apiClient } from "@/lib/api-client";
import { mockApi } from "@/mocks/mock-api";
import type { AppNotification } from "@/types/domain";

export const notificationKeys = {
  all: ["notifications"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: ({ signal }) =>
      env.useMocks ? mockApi.listNotifications() : apiClient.get<AppNotification[]>("/notifications", { signal }),
    // Light polling until push (SSE/WebSocket) is justified.
    refetchInterval: 60_000,
  });
}
