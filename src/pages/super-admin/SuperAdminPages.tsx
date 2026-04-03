import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { createBranch, createOrgAdmin, createOrganization } from '../../api/adminService';
import { createTag, deleteTag, updateTag } from '../../api/tagService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationControls } from '../../components/common/PaginationControls';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { ThemePreferencesCard } from '../../components/common/ThemePreferencesCard';
import { useOrganizationBranchesQuery, useOrganizationQuery, useOrganizationsQuery } from '../../hooks/useAdminQueries';
import { useTagsQuery } from '../../hooks/useTagQueries';
import { useAuthStore } from '../../store/authStore';
import type { TagListResponse, TagResponse, ValidationErrorResponse } from '../../types/api';
import { formatDateTime, formatRoleLabel } from '../../utils/formatters';
import { getStatusAccent } from '../../utils/statusStyles';
import { getTagColor } from '../../utils/tagColors';

const organizationSchema = z.object({
  name: z.string().min(2, 'Enter the organization name'),
  code: z.string().optional(),
});

const branchSchema = z.object({
  name: z.string().min(2, 'Enter the branch name'),
  city: z.string().optional(),
  state: z.string().optional(),
});

const orgAdminSchema = z.object({
  name: z.string().min(2, 'Enter the admin name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
  organizationId: z.string().min(1, 'Select an organization'),
  branchId: z.string().optional(),
  phone: z.string().optional(),
});

type OrganizationForm = z.infer<typeof organizationSchema>;
type BranchForm = z.infer<typeof branchSchema>;
type OrgAdminForm = z.infer<typeof orgAdminSchema>;

const TAG_QUERY_KEY = ['tags', 'list'] as const;

function getTagErrorMessage(error: AxiosError<ValidationErrorResponse>) {
  const status = error.response?.status;
  const detail = error.response?.data?.message?.detail?.[0]?.msg;

  if (status === 409) {
    return 'A tag with this name already exists.';
  }

  if (status === 422 || status === 400) {
    return detail ?? 'Tag name cannot be blank.';
  }

  return 'Unable to save this tag right now.';
}

export function SuperAdminDashboardPage() {
  const { data, isLoading, isError } = useOrganizationsQuery(1, 8);

  if (isLoading) return <LoadingScreen label="Loading super admin dashboard..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Super admin dashboard data is unavailable right now.</div>;

  const recentOrganizations = [...data.items].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)).slice(0, 5);
  const latestOrganization = recentOrganizations[0];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Platform administration"
        eyebrow="Super admin dashboard"
        action={<Link to="/super-admin/organizations/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Create organization</Link>}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Organizations" value={data.total} helper="Active organizations currently managed in Parishkan AI." accent="emerald" />
          <StatCard label="Showing" value={data.items.length} helper="Recent organizations loaded into this overview." accent="blue" />
          <StatCard label="Latest created" value={latestOrganization ? formatDateTime(latestOrganization.createdAt) : 'No data'} helper="Most recent organization creation time." accent="amber" />
          <StatCard label="Latest code" value={latestOrganization?.code ?? 'Not assigned'} helper="Reference code for the newest organization." accent="slate" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Recent organizations" eyebrow="Latest activity">
          {recentOrganizations.length === 0 ? (
            <EmptyState title="No organizations yet" description="Create the first organization to start setting up branches and org admins." actionLabel="Create organization" actionTo="/super-admin/organizations/new" />
          ) : (
            <div className="space-y-4">
              {recentOrganizations.map((organization) => (
                <Link key={organization.id} to={`/super-admin/organizations/${organization.id}`} className="block rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-slate-600">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{organization.name}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Code: {organization.code ?? 'Not assigned'}</p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateTime(organization.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Quick actions" eyebrow="Setup">
          <div className="grid gap-3">
            <Link to="/super-admin/organizations" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white">
              Review all organizations
            </Link>
            <Link to="/super-admin/organizations/new" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white">
              Create a new organization
            </Link>
            <Link to="/super-admin/org-admins/new" className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white">
              Provision an org admin
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function SuperAdminOrganizationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useOrganizationsQuery(page, 12, search.trim() || undefined);

  if (isLoading) return <LoadingScreen label="Loading organizations..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Organization data is unavailable right now.</div>;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Organizations"
        eyebrow="Platform setup"
        action={<Link to="/super-admin/organizations/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Create organization</Link>}
      >
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by organization name"
            className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
            Open any organization to manage branches and create dedicated org-admin accounts.
          </div>
        </div>
      </SectionCard>

      {data.items.length === 0 ? (
        <EmptyState title="No organizations found" description="Adjust the search or create a new organization to continue." actionLabel="Create organization" actionTo="/super-admin/organizations/new" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data.items.map((organization) => (
            <Link key={organization.id} to={`/super-admin/organizations/${organization.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-slate-600">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{organization.name}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Code: {organization.code ?? 'Not assigned'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {formatDateTime(organization.createdAt)}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Threshold: {organization.atRiskThreshold ?? 'Not set'}</p>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls page={page} total={data.total} limit={data.limit} onPageChange={setPage} />
    </div>
  );
}

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<OrganizationForm>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: '', code: '' },
  });

  const mutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: async (organization) => {
      toast.success('Organization created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      navigate(`/super-admin/organizations/${organization.id}`);
    },
    onError: () => toast.error('Unable to create the organization right now.'),
  });

  return (
    <SectionCard title="Create organization" eyebrow="Organization setup">
      <form
        className="grid gap-4 md:max-w-2xl"
        onSubmit={form.handleSubmit((values) => mutation.mutate({ name: values.name, code: values.code || null }))}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Organization name</label>
          <input {...form.register('name')} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
          {form.formState.errors.name ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Organization code</label>
          <input {...form.register('code')} placeholder="Optional" className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        </div>
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          {mutation.isPending ? 'Creating...' : 'Create organization'}
        </button>
      </form>
    </SectionCard>
  );
}

export function SuperAdminOrganizationDetailPage() {
  const { orgId = '' } = useParams();
  const organizationQuery = useOrganizationQuery(orgId);
  const branchesQuery = useOrganizationBranchesQuery(orgId, 1, 100);

  if (organizationQuery.isLoading || branchesQuery.isLoading) return <LoadingScreen label="Loading organization..." />;
  if (organizationQuery.isError || branchesQuery.isError || !organizationQuery.data || !branchesQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this organization.</div>;
  }

  const organization = organizationQuery.data;
  const orgAdmins = organization.orgAdmins ?? [];

  return (
    <div className="space-y-6">
      <SectionCard
        title={organization.name}
        eyebrow="Organization detail"
        action={
          <div className="flex flex-wrap gap-3">
            <Link to={`/super-admin/organizations/${organization.id}/branches/new`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500">
              Create branch
            </Link>
            <Link to={`/super-admin/org-admins/new?organizationId=${organization.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Create org admin
            </Link>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Code" value={organization.code ?? 'Not assigned'} helper="Reference code used for this organization." accent="blue" />
          <StatCard label="Branches" value={branchesQuery.data.items.length} helper="Branches currently configured under this organization." accent="emerald" />
          <StatCard label="Org admins" value={orgAdmins.length} helper="Organization admins returned with the organization detail response." accent="amber" />
          <StatCard label="Created" value={formatDateTime(organization.createdAt)} helper="Organization creation timestamp." accent="slate" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="Branches" eyebrow="Branch setup">
          {branchesQuery.data.items.length === 0 ? (
            <EmptyState title="No branches yet" description="Create the first branch for this organization." actionLabel="Create branch" actionTo={`/super-admin/organizations/${organization.id}/branches/new`} />
          ) : (
            <div className="space-y-4">
              {branchesQuery.data.items.map((branch) => (
                <div key={branch.id} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{branch.name}</h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {[branch.city, branch.state].filter(Boolean).join(', ') || 'Location not set'}
                      </p>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{formatDateTime(branch.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Org admins" eyebrow="Access ownership">
          {orgAdmins.length === 0 ? (
            <EmptyState title="No org admins listed" description="Create an org-admin account so the organization can start managing its own users and settings." actionLabel="Create org admin" actionTo={`/super-admin/org-admins/new?organizationId=${organization.id}`} />
          ) : (
            <div className="space-y-4">
              {orgAdmins.map((admin) => (
                <div key={admin.id} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{admin.name}</h3>
                      <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-400 [overflow-wrap:anywhere]">{admin.email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${admin.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export function CreateBranchPage() {
  const { orgId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: '', city: '', state: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: BranchForm) => createBranch(orgId, { name: values.name, city: values.city || null, state: values.state || null }),
    onSuccess: async () => {
      toast.success('Branch created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organization-branches', orgId] });
      navigate(`/super-admin/organizations/${orgId}`);
    },
    onError: () => toast.error('Unable to create the branch right now.'),
  });

  return (
    <SectionCard title="Create branch" eyebrow="Organization branch">
      <form className="grid gap-4 md:max-w-2xl" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Branch name</label>
          <input {...form.register('name')} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
          {form.formState.errors.name ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
            <input {...form.register('city')} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">State</label>
            <input {...form.register('state')} className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
          </div>
        </div>
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          {mutation.isPending ? 'Creating...' : 'Create branch'}
        </button>
      </form>
    </SectionCard>
  );
}

export function CreateOrgAdminPage() {
  const [searchParams] = useSearchParams();
  const prefilledOrgId = searchParams.get('organizationId') ?? '';
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(prefilledOrgId);
  const organizationsQuery = useOrganizationsQuery(1, 100);
  const branchesQuery = useOrganizationBranchesQuery(selectedOrganizationId, 1, 100);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<OrgAdminForm>({
    resolver: zodResolver(orgAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      organizationId: prefilledOrgId,
      branchId: '',
      phone: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: OrgAdminForm) =>
      createOrgAdmin({
        name: values.name,
        email: values.email,
        password: values.password,
        organizationId: values.organizationId,
        branchId: values.branchId || null,
        phone: values.phone || null,
      }),
    onSuccess: async (_, values) => {
      toast.success('Org admin created.');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'organization', values.organizationId] });
      navigate(`/super-admin/organizations/${values.organizationId}`);
    },
    onError: () => toast.error('Unable to create the org admin right now.'),
  });

  if (organizationsQuery.isLoading) return <LoadingScreen label="Loading organization options..." />;
  if (organizationsQuery.isError || !organizationsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Organization options are unavailable right now.</div>;
  }

  return (
    <SectionCard title="Create org admin" eyebrow="Access setup">
      <form
        className="grid gap-4 md:max-w-2xl"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <input {...form.register('name')} placeholder="Admin name" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <input {...form.register('email')} placeholder="Admin email" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <input type="password" {...form.register('password')} placeholder="Temporary password" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <select
          {...form.register('organizationId')}
          onChange={(event) => {
            setSelectedOrganizationId(event.target.value);
            form.setValue('organizationId', event.target.value);
            form.setValue('branchId', '');
          }}
          className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
        >
          <option value="">Select organization</option>
          {organizationsQuery.data.items.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </select>
        <select {...form.register('branchId')} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" disabled={!selectedOrganizationId}>
          <option value="">Optional branch assignment</option>
          {branchesQuery.data?.items.map((branch) => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
        <input {...form.register('phone')} placeholder="Phone (optional)" className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100" />
        <button type="submit" disabled={mutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
          {mutation.isPending ? 'Creating...' : 'Create org admin'}
        </button>
      </form>
    </SectionCard>
  );
}

export function SuperAdminTagsPage() {
  const queryClient = useQueryClient();
  const tagsQuery = useTagsQuery();
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingError, setEditingError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TagResponse | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTagListCache = (updater: (current: TagResponse[]) => TagResponse[]) => {
    queryClient.setQueryData<TagListResponse | undefined>(TAG_QUERY_KEY, (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: updater(current.items),
      };
    });
  };

  const resetDeleteDialog = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }

    setDeleteTarget(null);
    setDeleteCountdown(5);
  };

  useEffect(() => () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!deleteTarget) {
      return;
    }

    setDeleteCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setDeleteCountdown((current) => (current > 1 ? current - 1 : 1));
    }, 1000);
    countdownTimeoutRef.current = setTimeout(() => {
      resetDeleteDialog();
    }, 5000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
        countdownTimeoutRef.current = null;
      }
    };
  }, [deleteTarget]);

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: async (createdTag) => {
      setCreateName('');
      setCreateError('');
      updateTagListCache((current) => [...current, createdTag]);
      await queryClient.invalidateQueries({ queryKey: TAG_QUERY_KEY });
    },
    onError: (error: AxiosError<ValidationErrorResponse>) => {
      setCreateError(getTagErrorMessage(error));
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ tagId, name }: { tagId: string; name: string }) => updateTag(tagId, { name }),
    onSuccess: async (updatedTag) => {
      updateTagListCache((current) =>
        current.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)),
      );
      setEditingTagId(null);
      setEditingName('');
      setEditingError('');
      await queryClient.invalidateQueries({ queryKey: TAG_QUERY_KEY });
    },
    onError: (error: AxiosError<ValidationErrorResponse>) => {
      setEditingError(getTagErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: async (_, tagId) => {
      updateTagListCache((current) => current.filter((tag) => tag.id !== tagId));
      resetDeleteDialog();
      toast.success('Tag deleted.');
      await queryClient.invalidateQueries({ queryKey: TAG_QUERY_KEY });
    },
    onError: () => {
      toast.error('Unable to delete this tag right now.');
      resetDeleteDialog();
    },
  });

  const startEditing = (tag: TagResponse) => {
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditingError('');
  };

  const cancelEditing = () => {
    setEditingTagId(null);
    setEditingName('');
    setEditingError('');
  };

  const submitCreate = () => {
    const name = createName.trim();
    if (!name) {
      setCreateError('Tag name cannot be blank.');
      return;
    }

    setCreateError('');
    createMutation.mutate({ name });
  };

  const submitRename = () => {
    if (!editingTagId) {
      return;
    }

    const name = editingName.trim();
    if (!name) {
      setEditingError('Tag name cannot be blank.');
      return;
    }

    setEditingError('');
    renameMutation.mutate({ tagId: editingTagId, name });
  };

  if (tagsQuery.isLoading) {
    return <LoadingScreen label="Loading tags..." />;
  }

  if (tagsQuery.isError || !tagsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">Tag management is unavailable right now.</div>;
  }

  return (
    <>
      <SectionCard title="Tags" eyebrow="Global tag library">
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <input
                value={createName}
                onChange={(event) => {
                  setCreateName(event.target.value);
                  if (createError) {
                    setCreateError('');
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    submitCreate();
                  }
                }}
                placeholder="Create a new tag"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
              />
              {createError ? <p className="mt-2 text-sm text-rose-500">{createError}</p> : null}
            </div>
            <button
              type="button"
              onClick={submitCreate}
              disabled={createMutation.isPending}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              {createMutation.isPending ? 'Adding...' : 'Add tag'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Available tags</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Click a tag to rename it. Hover to reveal the delete action.</p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {tagsQuery.data.total} tags
            </span>
          </div>

          {tagsQuery.data.items.length === 0 ? (
            <EmptyState title="No tags yet" description="Create your first tag to start organizing tagged questions across the platform." />
          ) : (
            <div className="max-h-[28rem] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <div className="flex flex-wrap gap-3">
                {tagsQuery.data.items.map((tag) => {
                  const colors = getTagColor(tag.name);
                  const isEditing = editingTagId === tag.id;
                  return (
                    <div key={tag.id} className="space-y-2">
                      {isEditing ? (
                        <div className="rounded-2xl border border-emerald-400/70 bg-white p-3 shadow-sm dark:bg-slate-950">
                          <div className="flex items-center gap-2">
                            <input
                              value={editingName}
                              onChange={(event) => {
                                setEditingName(event.target.value);
                                if (editingError) {
                                  setEditingError('');
                                }
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  submitRename();
                                }
                                if (event.key === 'Escape') {
                                  event.preventDefault();
                                  cancelEditing();
                                }
                              }}
                              autoFocus
                              className="min-w-[10rem] rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />
                            <button
                              type="button"
                              onClick={submitRename}
                              disabled={renameMutation.isPending}
                              className="rounded-full border border-emerald-400/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                          {editingError ? <p className="mt-2 text-sm text-rose-500">{editingError}</p> : null}
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => startEditing(tag)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              startEditing(tag);
                            }
                          }}
                          className="group inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
                          style={{ backgroundColor: colors.bg, color: colors.text, borderColor: `${colors.text}33` }}
                        >
                          <span>{tag.name}</span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteTarget(tag);
                            }}
                            className="rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Delete tag</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{deleteTarget.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This action cannot be undone. Confirm within {deleteCountdown} seconds to permanently remove this tag.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetDeleteDialog}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : `Delete now (${deleteCountdown})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SuperAdminSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const details = useMemo(
    () => [
      { label: 'Organization', value: user?.organizationName ?? 'Platform level' },
      { label: 'Branch', value: user?.branchName ?? 'Not assigned' },
      { label: 'Phone', value: user?.phone ?? 'Not provided' },
      { label: 'User ID', value: user?.id ?? 'Not available' },
    ],
    [user],
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Super admin profile" eyebrow="Account overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Name" value={user?.name ?? 'Not available'} helper="Your display name for platform administration." accent="emerald" />
          <StatCard label="Role" value={formatRoleLabel(user?.role ?? 'super_admin')} helper="Your current access level in Parishkan AI." accent="blue" />
          <StatCard label="Email" value={user?.email ?? 'Not available'} helper="Your primary sign-in email." accent="amber" />
          <StatCard label="Status" value={user?.isActive ? 'Active' : 'Inactive'} helper="Shows whether this account is active." accent={getStatusAccent(user?.isActive ? 'active' : 'inactive')} />
        </div>
      </SectionCard>

      <SectionCard title="Profile details" eyebrow="Account information">
        <div className="grid gap-4 md:grid-cols-2">
          {details.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className={`mt-3 text-sm text-slate-700 dark:text-slate-300 ${item.label === 'User ID' ? 'break-all' : 'break-words [overflow-wrap:anywhere]'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <ThemePreferencesCard />
    </div>
  );
}
