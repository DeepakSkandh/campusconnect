import {
  Bell,
  Building2,
  CalendarDays,
  CalendarPlus,
  ClipboardCheck,
  ClipboardList,
  HandHeart,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/domain";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Roles that see this item. Omit for everyone signed in. UI-only; the backend authorizes. */
  roles?: Role[];
}

/** Primary navigation: the three product modules (plus Home). */
export const MAIN_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, description: "Your dashboard" },
  { to: "/resources", label: "Resources", icon: Building2, description: "Find labs, rooms and equipment" },
  { to: "/events", label: "Events", icon: CalendarDays, description: "Discover and organise campus events" },
  {
    to: "/skills",
    label: "Skills & Volunteering",
    icon: HandHeart,
    description: "Your skill profile and volunteer roles",
  },
];

const STUDENT_ROLES: Role[] = ["student", "organizer"];
const ADMIN_ROLES: Role[] = ["dept_admin", "campus_admin"];

/** Dashboard shortcut tiles, filtered by role. */
export const DASHBOARD_TILES: NavItem[] = [
  { to: "/resources", label: "Resources", icon: Building2, description: "Browse campus facilities and equipment" },
  { to: "/events", label: "Events", icon: CalendarDays, description: "Workshops, hackathons and more" },
  {
    to: "/events/new",
    label: "Create Event",
    icon: CalendarPlus,
    description: "Propose an event and list what you need",
    roles: STUDENT_ROLES,
  },
  {
    to: "/bookings",
    label: "My Bookings",
    icon: ClipboardList,
    description: "Track your booking requests",
    roles: STUDENT_ROLES,
  },
  {
    to: "/skills",
    label: "Volunteering",
    icon: HandHeart,
    description: "Your skills and open volunteer roles",
    roles: STUDENT_ROLES,
  },
  { to: "/notifications", label: "Notifications", icon: Bell, description: "Updates on your requests" },
  {
    to: "/admin/approvals",
    label: "Approvals",
    icon: ClipboardCheck,
    description: "Review pending booking requests",
    roles: ADMIN_ROLES,
  },
  {
    to: "/admin/resources",
    label: "Manage Resources",
    icon: Wrench,
    description: "Resources, equipment and schedules",
    roles: ["dept_admin"],
  },
  { to: "/admin/reports", label: "Reports", icon: TrendingUp, description: "Utilization reports", roles: ADMIN_ROLES },
  {
    to: "/admin/campus",
    label: "Campus Admin",
    icon: ShieldCheck,
    description: "Departments, roles and settings",
    roles: ["campus_admin"],
  },
  {
    to: "/admin/audit",
    label: "Audit Log",
    icon: ScrollText,
    description: "History of sensitive actions",
    roles: ["campus_admin"],
  },
];
