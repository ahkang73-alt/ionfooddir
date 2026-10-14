// Dr Dylan's voiceover (ElevenLabs, "Dr dylan" voice, calm multilingual v2 take),
// cut into sentences and placed on the matching scenes. src* are seconds in
// dr-dylan-voiceover.wav, `at` is where the sentence starts in the video (seconds).
export const VOICE_FILE = 'audio/dr-dylan-voiceover.wav';

export const VOICE_LINES = [
	{text: 'Hi everyone, Dr Dylan here from CeleVenus.', srcStart: 0, srcEnd: 2.75, at: 1.0},
	{text: 'You’re invited to our Halloween party.', srcStart: 2.75, srcEnd: 4.6, at: 5.6},
	{text: 'Join us on Friday, the 30th of October, from 3 to 6 p.m.', srcStart: 4.6, srcEnd: 9.0, at: 11.0},
	{
		text: 'There’ll be exciting prizes to be won, some special treats for you, and finger food for everyone.',
		srcStart: 9.0,
		srcEnd: 14.25,
		at: 17.6,
	},
	{text: 'No tricks, just treats. Come in, relax, and have a nice time with us.', srcStart: 14.25, srcEnd: 19.3, at: 27.7},
	{text: 'Do remember to RSVP, so we can save a spot for you.', srcStart: 19.3, srcEnd: 22.95, at: 33.4},
	{text: 'See you there… if you dare.', srcStart: 22.95, srcEnd: 25.26, at: 37.05},
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
