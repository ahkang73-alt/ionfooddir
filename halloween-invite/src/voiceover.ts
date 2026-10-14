// Dr Dylan's voiceover (ElevenLabs, "Dr dylan" voice), cut into sentences and
// placed on the matching scenes. src* are seconds in dr-dylan-voiceover.wav,
// `at` is where the sentence starts in the video (seconds).
export const VOICE_FILE = 'audio/dr-dylan-voiceover.wav';

export const VOICE_LINES = [
	{text: 'Hi everyone, Dr Dylan here from CeleVenus!', srcStart: 0, srcEnd: 3.25, at: 1.2},
	{text: 'You’re invited to our Halloween party!', srcStart: 3.25, srcEnd: 5.73, at: 6.1},
	{text: 'Join us on Friday, the 30th of October, from 3 to 6 p.m.', srcStart: 5.73, srcEnd: 9.94, at: 12.3},
	{
		text: 'There’ll be exciting prizes to be won, some special treats for you, and yummy finger food for everyone.',
		srcStart: 9.94,
		srcEnd: 15.56,
		at: 19.6,
	},
	{text: 'No tricks, just treats! Come in, relax, and have fun with us.', srcStart: 15.56, srcEnd: 20.06, at: 31.0},
	{text: 'Do remember to RSVP, so we can save a spot for you.', srcStart: 20.06, srcEnd: 23.84, at: 37.9},
	{text: 'See you there… if you dare!', srcStart: 23.84, srcEnd: 26.83, at: 41.8},
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
