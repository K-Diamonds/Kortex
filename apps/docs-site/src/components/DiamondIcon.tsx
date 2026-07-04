export function DiamondIcon({ size = 28 }: { size?: number }) {
  const id = `docs-diamond-${size}`;
  return (
    <svg viewBox="0 0 40 40" fill="none" width={size} height={size} aria-hidden>
      <polygon
        points="20,2 38,20 20,38 2,20"
        fill={`url(#${id}-g)`}
        stroke="rgba(0,212,255,0.6)"
        strokeWidth="1"
      />
      <polygon points="20,8 32,20 20,32 8,20" fill={`url(#${id}-i)`} opacity="0.6" />
      <defs>
        <linearGradient id={`${id}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#0066cc" />
        </linearGradient>
        <linearGradient id={`${id}-i`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#020c18" />
          <stop offset="100%" stopColor="#041a30" />
        </linearGradient>
      </defs>
    </svg>
  );
}
