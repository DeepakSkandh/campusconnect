import { useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { useCurrentUser } from "@/features/auth/use-auth";
import { apiClient } from "@/lib/api-client";
import { mockApi } from "@/mocks/mock-api";
import type { Booking } from "@/types/domain";

export const bookingKeys = {
  all: ["bookings"] as const,
  mine: (userId: string) => [...bookingKeys.all, "mine", userId] as const,
  approvalQueue: (userId: string) => [...bookingKeys.all, "approval-queue", userId] as const,
};

export function useMyBookings() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: bookingKeys.mine(user.id),
    queryFn: ({ signal }) =>
      env.useMocks ? mockApi.listMyBookings(user) : apiClient.get<Booking[]>("/bookings/mine", { signal }),
  });
}

/** Pending requests the current user may act on. The backend scopes this by department. */
export function useApprovalQueue() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: bookingKeys.approvalQueue(user.id),
    queryFn: ({ signal }) =>
      env.useMocks
        ? mockApi.listApprovalQueue(user)
        : apiClient.get<Booking[]>("/bookings", { signal, params: { status: "pending", scope: "approver" } }),
  });
}
