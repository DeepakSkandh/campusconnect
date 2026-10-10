import { ComingSoon } from "@/components/common/coming-soon";

/*
 * Admin areas are routed and role-guarded now so navigation is complete,
 * but their functionality is scheduled for later phases.
 */

export function ManageResourcesPage() {
  return (
    <ComingSoon
      title="Manage resources"
      description="Add and maintain the facilities and equipment your department owns."
      phase="Phase 2: Resources and Booking"
      planned={[
        "Create, edit and deactivate resources owned by your department only",
        "Equipment inventory with quantities",
        "Operating hours and maintenance / closure blocks",
        "Per-resource approval and eligibility policies",
      ]}
    />
  );
}

export function ReportsPage() {
  return (
    <ComingSoon
      title="Utilization reports"
      description="How resources are being used across your department or the campus."
      phase="Phase 4: Integration"
      planned={[
        "Bookings per resource over time",
        "Approval turnaround and rejection rates",
        "Peak hours and under-used facilities",
      ]}
    />
  );
}

export function CampusAdminPage() {
  return (
    <ComingSoon
      title="Campus administration"
      description="Platform-wide configuration for campus administrators."
      phase="Phase 1–4"
      planned={[
        "Department management",
        "Assign and revoke administrative roles",
        "Institution-wide booking policies",
        "System settings",
      ]}
    />
  );
}

export function AuditLogPage() {
  return (
    <ComingSoon
      title="Audit log"
      description="A record of sensitive actions: approvals, cancellations, role changes and policy edits."
      phase="Phase 4: Integration"
      planned={["Filter by user, department, action and date", "Before/after values for each change", "Export for review"]}
    />
  );
}
