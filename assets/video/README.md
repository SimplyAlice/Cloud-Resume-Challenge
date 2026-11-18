# Two Standalone Scroll-Scrubbed Video Studies

This directory houses the two independent creative video studies rendered in `#video-one` and `#video-two` of `index.html`, each controlled by its own scroll runway via `createIndependentScrollVideo` in `assets/js/script.js`.

## Independent Video Sections (Separated by Wave I Projects)

1. **Study I (`#video-one` / `video1`) — `Flower_opening_with_architecture.mp4`**
   - **Original archive:** `assets/video/originals/flower-opening-with-architecture.mp4` (`1920×1080`, `24fps`, `94` frames, `3.92s`)
   - **Composition:** Standalone deep plum gallery stage (`#1C1118`) with synced captions and chapter jump pills.
   - **Opening / Closing composition:** Closed blush bud on deep plum studio background -> bloom opening as hand-drawn architectural drafting sheets illuminate behind it.

2. **Study II (`#video-two` / `video2`) — `Botanical_animation.mp4`**
   - **Original archive:** `assets/video/originals/botanical-animation.mp4` (`1920×1080`, `24fps`, `239` frames, `9.96s`)
   - **Composition:** Warm parchment (`#F1EAE1`) right-side split-screen on desktop (`>= 62rem`) with a sticky 4-beat narrative on the left, adapting to a stacked vertical video-first layout on tablet and mobile (`< 62rem`).
   - **Opening / Closing composition:** Dewy closed peony bud on warm ivory parchment -> full bloom accompanied by radial engineering protractors and geometric axis construction lines.

## Why Scrub Derivatives Use All-Intra Encoding (`assets/video/scrub/`)

The original exports contain a single IDR keyframe at `0.00s` with B-frames, causing forward/reverse `video.currentTime` scrubbing to stall between distant keyframes. Both clips were transcoded cleanly to **all-intra (`-g 1 -keyint_min 1 -bf 0 -an -movflags +faststart`)** derivatives in `1080p` (desktop) and `720p` (mobile `max-width: 768px`) while keeping the originals archived in `assets/video/originals/`.

## Bandwidth-Conscious Preloading & Reduced Motion

- Each section uses an `IntersectionObserver` (`rootMargin: "450px 0px"`) to attach its `<source>` element only as the user approaches that section, while displaying WebP open/close posters immediately.
- Under `prefers-reduced-motion: reduce`, video playback and scroll scrubbing are bypassed and static WebP editorial plates (`assets/images/posters/`) remain visible.
