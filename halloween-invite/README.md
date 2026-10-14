# CeleVenus Halloween Party Invite 🎃

**▶ Final video: [`video/celevenus-halloween-invite.mp4`](video/celevenus-halloween-invite.mp4)**

A 60-second animated invitation (1080×1920, vertical, for WhatsApp/Instagram) built with [Remotion](https://www.remotion.dev).

**Event:** Friday, 30 October 2026, 3:00 PM – 6:00 PM at CeleVenus Wellness & Aesthetic Clinic, 391B Orchard Road, Ngee Ann City Tower B, #16-03/04.

## Storyboard

| Time | Scene | Sound |
| --- | --- | --- |
| 0–8 s | Moonlit night, a cute witch flies past, CeleVenus logo reveal | wind, whoosh, sparkle, chime |
| 8–16 s | "You're invited to our HALLOWEEN PARTY", pumpkins pop up | whoosh, sparkle, pops |
| 16–24 s | Save the date: Friday 30 Oct, 3–6 PM, a ghost peeks out | dings, boing |
| 24–41 s | What's brewing? Prizes, special offers on procedures, finger food | bubbles, dings, sparkle |
| 41–50 s | "No tricks, just treats!", come in, relax & enjoy | bats, boing |
| 50–60 s | Logo, date, address, "See you there!" | chime, whoosh, ta-da |

The background music and all sound effects are synthesised from scratch by `scripts/make_audio.py`, so there's no licensing issue when sharing the video.

## Editing

- Event wording/date/address: `src/theme.ts` (`EVENT`) and the `ITEMS` list in `src/HalloweenInvite.tsx`.
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
