export default function ScoreRing({ value, size = 40 }: { value: number; size?: number }) {
  const pct = Math.round(value * 10);
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative grid place-items-center rounded-full bg-bg/90 text-fg backdrop-blur"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`User score ${pct} percent`}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3" className="stroke-fg/15" />
        <circle
          cx="20" cy="20" r={r} fill="none" strokeWidth="3" strokeLinecap="round"
          className="stroke-accent" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <span className="text-[11px] font-semibold tabular-nums">{pct || 'NR'}</span>
    </div>
  );
}
