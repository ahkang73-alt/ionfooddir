import '@fontsource/creepster';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';

import React, {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	Easing,
	Html5Audio,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useVideoConfig,
} from 'remotion';
import {Background} from './Background';
import {SPEED, useSceneFrame} from './time';
import {
	Bat,
	Cauldron,
	ClockIcon,
	CupcakeIcon,
	GiftIcon,
	Ghost,
	Sparkle,
	TagIcon,
	Witch,
} from './elements/Characters';
import {CelevenusLogo} from './elements/Logo';
import {C, DURATION, EVENT, FONT, FPS} from './theme';
import {VOICE_FILE, VOICE_LINES, voiceActivity} from './voiceover';

// ------------------------------------------------------------------ helpers
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 fade between `start` and `start + dur`, then 1→0 at `end`. */
const inOut = (f: number, start: number, end: number, dur = 15) =>
	Math.min(
		interpolate(f, [start, start + dur], [0, 1], {...clamp, easing: ease}),
		interpolate(f, [end - dur, end], [1, 0], {...clamp, easing: ease}),
	);

const useFonts = () => {
	const [handle] = useState(() => delayRender('Loading fonts'));
	useEffect(() => {
		Promise.all(
			[
				'100px Creepster',
				'400 60px Fredoka',
				'600 60px Fredoka',
				'500 60px "Cormorant Garamond"',
				'italic 500 60px "Cormorant Garamond"',
			].map((f) => document.fonts.load(f)),
		)
			.then(() => continueRender(handle))
			.catch(() => continueRender(handle));
	}, [handle]);
};

const centered: React.CSSProperties = {
	position: 'absolute',
	left: 0,
	width: '100%',
	textAlign: 'center',
};

const spookyText = (size: number, color: string): React.CSSProperties => ({
	fontFamily: FONT.spooky,
	fontSize: size,
	color,
	letterSpacing: 4,
	lineHeight: 1,
	WebkitTextStroke: `${Math.round(size / 18)}px ${C.black}`,
	paintOrder: 'stroke fill',
	textShadow: `0 0 40px rgba(255,122,26,0.55), 0 8px 0 ${C.black}`,
});

const cuteText = (size: number, color = C.white, weight = 600): React.CSSProperties => ({
	fontFamily: FONT.cute,
	fontWeight: weight,
	fontSize: size,
	color,
	lineHeight: 1.15,
	textShadow: '0 4px 18px rgba(0,0,0,0.7)',
});

// ------------------------------------------------------------------ audio
const SFX: Array<{at: number; src: string; volume: number}> = [
	{at: 0, src: 'wind.wav', volume: 0.45},
	{at: 50, src: 'whoosh.wav', volume: 0.6},
	{at: 85, src: 'sparkle.wav', volume: 0.45},
	{at: 110, src: 'chime.wav', volume: 0.55},
	{at: 194, src: 'whoosh.wav', volume: 0.3},
	{at: 248, src: 'sparkle.wav', volume: 0.5},
	{at: 282, src: 'pop.wav', volume: 0.6},
	{at: 292, src: 'pop.wav', volume: 0.6},
	{at: 302, src: 'pop.wav', volume: 0.6},
	{at: 374, src: 'ding.wav', volume: 0.45},
	{at: 420, src: 'ding.wav', volume: 0.45},
	{at: 466, src: 'boing.wav', volume: 0.4},
	{at: 566, src: 'bubbles.wav', volume: 0.55},
	{at: 604, src: 'ding.wav', volume: 0.45},
	{at: 689, src: 'sparkle.wav', volume: 0.5},
	{at: 774, src: 'ding.wav', volume: 0.45},
	{at: 945, src: 'bats.wav', volume: 0.5},
	{at: 1000, src: 'boing.wav', volume: 0.35},
	{at: 1113, src: 'chime.wav', volume: 0.5},
	{at: 1172, src: 'whoosh.wav', volume: 0.5},
	{at: 1162, src: 'ding.wav', volume: 0.45},
	{at: 1260, src: 'tada.wav', volume: 0.55},
];

const Soundtrack: React.FC = () => (
	<>
		{/* music dips under Dr Dylan's voice */}
		<Html5Audio
			src={staticFile('audio/music.wav')}
			volume={(f) =>
				interpolate(f, [0, 20, DURATION - 30, DURATION], [0, 0.35, 0.35, 0.3], clamp) * (1 - 0.72 * voiceActivity(f, FPS))
			}
		/>
		{SFX.map((s) => (
			<Sequence key={`${s.src}-${s.at}`} from={Math.round(s.at / SPEED)} durationInFrames={150} layout="none">
				<Html5Audio src={staticFile(`audio/${s.src}`)} volume={s.volume * (1 - 0.65 * voiceActivity(s.at / SPEED, FPS))} />
			</Sequence>
		))}
		{VOICE_LINES.map((l) => {
			const dur = Math.round((l.srcEnd - l.srcStart) * FPS);
			return (
				<Sequence key={l.at} from={Math.round(l.at * FPS)} durationInFrames={dur} layout="none">
					<Html5Audio
						src={staticFile(VOICE_FILE)}
						trimBefore={Math.round(l.srcStart * FPS)}
						volume={(f) => interpolate(f, [0, 2, dur - 3, dur], [0, 1, 1, 0], clamp)}
					/>
				</Sequence>
			);
		})}
	</>
);

// ------------------------------------------------------------------ logo (persistent)
const LOGO_KEYS = [110, 135, 168, 198, 1110, 1142];
const PersistentLogo: React.FC = () => {
	const f = useSceneFrame();
	const y = interpolate(f, LOGO_KEYS, [800, 760, 760, 150, 150, 465], {...clamp, easing: ease});
	const w = interpolate(f, LOGO_KEYS, [560, 600, 600, 270, 270, 500], {...clamp, easing: ease});
	const opacity = interpolate(f, [110, 135], [0, 1], clamp);
	const halo = interpolate(f, LOGO_KEYS, [0, 1, 1, 0, 0, 1], clamp);
	return (
		<div
			style={{
				position: 'absolute',
				left: 540,
				top: y,
				transform: 'translate(-50%, -50%)',
				opacity,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: -w * 0.35,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(8,5,3,0.85) 0%, rgba(8,5,3,0.5) 45%, rgba(0,0,0,0) 70%)',
					opacity: halo,
				}}
			/>
			<CelevenusLogo width={w} style={{position: 'relative'}} />
			<div
				style={{
					position: 'relative',
					fontFamily: FONT.elegant,
					fontWeight: 500,
					fontSize: w * 0.056,
					letterSpacing: w * 0.014,
					color: C.cream,
					marginTop: w * 0.02,
					whiteSpace: 'nowrap',
				}}
			>
				WELLNESS &amp; AESTHETIC CLINIC
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ witch flight
const FlyingWitch: React.FC<{start: number; end: number; y0: number; y1: number; size: number}> = ({
	start,
	end,
	y0,
	y1,
	size,
}) => {
	const f = useSceneFrame();
	if (f < start - 2 || f > end + 30) return null;
	const pos = (fr: number) => {
		const p = (fr - start) / (end - start);
		return {
			x: interpolate(p, [0, 1], [-size - 50, 1080 + 50]),
			y: interpolate(p, [0, 1], [y0, y1]) - Math.sin(p * Math.PI) * 110 + Math.sin(fr / 8) * 12,
		};
	};
	const me = pos(f);
	return (
		<>
			{Array.from({length: 8}, (_, k) => {
				const p = pos(f - (k + 1) * 3);
				return (
					<Sparkle
						key={k}
						size={34 - k * 3}
						color={k % 2 ? C.white : C.glow}
						style={{
							position: 'absolute',
							left: p.x + 10 + Math.sin(k * 2.1) * 12,
							top: p.y + size * 0.6 + Math.cos(k * 1.7) * 14,
							opacity: (1 - k / 8) * (f < end + 20 ? 1 : 0),
							transform: `rotate(${f * 6 + k * 30}deg)`,
						}}
					/>
				);
			})}
			<Witch size={size} frame={f} style={{position: 'absolute', left: me.x, top: me.y, transform: 'rotate(-6deg)'}} />
		</>
	);
};

// ------------------------------------------------------------------ scenes
const IntroLine: React.FC = () => {
	const f = useSceneFrame();
	const o = inOut(f, 138, 172, 12);
	return (
		<div style={{...centered, top: 1060, opacity: o, transform: `translateY(${(1 - o) * 20}px)`}}>
			<div style={{...cuteText(54, C.orangeLight, 400)}}>has a spooky-sweet surprise for you…</div>
		</div>
	);
};

const TitleScene: React.FC = () => {
	const f = useSceneFrame();
	const {fps} = useVideoConfig();
	const exit = interpolate(f, [335, 360], [1, 0], {...clamp, easing: ease});
	const invited = interpolate(f, [186, 202], [0, 1], {...clamp, easing: ease});
	const word = 'HALLOWEEN';
	const party = spring({frame: f - 248, fps, config: {damping: 10, stiffness: 120}});
	const atCeleVenus = interpolate(f, [264, 282], [0, 1], clamp);
	if (f < 180 || f > 362) return null;
	return (
		<AbsoluteFill style={{opacity: exit, transform: `scale(${0.9 + 0.1 * exit})`}}>
			<div style={{...centered, top: 450, opacity: invited, transform: `translateY(${(1 - invited) * 30}px)`}}>
				<div style={cuteText(66)}>You’re invited to our</div>
			</div>
			<div style={{...centered, top: 570, display: 'flex', justifyContent: 'center'}}>
				{word.split('').map((ch, i) => {
					const s = spring({frame: f - 200 - i * 4, fps, config: {damping: 9, stiffness: 150}});
					return (
						<span
							key={i}
							style={{
								...spookyText(176, C.orange),
								display: 'inline-block',
								transform: `translateY(${(1 - s) * -520}px) rotate(${(1 - s) * (i % 2 ? 25 : -25) + Math.sin(f / 10 + i) * 3}deg)`,
								opacity: s > 0.02 ? 1 : 0,
							}}
						>
							{ch}
						</span>
					);
				})}
			</div>
			<div style={{...centered, top: 770, transform: `scale(${party})`}}>
				<span style={spookyText(250, C.white)}>PARTY</span>
				<Sparkle size={70} style={{position: 'absolute', left: 150, top: 10, opacity: party, transform: `rotate(${f * 3}deg)`}} />
				<Sparkle size={50} color={C.white} style={{position: 'absolute', right: 150, top: 190, opacity: party, transform: `rotate(${-f * 3}deg)`}} />
			</div>
			<div style={{...centered, top: 1070, opacity: atCeleVenus}}>
				<span style={{fontFamily: FONT.elegant, fontStyle: 'italic', fontWeight: 500, fontSize: 70, color: C.cream}}>
					at CeleVenus
				</span>
			</div>
		</AbsoluteFill>
	);
};

const DateScene: React.FC = () => {
	const f = useSceneFrame();
	const {fps} = useVideoConfig();
	if (f < 360 || f > 557) return null;
	const exit = interpolate(f, [528, 555], [1, 0], {...clamp, easing: ease});
	const head = interpolate(f, [364, 380], [0, 1], {...clamp, easing: ease});
	const card = spring({frame: f - 370, fps, config: {damping: 13, stiffness: 90}});
	const pill = spring({frame: f - 416, fps, config: {damping: 12, stiffness: 110}});
	const ghost = spring({frame: f - 462, fps, config: {damping: 7, stiffness: 120}});
	const rsvp = interpolate(f, [440, 456], [0, 1], {...clamp, easing: ease});
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<div style={{...centered, top: 400, opacity: head}}>
				<div style={spookyText(110, C.orange)}>Save the date!</div>
			</div>
			{/* ghost peeking from behind the calendar */}
			<Ghost
				size={200}
				frame={f}
				waving
				style={{position: 'absolute', left: 560 + ghost * 210, top: 600 - ghost * 40, transform: `rotate(${ghost * 14}deg)`}}
			/>
			<div style={{position: 'absolute', left: 240, top: 560, width: 600, perspective: 1400}}>
				<div
					style={{
						transformOrigin: '50% 0%',
						transform: `rotateX(${(1 - card) * -95}deg)`,
						background: C.white,
						borderRadius: 40,
						overflow: 'hidden',
						boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 8px rgba(255,122,26,0.9)',
						textAlign: 'center',
					}}
				>
					<div style={{background: C.orange, padding: '26px 0 18px', ...cuteText(72, C.white), textShadow: 'none', letterSpacing: 8}}>
						{EVENT.day}
					</div>
					<div style={{fontFamily: FONT.cute, fontWeight: 600, fontSize: 300, color: C.black, lineHeight: 1.05, marginTop: 6}}>
						{EVENT.date}
					</div>
					<div style={{fontFamily: FONT.cute, fontWeight: 600, fontSize: 58, color: C.orangeDeep, letterSpacing: 4, paddingBottom: 34}}>
						{EVENT.month}
					</div>
				</div>
				{[150, 450].map((x) => (
					<div
						key={x}
						style={{
							position: 'absolute',
							left: x - 16,
							top: -26,
							width: 32,
							height: 64,
							borderRadius: 16,
							background: C.black,
							border: `5px solid ${C.white}`,
							opacity: card,
						}}
					/>
				))}
			</div>
			<div
				style={{
					position: 'absolute',
					left: 110,
					top: 1180,
					width: 860,
					height: 150,
					borderRadius: 75,
					background: C.black,
					border: `6px solid ${C.orange}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 28,
					transform: `scale(${pill})`,
					boxShadow: '0 0 50px rgba(255,122,26,0.45)',
				}}
			>
				<ClockIcon size={96} frame={f} />
				<span style={{...cuteText(74), textShadow: 'none'}}>{EVENT.time}</span>
			</div>
			<div style={{...centered, top: 1372, opacity: rsvp, transform: `translateY(${(1 - rsvp) * 20}px)`}}>
				<span style={{...cuteText(50, C.orangeLight)}}>
					<Sparkle size={34} style={{verticalAlign: 'middle', marginRight: 14}} />
					RSVP required
					<Sparkle size={34} style={{verticalAlign: 'middle', marginLeft: 14}} />
				</span>
			</div>
		</AbsoluteFill>
	);
};

const ITEMS = [
	{at: 600, Icon: GiftIcon, title: 'Exciting prizes', sub: 'to be won at the party!'},
	{at: 685, Icon: TagIcon, title: 'Special offers on procedures', sub: 'Party hours only  •  3 – 6 PM'},
	{at: 770, Icon: CupcakeIcon, title: 'Finger food served', sub: 'Treat yourself & mingle with us'},
];

const TreatsScene: React.FC = () => {
	const f = useSceneFrame();
	const {fps} = useVideoConfig();
	if (f < 555 || f > 932) return null;
	const exit = interpolate(f, [902, 930], [1, 0], {...clamp, easing: ease});
	const head = spring({frame: f - 562, fps, config: {damping: 11, stiffness: 110}});
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<div style={{...centered, top: 380, transform: `scale(${head})`}}>
				<div style={spookyText(118, C.orange)}>What’s brewing?</div>
			</div>
			<div style={{position: 'absolute', left: 430, top: 510, transform: `scale(${head})`}}>
				<Cauldron size={220} frame={f} />
			</div>
			{ITEMS.map(({at, Icon, title, sub}, i) => {
				const s = spring({frame: f - at, fps, config: {damping: 13, stiffness: 100}});
				const pulse = 1 + 0.04 * Math.max(0, Math.sin(((f - at) / 12) * Math.PI)) * (f - at < 24 ? 1 : 0);
				return (
					<div
						key={title}
						style={{
							position: 'absolute',
							left: 70,
							top: 760 + i * 205,
							width: 940,
							height: 180,
							borderRadius: 40,
							background: C.white,
							border: `6px solid ${C.orange}`,
							boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
							display: 'flex',
							alignItems: 'center',
							gap: 30,
							padding: '0 34px',
							boxSizing: 'border-box',
							opacity: s,
							transform: `translateX(${(1 - s) * 700}px) rotate(${(1 - s) * 8}deg) scale(${pulse})`,
						}}
					>
						<div
							style={{
								width: 132,
								height: 132,
								flexShrink: 0,
								borderRadius: '50%',
								background: '#FFEBD6',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon size={104} />
						</div>
						<div>
							<div style={{fontFamily: FONT.cute, fontWeight: 600, fontSize: i === 1 ? 50 : 58, color: C.black, lineHeight: 1.1}}>
								{title}
							</div>
							<div style={{fontFamily: FONT.cute, fontWeight: 400, fontSize: 38, color: C.orangeDeep, marginTop: 6}}>{sub}</div>
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const EnjoyScene: React.FC = () => {
	const f = useSceneFrame();
	const {fps} = useVideoConfig();
	if (f < 930 || f > 1112) return null;
	const exit = interpolate(f, [1084, 1110], [1, 0], {...clamp, easing: ease});
	const l1 = spring({frame: f - 938, fps, config: {damping: 10, stiffness: 120}});
	const l2 = spring({frame: f - 952, fps, config: {damping: 10, stiffness: 120}});
	const body = interpolate(f, [972, 990], [0, 1], {...clamp, easing: ease});
	const ghosts = spring({frame: f - 998, fps, config: {damping: 8, stiffness: 100}});
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<div style={{...centered, top: 420, transform: `scale(${l1}) rotate(${(1 - l1) * -10}deg)`}}>
				<div style={spookyText(140, C.white)}>No tricks,</div>
			</div>
			<div style={{...centered, top: 570, transform: `scale(${l2}) rotate(${(1 - l2) * 10}deg)`}}>
				<div style={spookyText(150, C.orange)}>just treats!</div>
			</div>
			<div style={{...centered, top: 790, opacity: body, transform: `translateY(${(1 - body) * 30}px)`}}>
				<div style={cuteText(62)}>
					Come in, relax &amp; enjoy
					<br />a fun afternoon with us
				</div>
			</div>
			{/* bats swooping across */}
			{[0, 1, 2].map((i) => {
				const p = (f - 943 - i * 6) / 60;
				if (p < 0 || p > 1.1) return null;
				return (
					<Bat
						key={i}
						size={130 - i * 20}
						frame={f + i * 5}
						style={{
							position: 'absolute',
							left: interpolate(p, [0, 1], [1150, -200]),
							top: 1000 + i * 70 - Math.sin(p * Math.PI) * 160,
						}}
					/>
				);
			})}
			<div style={{position: 'absolute', left: 170, top: 1110, transform: `translateY(${(1 - ghosts) * 300}px) rotate(${Math.sin(f / 9) * 8}deg)`, opacity: ghosts}}>
				<Ghost size={210} frame={f} waving />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 690,
					top: 1150,
					transform: `translateY(${(1 - ghosts) * 300 + Math.sin(f / 7) * 14}px) rotate(${-Math.sin(f / 9) * 8}deg)`,
					opacity: ghosts,
				}}
			>
				<Ghost size={170} frame={f + 11} waving />
			</div>
		</AbsoluteFill>
	);
};

const OutroScene: React.FC = () => {
	const f = useSceneFrame();
	const {fps} = useVideoConfig();
	if (f < 1110) return null;
	const a = (start: number) => interpolate(f, [start, start + 18], [0, 1], {...clamp, easing: ease});
	const see = spring({frame: f - 1260, fps, config: {damping: 8, stiffness: 130}});
	const rsvp = spring({frame: f - 1158, fps, config: {damping: 11, stiffness: 120}});
	return (
		<AbsoluteFill>
			<div style={{...centered, top: 745, opacity: a(1135), transform: `translateY(${(1 - a(1135)) * 30}px)`}}>
				<div style={spookyText(118, C.orange)}>Halloween Party</div>
			</div>
			<div style={{...centered, top: 890, opacity: a(1152)}}>
				<div style={cuteText(60)}>Friday, 30 October 2026</div>
				<div style={{...cuteText(60, C.orangeLight), marginTop: 8}}>{EVENT.time}</div>
			</div>
			<div style={{...centered, top: 1062, opacity: a(1150)}}>
				<div style={{...cuteText(38, C.cream, 400)}}>
					{EVENT.addressLine1}
					<br />
					{EVENT.addressLine2}
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 120,
					top: 1175,
					width: 840,
					padding: '20px 0 22px',
					borderRadius: 44,
					background: C.orange,
					border: `5px solid ${C.white}`,
					textAlign: 'center',
					boxShadow: '0 0 50px rgba(255,122,26,0.5)',
					transform: `scale(${rsvp})`,
					zIndex: 2,
				}}
			>
				<div style={{fontFamily: FONT.cute, fontWeight: 600, fontSize: 58, color: C.black, lineHeight: 1.1}}>{EVENT.rsvpTitle}</div>
				<div style={{fontFamily: FONT.cute, fontWeight: 400, fontSize: 36, color: C.black, marginTop: 6}}>{EVENT.rsvpLine}</div>
			</div>
			<div style={{...centered, top: 1355, transform: `scale(${see}) rotate(${Math.sin(f / 12) * 2}deg)`}}>
				<div style={spookyText(150, C.white)}>See you there!</div>
			</div>
			{see > 0.05 &&
				Array.from({length: 10}, (_, i) => {
					const ang = (i / 10) * Math.PI * 2;
					const d = interpolate(f - 1260, [0, 30], [40, 330], {...clamp, easing: ease});
					const o = interpolate(f - 1260, [0, 10, 50, 70], [0, 1, 1, 0.25], clamp);
					return (
						<Sparkle
							key={i}
							size={i % 2 ? 36 : 54}
							color={i % 3 ? C.glow : C.white}
							style={{
								position: 'absolute',
								left: 540 + Math.cos(ang) * d * 1.4 - 25,
								top: 1430 + Math.sin(ang) * d * 0.4 - 25,
								opacity: o,
								transform: `rotate(${f * 4}deg)`,
							}}
						/>
					);
				})}
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ main
export const HalloweenInvite: React.FC = () => {
	useFonts();
	return (
		<AbsoluteFill style={{background: C.black}}>
			<Background />
			<FlyingWitch start={30} end={135} y0={420} y1={300} size={340} />
			<FlyingWitch start={1160} end={1265} y0={150} y1={90} size={260} />
			<PersistentLogo />
			<IntroLine />
			<TitleScene />
			<DateScene />
			<TreatsScene />
			<EnjoyScene />
			<OutroScene />
			<Soundtrack />
		</AbsoluteFill>
	);
};
