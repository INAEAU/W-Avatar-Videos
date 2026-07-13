import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Mascot, MouthShape} from './Mascot';
import {decorShapes} from './data/decor';
import lipsyncFrames from './data/lipsync.json';
import captionsRaw from './data/captions.json';

const captions = captionsRaw as Array<{text: string; startFrame: number; endFrame: number}>;
const lipsync = lipsyncFrames as Array<{m: number; s: MouthShape}>;

export const MascotVideo: React.FC<{leadInFrames: number}> = ({leadInFrames}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const speechFrame = frame - leadInFrames;

  const lip = lipsync[speechFrame] ?? {m: 0.03, s: 'rest' as MouthShape};
  const isSpeaking = speechFrame >= 0 && speechFrame < lipsync.length;

  // gentle idle blink schedule: a quick close every ~3.4s
  const blinkPeriod = Math.round(3.4 * fps);
  const t = frame % blinkPeriod;
  const blink = t < 6 ? Math.sin((t / 6) * Math.PI) : 0;

  // breathing / talking bounce
  const bounce = Math.sin(frame / 10) * 4 + (isSpeaking ? Math.sin(frame / 3.3) * lip.m * 3 : 0);
  const tilt = Math.sin(frame / 45) * 2.5;
  const armWave = (frame % 60) / 60;
  const browRaise = isSpeaking ? Math.min(1, lip.m * 1.3) : 0;

  const introProgress = spring({frame, fps, config: {damping: 200}, durationInFrames: 25});
  const mascotScale = interpolate(introProgress, [0, 1], [0.6, 1]);
  const mascotOpacity = interpolate(introProgress, [0, 1], [0, 1]);

  const outroStart = durationInFrames - Math.round(1.4 * fps);
  const outroFade = interpolate(frame, [outroStart, durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #FFF3B0 0%, #FFD6E8 45%, #C7F0FF 100%)',
        opacity: outroFade,
      }}
    >
      {decorShapes.map((d, i) => {
        const drift = Math.sin(frame / (30 / d.speed) + d.phase) * 10;
        const cx = (d.x / 100) * width;
        const cy = (d.y / 100) * height + drift;
        if (d.kind === 'circle') {
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: cx - d.size / 2,
                top: cy - d.size / 2,
                width: d.size,
                height: d.size,
                borderRadius: '50%',
                background: d.color,
                opacity: 0.55,
              }}
            />
          );
        }
        return (
          <svg
            key={i}
            style={{position: 'absolute', left: cx - d.size / 2, top: cy - d.size / 2}}
            width={d.size}
            height={d.size}
            viewBox="0 0 24 24"
          >
            <polygon
              points="12,1 15,9 23,9 16.5,14 19,22 12,17 5,22 7.5,14 1,9 9,9"
              fill={d.color}
              opacity={0.6}
            />
          </svg>
        );
      })}

      {/* Header banner */}
      <AbsoluteFill style={{alignItems: 'center', top: 30, height: 90}}>
        <div
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontWeight: 900,
            fontSize: 40,
            color: '#073B4C',
            letterSpacing: 0.5,
            textShadow: '0 2px 0 rgba(255,255,255,0.6)',
          }}
        >
          Incidents <span style={{color: '#EF476F'}}>vs.</span> Requests
        </div>
      </AbsoluteFill>

      {/* Mascot */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${mascotScale})`,
            opacity: mascotOpacity,
          }}
        >
          <Mascot
            mouthOpen={lip.m}
            mouthShape={lip.s}
            blink={blink}
            bounce={bounce}
            tilt={tilt}
            armWave={armWave}
            browRaise={browRaise}
          />
        </div>
      </AbsoluteFill>

      {/* Caption banner */}
      {captions.map((c, i) => {
        const start = c.startFrame + leadInFrames;
        const end = c.endFrame + leadInFrames;
        if (frame < start - 5 || frame > end + 10) return null;
        const fadeIn = interpolate(frame, [start - 5, start + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const fadeOut = interpolate(frame, [end - 12, end + 10], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const opacity = Math.min(fadeIn, fadeOut);
        const riseY = interpolate(fadeIn, [0, 1], [16, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 70,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              opacity,
              transform: `translateY(${riseY}px)`,
            }}
          >
            <div
              style={{
                background: '#073B4C',
                color: '#FFFFFF',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontWeight: 700,
                fontSize: 30,
                padding: '14px 34px',
                borderRadius: 999,
                boxShadow: '0 6px 0 rgba(0,0,0,0.12)',
              }}
            >
              {c.text}
            </div>
          </div>
        );
      })}

      <Sequence from={leadInFrames}>
        <Audio src={staticFile('audio/narration.wav')} />
      </Sequence>
    </AbsoluteFill>
  );
};
