import type { ShopItem } from "@/lib/shop";

export function BallSvg({ item, size = 36 }: { item: ShopItem; size?: number }) {
  const pattern = item.pattern ?? "classic";
  const base = item.color;
  const accent = item.accent ?? "#0a0a0a";
  const id = item.id;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <radialGradient id={`shade-${id}`} cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="0.55" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.4)" />
        </radialGradient>
        <radialGradient id={`grad-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={base} />
        </radialGradient>
        <linearGradient id={`lin-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={base} />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={pattern === "gradient" ? `url(#lin-${id})` : base}
        stroke="#0a0a0a"
        strokeWidth="1.5"
      />
      <g clipPath={`url(#clip-${id})`}>
        {pattern === "classic" && (
          <g fill={accent}>
            <polygon points="32,16 40,22 37,32 27,32 24,22" />
            <polygon points="14,30 22,22 28,28 26,38 16,38" />
            <polygon points="50,30 48,38 38,38 36,28 42,22" />
            <polygon points="26,40 38,40 40,50 32,54 24,50" />
          </g>
        )}
        {pattern === "stripes" && (
          <g fill={accent}>
            <rect x="0" y="10" width="64" height="8" />
            <rect x="0" y="28" width="64" height="8" />
            <rect x="0" y="46" width="64" height="8" />
          </g>
        )}
        {pattern === "swirl" && (
          <g fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round">
            <path d="M6 32 Q20 4 44 18 Q60 28 50 46 Q40 60 22 54 Q6 48 10 32" />
            <path d="M22 32 Q30 22 40 28 Q46 34 40 42 Q32 46 26 40" />
          </g>
        )}
        {pattern === "star" && (
          <g fill={accent}>
            <polygon points="32,6 38,24 57,24 42,36 48,55 32,44 16,55 22,36 7,24 26,24" />
          </g>
        )}
        {pattern === "dots" && (
          <g fill={accent}>
            {[
              [16, 16, 5],
              [44, 16, 5],
              [32, 28, 6],
              [16, 40, 5],
              [44, 40, 5],
              [32, 52, 5],
              [10, 28, 3],
              [54, 28, 3],
              [22, 52, 3],
              [42, 52, 3],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}
        {pattern === "checker" && (
          <g fill={accent}>
            {Array.from({ length: 8 }).flatMap((_, r) =>
              Array.from({ length: 8 }).map((__, c) =>
                (r + c) % 2 === 0 ? (
                  <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="8" height="8" />
                ) : null,
              ),
            )}
          </g>
        )}
        {pattern === "flame" && (
          <g fill={accent}>
            <path d="M32 4 Q20 18 26 30 Q14 30 14 44 Q14 60 32 62 Q50 60 50 44 Q50 30 38 30 Q44 18 32 4 Z" />
            <path d="M32 18 Q26 28 30 34 Q24 34 24 42 Q24 52 32 54 Q40 52 40 42 Q40 34 34 34 Q38 28 32 18 Z" fill={base} opacity="0.55" />
          </g>
        )}
        {pattern === "gradient" && (
          <g>
            <rect x="0" y="0" width="64" height="64" fill={`url(#grad-${id})`} opacity="0.7" />
            <circle cx="22" cy="22" r="6" fill={accent} opacity="0.8" />
          </g>
        )}
        {pattern === "hex" && (
          <g fill={accent} stroke={accent} strokeWidth="1.2">
            {[
              [16, 18],
              [32, 14],
              [48, 18],
              [16, 34],
              [32, 30],
              [48, 34],
              [16, 50],
              [32, 46],
              [48, 50],
            ].map(([x, y], i) => (
              <polygon
                key={i}
                fillOpacity={i % 2 === 0 ? 0.85 : 0.35}
                points={`${x},${y - 7} ${x + 6},${y - 3.5} ${x + 6},${y + 3.5} ${x},${y + 7} ${x - 6},${y + 3.5} ${x - 6},${y - 3.5}`}
              />
            ))}
          </g>
        )}
        {pattern === "ring" && (
          <g fill="none" stroke={accent} strokeWidth="4">
            <circle cx="32" cy="32" r="24" />
            <circle cx="32" cy="32" r="15" strokeWidth="3" />
            <circle cx="32" cy="32" r="6" fill={accent} />
          </g>
        )}
      </g>
      <circle cx="32" cy="32" r="30" fill={`url(#shade-${id})`} />
    </svg>
  );
}