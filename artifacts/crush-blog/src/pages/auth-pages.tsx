import { SignIn, SignUp } from '@clerk/react';
import { Link } from 'wouter';
import type { ReactNode } from 'react';
import { Brand } from '@/components/site';
import { Eyebrow } from '@/components/ui-primitives';
import { clerkAppearance } from '@/lib/clerk-appearance';
function AuthFrame({ children }: { children: ReactNode }) {
  return <main className="grid min-h-[100dvh] bg-[#f8f6f1] lg:grid-cols-[.9fr_1.1fr]">
    <section className="relative hidden overflow-hidden bg-[#eae5da] p-12 lg:flex lg:flex-col lg:justify-between">
      <Brand /><div className="absolute -right-24 top-[18%] h-[460px] w-[460px] rounded-full border border-[#d1c8b9]" /><div className="absolute -right-8 top-[28%] h-[300px] w-[300px] rounded-full border border-[#d1c8b9]" />
      <div className="relative max-w-xl"><Eyebrow>The work behind the story</Eyebrow><h1 className="mt-5 text-6xl font-extrabold leading-[.92] tracking-[-.08em]">Make room<br />for the real<br /><span className="text-[#c33a32]">story.</span></h1><p className="editorial-serif mt-6 max-w-sm text-xl leading-relaxed text-[#706b63]">The best business stories aren’t about having it figured out. They’re about showing up anyway.</p></div>
      <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[.18em] text-[#827b71]"><span>Crush Journal · Independent since 2024</span><span>Editor’s access</span></div>
    </section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-[450px]">
      <div className="mb-8 flex items-center justify-between lg:hidden"><Brand /><Eyebrow>Editor’s access</Eyebrow></div>{children}
      <Link href="/" className="mt-8 block text-center text-[10px] font-semibold uppercase tracking-[.16em] text-[#827b71] hover:text-[#a73630]" data-testid="link-auth-return">Return to Crush</Link>
      <p className="mt-5 text-center text-[10px] leading-5 text-[#9a9389]">Crush editorial is reserved for the approved editor. The publication remains open to all readers.</p>
    </div></section>
  </main>;
}
export function SignInPage() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return <AuthFrame><div className="mb-6"><Eyebrow>Editorial access</Eyebrow><h2 className="mt-2 text-3xl font-extrabold tracking-[-.06em]">Back to the work.</h2></div><SignIn routing="path" path={`${base}/sign-in`} signUpUrl={`${base}/sign-up`} forceRedirectUrl={`${base}/admin`} appearance={clerkAppearance} /></AuthFrame>;
}
export function SignUpPage() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return <AuthFrame><div className="mb-6"><Eyebrow>Crush editorial</Eyebrow><h2 className="mt-2 text-3xl font-extrabold tracking-[-.06em]">Create an account.</h2></div><SignUp routing="path" path={`${base}/sign-up`} signInUrl={`${base}/sign-in`} forceRedirectUrl={`${base}/admin`} appearance={clerkAppearance} /></AuthFrame>;
}
