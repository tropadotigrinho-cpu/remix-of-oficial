

# Iron Guard — 3D Immersive Map + Chat de Bordo Overhaul

## Overview
Comprehensive rework of the 3D immersive mode, alert pin visuals, risk zone rendering, map controls sidebar, and a new in-map chat modal with voice orb overlay.

---

## 1. Fix 3D Immersive Mode (MapImersivo3D.tsx)

**Problems:** Buildings have opacity, roads show through, speed/compass HUD duplicates sidebar controls, GPS not working properly.

**Changes:**
- Set `fill-extrusion-opacity` to `1.0` (currently `0.9`) so buildings are fully opaque
- Remove the bottom speed (km/h) and compass HUD blocks entirely — these already exist in MapControls sidebar
- Keep only the top-left "MODO 3D" badge and top-right "Voltar 2D" button
- Ensure `maxBounds` covers only São Paulo state (current SP_BOUNDS already does this: `[-53.1, -25.3]` to `[-44.1, -19.7]`)
- GPS: start tracking automatically on mount via `navigator.geolocation.watchPosition` (already implemented, should work if user grants permission)
- Dark style is already `mapbox://styles/mapbox/dark-v11` — confirmed correct

## 2. Fix MapTiler 3D Fallback (MapTiler3DFallback.tsx)

- Same changes: remove speed/compass HUD blocks
- Keep only mode badge + exit button
- Already uses dark style (`streets-v2-dark`)

## 3. Alert Pins — Minimalist Icons + Gradient Radius

**In MapCore.tsx:**
- Change pin rendering: use `symbol` layer with minimalist text icons instead of plain circles
- Add gradient radius halos ONLY for `roubo` and `assalto` types using a heatmap-like circle layer with gradient fill (no hard arc borders)
- For overlapping serious alerts: the gradient circles naturally create concentric/blended effects
- Remove `circle-stroke-width` / `circle-stroke-color` from unclustered pins to avoid arc borders

**Implementation approach:**
- Split alert pins into two sources: `alert-pins-serious` (roubo/assalto with gradient halos) and `alert-pins-normal` (other types, no halos)
- Serious pins get an additional `circle` layer with large radius, low opacity, and smooth gradient via `circle-blur`
- All pins get a `symbol` layer on top with the emoji icon at small size

## 4. Risk Zones — Gradient Without Arc Borders

**In MapCore.tsx:**
- Remove `zonas-risco-stroke` layer (the line border creating arc effect)
- Increase `fill-opacity` slightly and use `circle-blur` or keep as fill but ensure smooth gradient appearance
- For concentric overlapping zones: they already overlap naturally with fill layers — just ensure opacity blending looks smooth

## 5. MapControls Sidebar Improvements

**Add to MapControls.tsx:**
- Better heatmap toggle icon with visual on/off state (already partially done)
- Add a new "Chat de Bordo" button below the existing controls with a chat/message icon
- Wire `onOpenChat` callback prop

**Remove:** The duplicate layers button (currently there are compass, layers, 3D, heatmap, GPS — the layers button is redundant with the config panel)

## 6. In-Map Chat Modal (New Component)

**New file: `src/components/map/MapChatModal.tsx`**

Based on the reference image, this is a modal that appears over the map (not full-page):

**Text mode (default):**
- Dark card with "IA OPERACIONAL ATIVA" header + green dot + close button
- AI message bubble with bot avatar icon
- Quick-action chips ("Como tá aqui?", "Tem roubo perto?", "Analisar rota")
- Input bar with text field + mic icon + send button
- Placeholder: "Talk to Iron Guard AI..."

**Voice mode (when mic icon tapped):**
- Overlay with gradient background covers 40% bottom of screen
- Large glowing orb (green/teal, animated) — the AI presence indicator
- Audio waveform bars below orb
- Transcription text in italics
- The gradient overlay blends into the map above

**Integration:**
- Triggered from new chat button in MapControls
- State managed in MapOrchestrator
- Uses mock responses initially (same pattern as ChatPage.tsx)
- Later can be connected to Lovable AI edge function

## 7. Request Economy

- MapTiler: already used as fallback only; no changes needed
- Mapbox: budget system already in place via `mapboxBudget.ts`
- No additional API calls introduced

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/map/MapImersivo3D.tsx` | Remove speed/compass HUD, fix opacity to 1.0 |
| `src/components/map/MapTiler3DFallback.tsx` | Remove speed/compass HUD |
| `src/components/map/MapCore.tsx` | Rework pin layers (minimalist icons, gradient halos for serious only), remove zone stroke borders |
| `src/components/map/MapControls.tsx` | Add chat button, remove layers duplicate, improve heatmap icon |
| `src/components/map/MapChatModal.tsx` | **New** — in-map chat modal with text + voice orb overlay |
| `src/components/map/MapOrchestrator.tsx` | Add chat modal state, pass props |

## Technical Notes

- Gradient halos use MapLibre's `circle-blur` property to create smooth falloff without hard edges
- Voice orb reuses animation patterns from existing `ChatPage.tsx` VoiceScreen but in a compact 40% height overlay
- No database changes needed — this is all frontend UI
- No new API keys required

