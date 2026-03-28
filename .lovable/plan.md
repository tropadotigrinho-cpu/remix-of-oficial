

# Chat Modal Redesign + Pin Icons Refinement

## What Changes

### 1. MapChatModal.tsx — Full redesign matching reference HTML

**Voice mode (major overhaul):**
- Solid `#020407` background (not semi-transparent), 40vh height
- Gradient fade `-top-32` into the map above (transparent → `#020407`)
- AI orb: 112px, positioned at `-top-10` overlapping the modal edge, using `radial-gradient(circle, #00D1FF, #007AFF)` with cyan/blue glow + `orb-float` animation (scale 1→1.1 over 4s)
- Close button: top-right inside the modal, `rounded-full bg-white/5`
- Waveform: 7 bars, 4px wide, alternating `#00D1FF` / `#007AFF` colors, staggered `animation-delay`
- Live caption: 16px italic white text centered below waveform
- Input bar: unified pill container `bg-white/5 rounded-full border border-white/10` with mic button (cyan icon, no bg) + send button (cyan bg `#00D1FF`, dark icon) inside the pill — NOT separate circles outside
- 3px gap between orb, waveform, and caption (matching reference spec)

**Text mode:**
- Keep current structure (messages, chips, input) but update input bar to match the same pill style as voice mode
- Keep `🤖` avatar, message bubbles, quick chips

**Key differences from current:**
- Voice mode background is solid dark, not semi-transparent blur
- Orb uses cyan/blue gradient instead of teal
- Orb overlaps modal top edge (positioned `-top-10`)
- Input is a unified pill with buttons inside, not separate elements
- Waveform bars use alternating colors with staggered delays
- No separate header in voice mode — just close button

### 2. MapCore.tsx — Pin icons as occurrence type emojis

**Current issue:** Pins show emoji icons from `["get", "icon"]` property — this already works but need to verify the data flow and ensure the dark circle bg + emoji are properly sized.

**Changes:**
- Increase pin background circle to `14px` radius for better icon visibility
- Ensure `text-size` for emoji icons is `16` for clarity
- Remove `circle-stroke-width` from cluster circles (no borders)
- Gradient halos for roubo/assalto: increase `circle-blur` to `1.2` and adjust opacity to `0.15` for smoother gradient falloff — no arc borders, pure degrade
- Risk zones: already have no stroke (removed previously) — confirm fill-opacity blending for concentric overlap

### 3. Backdrop changes
- Voice mode: gradient from transparent to `#020407` (not `rgba(6,8,14,0.5)`)
- Text mode: keep dark overlay `rgba(0,0,0,0.35)`

## Files Modified

| File | Changes |
|------|---------|
| `MapChatModal.tsx` | Complete voice mode redesign, unified pill input, orb repositioned, new animations |
| `MapCore.tsx` | Pin size adjustments, remove cluster stroke borders, refine halo blur |

## Technical Details
- New CSS keyframes: `orb-float` (4s scale animation), `waveform` (1.2s height animation with staggered delays)
- Orb uses `position: absolute, top: -40px, left: 50%, transform: translateX(-50%)` to overlap modal edge
- Colors: primary `#00D1FF`, accent-blue `#007AFF` (from reference), mapped to existing `D.teal` usage replaced with these specific values

