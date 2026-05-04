import type { ComponentType, ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  Edit3,
  Eye,
  FileQuestion,
  FileText,
  GraduationCap,
  Hash,
  Inbox,
  LayoutDashboard,
  LibraryBig,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Monitor,
  Moon,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';

export type AppIcon = ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>;

const normalizedIconMap: Record<string, AppIcon> = {
  active: ShieldCheck,
  add: Plus,
  analytics: BarChart3,
  attempts: Activity,
  average: BarChart3,
  back: ChevronRight,
  branches: Building2,
  'build exam': ClipboardList,
  'bulk upload': Upload,
  classes: BookOpen,
  'class id': Hash,
  close: ChevronRight,
  code: Hash,
  continue: ChevronRight,
  create: Plus,
  created: CalendarClock,
  dashboard: LayoutDashboard,
  delete: Trash2,
  download: Download,
  edit: Edit3,
  email: Mail,
  errors: AlertTriangle,
  exams: ClipboardList,
  generated: Sparkles,
  groups: BookOpen,
  inactive: AlertTriangle,
  leaderboard: BarChart3,
  login: LogIn,
  logout: LogOut,
  name: UserRound,
  notifications: Bell,
  open: Eye,
  organizations: Building2,
  parent: Users,
  percentage: BarChart3,
  profile: UserRound,
  publish: Send,
  questions: FileQuestion,
  results: FileText,
  role: BriefcaseBusiness,
  'roll number': Hash,
  save: Save,
  score: CheckCircle2,
  search: Search,
  settings: Settings,
  status: ShieldCheck,
  students: GraduationCap,
  subjects: LibraryBig,
  submit: Send,
  tags: Tags,
  teacher: UserCheck,
  teachers: UserCheck,
  threshold: AlertTriangle,
  upload: Upload,
  user: User,
  'user id': Hash,
};

export function getAppIcon(label?: string | null, fallback: AppIcon = CircleHelp): AppIcon {
  if (!label) {
    return fallback;
  }

  const normalized = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (normalizedIconMap[normalized]) {
    return normalizedIconMap[normalized];
  }

  const partialMatch = Object.entries(normalizedIconMap).find(([key]) => normalized.includes(key));
  return partialMatch?.[1] ?? fallback;
}

export function getNavigationIcon(label: string): AppIcon {
  if (label.toLowerCase().includes('ai')) {
    return Bot;
  }

  return getAppIcon(label, LayoutDashboard);
}

export function getActionIcon(label: string): AppIcon {
  return getAppIcon(label, Plus);
}

export function getEmptyStateIcon(title: string): AppIcon {
  return getAppIcon(title, Inbox);
}

export function getStatIcon(label: string): AppIcon {
  return getAppIcon(label, Activity);
}

export function IconLabel({
  label,
  icon,
  className = '',
  iconClassName = 'h-4 w-4',
}: {
  label: ReactNode;
  icon?: AppIcon;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = icon ?? (typeof label === 'string' ? getActionIcon(label) : CircleHelp);

  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <Icon className={`${iconClassName} shrink-0`} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export const appIcons = {
  AlertTriangle,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Inbox,
  LogOut,
  LogIn,
  Mail,
  Menu,
  Moon,
  Monitor,
  Plus,
  Save,
  Search,
  Send,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserRound,
};
