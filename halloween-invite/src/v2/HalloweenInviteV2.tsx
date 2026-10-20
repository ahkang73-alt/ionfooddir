// Version 2 of the CeleVenus Halloween invite: 5 scenes, moonlit-graveyard look
// (orange / black / white with a touch of blood red), the witch circling the
// full moon, a distinct sound for every treat, and Dr Dylan's voice.
import '@fontsource/creepster';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/cormorant-garamond/500.css';

import React, {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	Easing,
	Html5Audio,
	interpolate,
	random,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {Bat, CrownIcon, CupcakeIcon, Moon, Pumpkin, Sparkle, TagIcon} from '../elements/Characters';
import {CelevenusLogo} from '../elements/Logo';
import {C, EVENT, FONT, FPS} from '../theme';
import {VOICE_FILE} from '../voiceover';
import {BLOOD, BloodDrips, Graveyard, Lightning, SkinScanIcon, Tombstone, WitchSilhouette} from './Elements';

export const V2_DURATION = 40 * FPS;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const sec = (f: number) => f / FPS;
/** 0→1 between two times (seconds). */
const ramp = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: ease});
/** Visible between start and end with short fades. */
const window_ = (t: number, a: number, b: number, fade = 0.35) => Math.min(ramp(t, a, a + fade), 1 - ramp(t, b - fade, b));
const pop = (t: number, at: number, damping = 11, stiffness = 120) =>
	spring({frame: (t - at) * FPS, fps: FPS, config: {damping, stiffness}});

const centered: React.CSSProperties = {position: 'absolute', left: 0, width: '100%', textAlign: 'center'};
const spooky = (size: number, color: string): React.CSSProperties => ({
	fontFamily: FONT.spooky,
	fontSize: size,
	color,
	letterSpacing: 4,
	lineHeight: 1,
	WebkitTextStroke: `${Math.round(size / 18)}px ${C.black}`,
	paintOrder: 'stroke fill',
	textShadow: `0 0 36px rgba(255,122,26,0.5), 0 8px 0 ${C.black}`,
});
const cute = (size: number, color: string = C.white, weight = 600): React.CSSProperties => ({
	fontFamily: FONT.cute,
	fontWeight: weight,
	fontSize: size,
	color,
	lineHeight: 1.15,
	textShadow: '0 4px 16px rgba(0,0,0,0.8)',
});

const useFonts = () => {
	const [handle] = useState(() => delayRender('Loading fonts'));
	useEffect(() => {
		Promise.all(['100px Creepster', '400 60px Fredoka', '600 60px Fredoka', '500 60px "Cormorant Garamond"'].map((f) => document.fonts.load(f)))
			.then(() => continueRender(handle))
			.catch(() => continueRender(handle));
	}, [handle]);
};

// ------------------------------------------------------------------ timeline (seconds)
const S2 = 4.4; // invitation + date
const S3 = 14.6; // treats
const S4 = 27.3; // no tricks + RSVP
const S5 = 36.2; // finale
const REVEALS = [15.6, 17.8, 22.2, 23.8]; // skin analysis, crown prize, offers, finger food
const SUMMARY = 25.6;
const STAMP = 34.6;
const SEE_YOU = 37.33; // lands on the music's final hit

// Dr Dylan (original "Dr dylan" voice) – same recording as version 1, re-timed to these scenes.
const TIME_LINE = 'audio/dr-dylan-time-line.wav';
const VOICE: Array<{srcStart: number; srcEnd: number; at: number; file?: string}> = [
	{srcStart: 0, srcEnd: 2.47, at: 0.8},
	{srcStart: 2.47, srcEnd: 4.44, at: 4.6},
	{srcStart: 0, srcEnd: 4.04, at: 8.7, file: TIME_LINE},
	{srcStart: 8.87, srcEnd: 14.97, at: 15.5},
	{srcStart: 14.97, srcEnd: 18.46, at: 22.1},
	{srcStart: 18.46, srcEnd: 23.71, at: 27.5},
	{srcStart: 23.71, srcEnd: 27.74, at: 32.85},
	{srcStart: 27.74, srcEnd: 29.96, at: 37.1},
];
const voiceActivity = (t: number) => {
	let v = 0;
	for (const l of VOICE) {
		const end = l.at + (l.srcEnd - l.srcStart);
		v = Math.max(v, Math.min(ramp(t, l.at - 0.35, l.at - 0.05), 1 - ramp(t, end, end + 0.4)));
	}
	return v;
};

const SFX: Array<{at: number; src: string; volume: number}> = [
	{at: 0, src: 'thunder.wav', volume: 0.5},
	{at: 0, src: 'wind.wav', volume: 0.18},
	{at: 1.0, src: 'whoosh.wav', volume: 0.35},
	{at: 2.0, src: 'chime.wav', volume: 0.35},
	{at: 3.0, src: 'whoosh.wav', volume: 0.3},
	{at: 4.4, src: 'whoosh.wav', volume: 0.25},
	{at: 5.9, src: 'drip.wav', volume: 0.55},
	{at: 6.5, src: 'drip.wav', volume: 0.45},
	{at: 7.0, src: 'whoosh.wav', volume: 0.35},
	{at: 8.5, src: 'stone.wav', volume: 0.55},
	{at: 10.2, src: 'ding.wav', volume: 0.3},
	{at: 14.6, src: 'whoosh.wav', volume: 0.3},
	{at: 14.9, src: 'bubbles.wav', volume: 0.35},
	// a different sound for each treat
	{at: REVEALS[0], src: 'scan.wav', volume: 0.6},
	{at: REVEALS[1], src: 'crown.wav', volume: 0.6},
	{at: REVEALS[2], src: 'kaching.wav', volume: 0.6},
	{at: REVEALS[3], src: 'munch.wav', volume: 0.7},
	{at: S4 + 0.1, src: 'bats.wav', volume: 0.45},
	{at: 28.6, src: 'whoosh.wav', volume: 0.35},
	{at: STAMP, src: 'stamp.wav', volume: 0.8},
	{at: STAMP + 0.5, src: 'drip.wav', volume: 0.5},
	{at: S5 + 0.1, src: 'chime.wav', volume: 0.35},
	{at: S5 + 0.3, src: 'whoosh.wav', volume: 0.35},
	{at: SEE_YOU, src: 'tada.wav', volume: 0.5},
	{at: 38.3, src: 'drip.wav', volume: 0.45},
];

const Soundtrack: React.FC = () => (
	<>
		<Html5Audio
			src={staticFile('audio/music.wav')}
			volume={(f) => interpolate(f, [0, 20, V2_DURATION - 30, V2_DURATION], [0, 0.18, 0.18, 0.16], clamp) * (1 - 0.8 * voiceActivity(sec(f)))}
		/>
		{SFX.map((s) => {
			const from = Math.round(s.at * FPS);
			return (
				<Sequence key={`${s.src}-${s.at}`} from={from} durationInFrames={150} layout="none">
					<Html5Audio src={staticFile(`audio/${s.src}`)} volume={(f) => s.volume * (1 - 0.45 * voiceActivity(sec(from + f)))} />
				</Sequence>
			);
		})}
		{VOICE.map((l) => {
			const dur = Math.round((l.srcEnd - l.srcStart) * FPS);
			return (
				<Sequence key={l.at} from={Math.round(l.at * FPS)} durationInFrames={dur} layout="none">
					<Html5Audio
						src={staticFile(l.file ?? VOICE_FILE)}
						trimBefore={Math.round(l.srcStart * FPS)}
						volume={(f) => interpolate(f, [0, 2, dur - 3, dur], [0, 1, 1, 0], clamp)}
					/>
				</Sequence>
			);
		})}
	</>
);

// ------------------------------------------------------------------ moon + witch
const MOON_T = [0, 1.6, S2, S2 + 0.8, S3, S3 + 0.7, S4, S4 + 0.7, S5, S5 + 0.7];
const moonAt = (t: number) => ({
	x: interpolate(t, MOON_T, [540, 540, 540, 540, 540, 860, 860, 190, 190, 540], {...clamp, easing: ease}),
	y: interpolate(t, MOON_T, [1150, 700, 700, 420, 420, 210, 210, 250, 250, 400], {...clamp, easing: ease}),
	size: interpolate(t, MOON_T, [760, 760, 760, 520, 520, 260, 260, 300, 300, 500], {...clamp, easing: ease}),
});

type WitchPose = {x: number; y: number; scale: number; flip: boolean; behind: boolean};
const witchAt = (t: number): WitchPose | null => {
	// scene 1: circles the full moon
	if (t >= 0.4 && t <= 4.7) {
		const a = -Math.PI * 0.85 + (t - 0.4) * 1.9;
		const m = moonAt(t);
		const depth = Math.sin(a);
		return {
			x: m.x + Math.cos(a) * 470,
			y: m.y + Math.sin(a) * 190 - 30,
			scale: 0.7 + 0.3 * depth,
			flip: Math.sin(a) > 0,
			behind: depth < -0.15,
		};
	}
	const cross = (a: number, b: number, x0: number, x1: number, y0: number, y1: number, scale: number): WitchPose | null => {
		if (t < a || t > b) return null;
		const p = (t - a) / (b - a);
		return {x: x0 + (x1 - x0) * p, y: y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 70, scale, flip: x1 < x0, behind: false};
	};
	return (
		cross(6.6, 9.2, 1250, -250, 380, 300, 0.75) ??
		cross(14.3, 15.9, -250, 1250, 200, 120, 0.55) ??
		cross(28.4, 30.8, -250, 1250, 1380, 1300, 0.8) ??
		cross(36.2, 37.7, 1250, -250, 360, 280, 0.75)
	);
};

const WITCH_SIZE = 430;
const WitchLayer: React.FC<{t: number; frame: number; behindPass: boolean}> = ({t, frame, behindPass}) => {
	const w = witchAt(t);
	if (!w || w.behind !== behindPass) return null;
	const trail = behindPass
		? []
		: Array.from({length: 7}, (_, k) => {
				const p = witchAt(t - (k + 1) * 0.07);
				return p && !p.behind ? {p, k} : null;
			}).filter(Boolean);
	return (
		<>
			{trail.map((tr) => {
				const {p, k} = tr as {p: WitchPose; k: number};
				return (
					<Sparkle
						key={k}
						size={(30 - k * 3) * p.scale}
						color={k % 2 ? C.white : C.glow}
						style={{
							position: 'absolute',
							left: p.x + (p.flip ? 70 : -70) * p.scale,
							top: p.y + 40 * p.scale + Math.sin(k * 2) * 10,
							opacity: 1 - k / 7,
							transform: `rotate(${frame * 6 + k * 40}deg)`,
						}}
					/>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: w.x - (WITCH_SIZE * w.scale) / 2,
					top: w.y - (WITCH_SIZE * 0.75 * w.scale) / 2,
					transform: `scaleX(${w.flip ? -1 : 1}) rotate(-6deg)`,
					filter: w.behind ? 'brightness(0.7)' : 'drop-shadow(0 0 10px rgba(255,140,40,0.9))',
				}}
			>
				<WitchSilhouette size={WITCH_SIZE * w.scale} frame={frame} />
			</div>
		</>
	);
};

// ------------------------------------------------------------------ backdrop
const STARS = Array.from({length: 34}, (_, i) => ({
	x: random(`v2x${i}`) * 1080,
	y: random(`v2y${i}`) * 1200,
	r: 1.2 + random(`v2r${i}`) * 2.6,
	speed: 0.03 + random(`v2s${i}`) * 0.08,
	phase: random(`v2p${i}`) * 6.3,
}));

const Backdrop: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const m = moonAt(t);
	const flash = Math.max(window_(t, 0.12, 0.3, 0.05), 0.7 * window_(t, 0.42, 0.55, 0.04));
	const pumpkinsIn = (i: number) => pop(t, S2 + 0.3 + i * 0.15, 9, 140);
	const flicker = (s: number) => 0.6 + 0.4 * Math.sin(frame / 3 + s) * Math.sin(frame / 7.1 + s * 2);
	return (
		<>
			<AbsoluteFill style={{background: `linear-gradient(180deg, #070504 0%, #120A07 45%, #2A1208 72%, #6E2A08 92%, #9C3F0C 100%)`}} />
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
						opacity: 0.3 + 0.7 * Math.abs(Math.sin(frame * s.speed + s.phase)),
					}}
				/>
			))}
			{/* moon glow */}
			<div
				style={{
					position: 'absolute',
					left: m.x - m.size,
					top: m.y - m.size,
					width: m.size * 2,
					height: m.size * 2,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(255,170,80,0.42) 0%, rgba(255,120,30,0.14) 38%, rgba(0,0,0,0) 62%)',
				}}
			/>
			<WitchLayer t={t} frame={frame} behindPass />
			<div style={{position: 'absolute', left: m.x - m.size / 2, top: m.y - m.size / 2}}>
				<Moon size={m.size} />
			</div>
			<Graveyard drift={(frame * 0.35) % 60} />
			{/* glowing jack-o'-lanterns */}
			{[
				{left: 20, size: 240, seed: 1},
				{left: 430, size: 200, seed: 2},
				{left: 800, size: 260, seed: 3},
			].map((p, i) => (
				<div key={i} style={{position: 'absolute', left: p.left, bottom: 28, transform: `translateY(${(1 - pumpkinsIn(i)) * 340}px)`}}>
					<div
						style={{
							position: 'absolute',
							left: -p.size * 0.3,
							top: -p.size * 0.3,
							width: p.size * 1.6,
							height: p.size * 1.4,
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(255,160,60,0.45) 0%, rgba(0,0,0,0) 65%)',
							opacity: flicker(p.seed),
						}}
					/>
					<Pumpkin size={p.size} face="jack" flicker={flicker(p.seed)} style={{position: 'relative'}} />
				</div>
			))}
			{/* lightning */}
			<AbsoluteFill style={{background: C.white, opacity: flash * 0.75}} />
			{flash > 0.05 && <Lightning height={900} style={{position: 'absolute', left: 90, top: 0, opacity: flash}} />}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)'}} />
		</>
	);
};

// ------------------------------------------------------------------ scene 1: logo
const SceneLogo: React.FC<{t: number}> = ({t}) => {
	const o = window_(t, 1.9, S2 + 0.2, 0.5);
	if (o <= 0) return null;
	return (
		<div style={{...centered, top: 1180, opacity: o, transform: `translateY(${(1 - ramp(t, 1.9, 2.6)) * 40}px)`}}>
			<div
				style={{
					position: 'absolute',
					left: 290,
					top: -80,
					width: 500,
					height: 500,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(6,4,3,0.85) 0%, rgba(6,4,3,0.4) 50%, rgba(0,0,0,0) 70%)',
				}}
			/>
			<div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<CelevenusLogo width={440} />
				<div style={{fontFamily: FONT.elegant, fontWeight: 500, fontSize: 26, letterSpacing: 7, color: C.cream, marginTop: 10}}>
					WELLNESS &amp; AESTHETIC CLINIC
				</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ scene 2: invitation + tombstone
const SceneInvite: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const o = window_(t, S2, S3, 0.4);
	if (o <= 0) return null;
	const invited = ramp(t, 4.6, 5.0);
	const hw = pop(t, 5.0);
	const party = pop(t, 5.5, 9, 140);
	const stone = interpolate(t, [8.5, 9.9], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.2))});
	const shake = t > 8.5 && t < 9.9 ? Math.sin(t * 90) * 3 * (1 - stone) : 0;
	const engrave = (a: number) => ramp(t, a, a + 0.4);
	return (
		<AbsoluteFill style={{opacity: o}}>
			<div style={{...centered, top: 712, opacity: invited, transform: `translateY(${(1 - invited) * 24}px)`}}>
				<span style={cute(60)}>You’re invited to our</span>
			</div>
			<div style={{...centered, top: 790, transform: `scale(${hw})`}}>
				<span style={spooky(168, C.orange)}>HALLOWEEN</span>
			</div>
			<div style={{...centered, top: 950, transform: `scale(${party})`}}>
				<span style={spooky(230, C.white)}>PARTY</span>
				<BloodDrips
					width={1080}
					frame={(t - 5.9) * FPS}
					drips={[
						{x: 370, len: 70, w: 16},
						{x: 470, len: 120, w: 18, delay: 6},
						{x: 600, len: 54, w: 14, delay: 12},
						{x: 700, len: 96, w: 16, delay: 18},
					]}
					style={{left: 0, top: 215}}
				/>
			</div>
			<Tombstone width={560} height={540} style={{left: 260 + shake, top: 1270 + (1 - stone) * 700}}>
				<div style={{...cute(42, C.black), textShadow: 'none', letterSpacing: 8, opacity: engrave(9.4)}}>FRIDAY</div>
				<div style={{fontFamily: FONT.cute, fontWeight: 600, fontSize: 96, color: C.black, lineHeight: 1.05, opacity: engrave(9.6)}}>30 OCT</div>
				<div style={{...cute(36, '#5A524B'), textShadow: 'none', letterSpacing: 6, opacity: engrave(9.7)}}>2026</div>
				<div style={{...cute(54, C.orangeDeep), textShadow: 'none', marginTop: 10, opacity: engrave(10.2)}}>{EVENT.time.replace(':00', '').replace(':00', '')}</div>
				<div style={{...cute(30, BLOOD), textShadow: 'none', letterSpacing: 4, marginTop: 10, opacity: engrave(10.6)}}>✦ RSVP REQUIRED ✦</div>
			</Tombstone>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ scene 3: treats, one sound each
const TREATS = [
	{
		Icon: ({size, frame}: {size: number; frame: number}) => <SkinScanIcon size={size} frame={frame} />,
		title: 'FREE Skin Analysis',
		badge: 'worth $150',
		sub: 'Limited slots  •  RSVP to book',
	},
	{Icon: ({size}: {size: number; frame: number}) => <CrownIcon size={size} />, title: 'Score a Crown', sub: 'and win a SkinCeuticals prize!'},
	{Icon: ({size}: {size: number; frame: number}) => <TagIcon size={size} />, title: 'Special offers', sub: 'on procedures  •  party hours only'},
	{Icon: ({size}: {size: number; frame: number}) => <CupcakeIcon size={size} />, title: 'Finger food', sub: 'served all afternoon'},
];

const SceneTreats: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const o = window_(t, S3, S4, 0.45);
	if (o <= 0) return null;
	const head = pop(t, S3 + 0.2);
	return (
		<AbsoluteFill style={{opacity: o}}>
			<div style={{...centered, top: 360, transform: `scale(${head})`}}>
				<span style={spooky(100, C.orange)}>What’s brewing?</span>
			</div>
			{TREATS.map((tr, i) => {
				const r = REVEALS[i];
				const move = REVEALS[i + 1] ?? SUMMARY;
				const enter = pop(t, r, 10, 130);
				const toRow = ramp(t, move, move + 0.45);
				const spotOpacity = t < r ? 0 : 1 - toRow;
				const rowIn = toRow;
				const slotY = 500 + i * 140;
				return (
					<React.Fragment key={tr.title}>
						{/* spotlight card */}
						{spotOpacity > 0.01 && (
							<div
								style={{
									position: 'absolute',
									left: 90,
									top: 1110 + (slotY - 1110) * toRow,
									width: 900,
									height: 440,
									borderRadius: 44,
									background: '#120B08',
									border: `6px solid ${C.orange}`,
									boxShadow: '0 0 60px rgba(255,122,26,0.4)',
									opacity: spotOpacity,
									transform: `scale(${enter * (1 - 0.6 * toRow)}) rotate(${(1 - enter) * -12}deg)`,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 10,
									boxSizing: 'border-box',
								}}
							>
								<div style={{transform: `scale(${1 + 0.06 * Math.sin(frame / 6)})`}}>
									<tr.Icon size={190} frame={frame} />
								</div>
								<div style={cute(66)}>
									{tr.title}
									{tr.badge && (
										<span
											style={{
												marginLeft: 14,
												padding: '4px 16px',
												borderRadius: 22,
												background: BLOOD,
												color: C.white,
												fontSize: 30,
												verticalAlign: 'middle',
												textShadow: 'none',
											}}
										>
											{tr.badge}
										</span>
									)}
								</div>
								<div style={cute(38, C.orangeLight, 400)}>{tr.sub}</div>
								<BloodDrips
									width={900}
									frame={(t - r - 0.3) * FPS}
									drips={[
										{x: 160, len: 34, w: 12},
										{x: 760, len: 50, w: 13, delay: 8},
									]}
									style={{left: -6, top: 434}}
								/>
							</div>
						)}
						{/* compact row */}
						{rowIn > 0.01 && (
							<div
								style={{
									position: 'absolute',
									left: 90,
									top: slotY,
									width: 900,
									height: 120,
									borderRadius: 30,
									background: 'rgba(14,9,6,0.92)',
									border: `4px solid ${C.orange}`,
									display: 'flex',
									alignItems: 'center',
									gap: 24,
									padding: '0 28px',
									boxSizing: 'border-box',
									opacity: rowIn,
									transform: `translateY(${(1 - rowIn) * 40}px) scale(${0.85 + 0.15 * rowIn})`,
								}}
							>
								<div
									style={{
										width: 92,
										height: 92,
										flexShrink: 0,
										borderRadius: '50%',
										background: '#FFEBD6',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<tr.Icon size={74} frame={frame} />
								</div>
								<div>
									<div style={{...cute(44), lineHeight: 1.05}}>
										{tr.title}
										{tr.badge && <span style={{fontSize: 26, color: C.orangeLight, marginLeft: 10}}>({tr.badge})</span>}
									</div>
									<div style={cute(28, C.orangeLight, 400)}>{tr.sub}</div>
								</div>
							</div>
						)}
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ scene 4: no tricks + RSVP stamp
const SceneRsvp: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	const o = window_(t, S4, S5, 0.35);
	if (o <= 0) return null;
	const tricks = window_(t, S4 + 0.3, 32.8, 0.4);
	const l1 = pop(t, 27.7);
	const l2 = pop(t, 28.6);
	const body = ramp(t, 29.4, 29.9);
	const slots = pop(t, 33.0);
	const stamp = spring({frame: (t - STAMP) * FPS, fps: FPS, config: {damping: 14, stiffness: 260, mass: 0.7}});
	const shake = t > STAMP && t < STAMP + 0.3 ? Math.sin(t * 120) * 10 * (1 - (t - STAMP) / 0.3) : 0;
	const reply = ramp(t, STAMP + 0.55, STAMP + 1.0);
	return (
		<AbsoluteFill style={{opacity: o, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
			{tricks > 0.01 && (
				<AbsoluteFill style={{opacity: tricks}}>
					<div style={{...centered, top: 560, transform: `scale(${l1}) rotate(${(1 - l1) * -8}deg)`}}>
						<span style={spooky(150, C.white)}>No tricks,</span>
					</div>
					<div style={{...centered, top: 720, transform: `scale(${l2}) rotate(${(1 - l2) * 8}deg)`}}>
						<span style={spooky(160, C.orange)}>just treats!</span>
					</div>
					<div style={{...centered, top: 930, opacity: body, transform: `translateY(${(1 - body) * 24}px)`}}>
						<span style={cute(56)}>
							Come in, relax &amp; have
							<br />a nice time with us
						</span>
					</div>
				</AbsoluteFill>
			)}
			{/* bats burst out of the moon */}
			{[0, 1, 2, 3].map((i) => {
				const p = (t - S4 - i * 0.12) / 1.8;
				if (p < 0 || p > 1) return null;
				return (
					<Bat
						key={i}
						size={130 - i * 15}
						frame={frame + i * 4}
						style={{
							position: 'absolute',
							left: 190 + p * (300 + i * 200),
							top: 250 + p * (200 + i * 120) - Math.sin(p * Math.PI) * 120,
							opacity: 1 - p * 0.3,
						}}
					/>
				);
			})}
			{t > 32.75 && (
				<>
					<div style={{...centered, top: 520, transform: `scale(${slots})`}}>
						<span style={spooky(96, C.orange)}>Slots are limited</span>
					</div>
					{t > STAMP && (
						<div
							style={{
								position: 'absolute',
								left: 150,
								top: 680,
								width: 780,
								height: 300,
								transform: `scale(${2.6 - 1.6 * stamp}) rotate(-7deg)`,
								opacity: Math.min(1, stamp * 1.4),
							}}
						>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									borderRadius: 30,
									border: `12px solid ${BLOOD}`,
									boxShadow: `inset 0 0 0 8px ${C.black}, inset 0 0 0 14px ${BLOOD}`,
									background: 'rgba(10,6,4,0.55)',
								}}
							/>
							<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<span
									style={{
										fontFamily: FONT.spooky,
										fontSize: 230,
										color: BLOOD,
										letterSpacing: 18,
										WebkitTextStroke: `6px ${C.white}`,
										paintOrder: 'stroke fill',
									}}
								>
									RSVP
								</span>
							</div>
							<BloodDrips
								width={780}
								frame={(t - STAMP - 0.4) * FPS}
								drips={[
									{x: 190, len: 60, w: 15},
									{x: 420, len: 100, w: 17, delay: 5},
									{x: 610, len: 70, w: 15, delay: 10},
								]}
								style={{left: 0, top: 292}}
							/>
						</div>
					)}
					<div style={{...centered, top: 1060, opacity: reply, transform: `translateY(${(1 - reply) * 24}px)`}}>
						<div style={cute(64)}>is a must!</div>
						<div style={{...cute(42, C.cream, 400), marginTop: 18}}>
							Reply to this message to book
							<br />
							your spot &amp; <b style={{color: C.orangeLight}}>FREE skin analysis</b>
						</div>
					</div>
				</>
			)}
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ scene 5: finale
const SceneFinale: React.FC<{t: number; frame: number}> = ({t, frame}) => {
	if (t < S5) return null;
	const a = (at: number) => ramp(t, at, at + 0.45);
	const see = pop(t, SEE_YOU, 8, 130);
	const dare = pop(t, 38.0, 9, 130);
	return (
		<AbsoluteFill>
			<div style={{...centered, top: 690, opacity: a(S5 + 0.1), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div
					style={{
						position: 'absolute',
						left: 290,
						top: -90,
						width: 500,
						height: 420,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(6,4,3,0.85) 0%, rgba(6,4,3,0.4) 50%, rgba(0,0,0,0) 70%)',
					}}
				/>
				<CelevenusLogo width={360} style={{position: 'relative'}} />
			</div>
			<div style={{...centered, top: 975, opacity: a(S5 + 0.25)}}>
				<span style={spooky(96, C.orange)}>Halloween Party</span>
			</div>
			<div style={{...centered, top: 1090, opacity: a(S5 + 0.4)}}>
				<span style={cute(50)}>Fri, 30 Oct 2026  •  {EVENT.time.replace(':00', '').replace(':00', '')}</span>
			</div>
			<div style={{...centered, top: 1160, opacity: a(S5 + 0.55)}}>
				<span style={cute(30, C.cream, 400)}>
					{EVENT.addressLine1}, {EVENT.addressLine2}
				</span>
			</div>
			<div style={{...centered, top: 1225, opacity: a(S5 + 0.7), transform: `scale(${0.9 + 0.1 * a(S5 + 0.7)})`}}>
				<span
					style={{
						display: 'inline-block',
						padding: '10px 30px',
						borderRadius: 40,
						background: BLOOD,
						border: `4px solid ${C.white}`,
						...cute(38),
						textShadow: 'none',
					}}
				>
					RSVP is a must • Reply to book your spot
				</span>
			</div>
			{see > 0.05 &&
				Array.from({length: 10}, (_, i) => {
					const ang = (i / 10) * Math.PI * 2;
					const d = interpolate(t - SEE_YOU, [0, 1], [40, 330], {...clamp, easing: ease});
					const op = interpolate(t - SEE_YOU, [0, 0.3, 1.6, 2.3], [0, 1, 1, 0.2], clamp);
					return (
						<Sparkle
							key={i}
							size={i % 2 ? 34 : 50}
							color={i % 3 ? C.glow : C.white}
							style={{
								position: 'absolute',
								left: 540 + Math.cos(ang) * d * 1.4 - 25,
								top: 1395 + Math.sin(ang) * d * 0.18 - 25,
								opacity: op,
								transform: `rotate(${frame * 4}deg)`,
							}}
						/>
					);
				})}
			<div style={{...centered, top: 1335, transform: `scale(${see})`}}>
				<span style={spooky(118, C.white)}>See you there…</span>
			</div>
			<div style={{...centered, top: 1468, transform: `scale(${dare}) rotate(${Math.sin(frame / 10) * 2}deg)`}}>
				<span style={{...spooky(112, BLOOD), WebkitTextStroke: `4px ${C.white}`, textShadow: '0 0 30px rgba(0,0,0,0.9)'}}>if you dare</span>
				<BloodDrips
					width={1080}
					frame={(t - 38.3) * FPS}
					drips={[
						{x: 380, len: 50, w: 13},
						{x: 520, len: 80, w: 15, delay: 6},
						{x: 690, len: 44, w: 12, delay: 11},
					]}
					style={{left: 0, top: 104}}
				/>
			</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ main
export const HalloweenInviteV2: React.FC = () => {
	useFonts();
	const frame = useCurrentFrame();
	const t = sec(frame);
	return (
		<AbsoluteFill style={{background: C.black}}>
			<Backdrop t={t} frame={frame} />
			<WitchLayer t={t} frame={frame} behindPass={false} />
			<SceneLogo t={t} />
			<SceneInvite t={t} frame={frame} />
			<SceneTreats t={t} frame={frame} />
			<SceneRsvp t={t} frame={frame} />
			<SceneFinale t={t} frame={frame} />
			<Soundtrack />
		</AbsoluteFill>
	);
};
