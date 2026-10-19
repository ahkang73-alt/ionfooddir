// Dr Dylan's voiceover (ElevenLabs "dr dylan 101" voice, multilingual v2),
// used as generated (level-matched only). Cut into sentences and placed on the
// matching scenes: src* are seconds in dr-dylan-voiceover.wav, `at` is where
// the sentence starts in the video (seconds).
export const VOICE_FILE = 'audio/dr-dylan-voiceover.wav';

export const VOICE_LINES = [
	{text: 'Hi, I’m Dr Dylan from CeleVenus.', srcStart: 0, srcEnd: 2.28, at: 0.9},
	{text: 'You’re invited to our Halloween party.', srcStart: 2.28, srcEnd: 4.28, at: 5.6},
	{text: 'Join us on Friday, the 30th of October, from 2 to 6 p.m.', srcStart: 4.28, srcEnd: 9.0, at: 10.8},
	{
		text: 'Enjoy a free skin analysis. If your skin scores a Crown, you’ll win a prize from SkinCeuticals.',
		srcStart: 9.0,
		srcEnd: 15.8,
		at: 17.0,
	},
	{text: 'There’ll also be special treats, and finger food for everyone.', srcStart: 15.8, srcEnd: 18.85, at: 23.9},
	{text: 'No tricks, just treats. Come in, relax, and have a nice time with us.', srcStart: 18.85, srcEnd: 24.03, at: 27.9},
	{text: 'Slots are limited, so do RSVP to book yours.', srcStart: 24.03, srcEnd: 27.99, at: 33.15},
	{text: 'See you there… if you dare.', srcStart: 27.99, srcEnd: 30.46, at: 37.1},
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
