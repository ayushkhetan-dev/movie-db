import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { hasYouTubeKey, loadYouTubeApi, searchTrailer, type YTPlayer } from '@/services/youtube';
import { Skeleton } from './Skeleton';

function Player({ videoKey, title, autoplay }: { videoKey: string; title: string; autoplay: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let player: YTPlayer | undefined;
    let cancelled = false;
    setFailed(false);
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !host.current) return;
        const mount = document.createElement('div');
        host.current.replaceChildren(mount);
        player = new YT.Player(mount, {
          videoId: videoKey,
          width: '100%',
          height: '100%',
          host: 'https://www.youtube-nocookie.com',
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: autoplay ? 1 : 0, mute: autoplay ? 1 : 0, origin: window.location.origin },
          events: { onError: () => setFailed(true) },
        });
      })
      .catch(() => setFailed(true));
    return () => { cancelled = true; player?.destroy(); };
  }, [videoKey, autoplay]);

  if (failed) {
    return (
      <div className="grid aspect-video max-w-4xl place-items-center rounded-2xl border border-fg/10 bg-surface p-6 text-center">
        <div>
          <p className="font-medium">This trailer can’t be played here.</p>
          <a href={`https://www.youtube.com/watch?v=${videoKey}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-onaccent">
            Watch on YouTube <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="aspect-video max-w-4xl overflow-hidden rounded-2xl border border-fg/10 bg-surface" role="region" aria-label={`${title} trailer`}>
      <div ref={host} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
    </div>
  );
}

interface Props { videoKey?: string; title: string; year?: string; autoplay?: boolean }

export default function TrailerPlayer({ videoKey, title, year, autoplay = false }: Props) {
  const fallback = useQuery({
    queryKey: ['yt-trailer', title, year],
    queryFn: () => searchTrailer(title, year),
    enabled: !videoKey && hasYouTubeKey,
    staleTime: Infinity,
    retry: 0,
  });
  const key = videoKey ?? fallback.data;

  if (!videoKey && fallback.isLoading) return <Skeleton className="aspect-video max-w-4xl" />;
  if (!key) return <p className="text-fg/70">No trailer is available for {title} yet.</p>;
  return <Player videoKey={key} title={title} autoplay={autoplay} />;
}
