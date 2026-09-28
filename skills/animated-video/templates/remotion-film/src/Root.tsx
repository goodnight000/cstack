import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { FPS, TOTAL, W, H } from "./lib";
export const Root: React.FC = () => <Composition id="Film" component={Film} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />;
