import React from 'react';
import {Composition} from 'remotion';
import {MascotVideo} from './MascotVideo';
import audioMeta from './data/audioMeta.json';

const fps = audioMeta.fps;
const leadInFrames = Math.round(0.7 * fps);
const tailFrames = Math.round(1.6 * fps);
const durationInFrames = leadInFrames + audioMeta.durationFrames + tailFrames;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MascotVideo"
      component={MascotVideo}
      durationInFrames={durationInFrames}
      fps={fps}
      width={1280}
      height={720}
      defaultProps={{leadInFrames}}
    />
  );
};
