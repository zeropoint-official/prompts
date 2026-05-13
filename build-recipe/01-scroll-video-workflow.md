# 01 — The Scroll Video Workflow (you do this manually)

This is the **one step Claude can't do for you**: generating the source video that becomes the scrubbable hero animation. Everything downstream (extraction, optimization, integration) is automated — but the creative direction of the hero clip is yours.

Read the whole file first. Steps 1–4 happen outside of Claude Code. Steps 5–7 hand the result back to Claude.

---

## The pipeline at a glance

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Idea    │ →  │  Frame   │ →  │  Nano    │ →  │ Animation│ →  │  Kling   │ →  │  ffmpeg  │
│ (awwwards│    │  prompts │    │  Banana  │    │  prompt  │    │  video   │    │  → WebP  │
│  / pin.) │    │   (AI)   │    │ start+end│    │   (AI)   │    │  render  │    │  frames  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     1              2               3                4                5                6+7
```

- **Steps 1–5** are manual / browser-based. Use whichever chat AI you prefer for the prompt-writing steps (ChatGPT, Claude, Gemini).
- **Steps 6–7** happen in Claude Code: you hand Claude the MP4 and tell it to extract frames, optimize, and place them where `<ScrollVideo>` expects them.

---

## Step 1 — Find your visual reference

The look of the hero is set by the reference, not by the prompt. Spend more time here than you think you should.

Sources that work:

- **[awwwards.com](https://www.awwwards.com)** — Filter by category "Real Estate", "Architecture", "Restaurant", whatever your vertical is. Open the site of the year / month nominees. Note the *one specific transition* you want — usually it's the hero.
- **Pinterest** — Search `[your vertical] cinematography`, `golden hour interior`, `architectural drone reveal`, `food beauty shot 4k`. Save 8–12 stills you love.
- **Vimeo Staff Picks** — Filmmaker reference. Search `dolly reveal`, `architectural film`, `commercial cinematography [vertical]`.
- **MUBI / A24 trailers** — For the "this looks like a real studio shipped it" tonal mood.

You're looking for **one specific shot** with:

- A clear **start frame** — a wide, slightly empty, mysterious or context-setting moment.
- A clear **end frame** — the "money shot." For real estate, a hero villa front-on at golden hour. For a restaurant, the signature dish plated. For a dental clinic, the calm waiting room. For SaaS, the dashboard centered.
- A **physically plausible camera movement** between them — push-in, pull-out, crane up, slow dolly, rack focus. Kling renders motion much better when it's a single believable camera move.

**Common mistakes here:** Picking a reference that has 3 cuts (Kling can't render cuts). Picking something at night (Kling renders golden-hour exteriors far better than night). Picking something with people in motion (humans are still uncanny — prefer empty rooms, architecture, food, abstract textures).

## Step 2 — Generate start-frame and end-frame *image prompts* with an AI

Open ChatGPT / Claude. Paste your reference stills (or describe them). Ask:

> I want to generate two still images that will serve as the start and end frames of a 5-second AI video. The video is the hero of a `{{VERTICAL}}` website for `{{BRAND_NAME}}` in `{{LOCATION}}`. Tone: `{{TONE}}`.
>
> The camera move I want is: `[describe — e.g. "slow dolly-in from a wide aerial view of the property to a frontal three-quarter at human eye level"]`.
>
> Write me two prompts I can paste into a text-to-image model (Nano Banana / Imagen / Flux):
> 1. **Start frame prompt** — the wide, atmospheric opening.
> 2. **End frame prompt** — the hero shot at the end of the camera move.
>
> Both prompts must:
> - Describe the same physical scene and lighting (golden hour, overcast, dusk, etc — pick one).
> - Use the same lens language (e.g. "35mm anamorphic", "shot on Arri Alexa").
> - Specify color palette: warm ink shadows `#0f0b06`, muted earth tones, with the brand accent `{{ACCENT_HEX}}` appearing as warm highlights / sky / accent material.
> - Avoid: visible text, watermarks, people, motion blur, lens flare overdone.
> - Be 100–150 words each.

The chat AI gives you two paragraph-style prompts.

## Step 3 — Generate the two stills in Nano Banana (or Imagen / Flux)

Paste each prompt into your text-to-image generator of choice. Generate 4–6 variants of each. Pick the one start and the one end where:

- The framing, lighting, and color palette match each other tightly (this is critical — Kling will struggle to interpolate if start and end live in different lighting worlds).
- The composition supports the camera move you described. If your move is "dolly in", the start should have negative space the dolly is moving *into*; the end shouldn't show anything that wasn't in the start.

Save them as `start.png` and `end.png`.

## Step 4 — Generate the *animation prompt* with an AI

Back to ChatGPT / Claude. Attach `start.png` and `end.png`. Ask:

> I'm using Kling 2.0 (image-to-video, start frame + end frame mode). Write me a Kling motion prompt that interpolates from the first image to the second over 5 seconds.
>
> The intended camera move is: `[same description from step 2]`.
>
> Requirements:
> - Single continuous camera move, no cuts.
> - Slow, deliberate pace — the video will be scrubbed by the user's scroll, so it should look good at *any* speed, including frozen.
> - Specify the camera-move verb (dolly, crane, pan, tilt, push) and approximate speed in cinematic terms ("slow", "languid", "creeping").
> - No people walking through frame, no falling leaves, no autoplay-feeling background motion. The only motion is the camera itself.
> - 60–100 words.

This gives you the Kling prompt.

## Step 5 — Render in Kling

1. Go to Kling (or your preferred image-to-video model — Runway Gen-3, Veo, Sora image-to-video, Hailuo all work). Use **image-to-video with start frame and end frame** mode if available; otherwise start-frame only and accept what you get.
2. Upload `start.png` as the start frame and `end.png` as the end frame.
3. Paste the animation prompt.
4. Set duration to **5 seconds** (longer = bigger video = more frames to extract = slower hero load).
5. Set the aspect ratio to **16:9** or **2.39:1** widescreen.
6. Quality: highest tier (Kling 2.0 / Master if available).
7. Render. Re-roll until the camera move is the *one believable single-take* you intended. **Reject** any render with a cut, a teleporting object, a person who morphs, or text artifacts.

Download the final MP4. Move it somewhere convenient — e.g. `~/Downloads/hero.mp4`.

> **Tip — re-roll budget.** Kling costs credits per render. Budget 4–6 attempts per hero. If after 6 attempts you can't get a clean continuous move, your start+end frames are too dissimilar — go back to step 3 and regenerate one of them to better match the other.

## Step 6 — Hand the MP4 to Claude Code

You're now back inside Claude Code. The codebase already exists (you ran steps 02–05 earlier and have the `<ScrollVideo>` component in place — but no frames yet).

Paste this prompt into Claude:

---

### ▶ Prompt to Claude

> I have a 5-second 16:9 MP4 at `{{HERO_VIDEO_PATH}}` that I want to turn into the frame sequence consumed by `<ScrollVideo>` (defined at `app/components/ScrollVideo.tsx`).
>
> The component expects WebP frames in three resolution tiers under `public/{{FRAMES_BASE}}/`:
>
> - `public/{{FRAMES_BASE}}/mobile/001.webp` … `061.webp` — targeted at viewports `< 768px`. Width: **750px**.
> - `public/{{FRAMES_BASE}}/desktop-1x/001.webp` … `061.webp` — viewport ≥ 768px with effective pixel width < 2000px. Width: **1600px**.
> - `public/{{FRAMES_BASE}}/desktop-2x/001.webp` … `061.webp` — Retina-class displays, effective pixel width ≥ 2000px. Width: **2400px**.
>
> Filenames are zero-padded to 3 digits (`001.webp`, `002.webp`, …). Exactly **61 frames** per tier.
>
> Use ffmpeg + cwebp (or `ffmpeg`'s built-in libwebp). Steps you should run:
>
> 1. Verify ffmpeg, ffprobe, and cwebp are installed. If `cwebp` isn't, use ffmpeg's libwebp encoder directly.
> 2. Probe the source video with `ffprobe` to confirm duration ~5s and the actual frame rate.
> 3. Compute the frame interval so that exactly 61 frames are extracted evenly across the duration. (`fps_filter = 60 / duration_in_seconds`, then `select` exactly 61 frames or sample at `fps_filter` and trim/pad to 61. Tiny mismatch is fine; we need ≤61 frames named `001` through however many.)
> 4. For each of the three target widths (`750`, `1600`, `2400`):
>    - Run `ffmpeg -i {{HERO_VIDEO_PATH}} -vf "fps=fps=12.2,scale=<WIDTH>:-2,crop=<WIDTH>:in_h-mod(in_h\,2)" -frames:v 61 /tmp/frames-<width>/%03d.png` (adjust fps so exactly 61 frames come out across the 5-second duration; if the video is exactly 5s, `fps=12.2` is right).
>    - Convert each PNG to WebP at **quality 78** (sweet spot — visually indistinguishable from PNG at 1/4 the size). Place outputs in `public/{{FRAMES_BASE}}/<tier>/`.
>    - Delete the intermediate PNGs.
> 5. After conversion, report total bytes per tier and the average frame size. Mobile tier should be **< 30 KB / frame**; desktop-1x **< 80 KB / frame**; desktop-2x **< 180 KB / frame**. If any tier is over, drop quality to 72 and re-encode.
> 6. Open the page in `pnpm dev` and verify the hero scrubs correctly with no missing frames.
>
> The frames base for THIS hero is: `{{FRAMES_BASE}}` (e.g. `frames` for the main hero, `frames-properties` for the residences-page hero, etc.). Don't overwrite existing frame folders unless I explicitly say so.
>
> Report back the per-tier total size and the average frame size when done.

---

### What Claude will do under the hood

(For your understanding — you don't need to paste this. The prompt above gives Claude everything it needs.)

```bash
# Probe
ffprobe -v error -show_entries format=duration -of csv=p=0 ~/Downloads/hero.mp4
#   → 5.012

# Make output dirs
mkdir -p public/frames/{mobile,desktop-1x,desktop-2x}

# Mobile (750px wide)
ffmpeg -i ~/Downloads/hero.mp4 \
  -vf "fps=fps=12.2,scale=750:-2" \
  -frames:v 61 \
  -c:v libwebp -quality 78 -preset photo \
  public/frames/mobile/%03d.webp

# Desktop 1x (1600px wide)
ffmpeg -i ~/Downloads/hero.mp4 \
  -vf "fps=fps=12.2,scale=1600:-2" \
  -frames:v 61 \
  -c:v libwebp -quality 78 -preset photo \
  public/frames/desktop-1x/%03d.webp

# Desktop 2x (2400px wide)
ffmpeg -i ~/Downloads/hero.mp4 \
  -vf "fps=fps=12.2,scale=2400:-2" \
  -frames:v 61 \
  -c:v libwebp -quality 78 -preset photo \
  public/frames/desktop-2x/%03d.webp

# Verify
ls public/frames/desktop-1x | wc -l    # → 61
du -sh public/frames/*                  # → roughly 0.8M / 3M / 8M
```

The 61-frame magic number comes from `<ScrollVideo>`: the component is hardcoded to `FRAME_COUNT = 61` (mobile loads every other frame → 31). Match the count or update the component.

## Step 7 — Tune the spacer height (optional)

Inside `app/(site)/page.tsx`, `<ScrollVideo heightVh={220} />` controls how much scroll distance the animation takes to play through. Defaults:

- `heightVh={220}` — desktop. The hero pins for 220vh of scroll. Animation completes by 82% (`ANIMATION_END = 0.82` in the component), leaving the last 18% to fade the hero overlay out.
- The component internally drops mobile spacer to `160vh` automatically.

Reduce to `180` if the scrub feels too long; raise to `260` for a more meditative pace. Don't drop below `140` — the scrub starts feeling jerky if each frame gets less than ~2vh.

---

## Multi-hero variants

If your site has more than one scroll-video hero (e.g. one for the home page and one for the residences index page, like Master Homes does), repeat steps 1–6 for each, using a different `framesBase` each time:

```tsx
<ScrollVideo framesBase="frames" />              {/* home page */}
<ScrollVideo framesBase="frames-properties" />   {/* residences index */}
```

Each `framesBase` gets its own `public/<base>/{mobile,desktop-1x,desktop-2x}/` tree of 61 WebP frames.

---

## What you cannot fix later

- **Wrong aspect ratio at render.** Kling won't re-render for free, and ffmpeg can crop but can't add pixels that don't exist. Pick the aspect right at step 5.
- **A "shimmer" or flicker between frames** is almost always Kling's denoiser, not your encoding — re-roll the Kling render.
- **A camera move that includes a hard cut** will look broken at any scrub speed. Re-render.

## What you can fix later

- Frame count, frame quality, frame width — re-run step 6.
- The hero overlay copy (it's HTML on top of the canvas) — edit `<ScrollVideo>`.
- The scroll spacer height — change `heightVh` prop.
- The end-fade threshold — change `ANIMATION_END` in the component.
