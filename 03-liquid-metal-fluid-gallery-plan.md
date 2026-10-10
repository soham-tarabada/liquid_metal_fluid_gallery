# Liquid Metal / Fluid Art Gallery — Implementation Plan

A portfolio/gallery site where the interface itself feels like liquid chrome: a raymarched metaball hero blob that morphs and merges, a cursor that leaves a trailing mercury-like blob, gallery tiles that goo-merge on hover, and shared-element liquid transitions into detail views.

---

## 1. Concept & Art Direction

| Aspect | Direction |
|---|---|
| Mood | Premium, tactile, slightly alien — think mercury, chrome, oil-on-water |
| Palette | Near-black or off-white base (pick one — chrome contrasts best against a *dark* background), the blob itself does the color work via environment reflections + a subtle tinted Fresnel |
| Typography | Confident, large display type for section titles that the liquid can flow *around* or *through* (mask effects) |
| Camera language | Mostly static camera; the *material* is the performer, not the camera |
| Signature moment | Two gallery-tile blobs merging into one continuous liquid shape on hover, then splitting again — the classic "metaball" moment, done well |

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build tool | **Vite 8** | — |
| UI framework | **React 19** | — |
| 3D renderer | **@react-three/fiber v9** + **three.js** | For the hero raymarched blob and reflective environment |
| Helpers | **@react-three/drei** — `Environment` (HDRI reflections are what sell "metal"), `Html` | — |
| Shaders | Hand-written GLSL raymarcher via `vite-plugin-glsl` | A true liquid-metal look needs signed-distance-field (SDF) raymarching with a *smooth minimum* blend between spheres — this is not achievable with standard mesh geometry |
| Lightweight 2D metaballs | **SVG goo filter** (`feGaussianBlur` + `feColorMatrix` threshold) for gallery-tile hover blobs and the cursor trail | Full raymarching for every small UI blob is wasteful; the classic SVG goo filter gives a near-identical "merging blobs" look at a fraction of the GPU cost, and works outside WebGL entirely |
| Layout transitions | **GSAP Flip plugin** (free since 2025) | Shared-element transition from a gallery tile to its full detail view — Flip records the "before" layout, you change the DOM/state, Flip animates the delta |
| Micro-interaction motion | **Framer Motion** | Cursor-trail spring physics (`useSpring`), button magnetism |
| Post-processing | **@react-three/postprocessing** | Bloom for the hero blob's specular highlights |
| Smooth scroll | **Lenis** | — |
| State | **Zustand** | Active gallery item, hover targets, quality tier |
| Styling | **Tailwind CSS v4** | — |

### Two-tier metaball strategy (important)
Don't raymarch everything. Reserve the expensive GPU raymarched SDF blob for **one hero moment** (and maybe the cursor trail on capable devices). For the many small "merge on hover" interactions across a gallery grid, use the **SVG goo filter** — it's a well-known, cheap, DOM-native technique (blur two shapes together, then sharpen the alpha threshold) that looks like liquid merging without touching WebGL at all.

---

## 3. Project Structure

```
src/
  scene/
    HeroBlob/
      HeroBlob.tsx            # raymarched SDF plane, fullscreen or hero-bound
      shaders/
        raymarch.frag.glsl
        raymarch.vert.glsl
    EnvironmentSetup.tsx        # HDRI for reflections
  dom/
    Gallery/
      GalleryGrid.tsx
      GalleryTile.tsx            # wrapped in SVG goo filter group
      GooFilterDefs.tsx           # shared <svg><filter> defs, referenced by CSS
      DetailView.tsx              # GSAP Flip target
    CursorTrail.tsx              # Framer Motion spring-chain of trailing blobs
    LiquidText.tsx                 # text masked by an animated gradient/shader
  store/useGalleryStore.ts
  data/gallery.ts                  # gallery item content model
public/
```

---

## 4. Phase-Wise Plan

### Phase 0 — Setup (Days 1–2)
- Scaffold, install `three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis zustand framer-motion`.
- Add `vite-plugin-glsl`.
- Define the SVG goo filter once, globally, as a shared `<defs>` block (don't duplicate it per component) — reused via `filter: url(#goo)` in CSS.
- Source or shoot an HDRI environment map for chrome reflections; compress appropriately.

### Phase 1 — Foundation (Days 3–4)
- Layout shell, Lenis + ScrollTrigger sync.
- Gallery content model (`data/gallery.ts`) — id, title, image, description, accent color — designed so the grid, detail view, and any CMS you add later all read from the same shape.
- Loading screen: a small goo-filter blob animation "filling up" — cheap and on-theme, no need for the full raymarcher here.

### Phase 2 — Core Liquid Engine (Days 5–11, the heart of the project)
- Write the **SDF smooth-minimum blend function** — this is the single technique that makes multiple "metaballs" read as one continuous liquid surface instead of overlapping spheres.
- Build the raymarching loop: march a ray per-pixel through a small scene of N sphere SDFs (positions driven by uniforms — scroll progress, mouse position, or an idle animation), accumulate the smooth-min distance, estimate the surface normal via the standard gradient trick, light it simply (one key light + the HDRI environment reflection via `Environment` for the "metal" read).
- Wrap this as a reusable `<LiquidBlob metaballs={[...]} />` component so the hero and any other raymarched moment share one implementation.
- Validate performance early — raymarching is the most expensive technique in any of these four plans; get the step-count/resolution budget right before building content on top of it (see Phase 5).

### Phase 3 — Section & Gallery Build (Days 12–18)
1. **Hero** — the large liquid blob, idling with a slow noise-driven morph, actively repelled/attracted by the cursor (feed pointer world position into a uniform, same raycast-to-plane pattern as any of these builds).
2. **Gallery grid** — each tile is a normal DOM `<img>`/card; on hover, two adjacent tiles' blob "backing shapes" merge via the shared SVG goo filter, revealing/emphasizing the hovered item while neighbors visually flow toward it.
3. **Detail view** — clicking a tile triggers a **GSAP Flip** transition: record the tile's current rect, swap in the expanded detail layout, let Flip animate the interpolation (position/size) while a liquid wipe (radial `clip-path` or a cheap shader dissolve) handles the content crossfade underneath.
4. **Liquid text / footer** — headline text filled with the same raymarched material via a render-to-texture composited through a text mask (or, cheaper: `background-clip: text` over an animated CSS gradient for lower tiers).

### Phase 4 — Interaction (Days 19–21)
- **Cursor trail**: 4–6 trailing blob elements, each a DOM `div` with `border-radius: 50%` wrapped in the goo filter group, positions computed via chained `useSpring` (each blob springs toward the previous one's position) — this is a DOM/Framer-Motion technique, not WebGL, and it's what most award-winning "liquid cursor" sites actually use.
- Magnetic buttons: GSAP `quickTo` nudging button position toward the cursor within a radius, snapping back on leave.
- Drag-to-morph: dragging a gallery tile temporarily biases its metaball's raymarch uniforms for a squash/stretch liquid feel, spring-returning on release.

### Phase 5 — Performance Optimization (Days 22–25)
- **Cap raymarch cost hard**: limit max steps (typically 48–80 is enough for a handful of blended spheres at this stylization level, not 200+), render the blob layer to a **half-resolution render target** and upscale/composite with a blur — visually near-identical, meaningfully cheaper.
- Never run the raymarcher as a full-page scroll-linked background — reserve it for the hero and, on high-tier devices only, the cursor trail. Everything else uses the SVG goo technique.
- Test the SVG goo filter specifically on Safari — `feColorMatrix`-based goo filters have a history of inconsistent/buggy rendering there; budget time for a `-webkit`-specific fallback (a simpler blurred-shadow merge, or disabling the effect and relying on scale/opacity transitions instead).
- Dispose the raymarch render target and any FBOs on unmount.
- Debounce/`rAF`-throttle pointer-position uniform updates; don't update every `mousemove` event synchronously.
- Use `will-change: transform` sparingly on the DOM blob trail elements (only while actively animating) to hint GPU compositing without permanently bloating memory.

### Phase 6 — Accessibility, Responsiveness, QA, Deploy (Days 26–28)
- Every gallery tile is a real `<a>`/`<button>` under the visual blob — the goo filter and hover effects must never be the *only* way to trigger navigation; keyboard focus and click targets work identically to a plain grid.
- `prefers-reduced-motion`: replace the live hero raymarcher with a static rendered frame (pre-render one attractive pose to an image) and disable the cursor trail and magnetic buttons — most of this site's "liquid" identity is motion, so the fallback should still look intentional, not broken.
- Responsive: raymarched hero simplifies (fewer metaballs, lower step count) or is replaced by a simpler CSS gradient blob on small/low-tier mobile screens.
- Alt text on all gallery images independent of the visual effects layered on top.
- Deploy: gallery images through an image CDN with responsive `srcset`; HDRI environment map compressed and cached aggressively (content-hashed, long `Cache-Control`).

---

## 5. Key Code Techniques

**Smooth-minimum SDF blend (GLSL):**
```glsl
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sceneSDF(vec3 p) {
  float d = sphereSDF(p - uBallPos0, uBallRadius0);
  d = smin(d, sphereSDF(p - uBallPos1, uBallRadius1), 0.6);
  d = smin(d, sphereSDF(p - uBallPos2, uBallRadius2), 0.6);
  return d;
}
```

**Raymarch loop skeleton:**
```glsl
vec3 ro = cameraPos;
vec3 rd = normalize(viewDir);
float t = 0.0;
for (int i = 0; i < 64; i++) {
  vec3 p = ro + rd * t;
  float d = sceneSDF(p);
  if (d < 0.001) { hit = true; break; }
  t += d;
  if (t > 20.0) break;
}
vec3 normal = estimateNormal(ro + rd * t); // central-difference gradient
```

**SVG goo filter (shared defs, CSS-driven):**
```html
<svg style="position:absolute; width:0; height:0;">
  <filter id="goo">
    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
    <feColorMatrix in="blur" mode="matrix"
      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" />
  </filter>
</svg>
```
```css
.goo-group { filter: url(#goo); }
```

**GSAP Flip shared-element transition:**
```js
const state = Flip.getState(tileEl);
setDetailOpen(true); // React re-render swaps layout
requestAnimationFrame(() => {
  Flip.from(state, { duration: 0.8, ease: "power2.inOut", absolute: true });
});
```

---

## 6. Performance Checklist

- [ ] Raymarch step count capped (~48–80) and resolution-tiered
- [ ] Raymarched layer rendered at half resolution, composited up
- [ ] Raymarching reserved for the hero (+ optionally cursor trail on high tier only)
- [ ] All other "metaball" moments use the SVG goo filter, not WebGL
- [ ] Pointer-driven uniforms throttled to `rAF`, not raw `mousemove`
- [ ] FBOs/render targets disposed on unmount

## 7. Best-Practice Checklist

- [ ] Gallery navigation works with keyboard/no-JS-visual-effects as a baseline
- [ ] Goo filter tested and gracefully degraded on Safari
- [ ] Reduced-motion fallback still looks like a deliberate design, not a broken page
- [ ] Shared filter defs, not duplicated per component
- [ ] Image assets served responsively via CDN

---

## 8. Suggested Timeline

| Phase | Duration |
|---|---|
| 0. Setup | 2 days |
| 1. Foundation | 2 days |
| 2. Liquid engine | 7 days |
| 3. Sections/Gallery | 7 days |
| 4. Interaction | 3 days |
| 5. Performance | 4 days |
| 6. QA/Deploy | 3 days |
| **Total** | **~4 weeks** (1 developer, full-time) |
