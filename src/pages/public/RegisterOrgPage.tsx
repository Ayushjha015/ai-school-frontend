import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { PublicPageShell } from '../../components/public/PublicPageShell';
import { useTheme } from '../../theme/ThemeProvider';
import { IconLabel, appIcons } from '../../utils/appIcons';

const registerOrgSchema = z.object({
  organizationName: z.string().min(2, 'Enter your organization name'),
  contactName: z.string().min(2, 'Enter the main contact name'),
  designation: z.string().min(2, 'Enter the contact designation'),
  mobileNumber: z
    .string()
    .min(8, 'Enter a valid mobile number')
    .regex(/^[0-9+\-\s()]+$/, 'Use only numbers and standard phone characters'),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(10, 'Enter the organization address'),
});

type RegisterOrgFormData = z.infer<typeof registerOrgSchema>;

export function RegisterOrgPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const form = useForm<RegisterOrgFormData>({
    resolver: zodResolver(registerOrgSchema),
    defaultValues: {
      organizationName: '',
      contactName: '',
      designation: '',
      mobileNumber: '',
      email: '',
      address: '',
    },
  });

  async function onSubmit(values: RegisterOrgFormData) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success(`Thanks, ${values.contactName}. Your organization request has been recorded.`);
    form.reset();
  }

  const inputClasses = `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15' : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'}`;

  return (
    <PublicPageShell
      eyebrow="Organization onboarding"
      title="Tell us about your organization and we'll help you get started."
      description="Use this short form to share your organization details, main contact, and onboarding requirements. This request is reviewed before workspace setup begins."
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className={`rounded-[28px] border p-6 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-white/70 bg-white/85'}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Registration form</p>
          <h2 className={`mt-3 text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Register your org</h2>
          <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Share the primary details below. Once submitted, your request can be reviewed by the onboarding team.
          </p>

          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`} htmlFor="organizationName">
                  Organization name
                </label>
                <input id="organizationName" {...form.register('organizationName')} className={inputClasses} placeholder="Kendriya Vidyalaya Sangathan" />
                {form.formState.errors.organizationName ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.organizationName.message}</p> : null}
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`} htmlFor="contactName">
                  Contact person
                </label>
                <input id="contactName" {...form.register('contactName')} className={inputClasses} placeholder="Ayush Jha" />
                {form.formState.errors.contactName ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.contactName.message}</p> : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`} htmlFor="designation">
                  Designation
                </label>
                <input id="designation" {...form.register('designation')} className={inputClasses} placeholder="Principal" />
                {form.formState.errors.designation ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.designation.message}</p> : null}
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`} htmlFor="mobileNumber">
                  Mobile number
                </label>
                <input id="mobileNumber" {...form.register('mobileNumber')} className={inputClasses} placeholder="+91 98765 43210" />
                {form.formState.errors.mobileNumber ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.mobileNumber.message}</p> : null}
              </div>
            </div>

            <div>
              <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`} htmlFor="email">
                Email
              </label>
              <input id="email" type="email" {...form.register('email')} className={inputClasses} placeholder="contact@school.org" />
              {form.formState.errors.email ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.email.message}</p> : null}
            </div>

            <div>
              <label className={`mb-2 block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`} htmlFor="address">
                Organization address
              </label>
              <textarea id="address" rows={4} {...form.register('address')} className={inputClasses} placeholder="Enter the organization address" />
              {form.formState.errors.address ? <p className="mt-2 text-sm text-rose-500">{form.formState.errors.address.message}</p> : null}
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={`inline-flex w-full justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${isDark ? 'bg-emerald-300 text-slate-950 hover:bg-emerald-200' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
            >
              <IconLabel label={form.formState.isSubmitting ? 'Submitting request...' : 'Submit organization request'} icon={appIcons.Send} />
            </button>
          </form>
        </section>

        <section className={`rounded-[28px] border p-6 ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-white/70 bg-white/85'}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>What happens next</p>
          <div className="mt-5 space-y-4">
            {[
              'Your organization details are captured for onboarding review.',
              'The right contact information is available for follow-up communication.',
              'Workspace setup planning can begin with a clear view of your school or branch needs.',
            ].map((item, index) => (
              <div key={item} className={`rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50/80'}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Step 0{index + 1}</p>
                <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item}</p>
              </div>
            ))}
          </div>

          <div className={`mt-6 rounded-[28px] border p-5 ${isDark ? 'border-blue-900/60 bg-blue-950/30' : 'border-blue-200 bg-blue-50/80'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>Already have access?</p>
            <p className={`mt-2 text-sm leading-7 ${isDark ? 'text-blue-100/90' : 'text-blue-900/80'}`}>
              If your organization already uses the platform, head to organization login and continue with your existing account.
            </p>
            <Link
              to="/login"
              className={`mt-4 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition ${isDark ? 'bg-slate-100 text-slate-950 hover:bg-white' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
            >
              <IconLabel label="Go to login" icon={appIcons.LogIn} />
            </Link>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
