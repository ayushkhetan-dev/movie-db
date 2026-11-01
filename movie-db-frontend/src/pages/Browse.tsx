import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import MovieCard from '@/components/MovieCard';
import { GridSkeleton } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useGenres } from '@/hooks/useGenres';
import { api } from '@/services/tmdb';

const sorts = [
  { v: 'popularity.desc', l: 'Most popular' },
  { v: 'vote_average.desc', l: 'Highest rated' },
  { v: 'primary_release_date.desc', l: 'Newest' },
  { v: 'revenue.desc', l: 'Box office' },
];

export default function Browse() {
  const [params] = useSearchParams();
  const [genre, setGenre] = useState<number | null>(Number(params.get('genre')) || null);
  const [sort, setSort] = useState(sorts[0].v);
  const { data: genres } = useGenres();
  const sentinel = useRef<HTMLDivElement>(null);

  const q = useInfiniteQuery({
    queryKey: ['discover', genre, sort],
    queryFn: ({ pageParam }) => api.discover({ page: pageParam, genre, sort }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined),
  });
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = q;

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const movies = q.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-8">
      <h1 className="text-4xl font-extrabold">Browse movies</h1>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm text-fg/70" htmlFor="sort">Sort by</label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-fg/20 bg-surface px-4 py-2 text-sm">
          {sorts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by genre">
        {[{ id: null as number | null, name: 'All genres' }, ...(genres ?? [])].map((g) => (
          <button
            key={g.name}
            onClick={() => setGenre(g.id)}
            aria-pressed={genre === g.id}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${genre === g.id ? 'border-accent bg-accent text-onaccent' : 'border-fg/20 hover:border-accent'}`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {q.isError ? (
        <div className="mt-8"><ErrorState onRetry={() => q.refetch()} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
          {(q.isLoading || isFetchingNextPage) && <GridSkeleton count={q.isLoading ? 18 : 6} />}
        </div>
      )}
      <div ref={sentinel} className="h-10" />
    </div>
  );
}
