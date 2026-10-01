// A single circular progress ring stat card — the visual style from the
// reference image, using OUR established macro colors (not the reference's
// colors) so it stays consistent with every other page on the site.

export default function MacroRing({
  label, value, unit, color, percent, icon,
}: { label: string; value: string | number; unit: string; color: string; percent: number; icon?: string }) {
  const r = 30, c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-line bg-panel p-3">
      <div className="relative h-[72px] w-[72px]">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tab text-base font-bold">{value}{unit}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted">{icon} {label}</span>
    </div>
  );
}
