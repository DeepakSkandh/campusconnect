import type { SkillProfile, VolunteerOpportunity } from "@/types/domain";

export interface SkillMatch {
  matched: string[];
  missing: string[];
}

/**
 * Deterministic, explainable comparison of a role's required skills with the
 * user's declared skills. Display only: the backend owns real matching, which
 * also considers availability, eligibility and role capacity.
 */
export function matchSkills(opportunity: VolunteerOpportunity, profile: SkillProfile | undefined): SkillMatch {
  const owned = new Set(profile?.skills.map((s) => s.skill.name.toLowerCase()) ?? []);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of opportunity.requiredSkills) {
    (owned.has(skill.toLowerCase()) ? matched : missing).push(skill);
  }
  return { matched, missing };
}
