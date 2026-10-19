// Cute hand-drawn Halloween characters, all plain SVG so they stay sharp.
import React from 'react';
import {C} from '../theme';

type Face = 'jack' | 'cute' | 'happy';

export const Pumpkin: React.FC<{
	size: number;
	face?: Face;
	flicker?: number; // 0..1 candle glow inside the carved face
	style?: React.CSSProperties;
}> = ({size, face = 'cute', flicker = 1, style}) => {
	const glow = `rgba(255, 214, 120, ${0.55 + 0.45 * flicker})`;
	return (
		<svg viewBox="0 0 200 180" width={size} height={size * 0.9} style={style}>
			<ellipse cx="100" cy="172" rx="80" ry="8" fill="rgba(0,0,0,0.45)" />
			{/* body segments */}
			<ellipse cx="58" cy="105" rx="52" ry="62" fill={C.orangeDeep} />
			<ellipse cx="142" cy="105" rx="52" ry="62" fill={C.orangeDeep} />
			<ellipse cx="78" cy="102" rx="44" ry="66" fill="#F26A12" />
			<ellipse cx="122" cy="102" rx="44" ry="66" fill="#F26A12" />
			<ellipse cx="100" cy="100" rx="38" ry="68" fill={C.orange} />
			<path d="M100 36 Q 88 100 100 166" stroke="#D9520A" strokeWidth="3" fill="none" opacity="0.6" />
			<ellipse cx="80" cy="66" rx="14" ry="22" fill="#FFFFFF" opacity="0.18" />
			{/* stem + curly vine */}
			<path d="M92 42 Q 90 22 104 10 L 112 16 Q 102 28 106 42 Z" fill={C.stem} />
			<path d="M108 30 q 22 -14 30 2 q 4 12 -10 10" stroke={C.stem} strokeWidth="4" fill="none" strokeLinecap="round" />
			{face === 'jack' && (
				<g fill={glow} stroke={C.ink} strokeWidth="3" strokeLinejoin="round">
					<path d="M58 84 L 82 84 L 70 62 Z" />
					<path d="M118 84 L 142 84 L 130 62 Z" />
					<path d="M94 104 L 106 104 L 100 94 Z" />
					<path d="M50 118 Q 100 160 150 118 L 136 122 L 130 132 L 120 124 L 110 136 L 100 126 L 90 136 L 80 124 L 70 132 L 64 122 Z" />
				</g>
			)}
			{face === 'cute' && (
				<g>
					<ellipse cx="74" cy="92" rx="11" ry="15" fill={C.ink} />
					<ellipse cx="126" cy="92" rx="11" ry="15" fill={C.ink} />
					<circle cx="78" cy="86" r="4.5" fill={C.white} />
					<circle cx="130" cy="86" r="4.5" fill={C.white} />
					<ellipse cx="58" cy="116" rx="12" ry="7" fill={C.blush} opacity="0.55" />
					<ellipse cx="142" cy="116" rx="12" ry="7" fill={C.blush} opacity="0.55" />
					<path d="M88 116 Q 100 130 112 116" stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
				</g>
			)}
			{face === 'happy' && (
				<g stroke={C.ink} strokeWidth="6" fill="none" strokeLinecap="round">
					<path d="M62 92 Q 74 78 86 92" />
					<path d="M114 92 Q 126 78 138 92" />
					<path d="M76 114 Q 100 140 124 114 Z" fill={glow} strokeWidth="4" />
					<ellipse cx="56" cy="112" rx="11" ry="6" fill={C.blush} stroke="none" opacity="0.55" />
					<ellipse cx="144" cy="112" rx="11" ry="6" fill={C.blush} stroke="none" opacity="0.55" />
				</g>
			)}
		</svg>
	);
};

export const Witch: React.FC<{
	size: number;
	frame: number;
	style?: React.CSSProperties;
}> = ({size, frame, style}) => {
	const wave = Math.sin(frame / 4) * 18;
	const cape = Math.sin(frame / 3) * 6;
	const legs = Math.sin(frame / 5) * 6;
	return (
		<svg viewBox="0 0 320 260" width={size} height={size * 0.8125} style={{overflow: 'visible', ...style}}>
			{/* cape fluttering behind */}
			<path
				d={`M150 118 Q 96 ${128 + cape} 58 ${150 + cape} Q 96 ${160 - cape} 150 168 Z`}
				fill={C.orange}
				stroke={C.ink}
				strokeWidth="4"
				strokeLinejoin="round"
			/>
			{/* broom */}
			<path d="M24 188 L 292 160" stroke="#8A5427" strokeWidth="9" strokeLinecap="round" />
			<path d="M58 176 L 6 158 L 0 186 L 8 214 L 62 196 Z" fill={C.orangeLight} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
			<path d="M14 168 L 56 182 M 6 186 L 58 188 M 12 206 L 58 194" stroke="#C97A20" strokeWidth="2.5" />
			<rect x="54" y="174" width="12" height="24" rx="3" fill={C.ink} transform="rotate(-6 60 186)" />
			{/* striped stockings + boots */}
			<g transform={`rotate(${legs} 176 182)`}>
				<rect x="166" y="176" width="16" height="52" rx="7" fill={C.white} stroke={C.ink} strokeWidth="3" />
				<rect x="166" y="188" width="16" height="9" fill={C.orange} />
				<rect x="166" y="206" width="16" height="9" fill={C.orange} />
				<path d="M162 226 L 186 226 L 200 238 Q 186 244 162 240 Z" fill={C.ink} />
			</g>
			<g transform={`rotate(${-legs} 196 180)`}>
				<rect x="188" y="174" width="16" height="48" rx="7" fill={C.white} stroke={C.ink} strokeWidth="3" />
				<rect x="188" y="186" width="16" height="9" fill={C.orange} />
				<rect x="188" y="203" width="16" height="9" fill={C.orange} />
				<path d="M184 220 L 208 220 L 224 230 Q 208 238 184 234 Z" fill={C.ink} />
			</g>
			{/* dress */}
			<path d="M142 120 Q 176 100 210 122 L 222 184 Q 180 196 136 184 Z" fill={C.ink} stroke={C.orangeLight} strokeWidth="2.5" />
			<path d="M146 176 Q 180 186 218 176" stroke={C.orange} strokeWidth="5" fill="none" />
			{/* waving arm */}
			<g transform={`rotate(${-30 + wave} 206 128)`}>
				<path d="M204 128 L 246 104" stroke={C.ink} strokeWidth="14" strokeLinecap="round" />
				<circle cx="250" cy="101" r="10" fill={C.skin} stroke={C.ink} strokeWidth="2.5" />
			</g>
			{/* holding arm */}
			<path d="M154 136 L 176 168" stroke={C.ink} strokeWidth="13" strokeLinecap="round" />
			<circle cx="178" cy="170" r="9" fill={C.skin} stroke={C.ink} strokeWidth="2.5" />
			{/* hair */}
			<path d="M136 92 Q 130 132 150 128 Q 146 112 152 98 Z" fill={C.orange} stroke={C.ink} strokeWidth="2.5" />
			<path d="M216 92 Q 224 130 204 126 Q 208 112 202 98 Z" fill={C.orange} stroke={C.ink} strokeWidth="2.5" />
			{/* head */}
			<circle cx="176" cy="92" r="38" fill={C.skin} stroke={C.ink} strokeWidth="3" />
			<path d="M140 80 Q 176 56 214 80 Q 196 70 176 74 Q 156 70 140 80 Z" fill={C.orange} />
			<path d="M156 92 Q 163 84 170 92" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
			<path d="M184 92 Q 191 84 198 92" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
			<ellipse cx="154" cy="104" rx="8" ry="5" fill={C.blush} opacity="0.6" />
			<ellipse cx="200" cy="104" rx="8" ry="5" fill={C.blush} opacity="0.6" />
			<path d="M170 106 Q 177 114 184 106" stroke={C.ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
			{/* hat */}
			<ellipse cx="176" cy="66" rx="66" ry="13" fill={C.ink} stroke={C.orangeLight} strokeWidth="2.5" />
			<path d="M136 64 Q 150 10 176 -6 Q 196 -20 230 -12 Q 204 -2 202 18 L 214 64 Z" fill={C.ink} stroke={C.orangeLight} strokeWidth="2.5" strokeLinejoin="round" />
			<path d="M140 54 Q 176 62 211 54 L 213 64 Q 176 72 138 64 Z" fill={C.orange} />
			<path d="M176 4 l 3 7 l 7 1 l -5 5 l 1 7 l -6 -3 l -6 3 l 1 -7 l -5 -5 l 7 -1 Z" fill={C.glow} />
		</svg>
	);
};

export const Ghost: React.FC<{
	size: number;
	frame: number;
	waving?: boolean;
	style?: React.CSSProperties;
}> = ({size, frame, waving = false, style}) => {
	const w = Math.sin(frame / 5) * 6;
	const arm = waving ? Math.sin(frame / 3.5) * 22 : 0;
	return (
		<svg viewBox="0 0 160 200" width={size} height={size * 1.25} style={{overflow: 'visible', ...style}}>
			<ellipse cx="80" cy="196" rx="44" ry="6" fill="rgba(0,0,0,0.3)" />
			<g transform={`rotate(${-arm} 30 100)`}>
				<ellipse cx="18" cy="104" rx="16" ry="10" fill={C.white} stroke={C.ink} strokeWidth="3" transform="rotate(-30 18 104)" />
			</g>
			<g transform={`rotate(${arm} 130 100)`}>
				<ellipse cx="142" cy="104" rx="16" ry="10" fill={C.white} stroke={C.ink} strokeWidth="3" transform="rotate(30 142 104)" />
			</g>
			<path
				d={`M20 170 L 20 78 Q 20 14 80 14 Q 140 14 140 78 L 140 170
				Q 130 ${182 + w} 120 170 Q 110 ${158 - w} 100 170 Q 90 ${182 + w} 80 170
				Q 70 ${158 - w} 60 170 Q 50 ${182 + w} 40 170 Q 30 ${158 - w} 20 170 Z`}
				fill={C.white}
				stroke={C.ink}
				strokeWidth="3.5"
			/>
			<ellipse cx="60" cy="82" rx="10" ry="14" fill={C.ink} />
			<ellipse cx="100" cy="82" rx="10" ry="14" fill={C.ink} />
			<circle cx="63" cy="76" r="4" fill={C.white} />
			<circle cx="103" cy="76" r="4" fill={C.white} />
			<ellipse cx="44" cy="102" rx="10" ry="6" fill={C.orangeLight} opacity="0.7" />
			<ellipse cx="116" cy="102" rx="10" ry="6" fill={C.orangeLight} opacity="0.7" />
			<ellipse cx="80" cy="108" rx="8" ry="10" fill={C.ink} />
		</svg>
	);
};

export const Bat: React.FC<{size: number; frame: number; style?: React.CSSProperties}> = ({size, frame, style}) => {
	const flap = Math.sin(frame / 1.6);
	const sy = 0.35 + 0.65 * Math.abs(flap);
	return (
		<svg viewBox="0 0 200 110" width={size} height={size * 0.55} style={{overflow: 'visible', ...style}}>
			<g transform={`translate(100 50) scale(1 ${flap > 0 ? sy : -sy * 0.6}) translate(-100 -50)`}>
				<path
					d="M96 50 Q 70 10 20 16 Q 34 30 24 42 Q 40 40 44 56 Q 56 46 66 60 Q 76 50 96 60 Z"
					fill={C.ink}
					stroke={C.orange}
					strokeWidth="2.5"
					strokeLinejoin="round"
				/>
				<path
					d="M104 50 Q 130 10 180 16 Q 166 30 176 42 Q 160 40 156 56 Q 144 46 134 60 Q 124 50 104 60 Z"
					fill={C.ink}
					stroke={C.orange}
					strokeWidth="2.5"
					strokeLinejoin="round"
				/>
			</g>
			<path d="M86 40 L 84 24 L 94 34 Z M 114 40 L 116 24 L 106 34 Z" fill={C.ink} stroke={C.orange} strokeWidth="2" />
			<ellipse cx="100" cy="54" rx="18" ry="20" fill={C.ink} stroke={C.orange} strokeWidth="2.5" />
			<circle cx="93" cy="48" r="5" fill={C.white} />
			<circle cx="107" cy="48" r="5" fill={C.white} />
			<circle cx="94" cy="49" r="2.4" fill={C.ink} />
			<circle cx="108" cy="49" r="2.4" fill={C.ink} />
			<path d="M95 60 L 97 64 L 99 60 M 101 60 L 103 64 L 105 60" stroke={C.white} strokeWidth="1.6" fill="none" />
		</svg>
	);
};

export const Spider: React.FC<{size: number; frame: number; thread: number; style?: React.CSSProperties}> = ({
	size,
	frame,
	thread,
	style,
}) => {
	const leg = Math.sin(frame / 6) * 6;
	return (
		<div style={{position: 'absolute', ...style}}>
			<div style={{width: 3, height: thread, background: 'rgba(255,255,255,0.55)', margin: '0 auto'}} />
			<svg viewBox="0 0 120 100" width={size} height={size * 0.83} style={{display: 'block', marginTop: -6, overflow: 'visible'}}>
				<g stroke={C.ink} strokeWidth="5" fill="none" strokeLinecap="round">
					{[0, 1, 2, 3].map((i) => (
						<React.Fragment key={i}>
							<path d={`M50 ${44 + i * 7} Q ${26 - i * 2} ${24 + i * 12 + leg} ${8 + i * 2} ${44 + i * 14}`} />
							<path d={`M70 ${44 + i * 7} Q ${94 + i * 2} ${24 + i * 12 - leg} ${112 - i * 2} ${44 + i * 14}`} />
						</React.Fragment>
					))}
				</g>
				<circle cx="60" cy="56" r="26" fill={C.ink} stroke={C.orange} strokeWidth="2.5" />
				<circle cx="51" cy="52" r="8" fill={C.white} />
				<circle cx="69" cy="52" r="8" fill={C.white} />
				<circle cx="52" cy="54" r="4" fill={C.ink} />
				<circle cx="70" cy="54" r="4" fill={C.ink} />
				<path d="M52 66 Q 60 72 68 66" stroke={C.orange} strokeWidth="3" fill="none" strokeLinecap="round" />
			</svg>
		</div>
	);
};

export const Cauldron: React.FC<{size: number; frame: number; style?: React.CSSProperties}> = ({size, frame, style}) => {
	const bubbles = [0, 1, 2, 3, 4].map((i) => {
		const p = ((frame + i * 13) % 50) / 50;
		return {x: 70 + i * 16 + Math.sin(frame / 7 + i) * 4, y: 64 - p * 70, r: 5 + (i % 3) * 3, o: 1 - p};
	});
	return (
		<svg viewBox="0 0 200 180" width={size} height={size * 0.9} style={{overflow: 'visible', ...style}}>
			{bubbles.map((b, i) => (
				<circle key={i} cx={b.x} cy={b.y} r={b.r} fill="none" stroke={i % 2 ? C.white : C.orangeLight} strokeWidth="3" opacity={b.o} />
			))}
			<path d="M30 156 L 22 176 M 170 156 L 178 176" stroke={C.ink} strokeWidth="10" strokeLinecap="round" />
			<ellipse cx="100" cy="114" rx="84" ry="62" fill={C.ink} stroke={C.orange} strokeWidth="3" />
			<ellipse cx="100" cy="66" rx="80" ry="18" fill={C.orange} stroke={C.ink} strokeWidth="6" />
			<ellipse cx="100" cy="64" rx="64" ry="10" fill={C.glow} opacity={0.6 + 0.3 * Math.sin(frame / 5)} />
			<path d="M50 120 Q 60 150 90 156" stroke="rgba(255,255,255,0.25)" strokeWidth="6" fill="none" strokeLinecap="round" />
		</svg>
	);
};

export const Moon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 200 200" width={size} height={size}>
		<defs>
			<radialGradient id="moonFill" cx="40%" cy="38%" r="70%">
				<stop offset="0%" stopColor="#FFF4E0" />
				<stop offset="55%" stopColor="#FFD08A" />
				<stop offset="100%" stopColor="#FF9A3C" />
			</radialGradient>
		</defs>
		<circle cx="100" cy="100" r="98" fill="url(#moonFill)" />
		<circle cx="70" cy="80" r="14" fill="#F6B266" opacity="0.45" />
		<circle cx="128" cy="62" r="9" fill="#F6B266" opacity="0.4" />
		<circle cx="120" cy="130" r="18" fill="#F6B266" opacity="0.35" />
		<circle cx="62" cy="136" r="7" fill="#F6B266" opacity="0.4" />
	</svg>
);

// ---------------------------------------------------------------- icons

export const GiftIcon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 100 100" width={size} height={size}>
		<rect x="16" y="42" width="68" height="48" rx="6" fill={C.orange} stroke={C.ink} strokeWidth="4" />
		<rect x="10" y="30" width="80" height="18" rx="5" fill={C.orangeDeep} stroke={C.ink} strokeWidth="4" />
		<rect x="44" y="30" width="12" height="60" fill={C.white} stroke={C.ink} strokeWidth="3" />
		<path d="M50 30 Q 30 6 22 20 Q 18 32 50 30 Z M 50 30 Q 70 6 78 20 Q 82 32 50 30 Z" fill={C.white} stroke={C.ink} strokeWidth="3.5" />
	</svg>
);

export const TagIcon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 100 100" width={size} height={size}>
		<path d="M12 46 L 46 12 L 86 12 L 88 52 L 54 86 Q 48 92 42 86 L 14 58 Q 8 52 12 46 Z" fill={C.orange} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
		<circle cx="70" cy="30" r="7" fill={C.white} stroke={C.ink} strokeWidth="3" />
		<path d="M46 34 l 5 12 l 13 1 l -10 8 l 4 13 l -12 -7 l -12 7 l 4 -13 l -10 -8 l 13 -1 Z" fill={C.white} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
	</svg>
);

export const CupcakeIcon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 100 100" width={size} height={size}>
		<path d="M22 52 L 30 92 L 70 92 L 78 52 Z" fill={C.white} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
		<path d="M36 52 L 40 92 M 50 52 L 50 92 M 64 52 L 60 92" stroke={C.ink} strokeWidth="5" />
		<path d="M16 54 Q 10 40 26 36 Q 26 20 44 22 Q 50 8 64 20 Q 82 20 78 38 Q 92 44 84 56 Z" fill={C.orange} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
		<path d="M50 12 L 44 26 L 56 26 Z" fill={C.white} stroke={C.ink} strokeWidth="2.5" />
		<circle cx="34" cy="44" r="3" fill={C.white} />
		<circle cx="60" cy="40" r="3" fill={C.ink} />
		<circle cx="70" cy="48" r="3" fill={C.white} />
	</svg>
);

export const ClockIcon: React.FC<{size: number; frame: number}> = ({size, frame}) => (
	<svg viewBox="0 0 100 100" width={size} height={size}>
		<circle cx="50" cy="50" r="42" fill={C.white} stroke={C.orange} strokeWidth="8" />
		<path d={`M50 50 L 50 24`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" transform={`rotate(${frame * 2} 50 50)`} />
		<path d="M50 50 L 68 50" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
		<circle cx="50" cy="50" r="5" fill={C.orange} />
	</svg>
);

export const Sparkle: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.glow, style}) => (
	<svg viewBox="0 0 40 40" width={size} height={size} style={style}>
		<path d="M20 0 Q 22 18 40 20 Q 22 22 20 40 Q 18 22 0 20 Q 18 18 20 0 Z" fill={color} />
	</svg>
);

export const CrownIcon: React.FC<{size: number}> = ({size}) => (
	<svg viewBox="0 0 100 100" width={size} height={size}>
		<path d="M12 74 L 8 30 L 30 50 L 50 18 L 70 50 L 92 30 L 88 74 Z" fill={C.orange} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
		<rect x="12" y="72" width="76" height="14" rx="4" fill={C.orangeDeep} stroke={C.ink} strokeWidth="4" />
		<circle cx="8" cy="28" r="6" fill={C.white} stroke={C.ink} strokeWidth="3" />
		<circle cx="50" cy="15" r="7" fill={C.white} stroke={C.ink} strokeWidth="3" />
		<circle cx="92" cy="28" r="6" fill={C.white} stroke={C.ink} strokeWidth="3" />
		<circle cx="50" cy="56" r="7" fill={C.white} stroke={C.ink} strokeWidth="3" />
		<circle cx="30" cy="62" r="4" fill={C.ink} />
		<circle cx="70" cy="62" r="4" fill={C.ink} />
	</svg>
);
