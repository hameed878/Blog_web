import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

export function Button({ children, className = '', variant = 'dark', disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'red' | 'light' | 'quiet' }) {
  const styles = {
    dark: 'bg-[#24211e] text-[#fffaf4] hover:bg-[#403b35]',
    red: 'bg-[#c33a32] text-white hover:bg-[#a72f29]',
    light: 'border border-[#d9d4ca] bg-[#fffdf9] text-[#302d28] hover:bg-[#f1ede5]',
    quiet: 'text-[#746e65] hover:bg-[#eee9e0] hover:text-[#201e1c]',
  };
  return <button {...props} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold tracking-[.02em] transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${styles[variant]} ${className}`}>{children}{disabled && props.type === 'submit' ? <LoaderCircle size={14} className="animate-spin" /> : null}</button>;
}

export function Field({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-[#d9d4ca] bg-[#fffdf9] px-3.5 py-3 text-sm text-[#201e1c] outline-none transition focus:border-[#c33a32] focus:ring-2 focus:ring-[#c33a32]/10 placeholder:text-[#a49d93] ${className}`} />;
}
export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full resize-y rounded-lg border border-[#d9d4ca] bg-[#fffdf9] px-3.5 py-3 text-sm leading-6 text-[#201e1c] outline-none transition focus:border-[#c33a32] focus:ring-2 focus:ring-[#c33a32]/10 placeholder:text-[#a49d93] ${className}`} />;
}
export function Eyebrow({ children }: { children: ReactNode }) { return <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a73630]">{children}</div>; }
export function Notice({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' | 'info' }) {
  const color = tone === 'success' ? 'border-[#98aa8b] bg-[#edf2e9] text-[#405440]' : tone === 'info' ? 'border-[#d8c9a8] bg-[#f5f0e4] text-[#66583d]' : 'border-[#dcaaa4] bg-[#f8ecea] text-[#8c332e]';
  return <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${color}`} data-testid="status-feedback">{children}</div>;
}
