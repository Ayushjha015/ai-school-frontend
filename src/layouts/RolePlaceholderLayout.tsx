export function RolePlaceholderLayout({ roleLabel, description }: { roleLabel: string; description: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-2xl rounded-[32px] border border-white/70 bg-white/90 p-10 text-center shadow-2xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Protected route</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{roleLabel} workspace</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
