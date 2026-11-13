import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteAdminPost, useGetAdminSummary, useListAdminPosts, getGetAdminSummaryQueryKey, getListAdminPostsQueryKey, getGetFeaturedPostQueryKey, getListPublishedPostsQueryKey } from '@workspace/api-client-react';
import { ArrowDownUp, ArrowUpRight, FilePlus2, FileText, LoaderCircle, Search, Trash2 } from 'lucide-react';
import { useClerk, useUser } from '@clerk/react';
import { Eyebrow, Notice } from '@/components/ui-primitives';
import { Button, Field } from '@/components/ui-primitives';
import { Brand } from '@/components/site';

const APPROVED_EMAIL = 'malikhkm123@gmail.com';
function SignOutControl() {
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL;
  return <button type="button" onClick={() => signOut({ redirectUrl: basePath || '/' })} className="rounded-full border border-[#d9d4ca] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.13em] text-[#756f65] transition hover:border-[#c33a32] hover:text-[#a73630]" data-testid="button-sign-out">Sign out</button>;
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [, setLocation] = useLocation();
  if (!isLoaded) return <div className="grid min-h-[100dvh] place-items-center bg-[#f8f6f1]"><div className="h-8 w-8 animate-pulse rounded-full bg-[#e5ded3]" aria-label="Loading session" /></div>;
  if (!isSignedIn) {
    return <div className="grid min-h-[100dvh] place-items-center bg-[#f8f6f1] px-5"><div className="max-w-md text-center"><Brand /><Eyebrow>Editor’s desk</Eyebrow><h1 className="mt-5 text-3xl font-extrabold tracking-[-.06em]">The stories start here.</h1><p className="editorial-serif mt-3 text-lg text-[#706b63]">Sign in with the editor account to manage the magazine.</p><Button variant="red" className="mt-7" onClick={() => setLocation('/sign-in')} data-testid="button-admin-sign-in">Continue to sign in <ArrowUpRight size={14} /></Button><Link href="/" className="mt-5 block text-xs text-[#827b71] hover:text-[#a73630]" data-testid="link-admin-public-home">Back to the magazine</Link></div></div>;
  }
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (email !== APPROVED_EMAIL) return <div className="grid min-h-[100dvh] place-items-center bg-[#f8f6f1] px-5"><div className="max-w-lg rounded-2xl border border-[#d9d4ca] bg-[#fffdf9] p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f8ecea] text-[#a73630]"><ArrowUpRight size={20} /></div><Eyebrow>Access restricted</Eyebrow><h1 className="mt-4 text-3xl font-extrabold tracking-[-.06em]">This desk has one editor.</h1><p className="editorial-serif mt-3 text-lg leading-relaxed text-[#706b63]">The account <strong className="font-semibold text-[#302d28]">{email ?? 'signed-in user'}</strong> isn’t approved to access Crush editorial tools.</p><p className="mt-3 text-xs text-[#827b71]">Sign in with the approved editor account or return to the public magazine.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-full border border-[#d9d4ca] px-5 py-3 text-xs font-semibold hover:bg-[#f4f0e8]" data-testid="link-denied-home">Go to the magazine</Link><SignOutControl /></div></div></div>;
  return <>{children}</>;
}

function AdminFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-[100dvh] bg-[#f8f6f1]"><header className="border-b border-[#d9d4ca] bg-[#f4f0e8]"><div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8"><div className="flex items-center gap-4"><Brand small /><span className="hidden h-5 w-px bg-[#d2cbbf] sm:block" /><span className="hidden text-[10px] font-semibold uppercase tracking-[.18em] text-[#827b71] sm:block">Editorial desk</span></div><div className="flex items-center gap-4"><Link href="/" className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#756f65] hover:text-[#a73630]" data-testid="link-view-public-site">View publication <ArrowUpRight size={12} className="ml-1 inline" /></Link><SignOutControl /></div></div></header><main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12">{children}</main></div>;
}
function displayDate(date: string) { return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date)); }
function DashboardContent() {
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [search, setSearch] = useState('');
  const params = useMemo(() => ({ status: filter, ...(search.trim() ? { q: search.trim() } : {}) }), [filter, search]);
  const summary = useGetAdminSummary();
  const posts = useListAdminPosts(params);
  const remove = useDeleteAdminPost();
  const queryClient = useQueryClient();
  const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  const handleDelete = (id: number, title: string) => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    remove.mutate({ id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminPostsQueryKey() }); queryClient.invalidateQueries({ queryKey: getListAdminPostsQueryKey(params) }); queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }); queryClient.invalidateQueries({ queryKey: getListPublishedPostsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetFeaturedPostQueryKey() }); } });
  };
  return <AdminFrame>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><Eyebrow>Crush / Editorial</Eyebrow><h1 className="mt-2 text-4xl font-extrabold tracking-[-.07em] sm:text-5xl">The desk.</h1><p className="editorial-serif mt-2 text-lg text-[#706b63]">A clear view of what’s written, and what’s next.</p></div>
      <Link href="/admin/new" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-[#c33a32] px-5 text-xs font-semibold text-white transition hover:bg-[#a72f29] sm:self-auto" data-testid="link-create-story"><FilePlus2 size={15} /> Write a story</Link>
    </div>
    {summary.isLoading ? <div className="mt-9 grid animate-pulse gap-3 sm:grid-cols-3">{[1,2,3].map((n)=><div key={n} className="h-28 rounded-xl bg-[#e9e4da]" />)}</div> : summary.isError ? <div className="mt-8"><Notice>Editorial summary couldn’t load. {errorText(summary.error)}</Notice></div> : !summary.data ? <div className="mt-8"><Notice>Editorial summary is not available right now.</Notice></div> : <div className="mt-9 grid gap-3 sm:grid-cols-3">
      {[
        { label: 'All stories', value: summary.data.totalPosts, Icon: FileText },
        { label: 'Published', value: summary.data.publishedPosts, Icon: ArrowUpRight },
        { label: 'Drafts', value: summary.data.draftPosts, Icon: FilePlus2 },
      ].map(({ label, value, Icon }) => <div key={label} className="flex items-start justify-between rounded-xl border border-[#ddd7cd] bg-[#fffdf9] p-5"><div><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#827b71]">{label}</div><div className="mt-2 text-3xl font-extrabold tracking-[-.06em]" data-testid={`text-stat-${label.toLowerCase()}`}>{value}</div></div><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f2eee6] text-[#a73630]"><Icon size={16} /></span></div>)}
    </div>}
    <section className="mt-10">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d9d4ca] pb-4 sm:flex-row sm:items-end">
        <div><Eyebrow>Archive</Eyebrow><h2 className="mt-2 text-2xl font-extrabold tracking-[-.05em]">Stories, all in one place</h2></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><span className="sr-only">Search stories</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d867c]" /><Field value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search titles" className="h-10 pl-9 sm:w-56" data-testid="input-search-posts" /></label>
          <label className="relative"><span className="sr-only">Filter by status</span><ArrowDownUp size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8d867c]" /><select value={filter} onChange={(e)=>setFilter(e.target.value as typeof filter)} className="h-10 w-full appearance-none rounded-lg border border-[#d9d4ca] bg-[#fffdf9] pl-9 pr-8 text-xs font-semibold outline-none focus:border-[#c33a32] sm:w-40" data-testid="select-post-status"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
        </div>
      </div>
      {posts.isLoading ? <div className="divide-y divide-[#e3ded5]">{[1,2,3].map(n=><div key={n} className="h-[86px] animate-pulse bg-[#eee9e0]" />)}</div> : posts.isError ? <div className="py-6"><Notice>Couldn’t load stories. {errorText(posts.error)}</Notice></div> : posts.data?.length ? <div className="mt-1 divide-y divide-[#e3ded5]">
        {posts.data.map(post=><article key={post.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between" data-testid={`row-post-${post.id}`}>
          <div className="min-w-0"><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] ${post.status==='published'?'bg-[#e8eee4] text-[#506344]':'bg-[#f2eee6] text-[#756f65]'}`} data-testid={`status-post-${post.id}`}>{post.status}</span>{post.featured && <span className="text-[9px] font-bold uppercase tracking-[.13em] text-[#a73630]">Featured</span>}<span className="text-[10px] text-[#938b80]">{post.category}</span></div><h3 className="mt-2 truncate text-lg font-bold tracking-[-.035em]">{post.title}</h3><p className="mt-1 text-xs text-[#827b71]">{post.status==='published' && post.publishedAt ? `Published ${displayDate(post.publishedAt)}` : `Updated ${displayDate(post.updatedAt)}`} <span className="mx-1.5">·</span> {post.author}</p></div>
          <div className="flex shrink-0 items-center gap-2"><Link href={`/admin/edit/${post.id}`} className="rounded-full border border-[#d9d4ca] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.12em] hover:border-[#c33a32] hover:text-[#a73630]" data-testid={`link-edit-post-${post.id}`}>Edit</Link>{post.status==='published' && <Link href={`/story/${post.slug}`} className="grid h-9 w-9 place-items-center rounded-full text-[#827b71] hover:bg-[#eee9e0]" aria-label={`View ${post.title}`} data-testid={`link-preview-post-${post.id}`}><ArrowUpRight size={15} /></Link>}<button onClick={()=>handleDelete(post.id,post.title)} disabled={remove.isPending} className="grid h-9 w-9 place-items-center rounded-full text-[#a69e93] hover:bg-[#f8ecea] hover:text-[#a73630] disabled:opacity-50" aria-label={`Delete ${post.title}`} data-testid={`button-delete-post-${post.id}`}><Trash2 size={15} /></button></div>
        </article>)}
      </div> : <div className="py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#eee9e0] text-[#a73630]"><FileText size={20} /></div><h3 className="mt-4 text-lg font-bold">{search || filter!=='all'?'Nothing matches that search.':'The archive is a blank page.'}</h3><p className="editorial-serif mt-2 text-[#827b71]">{search || filter!=='all'?'Try another title or status.':'Write your first story and give this issue a beginning.'}</p>{!search && filter==='all' && <Link href="/admin/new" className="mt-5 inline-flex rounded-full bg-[#24211e] px-5 py-3 text-xs font-semibold text-white" data-testid="link-empty-create">Start writing</Link>}</div>}
      {remove.isError && <div className="mt-4"><Notice>{errorText(remove.error)}</Notice></div>}
      {remove.isPending && <div className="mt-3 flex items-center gap-2 text-xs text-[#827b71]"><LoaderCircle size={14} className="animate-spin" /> Removing story…</div>}
    </section>
  </AdminFrame>;
}
export function AdminDashboard() { return <AdminGate><DashboardContent /></AdminGate>; }
