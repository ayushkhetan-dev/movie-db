import { get } from './tmdb';
import type { CreditItem, Genre, Movie, MultiResult, Paged, Person, PersonDetail, TvDetail, TvShow, Video } from '@/types/tmdb';

export const moreApi = {
  discoverTv: (p: { page: number; genre?: number | null; sort: string }) =>
    get<Paged<TvShow>>('/discover/tv', {
      page: p.page,
      sort_by: p.sort,
      with_genres: p.genre ?? undefined,
      'vote_count.gte': p.sort.startsWith('vote_average') ? 200 : undefined,
      'first_air_date.lte': p.sort.startsWith('first_air_date') ? new Date().toISOString().slice(0, 10) : undefined,
    }),
  tvGenres: () => get<{ genres: Genre[] }>('/genre/tv/list').then((r) => r.genres),
  tvDetail: (id: string) => get<TvDetail>(`/tv/${id}`, { append_to_response: 'credits,videos,similar' }),
  popularPeople: (page: number) => get<Paged<Person>>('/person/popular', { page }),
  person: (id: string) => get<PersonDetail>(`/person/${id}`, { append_to_response: 'combined_credits' }),
  trendingMoviesToday: () => get<Paged<Movie>>('/trending/movie/day'),
  trendingTvToday: () => get<Paged<TvShow>>('/trending/tv/day'),
  trendingPeopleToday: () => get<Paged<Person>>('/trending/person/day'),
  searchMulti: (query: string, page = 1) => get<Paged<MultiResult>>('/search/multi', { query, page, include_adult: 'false' }),
};

/** TV show -> Movie shape so MovieCard can render it (pair with to="/tv/:id"). */
export const tvToMovie = (t: TvShow): Movie => ({
  id: t.id, title: t.name, overview: t.overview, poster_path: t.poster_path, backdrop_path: t.backdrop_path,
  release_date: t.first_air_date, vote_average: t.vote_average, vote_count: t.vote_count, genre_ids: t.genre_ids,
});

export const creditToMovie = (c: CreditItem): Movie => ({
  id: c.id, title: c.title ?? c.name ?? 'Untitled', overview: c.overview, poster_path: c.poster_path,
  backdrop_path: c.backdrop_path, release_date: c.release_date ?? c.first_air_date ?? '',
  vote_average: c.vote_average, vote_count: c.vote_count,
});

/** Prefer an official YouTube trailer, then any trailer, then any YouTube clip. */
export function pickTrailerKey(videos: Video[]): string | undefined {
  const yt = videos.filter((v) => v.site === 'YouTube');
  return (yt.find((v) => v.type === 'Trailer') ?? yt.find((v) => v.type === 'Teaser') ?? yt[0])?.key;
}

/* ---- multi-search helpers ---- */
export const multiTitle = (r: MultiResult) => r.title ?? r.name ?? 'Untitled';
export const multiDate = (r: MultiResult) => r.release_date ?? r.first_air_date ?? '';
export const multiLink = (r: MultiResult) =>
  r.media_type === 'movie' ? `/movie/${r.id}` : r.media_type === 'tv' ? `/tv/${r.id}` : `/person/${r.id}`;
export const multiToMovie = (r: MultiResult): Movie => ({
  id: r.id, title: multiTitle(r), overview: r.overview ?? '', poster_path: r.poster_path ?? null, backdrop_path: null,
  release_date: multiDate(r), vote_average: r.vote_average ?? 0, vote_count: r.vote_count ?? 0,
});
export const multiToPerson = (r: MultiResult): Person => ({
  id: r.id, name: multiTitle(r), profile_path: r.profile_path ?? null,
  known_for_department: r.known_for_department ?? '', popularity: r.popularity, known_for: r.known_for,
});
