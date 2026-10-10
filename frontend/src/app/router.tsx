import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import type { RouteHandle } from "@/components/layout/breadcrumbs";
import { AuditLogPage, CampusAdminPage, ManageResourcesPage, ReportsPage } from "@/features/admin/admin-pages";
import { LoginPage } from "@/features/auth/login-page";
import { RequireAuth, RequireRole } from "@/features/auth/require-auth";
import { ApprovalQueuePage } from "@/features/bookings/approval-queue-page";
import { MyBookingsPage } from "@/features/bookings/my-bookings-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { CreateEventPage } from "@/features/events/create-event-page";
import { EventsPage } from "@/features/events/events-page";
import { NotificationsPage } from "@/features/notifications/notifications-page";
import { ResourceDetailPage } from "@/features/resources/resource-detail-page";
import { ResourcesPage } from "@/features/resources/resources-page";
import { SkillsPage } from "@/features/skills/skills-page";
import { NotFoundPage, RouteErrorPage } from "./route-pages";

const crumb = (label: string): RouteHandle => ({ crumb: label });

/*
 * Route map. Role guards here only hide pages; the backend authorizes every
 * request independently (spec §5).
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    handle: crumb("Home"),
    children: [
      {
        // Pathless layout route: errors in a page keep the header visible.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <DashboardPage /> },

          {
            path: "resources",
            handle: crumb("Resources"),
            children: [
              { index: true, element: <ResourcesPage /> },
              { path: ":resourceId", element: <ResourceDetailPage />, handle: crumb("Details") },
            ],
          },

          {
            path: "events",
            handle: crumb("Events"),
            children: [
              { index: true, element: <EventsPage /> },
              {
                path: "new",
                element: (
                  <RequireRole roles={["student", "organizer"]}>
                    <CreateEventPage />
                  </RequireRole>
                ),
                handle: crumb("Create event"),
              },
            ],
          },

          { path: "skills", element: <SkillsPage />, handle: crumb("Skills & Volunteering") },
          { path: "bookings", element: <MyBookingsPage />, handle: crumb("My bookings") },
          { path: "notifications", element: <NotificationsPage />, handle: crumb("Notifications") },

          {
            // No crumb: /admin itself has no page.
            path: "admin",
            children: [
              {
                element: <RequireRole roles={["dept_admin", "campus_admin"]} />,
                children: [
                  { path: "approvals", element: <ApprovalQueuePage />, handle: crumb("Approvals") },
                  { path: "reports", element: <ReportsPage />, handle: crumb("Reports") },
                ],
              },
              {
                element: <RequireRole roles={["dept_admin"]} />,
                children: [{ path: "resources", element: <ManageResourcesPage />, handle: crumb("Manage resources") }],
              },
              {
                element: <RequireRole roles={["campus_admin"]} />,
                children: [
                  { path: "campus", element: <CampusAdminPage />, handle: crumb("Campus admin") },
                  { path: "audit", element: <AuditLogPage />, handle: crumb("Audit log") },
                ],
              },
            ],
          },

          { path: "*", element: <NotFoundPage />, handle: crumb("Not found") },
        ],
      },
    ],
  },
]);
