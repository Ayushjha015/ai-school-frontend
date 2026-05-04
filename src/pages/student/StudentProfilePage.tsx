import { BriefcaseBusiness, Building2, Hash, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { ThemePreferencesCard } from '../../components/common/ThemePreferencesCard';
import { SectionCard } from '../../components/common/SectionCard';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../utils/formatters';
import { getStatusAccent, type StatusAccent } from '../../utils/statusStyles';

const cardBg: Record<StatusAccent, string> = {
  emerald: 'from-white to-emerald-50 border-emerald-100 dark:from-emerald-500/18 dark:to-slate-900 dark:border-emerald-800/70',
  blue: 'from-white to-blue-50 border-blue-100 dark:from-blue-500/18 dark:to-slate-900 dark:border-blue-800/70',
  amber: 'from-white to-amber-50 border-amber-100 dark:from-amber-500/18 dark:to-slate-900 dark:border-amber-800/70',
  rose: 'from-white to-rose-50 border-rose-100 dark:from-rose-500/18 dark:to-slate-900 dark:border-rose-800/70',
  slate: 'from-white to-slate-50 border-slate-100 dark:from-slate-700/35 dark:to-slate-900 dark:border-slate-700',
};

const iconBg: Record<StatusAccent, string> = {
  emerald: 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/20',
  blue: 'bg-blue-100 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-400/15 dark:text-blue-200 dark:ring-blue-400/20',
  amber: 'bg-amber-100 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-400/20',
  rose: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-400/15 dark:text-rose-200 dark:ring-rose-400/20',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-400/10 dark:text-slate-200 dark:ring-slate-400/15',
};

export function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const statusAccent = getStatusAccent(user?.isActive ? 'active' : 'inactive');

  return (
    <div className="space-y-6">
      <SectionCard title="Student profile" eyebrow="Account overview">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Name */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg.emerald}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Name</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg.emerald}`}>
                <UserRound className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {user?.name ?? 'Not available'}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Your display name for this account.</p>
          </div>

          {/* Role */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg.blue}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Role</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg.blue}`}>
                <BriefcaseBusiness className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {formatRoleLabel(user?.role ?? 'STUDENT')}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Your current access level in the portal.</p>
          </div>

          {/* Email */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg.amber}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Email</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg.amber}`}>
                <Mail className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {user?.email ?? 'Not available'}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Your primary sign-in email.</p>
          </div>

          {/* Status */}
          <div className={`rounded-3xl border bg-gradient-to-br p-5 shadow-sm ${cardBg[statusAccent]}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Status</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconBg[statusAccent]}`}>
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 break-words text-xl font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {user?.isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">Shows whether this account is ready to use.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Profile details" eyebrow="Account information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Organization</p>
            </div>
            <p className="mt-2.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {user?.organizationName ?? 'Not provided'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Branch</p>
            </div>
            <p className="mt-2.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {user?.branchName ?? 'Not provided'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Phone className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone</p>
            </div>
            <p className="mt-2.5 break-words text-sm font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
              {user?.phone ?? 'Not provided'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400">
                <Hash className="h-3.5 w-3.5" aria-hidden />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">User ID</p>
            </div>
            <p className="mt-2.5 break-all text-sm font-medium text-slate-900 dark:text-slate-100">
              {user?.id ?? 'Not provided'}
            </p>
          </div>
        </div>
      </SectionCard>

      <ThemePreferencesCard />
    </div>
  );
}
