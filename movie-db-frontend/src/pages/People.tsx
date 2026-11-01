import { useInfiniteQuery } from '@tanstack/react-query';
import PersonCard from '@/components/PersonCard';
import { GridSkeleton } from '@/components/Skeleton';
import ErrorState from '@/components/ErrorState';
import { useLoadMore } from '@/hooks/useLoadMore';
import { moreApi } from '@/services/tmdbExtra';

export default function People() {
  const q = useInfiniteQuery({
    queryKey: ['people-popular'],
    queryFn: ({ pageParam }) => moreApi.popularPeople(pageParam),
    initialPageParam: 1,
    getNextPageParam: (l) => (l.page < Math.min(l.total_pages, 500) ? l.page + 1 : undefined),
  });
  const sentinel = useLoadMore(q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage);
  const people = q.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-8">
      <h1 className="text-4xl font-extrabold">Popular people</h1>
      {q.isError ? (
        <div className="mt-8"><ErrorState onRetry={() => q.refetch()} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {people.map((p) => <PersonCard key={p.id} person={p} />)}
          {(q.isLoading || q.isFetchingNextPage) && <GridSkeleton count={q.isLoading ? 18 : 6} />}
        </div>
      )}
      <div ref={sentinel} className="h-10" />
    </div>
  );
}
