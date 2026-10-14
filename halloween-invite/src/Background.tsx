import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useVideoConfig} from 'remotion';
import {Bat, Moon, Pumpkin, Spider} from './elements/Characters';
import {C} from './theme';
import {useSceneFrame} from './time';

const STARS = Array.from({length: 26}, (_, i) => ({
	x: random(`sx${i}`) * 1080,
	y: random(`sy${i}`) * 1050,
	r: 1.5 + random(`sr${i}`) * 3,
	speed: 0.04 + random(`ss${i}`) * 0.08,
	phase: random(`sp${i}`) * Math.PI * 2,
}));

export const MOON = {left: 720, top: 70, size: 320};

export const Background: React.FC = () => {
	const frame = useSceneFrame();
	const {fps} = useVideoConfig();

	const moonRise = interpolate(frame, [0, 70], [260, 0], {
		extrapolateRight: 'clamp',
		easing: (t) => 1 - Math.pow(1 - t, 3),
	});
	const fadeIn = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});

	// pumpkins pop out of the ground at ~9.5 s
	const pumpkin = (start: number) =>
		spring({frame: frame - start, fps, config: {damping: 9, stiffness: 140, mass: 0.8}});
	const flicker = (seed: number) => 0.6 + 0.4 * Math.sin(frame / 3 + seed) * Math.sin(frame / 7.3 + seed * 2);

	const spiderIn = spring({frame: frame - 352, fps, config: {damping: 14, stiffness: 60}});

	return (
		<AbsoluteFill style={{opacity: fadeIn}}>
			<AbsoluteFill
				style={{
					background: `linear-gradient(180deg, ${C.black} 0%, #140C08 42%, #34160A 70%, #9A3E0A 92%, #C85A12 100%)`,
				}}
			/>
			{STARS.map((s, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: s.x,
						top: s.y,
						width: s.r * 2,
						height: s.r * 2,
						borderRadius: '50%',
						background: C.white,
						opacity: 0.35 + 0.65 * Math.abs(Math.sin(frame * s.speed + s.phase)),
						boxShadow: `0 0 ${s.r * 4}px rgba(255,255,255,0.8)`,
					}}
				/>
			))}
			{/* moon with soft halo */}
			<div
				style={{
					position: 'absolute',
					left: MOON.left - 120,
					top: MOON.top - 120 + moonRise,
					width: MOON.size + 240,
					height: MOON.size + 240,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(255,180,90,0.35) 0%, rgba(255,140,40,0.12) 45%, rgba(0,0,0,0) 70%)',
				}}
			/>
			<div style={{position: 'absolute', left: MOON.left, top: MOON.top + moonRise}}>
				<Moon size={MOON.size} />
			</div>
			{/* two little bats circling the moon */}
			{[0, 1].map((i) => {
				const a = frame / 40 + i * Math.PI;
				const x = MOON.left + MOON.size / 2 + Math.cos(a) * 170 - 40;
				const y = MOON.top + MOON.size / 2 + Math.sin(a) * 90 + moonRise - 20;
				return (
					<Bat
						key={i}
						size={i ? 70 : 90}
						frame={frame + i * 7}
						style={{position: 'absolute', left: x, top: y, transform: `scaleX(${Math.sin(a) > 0 ? -1 : 1})`}}
					/>
				);
			})}
			{/* spider dangling top-left from the date scene onwards */}
			<Spider
				size={110}
				frame={frame}
				thread={interpolate(spiderIn, [0, 1], [0, 210]) + Math.sin(frame / 18) * 26}
				style={{left: 70, top: 0, opacity: spiderIn > 0.01 ? 1 : 0}}
			/>
			{/* hills */}
			<svg viewBox="0 0 1080 420" width={1080} height={420} style={{position: 'absolute', bottom: 0}}>
				<path d="M0 170 Q 260 70 560 150 Q 820 220 1080 120 L 1080 420 L 0 420 Z" fill="#1A0F0A" />
				<path d="M0 260 Q 300 170 600 240 Q 860 300 1080 230 L 1080 420 L 0 420 Z" fill={C.black} />
				{/* little spooky tree */}
				<path
					d="M140 140 L 150 40 Q 130 20 110 26 M 150 70 Q 175 40 196 44 M 148 96 Q 120 80 100 88"
					stroke="#1A0F0A"
					strokeWidth="10"
					fill="none"
					strokeLinecap="round"
				/>
				<path d="M134 150 L 146 34 L 156 34 L 164 150 Z" fill="#1A0F0A" />
			</svg>
			{/* pumpkin patch */}
			<div style={{position: 'absolute', left: 20, bottom: 40, transform: `translateY(${(1 - pumpkin(280)) * 320}px)`}}>
				<Pumpkin size={270} face="jack" flicker={flicker(1)} />
			</div>
			<div style={{position: 'absolute', left: 420, bottom: 20, transform: `translateY(${(1 - pumpkin(290)) * 320}px)`}}>
				<Pumpkin size={190} face="happy" flicker={flicker(2)} />
			</div>
			<div style={{position: 'absolute', right: 30, bottom: 50, transform: `translateY(${(1 - pumpkin(300)) * 320}px)`}}>
				<Pumpkin size={300} face="cute" />
			</div>
			{/* vignette */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
		</AbsoluteFill>
	);
};
