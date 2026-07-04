export function DiamondIcon({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = `diamond-${size}`;
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <polygon
        points="20,2 38,20 20,38 2,20"
        fill={`url(#${id}-grad)`}
        stroke="rgba(0,212,255,0.6)"
        strokeWidth="1"
      />
      <polygon
        points="20,8 32,20 20,32 8,20"
        fill={`url(#${id}-inner)`}
        opacity="0.6"
      />
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#0066cc" />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#020c18" />
          <stop offset="100%" stopColor="#041a30" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RobotIcon({ color = '#ffffff' }: { color?: string }) {
  return (
    <g transform="translate(16, 16)" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2.5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="12" r="1.5" fill={color} />
      <circle cx="15" cy="12" r="1.5" fill={color} />
      <path d="M12 6V3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1" fill={color} />
      <path d="M3 10.5H1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23 10.5H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 18v2.5M16 18v2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export function DiamondToggleButton({ open, size = 56 }: { open: boolean; size?: number }) {
  const gradId = `btnGrad-${size}`;
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <polygon
        points="28,3 53,28 28,53 3,28"
        fill={`url(#${gradId})`}
        stroke="rgba(0,212,255,0.8)"
        strokeWidth="1.5"
      />
      {open ? <RobotIcon color="#ffffff" /> : null}
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d3a5c" />
          <stop offset="100%" stopColor="#041526" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2L15 22L11 13L2 9L22 2Z"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="#00d4ff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7" r="4" stroke="#00d4ff" strokeWidth="2" />
    </svg>
  );
}
