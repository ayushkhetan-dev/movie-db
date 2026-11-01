import type { Genre, Movie, MovieDetail, Paged } from '@/types/tmdb';

const BASE = 'https://api.themoviedb.org/3';
const token = import.meta.env.VITE_TMDB_TOKEN;
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

export const hasCredentials = Boolean(token || apiKey);

export async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));
  if (!token && apiKey) url.searchParams.set('api_key', apiKey);
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export const img = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export const api = {
  trending: () => get<Paged<Movie>>('/trending/movie/week'),
  popular: () => get<Paged<Movie>>('/movie/popular'),
  topRated: () => get<Paged<Movie>>('/movie/top_rated'),
  nowPlaying: () => get<Paged<Movie>>('/movie/now_playing'),
  upcoming: () => get<Paged<Movie>>('/movie/upcoming'),
  genres: () => get<{ genres: Genre[] }>('/genre/movie/list').then((r) => r.genres),
  discover: (p: { page: number; genre?: number | null; sort: string }) =>
    get<Paged<Movie>>('/discover/movie', {
      page: p.page,
      sort_by: p.sort,
      with_genres: p.genre ?? undefined,
      'vote_count.gte': p.sort.startsWith('vote_average') ? 300 : undefined,
    }),
  search: (query: string, page = 1) => get<Paged<Movie>>('/search/movie', { query, page }),
  detail: (id: string) => get<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits,videos,similar' }),
};

export const year = (d: string) => (d ? d.slice(0, 4) : '—');
