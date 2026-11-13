import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Brand } from '@/components/site';
import { Eyebrow } from '@/components/ui-primitives';

export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#f8f6f1] px-5 text-center">
      <div className="max-w-lg">
        <Brand />
        <Eyebrow>Not in this issue</Eyebrow>
        <h1 className="mt-5 text-4xl font-extrabold tracking-[-.07em] sm:text-5xl">
          That page has moved on.
        </h1>
        <p className="editorial-serif mt-4 text-lg leading-relaxed text-[#706b63]">
          The story you’re looking for may have changed pages. There’s always
          something else worth reading.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#24211e] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#c33a32]"
          data-testid="link-not-found-home"
        >
          <ArrowLeft size={14} />
          Back to the magazine
        </Link>
      </div>
    </main>
  );
}
