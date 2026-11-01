import { AlertTriangle } from 'lucide-react';
import { hasCredentials } from '@/services/tmdb';

export default function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-4 flex items-start gap-3 rounded-xl border border-fg/10 bg-surface p-5 sm:mx-8">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div>
        <p className="font-medium">We couldn’t load movies from TMDB.</p>
        <p className="mt-1 text-sm text-fg/60">
          {hasCredentials
            ? 'Check your connection and try again.'
            : 'No API credentials found. Copy .env.example to .env and add your TMDB token, then restart the dev server.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-onaccent">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
