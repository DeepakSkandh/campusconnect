import { useQuery } from "@tanstack/react-query";
import { env } from "@/config/env";
import { useCurrentUser } from "@/features/auth/use-auth";
import { apiClient } from "@/lib/api-client";
import { mockApi } from "@/mocks/mock-api";
import type { SkillProfile, VolunteerOpportunity } from "@/types/domain";

export const skillKeys = {
  profile: (userId: string) => ["skills", "profile", userId] as const,
  opportunities: ["volunteer", "opportunities"] as const,
};

export function useSkillProfile() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: skillKeys.profile(user.id),
    queryFn: ({ signal }) =>
      env.useMocks ? mockApi.getSkillProfile(user) : apiClient.get<SkillProfile>("/skills/me", { signal }),
  });
}

export function useVolunteerOpportunities() {
  return useQuery({
    queryKey: skillKeys.opportunities,
    queryFn: ({ signal }) =>
      env.useMocks
        ? mockApi.listVolunteerOpportunities()
        : apiClient.get<VolunteerOpportunity[]>("/volunteer-roles", { signal, params: { open: true } }),
  });
}
