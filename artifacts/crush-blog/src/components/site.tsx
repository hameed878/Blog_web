import { Link } from 'wouter';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className={`inline-flex items-baseline ${small ? 'gap-1' : ''}`} aria-label="Crush home" data-testid="link-crush-home">
      <span className="masthead-word text-[2.15rem] leading-none text-[#201e1c]">Crush</span><span className="masthead-word -ml-1 text-[2.15rem] leading-none text-[#c33a32]">!</span>
    </Link>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-[#f8f6f1] text-[#201e1c]">
      <header className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex h-[94px] items-center justify-between border-b border-[#d9d4ca] sm:h-[118px]">
          <div className="w-20 text-[10px] uppercase tracking-[.22em] text-[#756f65]">Independent<br />since 2024</div>
          <Brand />
          <div className="hidden w-20 justify-end text-[10px] uppercase tracking-[.18em] text-[#756f65] sm:flex">Issue № 08</div>
          <button onClick={() => setOpen(!open)} className="rounded-full border border-[#d9d4ca] p-2 sm:hidden" aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 z-20 flex-col gap-4 border-b border-[#d9d4ca] bg-[#f8f6f1] px-5 py-5 text-xs font-semibold uppercase tracking-[.18em] sm:static sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-12 sm:border-0 sm:px-0 sm:py-0`} aria-label="Main navigation">
          <Link href="/" className="py-1 hover:text-[#c33a32]" data-testid="link-nav-latest">Latest stories</Link>
          <a href="/#voices" onClick={() => setOpen(false)} className="py-1 hover:text-[#c33a32]">The voices</a>
          <a href="/#about" onClick={() => setOpen(false)} className="py-1 hover:text-[#c33a32]">About Crush</a>
          <Link href="/admin" className="inline-flex items-center gap-1 py-1 text-[#a72f29] hover:text-[#201e1c]" data-testid="link-editorial-login">For the editor <ArrowUpRight size={13} /></Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-[#d9d4ca]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-14">
          <div><Brand /><p className="editorial-serif mt-3 max-w-sm text-sm text-[#746e65]">A journal of the people who made a way when there wasn’t one.</p></div>
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#746e65]">
            <a href="/#voices" className="hover:text-[#c33a32]">Our stories</a><a href="/#about" className="hover:text-[#c33a32]">About</a><Link href="/admin" className="hover:text-[#c33a32]" data-testid="link-footer-editor">Editor access</Link>
          </div>
          <span className="text-[10px] uppercase tracking-[.14em] text-[#9a948b]">© Crush Journal 2024–26</span>
        </div>
      </footer>
    </div>
  );
}

export function ImagePanel({ src, alt, className = '', tone = 'rose' }: { src?: string | null; alt: string; className?: string; tone?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#e8ddd2] ${className}`} data-testid="image-story-art">
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.025]" /> : (
        <div className={`story-art story-art-${tone} h-full w-full`} role="img" aria-label={alt}>
          <div className="art-sun" /><div className="art-orbit" /><div className="art-line" /><span className="art-mark">C!</span>
        </div>
      )}
      {src && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />}
    </div>
  );
}
