import { Link } from 'react-router-dom';
import { IconLabel } from '../../utils/appIcons';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-10 text-center shadow-2xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">The page you opened could not be found. You can head back to the public homepage and continue from there.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <IconLabel label="Go to homepage" />
        </Link>
      </div>
    </div>
  );
}
