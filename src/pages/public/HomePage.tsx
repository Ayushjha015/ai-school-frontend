import { Link } from 'react-router-dom';
import { PublicPageShell } from '../../components/public/PublicPageShell';
import { useTheme } from '../../theme/ThemeProvider';

const roleCards = [
  {
    title: 'For organizations',
    description: 'Centralize operations across branches and gain complete academic visibility.',
  },
  {
    title: 'For teachers',
    description: 'Create exams, manage question banks, and analyze student performance.',
  },
  {
    title: 'For students',
    description: 'Take exams, track progress, and understand performance easily.',
  },
  {
    title: 'For parents',
    description: 'Stay informed about exams, results, and academic growth.',
  },
];

const featureCards = [
  'Role-based dashboards designed for students, teachers, parents, and administrators.',
  'End-to-end exam lifecycle support from question authoring to live attempts and analytics.',
  'Result, leaderboard, and notification experiences that keep everyone aligned.',
  'A single secure workspace that adapts to each organization and branch structure.',
];

const benefits = [
  'Reduce manual coordination between teachers, parents, and students.',
  'Keep academic operations organized with clear access by role and responsibility.',
  'Make exam schedules, results, and progress easier to understand across the organization.',
];

export function HomePage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <PublicPageShell
      eyebrow="Platform overview"
      title="School operations, exams, and progress tracking in one polished workspace."
      description="Parishkan AI brings together organization access, question banks, exam delivery, analytics, student performance, and parent visibility in a single platform built for modern academic teams."
    >
      <div className="space-y-6 sm:space-y-8">
        <section
          className={`grid gap-6 overflow-hidden rounded-[32px] border p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-white/70 bg-white/85'}`}
        >
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Everything your academic workflow needs</p>
            <h2 className={`mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[3.4rem] ${isDark ? 'text-slate-50' : 'text-slate-950'}`}>
              Everything your academic workflow needs. Nothing it doesn&apos;t.
            </h2>
            <p className={`mt-5 max-w-2xl text-sm leading-7 sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              From onboarding institutions to conducting exams and analyzing results, Parishkan AI simplifies every step of the academic lifecycle with clarity, control, and real-time visibility.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${isDark ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
              >
                Organization login
              </Link>
              <Link
                to="/register-org"
                className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${isDark ? 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500' : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-400'}`}
              >
                Register your org
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className={`rounded-[28px] border p-5 ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All-in-one platform</p>
              <p className={`mt-3 text-lg font-semibold leading-8 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Manage organizations, exams, analytics, results, and communication without switching tools.</p>
            </div>
            <div className={`rounded-[28px] border p-5 ${isDark ? 'border-emerald-900/60 bg-emerald-950/40' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Built for real roles</p>
              <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-emerald-100/90' : 'text-emerald-900'}`}>Every user, student, teacher, parent, or admin, sees exactly what they need.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[28px] border p-5 shadow-sm ${isDark ? 'border-slate-800 bg-slate-950/75 shadow-black/10' : 'border-white/70 bg-white/85 shadow-slate-900/5'}`}
            >
              <h3 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{card.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{card.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className={`rounded-[28px] border p-6 ${isDark ? 'border-slate-800 bg-slate-950/75' : 'border-white/70 bg-white/85'}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Feature highlights</p>
            <div className="mt-5 space-y-4">
              {featureCards.map((item, index) => (
                <div key={item} className={`rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50/80'}`}>
                  <p className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>0{index + 1}</p>
                  <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[28px] border p-6 ${isDark ? 'border-slate-800 bg-slate-950/75' : 'border-white/70 bg-white/85'}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Why teams use it</p>
            <h3 className={`mt-3 text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Clarity over chaos in academic operations</h3>
            <div className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className={`mt-1 inline-block h-2.5 w-2.5 rounded-full ${isDark ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                  <p className={`text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{benefit}</p>
                </div>
              ))}
            </div>
            <div className={`mt-8 rounded-[28px] border p-5 ${isDark ? 'border-blue-900/60 bg-blue-950/30' : 'border-blue-200 bg-blue-50/80'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>Ready to bring your organization in?</p>
              <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-blue-100/90' : 'text-blue-900/80'}`}>
                Start with organization login if your team already uses Parishkan AI, or register your organization to begin the onboarding conversation.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className={`rounded-[28px] border p-6 ${isDark ? 'border-slate-800 bg-slate-950/75' : 'border-white/70 bg-white/85'}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Organization access</p>
            <h3 className={`mt-3 text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Sign in to your existing workspace.</h3>
            <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Use your organization-issued account to continue to the right role dashboard automatically after sign-in.
            </p>
            <Link
              to="/login"
              className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition ${isDark ? 'bg-slate-100 text-slate-950 hover:bg-white' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
            >
              Go to organization login
            </Link>
          </div>

          <div className={`rounded-[28px] border p-6 ${isDark ? 'border-emerald-900/60 bg-emerald-950/35' : 'border-emerald-200 bg-emerald-50/85'}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>New organization</p>
            <h3 className={`mt-3 text-2xl font-semibold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Register your organization.</h3>
            <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-emerald-100/90' : 'text-emerald-900/90'}`}>
              Share your organization details and contact information so the onboarding process can start with the right team.
            </p>
            <Link
              to="/register-org"
              className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition ${isDark ? 'bg-emerald-300 text-slate-950 hover:bg-emerald-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            >
              Open registration form
            </Link>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
