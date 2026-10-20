// Artwork for version 2 of the invite: darker "moonlit graveyard" look with
// black silhouettes, glowing orange and a touch of blood red.
import React from 'react';
import {C} from '../theme';

export const BLOOD = '#B3121B';
export const BLOOD_DARK = '#7A0A10';
export const STONE = '#E4DED6';

/** Black witch-on-broom silhouette with a thin orange rim so it reads on the dark sky. */
export const WitchSilhouette: React.FC<{size: number; frame: number; style?: React.CSSProperties}> = ({size, frame, style}) => {
	const cape = Math.sin(frame / 2.5) * 10;
	const hair = Math.sin(frame / 3 + 1) * 6;
	const rim = {stroke: C.orange, strokeWidth: 4.5, strokeLinejoin: 'round' as const};
	return (
		<svg viewBox="0 0 320 240" width={size} height={size * 0.75} style={{overflow: 'visible', ...style}}>
			{/* bristles */}
			<path d="M60 168 L 4 146 L -6 176 L 6 206 L 64 186 Z" fill={C.black} {...rim} />
			<path d="M10 160 L 58 176 M 0 178 L 60 180 M 8 198 L 60 184" stroke={C.orangeDeep} strokeWidth="2" />
			{/* broom handle */}
			<path d="M58 178 L 300 150" stroke={C.black} strokeWidth="10" strokeLinecap="round" />
			<path d="M58 178 L 300 150" stroke={C.orange} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
			{/* flowing cape */}
			<path d={`M150 100 Q 100 ${110 + cape} 54 ${126 + cape} Q 96 ${150 - cape / 2} 156 160 Z`} fill={C.black} {...rim} />
			{/* body + legs */}
			<path d="M140 98 Q 170 84 204 104 L 214 168 L 186 170 L 196 206 L 176 210 L 166 172 L 134 168 Z" fill={C.black} {...rim} />
			<path d="M196 206 L 222 210 L 176 214 Z" fill={C.black} {...rim} />
			{/* arm reaching for the broom */}
			<path d="M190 116 Q 222 136 236 156" stroke={C.black} strokeWidth="12" strokeLinecap="round" fill="none" />
			{/* flying hair */}
			<path d={`M156 74 Q 120 ${80 + hair} 100 ${70 + hair} Q 126 ${94 + hair / 2} 154 96 Z`} fill={C.black} {...rim} />
			{/* head with pointed nose and chin */}
			<path d="M154 60 Q 176 50 192 66 L 206 74 L 192 78 Q 196 90 186 96 Q 166 100 156 88 Z" fill={C.black} {...rim} />
			{/* hat */}
			<path d="M128 60 Q 176 44 222 58 Q 176 70 128 60 Z" fill={C.black} {...rim} />
			<path d="M146 58 Q 156 18 172 2 Q 186 -12 214 -16 Q 194 0 196 22 L 200 56 Z" fill={C.black} {...rim} />
			<path d="M146 50 Q 174 56 200 48 L 200 56 Q 174 62 146 58 Z" fill={C.orange} />
		</svg>
	);
};

/** Layered graveyard silhouette (tombstones, crosses, fence, dead tree) along the bottom. */
export const Graveyard: React.FC<{drift: number; width?: number}> = ({drift, width = 1080}) => (
	<svg viewBox="0 0 1080 460" width={width} height={(width / 1080) * 460} style={{position: 'absolute', bottom: 0, left: 0}}>
		{/* back layer */}
		<g transform={`translate(${-drift * 0.4} 0)`} fill="#1E110B">
			<path d="M-60 210 Q 260 120 560 190 Q 860 250 1160 160 L 1160 460 L -60 460 Z" />
			<path d="M780 180 L 790 60 Q 760 40 740 46 M 790 96 Q 822 64 846 70 M 788 130 Q 756 112 732 120" stroke="#1E110B" strokeWidth="12" fill="none" strokeLinecap="round" />
			<path d="M774 192 L 784 54 L 798 54 L 806 192 Z" />
		</g>
		{/* front layer */}
		<g transform={`translate(${-drift} 0)`} fill={C.black}>
			<path d="M-80 300 Q 300 230 620 290 Q 900 340 1180 270 L 1180 460 L -80 460 Z" />
			{/* tombstones */}
			<path d="M120 300 L 120 250 Q 120 220 150 220 Q 180 220 180 250 L 180 300 Z" />
			<path d="M300 296 L 300 236 Q 300 200 336 200 Q 372 200 372 236 L 372 296 Z" />
			<path d="M480 300 L 480 268 L 520 268 L 520 300 Z" />
			<path d="M700 316 L 700 262 Q 700 236 726 236 Q 752 236 752 262 L 752 316 Z" />
			{/* crosses */}
			<path d="M226 300 L 226 228 L 240 228 L 240 300 Z M 210 246 L 256 246 L 256 258 L 210 258 Z" />
			<path d="M890 300 L 890 238 L 904 238 L 904 300 Z M 874 254 L 920 254 L 920 266 L 874 266 Z" />
			{/* fence */}
			{Array.from({length: 12}, (_, i) => (
				<path key={i} d={`M${560 + i * 26} 330 L ${560 + i * 26} 282 L ${566 + i * 26} 270 L ${572 + i * 26} 282 L ${572 + i * 26} 330 Z`} />
			))}
			<rect x="556" y="296" width="320" height="8" />
		</g>
	</svg>
);

/** Rounded tombstone slab for the date. Children are rendered as the engraving. */
export const Tombstone: React.FC<{width: number; height: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
	width,
	height,
	children,
	style,
}) => (
	<div style={{position: 'absolute', width, height, ...style}}>
		<svg viewBox="0 0 100 120" width={width} height={height} preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
			<defs>
				<linearGradient id="stoneShade" x1="0" x2="1">
					<stop offset="0%" stopColor="#F1ECE6" />
					<stop offset="100%" stopColor="#C9C1B8" />
				</linearGradient>
			</defs>
			<path d="M4 120 L 4 40 Q 4 3 50 3 Q 96 3 96 40 L 96 120 Z" fill="url(#stoneShade)" stroke={C.black} strokeWidth="1.6" />
			<path d="M78 20 L 72 32 L 77 40 L 70 52" stroke="#9C948B" strokeWidth="0.9" fill="none" />
			<path d="M14 96 L 20 104 L 17 112" stroke="#9C948B" strokeWidth="0.9" fill="none" />
		</svg>
		<div
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				paddingTop: height * 0.08,
			}}
		>
			{children}
		</div>
	</div>
);

/**
 * Blood drips hanging from the bottom of a word. `progress` 0..1 grows the drips;
 * after that each drip lets a drop fall.
 */
export const BloodDrips: React.FC<{
	width: number;
	drips: Array<{x: number; len: number; w?: number; delay?: number}>;
	frame: number; // frames since the drips started
	style?: React.CSSProperties;
}> = ({width, drips, frame, style}) => (
	<svg width={width} height={260} style={{position: 'absolute', overflow: 'visible', ...style}}>
		{drips.map((d, i) => {
			const local = frame - (d.delay ?? 0);
			const grow = Math.max(0, Math.min(1, local / 24));
			const ease = 1 - Math.pow(1 - grow, 3);
			const len = d.len * ease;
			const w = d.w ?? 14;
			// a drop detaches every ~50 frames once fully grown
			const dropT = local - 26;
			const cycle = dropT > 0 ? (dropT % 55) / 55 : -1;
			return (
				<g key={i}>
					<path
						d={`M${d.x - w / 2} 0 L ${d.x - w / 2} ${len} Q ${d.x} ${len + w} ${d.x + w / 2} ${len} L ${d.x + w / 2} 0 Z`}
						fill={BLOOD}
					/>
					<ellipse cx={d.x} cy={len} rx={w * 0.62} ry={w * 0.72} fill={BLOOD} opacity={grow > 0 ? 1 : 0} />
					<ellipse cx={d.x - w * 0.18} cy={len - w * 0.2} rx={w * 0.14} ry={w * 0.2} fill="#FF6B6B" opacity={grow > 0.5 ? 0.6 : 0} />
					{cycle >= 0 && cycle < 0.7 && (
						<ellipse cx={d.x} cy={len + 10 + cycle * cycle * 300} rx={w * 0.35} ry={w * 0.5} fill={BLOOD} opacity={1 - cycle / 0.7} />
					)}
				</g>
			);
		})}
	</svg>
);

/** Face with a scanning line, for the skin analysis. */
export const SkinScanIcon: React.FC<{size: number; frame: number}> = ({size, frame}) => {
	const y = 26 + ((Math.sin(frame / 8) + 1) / 2) * 52;
	return (
		<svg viewBox="0 0 100 100" width={size} height={size}>
			<path d="M14 26 L 14 12 L 28 12 M 72 12 L 86 12 L 86 26 M 86 74 L 86 88 L 72 88 M 28 88 L 14 88 L 14 74" stroke={C.orange} strokeWidth="5" fill="none" strokeLinecap="round" />
			<ellipse cx="50" cy="50" rx="24" ry="30" fill={C.white} stroke={C.black} strokeWidth="3" />
			<ellipse cx="41" cy="46" rx="3" ry="4" fill={C.black} />
			<ellipse cx="59" cy="46" rx="3" ry="4" fill={C.black} />
			<path d="M42 62 Q 50 68 58 62" stroke={C.black} strokeWidth="3" fill="none" strokeLinecap="round" />
			<ellipse cx="36" cy="56" rx="4" ry="2.5" fill={C.blush} opacity="0.6" />
			<ellipse cx="64" cy="56" rx="4" ry="2.5" fill={C.blush} opacity="0.6" />
			<rect x="18" y={y} width="64" height="4" rx="2" fill={C.orange} opacity="0.9" />
			<rect x="18" y={y - 8} width="64" height="8" fill={C.orange} opacity="0.18" />
		</svg>
	);
};

/** Jagged lightning bolt. */
export const Lightning: React.FC<{height: number; style?: React.CSSProperties}> = ({height, style}) => (
	<svg viewBox="0 0 100 300" width={height / 3} height={height} style={style}>
		<path d="M60 0 L 30 120 L 55 120 L 20 300 L 80 100 L 52 100 L 78 0 Z" fill={C.white} opacity="0.95" />
	</svg>
);
