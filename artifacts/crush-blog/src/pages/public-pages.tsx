import { Link, useParams } from 'wouter';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3 } from 'lucide-react';
import { useGetFeaturedPost, useGetPublishedPost, useListPublishedPosts } from '@workspace/api-client-react';
import type { BlogPost } from '@workspace/api-client-react';
import { Eyebrow, Notice } from '@/components/ui-primitives';
import { ImagePanel, PublicShell } from '@/components/site';

const tones = ['rose', 'ochre', 'sage', 'blue'];
function dateLabel(date?: string | null) {
  if (!date) return 'Recently published';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
function StoryCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return (
    <article className={`group fade-up ${index % 3 === 1 ? 'pt-10 sm:pt-16' : ''}`} data-testid={`card-story-${post.id}`}>
      <Link href={`/story/${post.slug}`} className="block" data-testid={`link-story-${post.id}`}>
        <ImagePanel src={post.coverImageUrl} alt={post.title} tone={tones[index % tones.length]} className="aspect-[1.28] w-full" />
        <div className="mt-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.17em] text-[#a73630]">
          <span>{post.category}</span><span className="h-px w-5 bg-[#c9c2b7]" /><span className="text-[#817a70]">{dateLabel(post.publishedAt)}</span>
        </div>
        <h3 className="mt-3 max-w-[30ch] text-[1.55rem] font-extrabold leading-[1.06] tracking-[-.055em] transition-colors group-hover:text-[#a73630] sm:text-[1.9rem]" data-testid={`text-story-title-${post.id}`}>{post.title}</h3>
        <p className="editorial-serif mt-3 max-w-[42ch] text-[1.08rem] leading-[1.5] text-[#706b63]">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Read the story <ArrowUpRight size={13} /></span>
      </Link>
    </article>
  );
}
function LoadingStoryGrid() {
  return <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <div key={n} className="animate-pulse"><div className="aspect-[1.28] bg-[#e9e4da]" /><div className="mt-5 h-3 w-24 bg-[#e9e4da]" /><div className="mt-4 h-7 w-4/5 bg-[#e9e4da]" /><div className="mt-2 h-4 w-full bg-[#e9e4da]" /></div>)}</div>;
}
export function HomePage() {
  const featured = useGetFeaturedPost();
  const stories = useListPublishedPosts({ limit: 24 });
  const list = stories.data ?? [];
  const hero = featured.data ?? list.find((post) => post.featured) ?? list[0];
  const rest = list.filter((post) => post.id !== hero?.id);
  return <PublicShell>
    <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
      <div className="flex items-center justify-between border-b border-[#d9d4ca] py-3 text-[9px] font-semibold uppercase tracking-[.2em] text-[#827b71]">
        <span>Stories for the self-made</span><span className="hidden sm:inline">People, not playbooks</span><span>Vol. 08 — 2026</span>
      </div>
      <section className="grid gap-8 py-9 sm:py-14 lg:grid-cols-[1.3fr_.7fr] lg:gap-14 lg:py-16" aria-label="Featured story">
        {featured.isLoading && stories.isLoading ? <div className="grid animate-pulse gap-8 lg:col-span-2 lg:grid-cols-[1.3fr_.7fr]"><div className="aspect-[1.43] bg-[#e9e4da]" /><div className="space-y-4 pt-6"><div className="h-4 w-20 bg-[#e9e4da]" /><div className="h-12 bg-[#e9e4da]" /><div className="h-4 bg-[#e9e4da]" /></div></div> : hero ? <>
          <Link href={`/story/${hero.slug}`} className="group block" data-testid={`link-featured-story-${hero.id}`}>
            <ImagePanel src={hero.coverImageUrl} alt={hero.title} tone="rose" className="aspect-[1.43] w-full" />
          </Link>
          <div className="flex flex-col justify-center pb-4 lg:pl-2">
            <Eyebrow>Editor’s pick <span className="ml-2 text-[#827b71]">/ {hero.category}</span></Eyebrow>
            <Link href={`/story/${hero.slug}`} className="group" data-testid={`link-featured-title-${hero.id}`}>
              <h1 className="mt-5 max-w-[14ch] text-[2.8rem] font-extrabold leading-[.94] tracking-[-.07em] transition-colors group-hover:text-[#a73630] sm:text-[4rem] lg:text-[4.3rem]" data-testid="text-featured-title">{hero.title}</h1>
            </Link>
            <p className="editorial-serif mt-5 max-w-[42ch] text-[1.25rem] leading-[1.48] text-[#706b63]">{hero.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[#827b71]">
              <span>By {hero.author}</span><span className="h-1 w-1 rounded-full bg-[#c33a32]" /><span>{dateLabel(hero.publishedAt)}</span>
            </div>
            <Link href={`/story/${hero.slug}`} className="mt-8 inline-flex w-fit items-center gap-3 border-b border-[#c33a32] pb-2 text-[11px] font-bold uppercase tracking-[.16em] hover:text-[#a73630]" data-testid="link-read-featured">Read the full story <ArrowRight size={14} /></Link>
          </div>
        </> : <div className="lg:col-span-2">{featured.isError || stories.isError ? <Notice>We couldn’t bring the magazine to you just now. Refresh the page to try again.</Notice> : <div className="border-y border-[#d9d4ca] py-16 text-center"><Eyebrow>The first chapter</Eyebrow><h1 className="mt-4 text-4xl font-extrabold tracking-[-.06em]">Good stories start here.</h1><p className="editorial-serif mt-3 text-lg text-[#706b63]">Our next story is in the making. Check back soon.</p></div>}</div>}
      </section>
      <section id="voices" className="border-t border-[#d9d4ca] py-12 sm:py-16">
        <div className="mb-9 flex items-end justify-between gap-5">
          <div><Eyebrow>From the people who built it</Eyebrow><h2 className="mt-3 text-3xl font-extrabold tracking-[-.06em] sm:text-4xl">The latest, honestly.</h2></div>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[.18em] text-[#827b71] sm:block">No formulas. Just the work.</span>
        </div>
        {stories.isLoading ? <LoadingStoryGrid /> : stories.isError ? <Notice>Stories are taking a moment to load. Please try again shortly.</Notice> : rest.length ? <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{rest.map((post, i) => <StoryCard key={post.id} post={post} index={i} />)}</div> : <div className="editorial-serif border-t border-[#d9d4ca] py-10 text-[#706b63]">There are no more stories in this issue yet.</div>}
      </section>
    </div>
    <section id="about" className="bg-[#eae5da]">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-[.7fr_1.3fr] md:gap-20">
        <Eyebrow>What we believe</Eyebrow>
        <div><h2 className="max-w-[19ch] text-3xl font-extrabold leading-[1.02] tracking-[-.06em] sm:text-5xl">There’s no such thing as an overnight success.</h2><p className="editorial-serif mt-5 max-w-[54ch] text-xl leading-relaxed text-[#625e57]">Crush is a journal about the long middle: the quiet choices, stubborn pivots and people who made something from a hunch. Less advice from the sidelines. More truth from the people in it.</p><a href="#voices" className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em]">Meet the makers <ArrowDownRight size={15} /></a></div>
      </div>
    </section>
  </PublicShell>;
}

export function StoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const query = useGetPublishedPost(slug);
  const story = query.data;
  return <PublicShell>
    <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 sm:py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#756f65] hover:text-[#a73630]" data-testid="link-back-magazine"><ArrowLeft size={14} /> Back to the magazine</Link>
      {query.isLoading ? <div className="mt-10 animate-pulse"><div className="h-3 w-28 bg-[#e9e4da]" /><div className="mt-6 h-14 max-w-3xl bg-[#e9e4da]" /><div className="mt-4 h-6 max-w-xl bg-[#e9e4da]" /><div className="mt-10 aspect-[2.1] bg-[#e9e4da]" /></div> : query.isError || !story ? <div className="mx-auto max-w-xl py-24 text-center"><Eyebrow>Page not found</Eyebrow><h1 className="mt-4 text-4xl font-extrabold tracking-[-.06em]">This story isn’t here.</h1><p className="editorial-serif mt-4 text-lg text-[#706b63]">It may have moved, or perhaps it hasn’t been published yet.</p><Link href="/" className="mt-8 inline-flex rounded-full bg-[#24211e] px-5 py-3 text-xs font-semibold text-white" data-testid="link-return-home">Return to the magazine</Link></div> : <>
        <div className="mx-auto mt-12 max-w-[850px] text-center">
          <Eyebrow>{story.category}</Eyebrow><h1 className="mt-5 text-[2.6rem] font-extrabold leading-[.96] tracking-[-.07em] sm:text-6xl lg:text-[5rem]" data-testid={`text-article-title-${story.id}`}>{story.title}</h1>
          <p className="editorial-serif mx-auto mt-6 max-w-[700px] text-xl leading-relaxed text-[#706b63] sm:text-2xl">{story.excerpt}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[.15em] text-[#827b71]"><span>Words by {story.author}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={12} /> {dateLabel(story.publishedAt)}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={12} /> 6 min read</span></div>
        </div>
        <ImagePanel src={story.coverImageUrl} alt={story.title} tone="rose" className="mx-auto mt-10 aspect-[1.9] max-h-[600px] w-full" />
        <article className="article-body prose prose-lg mx-auto mt-12 max-w-[680px] sm:mt-16" data-testid={`content-article-${story.id}`} dangerouslySetInnerHTML={{ __html: story.contentHtml }} />
        <div className="mx-auto mt-14 max-w-[680px] border-t border-[#d9d4ca] pt-7"><div className="flex items-center justify-between"><div><Eyebrow>More from Crush</Eyebrow><p className="editorial-serif mt-2 text-lg text-[#706b63]">Good stories don’t happen alone.</p></div><Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] hover:text-[#a73630]">Explore stories <ArrowRight size={14} /></Link></div></div>
      </>}
    </div>
  </PublicShell>;
}
