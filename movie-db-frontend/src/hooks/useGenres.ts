import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/tmdb';

export function useGenres() {
  return useQuery({ queryKey: ['genres'], queryFn: api.genres, staleTime: Infinity });
}
