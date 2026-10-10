import { Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "./page-header";

interface ComingSoonProps {
  title: string;
  description: string;
  /** Implementation phase from the project plan, e.g. "Phase 2: Resources and Booking". */
  phase: string;
  planned: string[];
}

/**
 * Placeholder for routes that exist in navigation but aren't built yet.
 * Keeps "planned" clearly separate from "implemented".
 */
export function ComingSoon({ title, description, phase, planned }: ComingSoonProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Construction className="size-4 text-gold" aria-hidden />
            <CardTitle>Not built yet</CardTitle>
          </div>
          <CardDescription>Planned for {phase}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {planned.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
