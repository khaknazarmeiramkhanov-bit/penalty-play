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
        <radialGradient id={`grad-${id}`} cx="50%" cy="50%" r="55%">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor={base} />
        </radialGradient>
        <clipPath id={`clip-${id}`}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={pattern === "gradient" ? `url(#grad-${id})` : base}
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
            <rect x="0" y="14" width="64" height="6" />
            <rect x="0" y="30" width="64" height="6" />
            <rect x="0" y="46" width="64" height="6" />
          </g>
        )}
        {pattern === "swirl" && (
          <g fill="none" stroke={accent} strokeWidth="3">
            <path d="M6 32 Q32 6 58 32 Q32 58 6 32" />
            <path d="M16 32 Q32 18 48 32 Q32 46 16 32" />
          </g>
        )}
        {pattern === "star" && (
          <polygon
            points="32,8 37,25 55,25 41,36 46,54 32,43 18,54 23,36 9,25 27,25"
            fill={accent}
          />
        )}
        {pattern === "dots" && (
          <g fill={accent}>
            {[
              [20, 20],
              [44, 20],
              [32, 32],
              [20, 44],
              [44, 44],
              [32, 12],
              [12, 32],
              [52, 32],
              [32, 52],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="4" />
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
          <path
            d="M32 6 Q22 22 28 30 Q18 30 18 42 Q18 56 32 60 Q46 56 46 42 Q46 30 36 30 Q42 22 32 6 Z"
            fill={accent}
          />
        )}
        {pattern === "gradient" && (
          <circle cx="32" cy="32" r="14" fill={accent} opacity="0.45" />
        )}
        {pattern === "hex" && (
          <g fill="none" stroke={accent} strokeWidth="1.6">
            {[
              [16, 18],
              [32, 18],
              [48, 18],
              [16, 34],
              [32, 34],
              [48, 34],
              [16, 50],
              [32, 50],
              [48, 50],
            ].map(([x, y], i) => (
              <polygon
                key={i}
                points={`${x},${y - 6} ${x + 5},${y - 3} ${x + 5},${y + 3} ${x},${y + 6} ${x - 5},${y + 3} ${x - 5},${y - 3}`}
              />
            ))}
          </g>
        )}
        {pattern === "ring" && (
          <g fill="none" stroke={accent} strokeWidth="2.5">
            <circle cx="32" cy="32" r="22" />
            <circle cx="32" cy="32" r="14" />
            <circle cx="32" cy="32" r="6" />
          </g>
        )}
      </g>
      <circle cx="32" cy="32" r="30" fill={`url(#shade-${id})`} />
    </svg>
  );
}