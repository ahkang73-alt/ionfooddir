# CeleVenus Halloween Party Invite 🎃

**▶ Version 1: [`video/celevenus-halloween-invite.mp4`](video/celevenus-halloween-invite.mp4)**
**▶ Version 2: [`video/celevenus-halloween-invite-v2.mp4`](video/celevenus-halloween-invite-v2.mp4)** (see below)

A 40-second animated invitation (1080×1920, vertical, for WhatsApp/Instagram) built with [Remotion](https://www.remotion.dev).

**Event:** Friday, 30 October 2026, 12:00 PM – 7:00 PM at CeleVenus Wellness & Aesthetic Clinic, 391B Orchard Road, Ngee Ann City Tower B, #16-03/04.

## Storyboard

| Time | Scene | Sound |
| --- | --- | --- |
| 0–5.3 s | Moonlit night, a cute witch flies past, CeleVenus logo reveal | wind, whoosh, sparkle, chime |
| 5.3–10.7 s | "You're invited to our HALLOWEEN PARTY", pumpkins pop up | whoosh, sparkle, pops |
| 10.7–16.4 s | Save the date: Friday 30 Oct, 12–7 PM, "RSVP required", a ghost peeks out | dings, boing |
| 16.4–27.6 s | What's brewing? FREE skin analysis (score a Crown, win a SkinCeuticals prize), special offers on procedures, finger food | bubbles, dings, sparkle |
| 27.6–32.9 s | "No tricks, just treats!", come in, relax & enjoy | bats, boing |
| 32.9–40 s | Logo, date, address, "RSVP is a must!" card, "See you there!" (lands on the music's final hit at ~37.3 s) | chime, whoosh, ding, ta-da |

## Voiceover

Dr Dylan's voiceover was generated with ElevenLabs (the workspace's "Dr dylan" voice, `eleven_multilingual_v2`), then slowed slightly and EQ-matched to the clinic's preferred Dr Dylan recording. It is stored in `public/audio/dr-dylan-voiceover.wav`; `src/voiceover.ts` cuts it into sentences and places each one on its scene, and the music automatically dips while Dr Dylan is speaking.

| At | Line |
| --- | --- |
| 0.9 s | Hi, I'm Dr Dylan from CeleVenus. |
| 5.5 s | You're invited to our Halloween party. |
| 10.9 s | Join us on Friday, the 30th of October, from 12 to 7 p.m. |
| 17.2 s | Enjoy a free skin analysis. If your skin scores a Crown, you'll win a prize from SkinCeuticals. |
| 23.3 s | There'll also be special treats, and finger food for everyone. |
| 27.9 s | No tricks, just treats. Come in, relax, and have a nice time with us. |
| 33.25 s | Slots are limited, so do RSVP to book yours. |
| 37.3 s | See you there… if you dare. |

The background music and all sound effects are synthesised from scratch by `scripts/make_audio.py`, so there's no licensing issue when sharing the video.

## Editing

- Event wording/date/address/RSVP line: `src/theme.ts` (`EVENT`) and the `ITEMS` list in `src/HalloweenInvite.tsx`.
- Colours and fonts: `src/theme.ts`.
- Overall pace: `SPEED` in `src/time.ts` (scene timings are written on a 45 s scale and played back at 45/40 speed).
- Characters (pumpkins, witch, ghosts, bats, spider, cauldron, icons): `src/elements/Characters.tsx`.

## Version 2 (`HalloweenInviteV2`, `src/v2/`)

A second 40 s take in a darker moonlit-graveyard style (orange / black / white with a touch of blood red), in five scenes, with the same Dr Dylan voiceover re-timed:

| Time | Scene | Sound |
| --- | --- | --- |
| 0–4.4 s | Lightning, full moon rises, the witch circles the moon, CeleVenus logo | thunder, whoosh, chime |
| 4.4–14.6 s | "You're invited to our HALLOWEEN PARTY" with blood drips; a tombstone rises engraved with Fri 30 Oct, 12–7 PM, RSVP required | drips, stone grind |
| 14.6–27.3 s | "What's brewing?" – each treat gets its own spotlight and sound: FREE skin analysis, Score a Crown (SkinCeuticals prize), special offers, finger food | scanner beep, royal fanfare, ka-ching, munch |
| 27.3–36.2 s | "No tricks, just treats!", then "Slots are limited" and a blood-red RSVP stamp | bats, stamp |
| 36.2–40 s | Logo, date, address, RSVP reminder, "See you there… if you dare" | chime, whoosh, ta-da |

## Commands

```bash
npm install
npm run audio    # regenerate public/audio/*.wav (needs python3 + numpy)
npm run studio   # live preview in the browser
npm run render   # writes out/celevenus-halloween-invite.mp4
npm run render:v2  # writes out/celevenus-halloween-invite-v2.mp4
```

To render with an existing Chrome headless shell, set `REMOTION_BROWSER=/path/to/headless_shell`.
