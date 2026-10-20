import React from 'react';
import {Composition} from 'remotion';
import {HalloweenInvite} from './HalloweenInvite';
import {HalloweenInviteV2, V2_DURATION} from './v2/HalloweenInviteV2';
import {DURATION, FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="HalloweenInvite"
			component={HalloweenInvite}
			durationInFrames={DURATION}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
		/>
		<Composition
			id="HalloweenInviteV2"
			component={HalloweenInviteV2}
			durationInFrames={V2_DURATION}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
		/>
	</>
);
