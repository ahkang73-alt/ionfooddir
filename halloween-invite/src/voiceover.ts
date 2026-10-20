// Dr Dylan's voiceover (ElevenLabs "dr dylan 101" voice, multilingual v2),
// used as generated (level-matched only). Cut into sentences and placed on the
// matching scenes: src* are seconds in the voice file, `at` is where the
// sentence starts in the video (seconds).
export const VOICE_FILE = 'audio/dr-dylan-voiceover.wav';

export const VOICE_LINES: Array<{text: string; srcStart: number; srcEnd: number; at: number; file?: string}> = [
	{text: 'Hi, I’m Dr Dylan from CeleVenus.', srcStart: 0, srcEnd: 2.03, at: 0.9},
	{text: 'You’re invited to our Halloween party.', srcStart: 2.03, srcEnd: 3.93, at: 5.5},
	{text: 'Join us on Friday, the 30th of October, from 12 to 7 p.m.', srcStart: 3.93, srcEnd: 8.4, at: 10.9},
	{
		text: 'Enjoy a free skin analysis. If your skin scores a Crown, you’ll win a prize from SkinCeuticals.',
		srcStart: 8.4,
		srcEnd: 14.7,
		at: 17.2,
	},
	{text: 'There’ll also be special treats, and finger food for everyone.', srcStart: 14.7, srcEnd: 17.9, at: 23.6},
	{text: 'No tricks, just treats. Come in, relax, and have a nice time with us.', srcStart: 17.9, srcEnd: 22.04, at: 27.9},
	{text: 'Slots are limited, so do RSVP to book yours.', srcStart: 22.04, srcEnd: 25.6, at: 33.2},
	{text: 'See you there… if you dare.', srcStart: 25.6, srcEnd: 27.63, at: 37.1},
];

/** 1 while Dr Dylan is talking (with short ramps either side), else 0. */
export const voiceActivity = (frame: number, fps: number) => {
	const t = frame / fps;
	let v = 0;
	for (const l of VOICE_LINES) {
		const end = l.at + (l.srcEnd - l.srcStart);
		const rampIn = Math.min(1, Math.max(0, (t - (l.at - 0.35)) / 0.3));
		const rampOut = Math.min(1, Math.max(0, (end + 0.4 - t) / 0.4));
		v = Math.max(v, Math.min(rampIn, rampOut));
	}
	return v;
};
