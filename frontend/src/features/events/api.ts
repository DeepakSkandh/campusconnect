import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";
import { useCurrentUser } from "@/features/auth/use-auth";
import { apiClient } from "@/lib/api-client";
import { mockApi } from "@/mocks/mock-api";
import type { CampusEvent, CreateEventPayload, EventFilters } from "@/types/domain";

export const eventKeys = {
  all: ["events"] as const,
  list: (userId: string, filters: EventFilters) => [...eventKeys.all, "list", userId, filters] as const,
};

export function useEvents(filters: EventFilters) {
  const user = useCurrentUser();
  return useQuery({
    queryKey: eventKeys.list(user.id, filters),
    queryFn: ({ signal }) =>
      env.useMocks
        ? mockApi.listEvents(user, filters)
        : apiClient.get<CampusEvent[]>("/events", { signal, params: { q: filters.q, category: filters.category } }),
    placeholderData: keepPreviousData,
  });
}

interface CreateEventVariables {
  payload: CreateEventPayload;
  /** Same key for retries of the same submission, so the server creates the event once. */
  idempotencyKey: string;
}

export function useCreateEvent() {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: CreateEventVariables) =>
      env.useMocks
        ? mockApi.createEvent(user, payload, idempotencyKey)
        : apiClient.post<CampusEvent>("/events", payload, { idempotencyKey }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}
