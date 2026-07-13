import React from 'react';

export type MouthShape =
  | 'rest'
  | 'closed'
  | 'fv'
  | 'open'
  | 'mid'
  | 'small'
  | 'round'
  | 'mid-consonant';

const mouthWidthByShape: Record<MouthShape, number> = {
  rest: 46,
  closed: 46,
  fv: 40,
  open: 58,
  mid: 52,
  small: 44,
  round: 30,
  'mid-consonant': 48,
};

export const Mascot: React.FC<{
  mouthOpen: number;
  mouthShape: MouthShape;
  blink: number; // 0 = eyes open, 1 = fully closed
  bounce: number; // vertical bob offset in px
  tilt: number; // rotation in degrees
  armWave: number; // 0..1 wave cycle for right arm
  browRaise: number; // 0..1 eyebrow raise for emphasis
}> = ({mouthOpen, mouthShape, blink, bounce, tilt, armWave, browRaise}) => {
  const mouthH = 6 + mouthOpen * 46;
  const mouthW = mouthWidthByShape[mouthShape];
  const eyeScaleY = Math.max(0.04, 1 - blink);
  const armAngle = -18 + Math.sin(armWave * Math.PI * 2) * 22;

  return (
    <svg
      viewBox="0 0 440 420"
      width={440}
      height={420}
      style={{
        overflow: 'visible',
        transform: `translateY(${bounce}px) rotate(${tilt}deg)`,
      }}
    >
      <defs>
        <linearGradient id="wBodyGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06D6A0" />
          <stop offset="100%" stopColor="#118AB2" />
        </linearGradient>
        <radialGradient id="cheekGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B9D" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#FF6B9D" stopOpacity={0} />
        </radialGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#04303f" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="220" cy="392" rx="140" ry="18" fill="#04303f" opacity={0.18} />

      {/* left leg/foot */}
      <g>
        <ellipse cx="150" cy="368" rx="26" ry="18" fill="#073B4C" />
        <rect x="140" y="300" width="20" height="80" rx="10" fill="#0B5566" />
      </g>
      {/* right leg/foot */}
      <g>
        <ellipse cx="290" cy="368" rx="26" ry="18" fill="#073B4C" />
        <rect x="280" y="300" width="20" height="80" rx="10" fill="#0B5566" />
      </g>

      {/* left arm (static, hand on hip-ish) */}
      <g transform="rotate(18 90 200)">
        <rect x="80" y="200" width="18" height="90" rx="9" fill="#06D6A0" />
        <circle cx="89" cy="292" r="16" fill="#FFD166" />
      </g>

      {/* body: chunky rounded "W" made from a thick stroked polyline */}
      <path
        d="M 60 100 L 140 320 L 220 170 L 300 320 L 380 100"
        fill="none"
        stroke="url(#wBodyGradient)"
        strokeWidth={72}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#softShadow)"
      />
      {/* subtle highlight stroke for a glossy friendly look */}
      <path
        d="M 60 100 L 140 320 L 220 170 L 300 320 L 380 100"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.18}
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* right arm (animated wave) */}
      <g transform={`rotate(${armAngle} 350 200)`}>
        <rect x="350" y="200" width="18" height="90" rx="9" fill="#06D6A0" />
        <circle cx="359" cy="292" r="16" fill="#FFD166" />
      </g>

      {/* face plate on the middle peak of the W */}
      <ellipse cx="220" cy="150" rx="98" ry="76" fill="#FFFFFF" opacity={0.97} />
      <ellipse cx="220" cy="150" rx="98" ry="76" fill="none" stroke="#073B4C" strokeOpacity={0.06} strokeWidth={3} />

      {/* cheeks */}
      <ellipse cx="168" cy="182" rx="22" ry="14" fill="url(#cheekGradient)" />
      <ellipse cx="272" cy="182" rx="22" ry="14" fill="url(#cheekGradient)" />

      {/* eyebrows */}
      <rect
        x="176"
        y={112 - browRaise * 8}
        width="34"
        height="8"
        rx="4"
        fill="#073B4C"
        transform={`rotate(-8 193 116)`}
      />
      <rect
        x="230"
        y={112 - browRaise * 8}
        width="34"
        height="8"
        rx="4"
        fill="#073B4C"
        transform={`rotate(8 247 116)`}
      />

      {/* eyes */}
      <g transform={`translate(193 142) scale(1 ${eyeScaleY})`}>
        <circle cx="0" cy="0" r="20" fill="#FFFFFF" stroke="#073B4C" strokeWidth={3} />
        <circle cx="4" cy="2" r="9" fill="#073B4C" />
        <circle cx="7" cy="-2" r="3" fill="#FFFFFF" />
      </g>
      <g transform={`translate(247 142) scale(1 ${eyeScaleY})`}>
        <circle cx="0" cy="0" r="20" fill="#FFFFFF" stroke="#073B4C" strokeWidth={3} />
        <circle cx="4" cy="2" r="9" fill="#073B4C" />
        <circle cx="7" cy="-2" r="3" fill="#FFFFFF" />
      </g>

      {/* mouth */}
      <g transform="translate(220 196)">
        <rect
          x={-mouthW / 2}
          y={-mouthH / 2}
          width={mouthW}
          height={mouthH}
          rx={mouthH / 2}
          fill="#7A1F3D"
        />
        {mouthOpen > 0.25 ? (
          <rect
            x={-mouthW / 2 + 6}
            y={mouthH / 2 - Math.min(mouthH * 0.4, 10)}
            width={mouthW - 12}
            height={Math.min(mouthH * 0.4, 10)}
            rx={4}
            fill="#FF8FAE"
          />
        ) : null}
      </g>
    </svg>
  );
};
