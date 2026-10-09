// Drop-in for @remotion/three's ThreeCanvas that never lets a frame be captured before the scene
// inside it has been drawn. A three.js canvas builds its scene a tick after it mounts, so the first
// frame after any mount (a new act, a canvas swapped mid-act, a render worker joining) could be
// captured empty. Use it for every 3D canvas in the film.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {ThreeCanvas as Base} from '@remotion/three';
import {useThree} from '@react-three/fiber';

// Last child of the canvas: by the time its effects run, everything before it has mounted.
const Drawn = ({handle}: {handle: number}) => {
  const advance = useThree((s) => s.advance);
  // Redraw after every commit, so a texture or image that arrives after the canvas mounted is on
  // screen before the frame is released.
  useEffect(() => { advance(performance.now()); });
  useEffect(() => {
    advance(performance.now());
    continueRender(handle);
  }, [advance, handle]);
  return null;
};

// Release a delayRender handle AFTER the state it was waiting for has been committed and drawn.
// Use this instead of continueRender() right after a setState: releasing in the same tick leaves
// a moment with nothing holding the frame while React has not yet mounted what the state enables.
export const settle = (handle: number) => {
  let done = false;
  const go = () => { if (!done) { done = true; continueRender(handle); } };
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(go, 150);
};

export const ThreeCanvas: typeof Base = (props) => {
  const [handle] = useState(() => delayRender('three canvas: first draw'));
  useEffect(() => () => continueRender(handle), [handle]); // unmounted before it drew
  return (
    <Base {...props}>
      {props.children}
      <Drawn handle={handle} />
    </Base>
  );
};
