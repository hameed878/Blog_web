import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateAdminPost, useGetAdminPost, useUpdateAdminPost, getGetAdminPostQueryKey, getGetAdminSummaryQueryKey, getListAdminPostsQueryKey, getGetFeaturedPostQueryKey, getListPublishedPostsQueryKey, getGetPublishedPostQueryKey } from '@workspace/api-client-react';
import type { BlogPost, BlogPostInput } from '@workspace/api-client-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import { ArrowLeft, Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, LoaderCircle, Quote, Redo2, Underline, Undo2 } from 'lucide-react';
import { Button, Field, Notice, Textarea } from '@/components/ui-primitives';
import { Eyebrow } from '@/components/ui-primitives';
import { AdminGate } from '@/pages/admin-pages';
import { ImagePanel } from '@/components/site';

const defaultForm = { title: '', excerpt: '', contentHtml: '', coverImageUrl: '', category: 'Founder story', author: 'Crush Editorial', status: 'draft' as 'draft' | 'published', featured: false };
function EditorForm({ id }: { id?: number }) {
  const editing = id !== undefined && Number.isFinite(id);
  const query = useGetAdminPost(id ?? 0, { query: { enabled: editing, queryKey: getGetAdminPostQueryKey(id ?? 0) } });
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(!editing);
  const initialized = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const create = useCreateAdminPost();
  const update = useUpdateAdminPost();
  const [, setLocation] = useLocation();
  const saving = create.isPending || update.isPending;
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      LinkExtension.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      UnderlineExtension,
    ],
    content: '',
    editorProps: {
      attributes: {
        'aria-label': 'Story body',
        'aria-multiline': 'true',
        'data-placeholder': 'Begin with the moment everything changed…',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const contentHtml = currentEditor.getHTML();
      setForm((current) => ({ ...current, contentHtml }));
    },
  });
  useEffect(() => {
    if (query.data && editing && editor && initialized.current !== id) {
      const post: BlogPost = query.data;
      initialized.current = id ?? null;
      setForm({ title: post.title, excerpt: post.excerpt, contentHtml: post.contentHtml, coverImageUrl: post.coverImageUrl ?? '', category: post.category, author: post.author, status: post.status, featured: post.featured });
      editor.commands.setContent(post.contentHtml || '');
      setReady(true);
    }
  }, [query.data, editing, id, editor]);
  const setValue = <K extends keyof typeof defaultForm>(name: K, value: (typeof defaultForm)[K]) => setForm((current) => ({ ...current, [name]: value }));
  const invalidate = (slug?: string) => {
    queryClient.invalidateQueries({ queryKey: getListAdminPostsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListPublishedPostsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedPostQueryKey() });
    if (slug) queryClient.invalidateQueries({ queryKey: getGetPublishedPostQueryKey(slug) });
    const previousSlug = query.data?.slug;
    if (previousSlug && previousSlug !== slug) queryClient.invalidateQueries({ queryKey: getGetPublishedPostQueryKey(previousSlug) });
    if (id !== undefined) queryClient.invalidateQueries({ queryKey: getGetAdminPostQueryKey(id) });
  };
  const submit = (status: 'draft' | 'published') => {
    setError(''); setMessage('');
    const body: BlogPostInput = { ...form, status, coverImageUrl: form.coverImageUrl.trim() || null };
    if (!body.title.trim()) { setError('Give this story a title before saving.'); return; }
    if (!body.category.trim() || !body.author.trim()) { setError('Category and author are required.'); return; }
    if (!editor?.getText().trim()) { setError('Add the story body before saving.'); return; }
    if (editing && id !== undefined) {
      update.mutate({ id, data: body }, { onSuccess: (post) => { invalidate(post.slug); setMessage(status === 'published' ? 'Your story is published.' : 'Draft saved.'); setForm((current) => ({ ...current, status: post.status })); }, onError: (failure) => setError(failure instanceof Error ? failure.message : 'We couldn’t save this story. Try again.') });
    } else {
      create.mutate({ data: body }, { onSuccess: (post) => { invalidate(post.slug); setMessage(status === 'published' ? 'Your story is published.' : 'Draft saved.'); setLocation(`/admin/edit/${post.id}`); }, onError: (failure) => setError(failure instanceof Error ? failure.message : 'We couldn’t save this story. Try again.') });
    }
  };
  const format = (command: 'paragraph' | 'heading2' | 'heading3' | 'bold' | 'italic' | 'underline' | 'bulletList' | 'orderedList' | 'blockquote' | 'link' | 'undo' | 'redo') => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (command === 'paragraph') chain.setParagraph().run();
    if (command === 'heading2') chain.toggleHeading({ level: 2 }).run();
    if (command === 'heading3') chain.toggleHeading({ level: 3 }).run();
    if (command === 'bold') chain.toggleBold().run();
    if (command === 'italic') chain.toggleItalic().run();
    if (command === 'underline') chain.toggleUnderline().run();
    if (command === 'bulletList') chain.toggleBulletList().run();
    if (command === 'orderedList') chain.toggleOrderedList().run();
    if (command === 'blockquote') chain.toggleBlockquote().run();
    if (command === 'undo') chain.undo().run();
    if (command === 'redo') chain.redo().run();
    if (command === 'link') {
      const href = window.prompt('Enter a link URL');
      if (!href) return;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
  };
  if (editing && query.isLoading) return <div className="mx-auto max-w-4xl animate-pulse py-12"><div className="h-8 w-56 bg-[#e9e4da]" /><div className="mt-8 h-96 bg-[#e9e4da]" /></div>;
  if (editing && (query.isError || !query.data)) return <div className="mx-auto max-w-2xl py-16"><Notice>We couldn’t find this draft or it may have been removed. Try returning to the archive.</Notice><Link href="/admin" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold" data-testid="link-editor-back-error"><ArrowLeft size={14} /> Back to the desk</Link></div>;
  return <>
    <div className="mx-auto max-w-[1080px]">
      <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#756f65] hover:text-[#a73630]" data-testid="link-editor-back"><ArrowLeft size={14} /> Editorial desk</Link>
      <div className="mt-6 flex flex-col justify-between gap-4 border-b border-[#d9d4ca] pb-6 sm:flex-row sm:items-end"><div><Eyebrow>{editing ? 'Shape the story' : 'Start something worth reading'}</Eyebrow><h1 className="mt-2 text-3xl font-extrabold tracking-[-.06em] sm:text-4xl">{editing ? 'Edit story' : 'A new story'}</h1></div><div className="flex gap-2"><Button variant="light" disabled={saving || !ready} onClick={()=>submit('draft')} data-testid="button-save-draft">{saving ? 'Saving…' : 'Save draft'}</Button><Button variant="red" disabled={saving || !ready} onClick={()=>submit('published')} data-testid="button-publish-story">{saving ? 'Saving…' : form.status==='published' ? 'Update story' : 'Publish story'}</Button></div></div>
      <div className="mt-5 space-y-3" aria-live="polite">{error && <Notice>{error}</Notice>}{message && <Notice tone="success">{message}</Notice>}{(create.isError || update.isError) && !error && <Notice>There was a problem saving your story. Please try again.</Notice>}</div>
      {!ready && <div className="mt-6"><Notice tone="info">Preparing the editor…</Notice></div>}
      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 rounded-xl border border-[#ded8ce] bg-[#fffdf9] shadow-sm">
          <div className="border-b border-[#e4ded5] p-4 sm:p-7">
            <label className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#827b71]" htmlFor="post-title">Story title</label>
            <Field id="post-title" value={form.title} onChange={e=>setValue('title',e.target.value)} maxLength={180} placeholder="A title that gets to the heart of it" className="mt-3 border-0 bg-transparent px-0 text-3xl font-extrabold leading-tight tracking-[-.06em] shadow-none focus:ring-0 sm:text-4xl" data-testid="input-post-title" />
            <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.16em] text-[#827b71]" htmlFor="post-excerpt">The short version <span className="font-normal normal-case tracking-normal">(excerpt)</span></label>
            <Textarea id="post-excerpt" value={form.excerpt} onChange={e=>setValue('excerpt',e.target.value)} maxLength={360} rows={3} placeholder="One or two sentences to make someone stay." className="editorial-serif mt-2 border-0 bg-transparent px-0 text-lg leading-relaxed shadow-none focus:ring-0" data-testid="input-post-excerpt" />
          </div>
          <div className="flex flex-wrap items-center gap-1 border-b border-[#e4ded5] bg-[#faf8f3] px-3 py-2">
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('paragraph')} aria-label="Paragraph" title="Paragraph" className="grid h-9 w-9 place-items-center rounded-md text-[11px] font-semibold text-[#625e57] hover:bg-[#eae5da] hover:text-[#a73630]" data-testid="button-format-paragraph">¶</button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('heading2')} aria-label="Heading 2" title="Heading 2" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('heading',{level:2})?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-heading-2"><Heading2 size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('heading3')} aria-label="Heading 3" title="Heading 3" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('heading',{level:3})?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-heading-3"><Heading3 size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('bold')} aria-label="Bold" title="Bold" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('bold')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-bold"><Bold size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('italic')} aria-label="Italic" title="Italic" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('italic')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-italic"><Italic size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('underline')} aria-label="Underline" title="Underline" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('underline')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-underline"><Underline size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('bulletList')} aria-label="Bulleted list" title="Bulleted list" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('bulletList')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-bulleted-list"><List size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('orderedList')} aria-label="Numbered list" title="Numbered list" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('orderedList')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-numbered-list"><ListOrdered size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('blockquote')} aria-label="Block quote" title="Block quote" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('blockquote')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-block-quote"><Quote size={16} /></button>
            <span className="mx-1 h-5 w-px bg-[#ded8ce]" />
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>format('link')} aria-label="Insert link" title="Insert link" className={`grid h-9 w-9 place-items-center rounded-md hover:bg-[#eae5da] hover:text-[#a73630] ${editor?.isActive('link')?'bg-[#eae5da] text-[#a73630]':'text-[#625e57]'}`} data-testid="button-format-link"><Link2 size={16} /></button>
            <span className="mx-1 h-5 w-px bg-[#ded8ce]" />
            <button type="button" disabled={!editor?.can().undo()} onMouseDown={e=>e.preventDefault()} onClick={()=>format('undo')} aria-label="Undo" title="Undo" className="grid h-9 w-9 place-items-center rounded-md text-[#625e57] hover:bg-[#eae5da] disabled:opacity-35" data-testid="button-format-undo"><Undo2 size={16} /></button>
            <button type="button" disabled={!editor?.can().redo()} onMouseDown={e=>e.preventDefault()} onClick={()=>format('redo')} aria-label="Redo" title="Redo" className="grid h-9 w-9 place-items-center rounded-md text-[#625e57] hover:bg-[#eae5da] disabled:opacity-35" data-testid="button-format-redo"><Redo2 size={16} /></button>
          </div>
          <EditorContent editor={editor} className="editor-content min-h-[430px] px-5 py-6 text-[17px] leading-[1.75] outline-none sm:px-8 sm:py-8" data-testid="editor-content" />
          <div className="flex items-center justify-between border-t border-[#e4ded5] px-4 py-3 text-[10px] uppercase tracking-[.12em] text-[#9a9389] sm:px-7"><span>Write it like you’d tell a friend.</span><span>{form.contentHtml.replace(/<[^>]*>/g,' ').trim().split(/\s+/).filter(Boolean).length} words</span></div>
        </div>
        <aside className="space-y-4">
          <section className="rounded-xl border border-[#ded8ce] bg-[#fffdf9] p-5"><Eyebrow>Story details</Eyebrow>
            <label className="mt-5 block text-[10px] font-bold uppercase tracking-[.14em] text-[#827b71]" htmlFor="post-category">Category</label>
            <select id="post-category" value={form.category} onChange={e=>setValue('category',e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#d9d4ca] bg-[#fffdf9] px-3 text-sm outline-none focus:border-[#c33a32]" data-testid="select-post-category">{['Founder story','The pivot','Money & meaning','Building well','Field notes','Opinion'].map(c=><option key={c}>{c}</option>)}</select>
            <label className="mt-4 block text-[10px] font-bold uppercase tracking-[.14em] text-[#827b71]" htmlFor="post-author">Author</label><Field id="post-author" value={form.author} onChange={e=>setValue('author',e.target.value)} maxLength={120} className="mt-2" data-testid="input-post-author" />
            <label className="mt-4 block text-[10px] font-bold uppercase tracking-[.14em] text-[#827b71]" htmlFor="post-cover">Cover image URL</label><Field id="post-cover" type="url" value={form.coverImageUrl} onChange={e=>setValue('coverImageUrl',e.target.value)} placeholder="https://…" className="mt-2" data-testid="input-cover-image" />
            <p className="mt-2 text-[10px] leading-4 text-[#928a7f]">Paste a direct image link. The image appears on the magazine cover.</p>
            {form.coverImageUrl && <ImagePanel src={form.coverImageUrl} alt="Cover preview" className="mt-4 aspect-[1.5] w-full rounded-lg" />}
          </section>
          <section className="rounded-xl border border-[#ded8ce] bg-[#fffdf9] p-5"><Eyebrow>Publication</Eyebrow><div className="mt-4 flex items-center justify-between"><div><div className="text-sm font-semibold">Featured story</div><div className="mt-1 text-xs text-[#827b71]">Lead the next issue with this one.</div></div><button type="button" role="switch" aria-checked={form.featured} onClick={()=>setValue('featured',!form.featured)} className={`relative h-6 w-11 rounded-full transition-colors ${form.featured?'bg-[#c33a32]':'bg-[#d9d4ca]'}`} data-testid="switch-featured"><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${form.featured?'translate-x-6':'translate-x-1'}`} /></button></div><div className="mt-5 border-t border-[#e4ded5] pt-4"><div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#827b71]">Current status</div><div className="mt-2 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${form.status==='published'?'bg-[#668154]':'bg-[#b5a888]'}`} /><span className="text-sm font-semibold capitalize">{form.status}</span></div></div></section>
          <div className="flex gap-2 lg:hidden"><Button variant="light" className="flex-1" disabled={saving} onClick={()=>submit('draft')} data-testid="button-save-draft-mobile">Save draft</Button><Button variant="red" className="flex-1" disabled={saving} onClick={()=>submit('published')} data-testid="button-publish-mobile">Publish</Button></div>
        </aside>
      </div>
      {(create.isPending || update.isPending) && <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-[#24211e] px-4 py-3 text-xs text-white shadow-lg"><LoaderCircle size={14} className="animate-spin" /> Saving changes…</div>}
    </div>
  </>;
}
export function EditorPage({ mode }: { mode: 'new' | 'edit' }) {
  const { id: idParam } = useParams<{ id: string }>();
  const id = mode === 'edit' && idParam ? Number(idParam) : undefined;
  return <AdminGate><EditorForm id={id} /></AdminGate>;
}
