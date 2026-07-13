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
  rest: 44,
  closed: 44,
  fv: 38,
  open: 52,
  mid: 46,
  small: 40,
  round: 28,
  'mid-consonant': 42,
};

const PEAK_X = 220;
const PEAK_Y = 195;
const NAVY = '#10163A';

export const Mascot: React.FC<{
  mouthOpen: number;
  mouthShape: MouthShape;
  blink: number; // 0 = eyes open, 1 = fully closed
  bounce: number; // vertical bob offset in px
  tilt: number; // rotation in degrees
  armWave: number; // 0..1 wave cycle for right arm
  browRaise: number; // 0..1 eyebrow lift for emphasis
}> = ({mouthOpen, mouthShape, blink, bounce, tilt, armWave, browRaise}) => {
  const mouthH = 6 + mouthOpen * 38;
  const mouthW = mouthWidthByShape[mouthShape];
  const isSmiling = mouthOpen < 0.12;
  const eyeScaleY = Math.max(0.04, 1 - blink);
  const armAngle = -18 + Math.sin(armWave * Math.PI * 2) * 22;
  const browLift = 7 + browRaise * 7;

  const bodyPath = 'M 55 90 L 155 330 L 220 195 L 285 330 L 385 90';

  return (
    <svg
      viewBox="0 0 440 440"
      width={440}
      height={440}
      style={{
        overflow: 'visible',
        transform: `translateY(${bounce}px) rotate(${tilt}deg)`,
      }}
    >
      <defs>
        <linearGradient id="wBodyGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00E6B8" />
          <stop offset="100%" stopColor="#3A5DFF" />
        </linearGradient>
        <radialGradient id="cheekGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6F91" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#FF6F91" stopOpacity={0} />
        </radialGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#04122f" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="220" cy="422" rx="145" ry="16" fill="#04122f" opacity={0.18} />

      {/* left leg/foot */}
      <g>
        <rect x="143" y="325" width="26" height="80" rx="13" fill="#26307A" stroke={NAVY} strokeWidth={5} />
        <ellipse cx="156" cy="408" rx="28" ry="17" fill={NAVY} />
      </g>
      {/* right leg/foot */}
      <g>
        <rect x="271" y="325" width="26" height="80" rx="13" fill="#26307A" stroke={NAVY} strokeWidth={5} />
        <ellipse cx="284" cy="408" rx="28" ry="17" fill={NAVY} />
      </g>

      {/* left arm (static, hand on hip-ish) */}
      <g transform="rotate(20 100 235)">
        <rect x="88" y="235" width="24" height="95" rx="12" fill="#00E6B8" stroke={NAVY} strokeWidth={5} />
        <circle cx="100" cy="332" r="20" fill="#FFC93C" stroke={NAVY} strokeWidth={5} />
      </g>

      {/* body outline (drawn wider, underneath, to give a bold sticker-style border) */}
      <path
        d={bodyPath}
        fill="none"
        stroke={NAVY}
        strokeWidth={112}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#softShadow)"
      />
      {/* body: chunky rounded "W" made from a thick stroked polyline */}
      <path
        d={bodyPath}
        fill="none"
        stroke="url(#wBodyGradient)"
        strokeWidth={96}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* glossy highlight stroke for a polished look */}
      <path
        d={bodyPath}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.28}
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-8 -10)"
      />

      {/* right arm (animated wave) */}
      <g transform={`rotate(${armAngle} 340 235)`}>
        <rect x="328" y="235" width="24" height="95" rx="12" fill="#00E6B8" stroke={NAVY} strokeWidth={5} />
        <circle cx="340" cy="332" r="20" fill="#FFC93C" stroke={NAVY} strokeWidth={5} />
      </g>

      {/* rounded knob at the W's middle peak: outline + gradient fill,
          giving generous surface for the face while staying the same
          body color -- no separate "head" */}
      <circle cx={PEAK_X} cy={PEAK_Y} r={87} fill={NAVY} filter="url(#softShadow)" />
      <circle cx={PEAK_X} cy={PEAK_Y} r={78} fill="url(#wBodyGradient)" />
      <ellipse cx={PEAK_X - 30} cy={PEAK_Y - 45} rx="34" ry="20" fill="#ffffff" opacity={0.22} />

      {/* cheeks, right on the body color */}
      <ellipse cx={PEAK_X - 52} cy={PEAK_Y + 34} rx="20" ry="13" fill="url(#cheekGradient)" />
      <ellipse cx={PEAK_X + 52} cy={PEAK_Y + 34} rx="20" ry="13" fill="url(#cheekGradient)" />

      {/* happy, raised eyebrows -- gentle upward arches */}
      <path
        d={`M ${PEAK_X - 48} ${PEAK_Y - 20 + 7} Q ${PEAK_X - 28} ${PEAK_Y - 20 - browLift} ${PEAK_X - 8} ${PEAK_Y - 20 + 7}`}
        fill="none"
        stroke={NAVY}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d={`M ${PEAK_X + 8} ${PEAK_Y - 20 + 7} Q ${PEAK_X + 28} ${PEAK_Y - 20 - browLift} ${PEAK_X + 48} ${PEAK_Y - 20 + 7}`}
        fill="none"
        stroke={NAVY}
        strokeWidth={7}
        strokeLinecap="round"
      />

      {/* eyes, placed directly on the W's body (Clippy-style) */}
      <g transform={`translate(${PEAK_X - 29} ${PEAK_Y}) scale(1 ${eyeScaleY})`}>
        <circle cx="0" cy="0" r="23" fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
        <circle cx="4" cy="4" r="11" fill={NAVY} />
        <circle cx="8" cy="-2" r="4" fill="#FFFFFF" />
      </g>
      <g transform={`translate(${PEAK_X + 29} ${PEAK_Y}) scale(1 ${eyeScaleY})`}>
        <circle cx="0" cy="0" r="23" fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
        <circle cx="4" cy="4" r="11" fill={NAVY} />
        <circle cx="8" cy="-2" r="4" fill="#FFFFFF" />
      </g>

      {/* mouth, on the body: a happy smile at rest, an open shape while talking */}
      <g transform={`translate(${PEAK_X} ${PEAK_Y + 38})`}>
        {isSmiling ? (
          <path
            d={`M ${-mouthW / 2} 0 Q 0 18 ${mouthW / 2} 0`}
            fill="none"
            stroke={NAVY}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ) : (
          <>
            <rect
              x={-mouthW / 2}
              y={-mouthH / 2}
              width={mouthW}
              height={mouthH}
              rx={mouthH / 2}
              fill={NAVY}
            />
            <rect
              x={-mouthW / 2 + 4}
              y={-mouthH / 2 + 4}
              width={mouthW - 8}
              height={Math.max(mouthH - 8, 2)}
              rx={Math.max(mouthH / 2 - 4, 1)}
              fill="#E63950"
            />
            {mouthOpen > 0.25 ? (
              <rect
                x={-mouthW / 2 + 6}
                y={mouthH / 2 - Math.min(mouthH * 0.38, 9) - 4}
                width={mouthW - 12}
                height={Math.min(mouthH * 0.38, 9)}
                rx={4}
                fill="#FF9EB5"
              />
            ) : null}
          </>
        )}
      </g>
    </svg>
  );
};
