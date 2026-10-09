import React, {useMemo} from 'react';
import {AbsoluteFill, random} from 'remotion';

// A tile of film grain, built once. Shifted every frame so it never sits still.
const useGrain = () =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d')!;
    const d = g.createImageData(512, 512);
    for (let i = 0; i < 512 * 512; i++) {
      const v = 128 + (random(`grain${i}`) - 0.5) * 255;
      d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v;
      d.data[i * 4 + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return c.toDataURL();
  }, []);

// A finish wrapped around every scene: bloom on anything bright, a soft vignette and
// fine grain (which also keeps the dark gradients from banding after the platform recompresses).
// `bloom` 0..1 scales the glow (0 skips it); draw captions outside this wrapper.
export const Finish: React.FC<{fr: number; bloom?: number; children: React.ReactNode}> = ({fr, bloom = 1, children}) => {
  const grain = useGrain();
  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="film-bloom" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* keep only what is brighter than ~62%, then spread it at two radii */}
          <feColorMatrix in="SourceGraphic" type="matrix" values="2.6 0 0 0 -1.62  0 2.6 0 0 -1.62  0 0 2.6 0 -1.62  0 0 0 1 0" result="hot" />
          <feGaussianBlur in="hot" stdDeviation="9" result="b1" />
          <feGaussianBlur in="hot" stdDeviation="42" result="b2" />
          <feComposite in="b1" in2="b2" operator="arithmetic" k1="0" k2={0.55 * bloom} k3={0.75 * bloom} k4="0" result="glow" />
          <feBlend in="SourceGraphic" in2="glow" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{filter: bloom > 0 ? 'url(#film-bloom)' : undefined}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{backgroundImage: `url(${grain})`, backgroundPosition: `${Math.floor(random(`gx${fr}`) * 512)}px ${Math.floor(random(`gy${fr}`) * 512)}px`, mixBlendMode: 'overlay', opacity: 0.075, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
