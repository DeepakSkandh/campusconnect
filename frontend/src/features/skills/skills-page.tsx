import { CircleCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/query-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Proficiency, SkillProfile, VolunteerOpportunity } from "@/types/domain";
import { useSkillProfile, useVolunteerOpportunities } from "./api";
import { matchSkills } from "./skill-match";

const proficiencyLabel: Record<Proficiency, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function SkillProfileCard({ profile }: { profile: SkillProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My skills</CardTitle>
        <CardDescription>
          {profile.openToVolunteer ? "You're open to volunteering." : "You're not currently volunteering."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {profile.skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't added any skills yet.</p>
        ) : (
          <ul className="space-y-2">
            {profile.skills.map(({ skill, proficiency }) => (
              <li key={skill.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {skill.name}
                  <span className="block text-xs text-muted-foreground">{skill.category}</span>
                </span>
                <Badge variant="muted">{proficiencyLabel[proficiency]}</Badge>
              </li>
            ))}
          </ul>
        )}

        {profile.interests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Button variant="outline" size="sm" disabled className="w-full">
            Edit skills & availability
          </Button>
          <p className="text-center text-xs text-muted-foreground">Profile editing opens in Phase 3</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityRow({ opportunity, profile }: { opportunity: VolunteerOpportunity; profile?: SkillProfile }) {
  const { matched, missing } = matchSkills(opportunity, profile);
  const slotsLeft = opportunity.slotsTotal - opportunity.slotsFilled;
  const full = slotsLeft <= 0;

  return (
    <li className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{opportunity.roleTitle}</p>
          <p className="text-sm text-muted-foreground">
            {opportunity.eventTitle} · {formatDate(opportunity.eventStart)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <Button size="sm" disabled title={full ? "This role is full" : undefined}>
            {full ? "Role full" : "Apply"}
          </Button>
          {!full && <span className="text-xs text-muted-foreground">Applications open in Phase 3</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {opportunity.requiredSkills.map((skill) => {
          const has = matched.includes(skill);
          return (
            <span
              key={skill}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                has ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground",
              )}
            >
              {has && <CircleCheck className="size-3" aria-hidden />}
              {skill}
              <span className="sr-only">{has ? "(you have this)" : "(you don't have this yet)"}</span>
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {matched.length > 0
            ? `You match ${matched.length} of ${opportunity.requiredSkills.length} required skills`
            : "None of your declared skills match yet"}
          {missing.length > 0 && matched.length > 0 && ` · missing ${missing.join(", ")}`}
        </span>
        <span>
          {opportunity.slotsFilled}/{opportunity.slotsTotal} filled
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`${opportunity.roleTitle} slots filled`}
        aria-valuemin={0}
        aria-valuemax={opportunity.slotsTotal}
        aria-valuenow={opportunity.slotsFilled}
      >
        <div
          className={cn("h-full rounded-full", full ? "bg-slate-400" : "bg-primary")}
          style={{ width: `${Math.min(100, (opportunity.slotsFilled / opportunity.slotsTotal) * 100)}%` }}
        />
      </div>
    </li>
  );
}

export function SkillsPage() {
  const profile = useSkillProfile();
  const opportunities = useVolunteerOpportunities();

  return (
    <>
      <PageHeader
        title="Skills & volunteering"
        description="Keep your skills up to date so organizers can find you, and pick up volunteer roles that fit."
      />

      <div className="grid items-start gap-4 lg:grid-cols-[320px_1fr]">
        {profile.isPending ? (
          <Card>
            <LoadingState label="Loading your profile…" />
          </Card>
        ) : profile.isError ? (
          <Card>
            <ErrorState error={profile.error} onRetry={() => profile.refetch()} />
          </Card>
        ) : (
          <SkillProfileCard profile={profile.data} />
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold" aria-hidden />
              <CardTitle>Open volunteer roles</CardTitle>
            </div>
            <CardDescription>Skills you already have are highlighted, so you can see why a role fits.</CardDescription>
          </CardHeader>
          <CardContent>
            {opportunities.isPending ? (
              <LoadingState label="Loading volunteer roles…" />
            ) : opportunities.isError ? (
              <ErrorState error={opportunities.error} onRetry={() => opportunities.refetch()} />
            ) : opportunities.data.length === 0 ? (
              <EmptyState title="No open roles right now" description="Check back when new events are announced." />
            ) : (
              <ul className="divide-y">
                {opportunities.data.map((opportunity) => (
                  <OpportunityRow key={opportunity.id} opportunity={opportunity} profile={profile.data} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
