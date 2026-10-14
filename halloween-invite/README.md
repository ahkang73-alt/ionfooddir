# CeleVenus Halloween Party Invite 🎃

**▶ Final video: [`video/celevenus-halloween-invite.mp4`](video/celevenus-halloween-invite.mp4)**

A 45-second animated invitation (1080×1920, vertical, for WhatsApp/Instagram) built with [Remotion](https://www.remotion.dev).

**Event:** Friday, 30 October 2026, 3:00 PM – 6:00 PM at CeleVenus Wellness & Aesthetic Clinic, 391B Orchard Road, Ngee Ann City Tower B, #16-03/04.

## Storyboard

| Time | Scene | Sound |
| --- | --- | --- |
| 0–6 s | Moonlit night, a cute witch flies past, CeleVenus logo reveal | wind, whoosh, sparkle, chime |
| 6–12 s | "You're invited to our HALLOWEEN PARTY", pumpkins pop up | whoosh, sparkle, pops |
| 12–18.5 s | Save the date: Friday 30 Oct, 3–6 PM, "RSVP required", a ghost peeks out | dings, boing |
| 18.5–31 s | What's brewing? Prizes, special offers on procedures, finger food | bubbles, dings, sparkle |
| 31–37 s | "No tricks, just treats!", come in, relax & enjoy | bats, boing |
| 37–45 s | Logo, date, address, "RSVP is a must!" card, "See you there!" (lands on the music's final hit at 42 s) | chime, whoosh, ding, ta-da |

## Voiceover

Dr Dylan's voiceover was generated with ElevenLabs (the workspace's "Dr dylan" voice, `eleven_multilingual_v2` for a calm, natural delivery) and is stored in `public/audio/dr-dylan-voiceover.wav`. `src/voiceover.ts` cuts it into sentences and places each one on its scene; the music automatically dips while Dr Dylan is speaking.

| At | Line |
| --- | --- |
| 1.4 s | Hi everyone, Dr Dylan here from CeleVenus. |
| 6.3 s | You're invited to our Halloween party. |
| 12.4 s | Join us on Friday, the 30th of October, from 3 to 6 p.m. |
| 20.3 s | There'll be exciting prizes to be won, some special treats for you, and finger food for everyone. |
| 31.0 s | No tricks, just treats. Come in, relax, and have a nice time with us. |
| 38.2 s | Do remember to RSVP, so we can save a spot for you. |
| 41.8 s | See you there… if you dare. |

The background music and all sound effects are synthesised from scratch by `scripts/make_audio.py`, so there's no licensing issue when sharing the video.

## Editing

- Event wording/date/address/RSVP line: `src/theme.ts` (`EVENT`) and the `ITEMS` list in `src/HalloweenInvite.tsx`.
- Colours and fonts: `src/theme.ts`.
- Characters (pumpkins, witch, ghosts, bats, spider, cauldron, icons): `src/elements/Characters.tsx`.

## Commands

```bash
npm install
npm run audio    # regenerate public/audio/*.wav (needs python3 + numpy)
npm run studio   # live preview in the browser
npm run render   # writes out/celevenus-halloween-invite.mp4
```

To render with an existing Chrome headless shell, set `REMOTION_BROWSER=/path/to/headless_shell`.
