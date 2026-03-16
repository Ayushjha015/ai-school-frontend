import { ThemePreferencesCard } from '../../components/common/ThemePreferencesCard';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../utils/formatters';
import { getStatusAccent } from '../../utils/statusStyles';

export function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <SectionCard title="My profile" eyebrow="Account overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Name" value={user?.name ?? 'Not available'} helper="Your display name for this account." accent="emerald" />
          <StatCard label="Role" value={formatRoleLabel(user?.role ?? 'STUDENT')} helper="Your current access level in the portal." accent="blue" />
          <StatCard label="Email" value={user?.email ?? 'Not available'} helper="Your primary sign-in email." accent="amber" />
          <StatCard label="Status" value={user?.isActive ? 'Active' : 'Inactive'} helper="Shows whether this account is ready to use." accent={getStatusAccent(user?.isActive ? 'active' : 'inactive')} />
        </div>
      </SectionCard>

      <SectionCard title="Profile details" eyebrow="Account information">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organization</p>
            <p className="mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{user?.organizationName ?? 'Not provided'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Branch</p>
            <p className="mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{user?.branchName ?? 'Not provided'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</p>
            <p className="mt-3 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{user?.phone ?? 'Not provided'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User ID</p>
            <p className="mt-3 break-all text-sm text-slate-700">{user?.id ?? 'Not provided'}</p>
          </div>
        </div>
      </SectionCard>

      <ThemePreferencesCard />
    </div>
  );
}
