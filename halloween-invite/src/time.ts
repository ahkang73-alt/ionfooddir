import {useCurrentFrame} from 'remotion';

// The animation timeline was laid out for 45 s; it plays back at this speed
// so the finished video is 40 s. Scene timings in the code stay in "story
// frames" (45 s scale); audio placement converts back to real frames.
export const SPEED = 45 / 40;

export const useSceneFrame = () => useCurrentFrame() * SPEED;
