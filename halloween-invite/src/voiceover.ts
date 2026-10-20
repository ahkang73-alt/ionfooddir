// Dr Dylan's voiceover (ElevenLabs "Dr dylan" voice, multilingual v2), slowed
// slightly and EQ-matched to the clinic's preferred Dr Dylan recording.
// Cut into sentences and placed on the matching scenes: src* are seconds in
// dr-dylan-voiceover.wav, `at` is where the sentence starts in the video (seconds).
export const VOICE_FILE = 'audio/dr-dylan-voiceover.wav';

export const VOICE_LINES: Array<{text: string; srcStart: number; srcEnd: number; at: number; file?: string}> = [
	{text: 'Hi, I’m Dr Dylan from CeleVenus.', srcStart: 0, srcEnd: 2.47, at: 0.9},
	{text: 'You’re invited to our Halloween party.', srcStart: 2.47, srcEnd: 4.44, at: 5.5},
	// re-recorded on its own when the party time changed to 12–7 PM
	{
		text: 'Join us on Friday, the 30th of October, from 12 to 7 p.m.',
		file: 'audio/dr-dylan-time-line.wav',
		srcStart: 0,
		srcEnd: 4.04,
		at: 10.9,
	},
	{
		text: 'Enjoy a free skin analysis. If your skin scores a Crown, you’ll win a prize from SkinCeuticals.',
		srcStart: 8.87,
		srcEnd: 14.97,
		at: 17.2,
	},
	{text: 'There’ll also be special treats, and finger food for everyone.', srcStart: 14.97, srcEnd: 18.46, at: 23.3},
	{text: 'No tricks, just treats. Come in, relax, and have a nice time with us.', srcStart: 18.46, srcEnd: 23.71, at: 27.9},
	{text: 'Slots are limited, so do RSVP to book yours.', srcStart: 23.71, srcEnd: 27.74, at: 33.25},
	{text: 'See you there… if you dare.', srcStart: 27.74, srcEnd: 29.96, at: 37.3},
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
