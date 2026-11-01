export interface YTPlayer { destroy(): void }
interface YTNamespace { Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer }
declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
}

const ytKey = import.meta.env.VITE_YT_API_KEY;
export const hasYouTubeKey = Boolean(ytKey);

let loader: Promise<YTNamespace> | null = null;

/** Loads the YouTube IFrame Player API once and resolves with window.YT. */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT as YTNamespace); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => { loader = null; reject(new Error('YouTube API failed to load')); };
    document.head.appendChild(s);
  });
  return loader;
}

/** Fallback when TMDB has no trailer. Needs VITE_YT_API_KEY (YouTube Data API v3; costs 100 quota units per call). */
export async function searchTrailer(title: string, year?: string): Promise<string | undefined> {
  if (!ytKey) return undefined;
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('q', `${title} ${year ?? ''} official trailer`);
  url.searchParams.set('key', ytKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube search failed (${res.status})`);
  const data = (await res.json()) as { items?: { id?: { videoId?: string } }[] };
  return data.items?.[0]?.id?.videoId;
}
