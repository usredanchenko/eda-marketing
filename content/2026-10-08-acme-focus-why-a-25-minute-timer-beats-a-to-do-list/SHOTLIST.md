# SHOTLIST

> Generated from `data/shotlist.json` by `npm run mos -- md`. Edit the JSON, not this file.

Shots: 12, ~41.6 s of screen time in total.

## SHOOT_THIS — you film these (5)

_Camera, light and action are spelled out so you can shoot without a call._

### S01 · 4.5 s

- **Camera:** phone on tripod, vertical 1080x1920, eye level
- **Framing:** medium close-up, eyes in the upper third
- **Action:** Looks at the laptop, then at camera on 'And I started nothing.'
- **Speech:** Every morning my to-do list got longer. And I started nothing.
- **Environment:** Alex's desk, laptop, plain wall behind
- **Lighting:** soft window light from the side, no color gels
- **Props:** laptop open, sticky note with a long list
- **Screen recording:** none
- **Required asset:** video/footage/S01.mov
- **Motion graphics:** lower third + accent
- **Audio:** lav or phone mic, room tone 5 s
- **Notes:** Keep the eyes clear of the top headline accent.
- Script blocks: b01 · draft substitute: assets/acme-focus/footage/desk-vertical.mp4

### S02 · 2.5 s

- **Camera:** same setup as S01
- **Framing:** medium close-up
- **Action:** Says the beta line to camera.
- **Speech:** Three of five beta features shipped.
- **Environment:** Alex's desk, laptop, plain wall behind
- **Lighting:** soft window light from the side, no color gels
- **Props:** laptop
- **Screen recording:** none
- **Required asset:** video/footage/S02.mov
- **Motion graphics:** progress bar in the lower third
- **Audio:** same mic
- **Notes:** Line must match facts.yaml publicWording.
- Script blocks: b02 · draft substitute: placeholder scene

### S03 · 5.8 s

- **Camera:** same setup, slightly wider
- **Framing:** medium shot, hands and laptop in frame
- **Action:** Reaches for the laptop, opens email instead of the task.
- **Speech:** A long list makes you choose first. Choosing feels like work — so you open email instead.
- **Environment:** Alex's desk, laptop, plain wall behind
- **Lighting:** soft window light from the side, no color gels
- **Props:** laptop with a blank email client (no real inbox, no personal data)
- **Screen recording:** none
- **Required asset:** video/footage/S03.mov
- **Motion graphics:** notification card overlay (G01)
- **Audio:** same mic
- **Notes:** Do not film a real inbox.
- Script blocks: b03 · draft substitute: assets/acme-focus/footage/desk-vertical.mp4

### S04 · 4.8 s

- **Camera:** same setup
- **Framing:** medium close-up
- **Action:** Delivers the payoff line, calm.
- **Speech:** Twenty-five minutes, one task. And no streak to lose if you skip tomorrow.
- **Environment:** Alex's desk, laptop, plain wall behind
- **Lighting:** soft window light from the side, no color gels
- **Props:** phone with the timer
- **Screen recording:** none
- **Required asset:** video/footage/S04.mov
- **Motion graphics:** title card covers the first half
- **Audio:** same mic
- **Notes:** Optional cover: the edit uses title + done screen; keep as a safety take.
- Script blocks: b05

### S05 · 2 s

- **Camera:** same setup
- **Framing:** medium close-up
- **Action:** Asks the question to camera.
- **Speech:** It's in public beta on iOS. Tell me what breaks your focus.
- **Environment:** Alex's desk, laptop, plain wall behind
- **Lighting:** soft window light from the side, no color gels
- **Props:** none
- **Screen recording:** none
- **Required asset:** video/footage/S05.mov
- **Motion graphics:** CTA card follows
- **Audio:** same mic
- **Notes:** Speech continues over the CTA card.
- Script blocks: b06 · draft substitute: assets/acme-focus/footage/desk-vertical.mp4

## GENERATE_THIS — the system makes these (4)

_Remotion components and HyperFrames segments._

### G01 · 4.6 s

- **Camera:** n/a
- **Framing:** card in the upper half
- **Action:** Inbox card lands; status NEW → OPENED.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** none
- **Required asset:** Remotion card scene (NotificationCard)
- **Motion graphics:** header ILLUSTRATION · INBOX
- **Audio:** ui-notify on entry
- **Notes:** Illustration, not a real notification.
- Script blocks: b03

### G02 · 2.2 s

- **Camera:** n/a
- **Framing:** lower third
- **Action:** Progress bar fills to 3/5.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** none
- **Required asset:** Remotion progress scene, factId acme-focus-beta-progress
- **Motion graphics:** BETA MILESTONE
- **Audio:** —
- **Notes:** Value 0.6 = 3 of 5 (PUBLIC_CONFIRMED).
- Script blocks: b02

### G03 · 2.3 s

- **Camera:** n/a
- **Framing:** CTA band
- **Action:** Editorial CTA card with logo.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** none
- **Required asset:** Remotion cta scene
- **Motion graphics:** Link in bio · ACME FOCUS
- **Audio:** —
- **Notes:** Editorial: not spoken, not in the SRT.
- Script blocks: b06

### G04 · 1.9 s

- **Camera:** n/a
- **Framing:** center
- **Action:** Title card '25 minutes / one task'.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** none
- **Required asset:** Remotion title scene
- **Motion graphics:** coral gradient on 'one task'
- **Audio:** whoosh-soft on entry
- **Notes:** Spoken phrase: captions are suppressed while it is on screen.
- Script blocks: b05

## EXISTING_ASSET — taken from assets/ (3)

_Paths and restrictions are in ASSETS.md._

### E01 · 3.1 s

- **Camera:** n/a
- **Framing:** full frame (cover crop of a 16:9 still)
- **Action:** Blockout of a future screen.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** none
- **Required asset:** assets/acme-focus/preview/blockout.png
- **Motion graphics:** honesty label
- **Audio:** —
- **Notes:** Example blockout, labeled BLOCKOUT · NOT THE REAL PRODUCT.
- Script blocks: b02

### E02 · 5 s

- **Camera:** n/a
- **Framing:** phone frame, centered
- **Action:** Start screen, then hard cut to the running timer.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** task.png → timer.png (example UI)
- **Required asset:** assets/acme-focus/screens/task.png; assets/acme-focus/screens/timer.png
- **Motion graphics:** label EXAMPLE UI · FICTIONAL APP
- **Audio:** ui-pop on the cut
- **Notes:** Replace with real app screenshots when available.
- Script blocks: b04

### E03 · 2.9 s

- **Camera:** n/a
- **Framing:** phone frame, centered
- **Action:** Done screen: 'no streaks · no scores'.
- **Speech:** —
- **Environment:** n/a
- **Lighting:** n/a
- **Props:** n/a
- **Screen recording:** done.png (example UI)
- **Required asset:** assets/acme-focus/screens/done.png
- **Motion graphics:** label EXAMPLE UI · FICTIONAL APP
- **Audio:** —
- **Notes:** Matches fact acme-focus-no-streaks.
- Script blocks: b05
