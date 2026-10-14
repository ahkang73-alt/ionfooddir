import React from 'react';
import {Composition} from 'remotion';
import {HalloweenInvite} from './HalloweenInvite';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="HalloweenInvite"
		component={HalloweenInvite}
		durationInFrames={DURATION}
		fps={FPS}
		width={WIDTH}
		height={HEIGHT}
	/>
);
