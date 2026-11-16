# Liquid Night — connected city (current)

Liquid Night is the canonical homepage at `index.html`, promoted for public community feedback on October 25, 2026. `designs.html` forwards old URLs to it with query/hash preservation; `community.html` retains the previous bento page. Future work extends this Liquid Night baseline. Open Studio, City of Swift and the comparison chooser remain commented out. Older notes below are historical.

## Navigation

The retained bento page and Liquid Night use floating, rounded glass navigation inspired by [Swift Bengaluru](https://swiftbengaluru.org/). Their implementations remain separate: retained bento markup and hash tabs live in `community.html`, `css/navbar.css`, and `app.js`; Liquid Night uses `index.html`, `designs.css`, and `designs.js`. The shared homepage stylesheet also styles the existing privacy-page navbar.

Both bars place the community brand left and links right, switching to native `<details>` menus below 768px. Menus retain all existing destinations, 44px controls, visible focus, outside-click and link dismissal, and Escape with focus returned to the summary. Short viewports scroll the dropdown; reduced transparency uses an opaque bar. Liquid Night measures the full sticky wrapper, including its top gap, for anchor clearance and pinned-story positioning. No refraction renderer or dependency is added.

Run `node navigation.check.mjs` for retained bento routing, desktop/mobile selection, feature deep links, and menu/focus behavior; `node designs.check.mjs` covers Liquid Night menu dismissal and existing offsets/content/story behavior. Visual layout requires HTTP browser review.

## Footer

Liquid Night has one page footer outside `main`. It replaces the former footer and design-preview strip, showing the community name, Code of conduct / Privacy policy / Email us links and “Built by Abhishek Patel” credit. The November 3 local update links the credited name to the user's supplied `https://abhishek-patel-in.github.io/`, opening safely in a new tab. Following the user's final-row screenshot reference, the full existing community/trademark disclaimer is centered on a muted edge-to-edge strip at the bottom. Independence wording appears only in that sentence. The public theme label is removed; team and Instagram remain in existing navigation/community sections. Desktop uses three columns above the strip; phones stack the same content and wrap links with 44px-high targets. `syncLiquidLocation` no longer writes the removed preview label. The retired comparison controller remains commented out.

Run `node designs.check.mjs` for the homepage and legacy routing, then inspect footer wrapping, keyboard focus and links over HTTP. The initial November 1 consolidation passed at 1114, 768, 390 and 320px. The final-row follow-up passed at 1114, 390 and 320px without document horizontal overflow or captured browser warnings/errors; its text contrast is 4.60:1. The user approved the final footer on November 1; releases follow the existing feedback-publishing workflow.

## Scroll motion

The user approved the November 2 homepage order: city hero, Learn / Build / Belong story, then event archive, followed by the existing programs and remaining sections. The story and events sections are moved in the document itself, keeping reading and keyboard order aligned with the visual layout. IDs, content, navigation destinations and motion behavior are preserved; publication is a separate step.

The Learn / Build / Belong story uses a pinned stage. On windows at least 900px wide with 600px available below navigation, `designs.js` enhances the existing markup: the headline stays beside one large chapter card while ordinary page scrolling changes chapters over 1.8 viewport heights of travel. The November 2 spacing refinement caps the visible stage at 600px, bringing cards and chapter controls closer together. The wrapper adds the same 1.8 viewport heights of scroll travel to the actual stage height; progress and chapter destinations subtract that stage height rather than the viewport. Fit checks also use the actual stage, so larger text that exceeds it returns to ordinary flow. Each chapter holds for reading, then adjacent chapters crossfade using a smoothstep curve; opacity, up to 40px vertical travel, and up to 4% scale change follow scroll position directly. Pausing holds the current blend; scrolling upward retraces it. The stage releases into the next section at its end. Native chapter buttons scroll smoothly to each chapter's center and expose their selected state; direct hashes land instantly. No wheel/touch interception, animation timer, or dependency is added; updates reuse the existing animation-frame scheduler. The user approved the local preview on November 2 and requested committing the spacing changes. Publication remains a separate release step.

Only the dominant pinned chapter accepts pointer/keyboard input and appears to assistive technology; adjacent card backgrounds can both be visible during a blend. Text fades out before incoming lettering appears, avoiding doubled headlines when pausing midway. A chapter containing focus stays fully legible until focus leaves it. Small/short windows, reduced motion, unavailable JavaScript, and content taller than the stage retain the ordinary layout with all chapters visible; printing also restores the ordinary layout. Font and element resizing recheck the fit. Direct chapter hashes select the corresponding scroll position. The native story headline remains untransformed, and city artwork/hit regions are excluded.

Other section headings, impact numbers, the app overview, and the closing headline retain native CSS view-timeline fade/rise reveals (36px desktop, 18px below 768px). These reveals fall back to static content without timeline/range support, during reduced motion, forced colors, or printing; focused and targeted content bypasses them. CSS timeline reference: [MDN view timelines](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline/view).

Run `node designs.check.mjs` for chapter boundaries, partial fades, exclusive text handoff, bounded movement/scale, continuity, exact reversal, stopped-scroll stability, focus retention, chapter buttons/hashes, and mobile/short/overflow/reduced-motion fallbacks. On October 24, the HTTP preview was reviewed in the in-app browser at 1195×1224. Both handoffs, paused blends, and section release passed; the stage stayed 72px below the viewport top while pinned. At 13 identical scroll positions, reverse scrolling reproduced the exact card/text opacity values. An initial doubled-headline issue was fixed and reviewed again; no console errors were captured after reload. Screenshot: `/tmp/swift-pinned-browser-verified.png` (outside the checkout).

Phone-sized browser review also passed on October 24 at 390×844 and 320×568. The story used its normal-flow fallback: one column, every chapter/copy fully visible and non-inert, no horizontal overflow, and 44px-high chapter links. Scrolling through the cards into the following section and back reproduced the same positions without stuck pinning. Screenshots: `/tmp/swift-mobile-390-verified.png` and `/tmp/swift-mobile-320-verified.png`. The temporary viewport override was reset after review; no product changes were needed.

Remaining browser coverage: buttons/Tab order, direct hashes, other viewport sizes, 200% zoom, reduced motion, print, and physical devices. No frame-rate or physical-device performance measurement is claimed.

## Closing headline glass

The current closing headline adapts the [React Bits Fluid Glass 320px blob](https://reactbits.dev/components/fluid-glass?size=320&shape=blob), requested after feedback version 2. It uses the reference's signed-distance blob, ray tracing, spectral dispersion and studio reflections, without React or another dependency. The matching MIT + Commons Clause notice and attribution remain in `headline-glass.mjs`. The old `story-glass.mjs` prototype stays unmodified and inactive.

Version 2 used direct SVG displacement of native text. Applying the new blob's much stronger bending through an eight-bit displacement map produced rough letter edges, so the blob interior now uses WebGL text sampling. A cached SVG coverage mask removes original lettering only beneath that interior; all surrounding text keeps its native HTML paint. This prevents doubled letters while retaining sharp native type outside the blob. Typography and the existing gradient are measured from the DOM and cached on size/font changes. Pointer frames never repaint/upload text or read pixels back. No `foreignObject`, backdrop capture or second renderer is used.

Fine pointers move one blob, at most 200px wide (slightly reduced from 220px after user review), with bounded spring deformation; touch and reduced motion use a still treatment, at most 128px. The transparent canvas bounds extend beyond the body's diameter. The fixed blob does not cycle shapes or drift continuously. Selection, printing, forced colors, increased contrast and reduced transparency expose complete native HTML. Rendering stops when settled, offscreen, hidden or suspended in the back-forward cache. Failed initialization, unavailable WebGL or context loss restores the native heading. Small-screen type still fits at 320px. The pinned story and cityscape stay independent.

Run `node headline-glass.check.mjs` for mask boundaries, shader declarations, cached uploads/readback, finite motion, idle/offscreen/selection/reduced-motion/print/bfcache behavior, GPU failure and cleanup. Actual Safari/Chromium checks remain necessary for shader compilation, gradient typography, optical appearance and native text painting.

## Reviewer feedback: profiles, chronology and galleries

Liquid Night keeps approved profile data and portraits. Crew cards have one “Visit profile” link and conditional “Read bio” buttons; speaker photo buttons reveal a three-line biography preview and conditional “See more” action. Speaker names and LinkedIn links stay visible. A shared native dialog shows safe text paragraphs, retains authored breaks, provides a keyboard-focusable scrolling biography region, locks background scroll, and restores focus on dismissal. Its link copies the invoking card's destination and label. Three-line previews are enabled only when the dialog is available; short biographies need no popup. Overflow is rechecked on resize, font changes and directory disclosure, with no polling.

The November 2 team cards follow the selected blue-framed Swift Ahmedabad badge reference: cobalt holders around pale paper inserts, the existing community mark, rectangular initials and prominent names. Current crew data has no portraits; none are borrowed from speaker profiles. Card heights grow with content, with four columns on wide screens, two at 1100px and below, and one below 768px. At that approval, the four-person preview and native directory disclosure retained all 20 people in their original order. Biography buttons/dialogs and profile links retain 44px minimum action heights. Styles are scoped to the Liquid Night crew, with system-color and visible-focus fallbacks. The user approved those badges on November 2; publication history is recorded in the feedback log.

The November 3 update adds Abhishek Patel as the 21st crew member with his approved role and biography. His photo is explicitly deferred; the existing AP initials remain. Optional `profileUrl` selects one HTTPS profile destination (LinkedIn, GitHub, Twitter or a personal website), falling back to existing `linkedIn` values; optional `role` is escaped and displayed separately. The retained bento cards consume these same fields without changing layout or ordering. Liquid Night keeps the first four crew fixed and sorts only the expanded 17 by per-page random ranks, cached by profile destination. Opening/closing or retrying content preserves that order; a page reload generates new ranks without rewriting JSON. Speaker ordering and destinations remain separate. Homepage/navigation/cityscape/optics checks and desktop/390/320px HTTP review passed; reload and disclosure behavior, biography link/focus return, one link per badge, 44px footer/dialog links and no document overflow were verified. The user accepted the preview and requested commit/publication; see the feedback log for release status. Physical-device and spoken screen-reader checks were not performed.

Speaker recency is derived from optional `date`, `speakerIds` and `source` fields on the ten verified event records in `events.json`. Dates are local Ahmedabad calendar dates, not UTC slices of the generated timestamps. Evidence comes from the pinned Talks snapshot's events, talk–speaker links, and named `type: talk` agenda entries, including community updates. IDs are deduplicated and restricted to the 30 approved profiles. Only explicitly completed `Past event` records dated no later than today qualify. No speaker/date is inferred for the year-only WWDC26 record.

The March folder says 2025, but its pinned `Info.yml` explicitly says **March 14, 2026**; the user approved that correction. The regression check protects it and Ratnesh Jain's named community update. Dates and appearance evidence belong to events; no latest-date fields are maintained on speaker profiles. The speaker row uses this newest-first order, with English alphabetical ties and undated speakers last. Failed event loading or invalid chronology keeps readable alphabetical profiles with a recency/retry notice.

The November 1 speaker cards follow the user’s cover-flow reference: square photo cards, angled neighbors and fading mirrored portraits. All 30 speakers share one native horizontal row; crew retains its four-card preview and expanded directory. Original portrait files stay unchanged, and decorative mirror images reuse the same URLs with native lazy loading. The first speaker starts centered. Arrows step one speaker; the focused row supports Left/Right and Home/End. Tabbing into a card centers it. Static `.speaker-slot` wrappers own snapping while only their articles transform, preventing transform/scroll feedback. Updates run on scroll/resize without an idle loop. Reduced motion removes depth and overlap. Unsupported/failed dialogs expose full text; failed portraits retain initials. Existing hover, activation, outside-click, Escape and dialog focus behavior is preserved. The user approved these local cards on November 1; publication remains separate.

Events use a manually scrolling row at every size, with one-card arrow steps, proximity snapping and boundary states. The app gallery's existing single row extends to the page edges, showing all 19 replacement Community Talks screenshots with page-sized manual steps. Its controls and heading keep normal gutters. Both galleries derive limits from current geometry after scroll/resize; unavailable buttons remain focusable but do not activate. Contact uses a separate inset panel class, keeping card styling off the section wrapper.

Run `node designs.check.mjs`, `node navigation.check.mjs`, and `node cityscape.check.mjs` alongside the optics check. Check 320px layouts, dialog keyboard behavior, gallery endpoints, 200% zoom, and actual Safari/Chromium painting. Publication is a separate release step; use the current release record before reporting local changes as live.

## Story headline glass

Retired October 22 at the user's request. The page no longer loads `story-glass.mjs` or mounts its canvas/hook; the heading retains its spacing and native text. The prototype module and check were tracked on November 3 under the commit-everything request; both remain inactive and outside the public runtime. Notes below describe that inactive prototype, not the current page.

`story-glass.mjs` enhances only “One connection. So many possibilities.” The native `h2`, explicit line break, muted span, selection, and surrounding links remain intact. `designs.html` reserves the stage before initialization; the canvas never receives pointer or keyboard input.

The October 21 revision follows the user's request for an Apple Liquid Glass-inspired material: a thinner lens, neutral clear center, opposing edge highlights, lighter shadow, and no rectangular studio reflection. Maximum diameter is now 192px desktop / 128px mobile, with measured placement shrinking to 96px or omitting the effect. Refraction is capped at 0.075em desktop / 0.045em mobile. This is a web approximation for the requested decorative headline, not Apple's native material or its recommended control-layer placement. Apple's [material guidance](https://developer.apple.com/design/human-interface-guidelines/materials) reserves Liquid Glass for navigation and controls.

Fine mouse pointers at widths of at least 768px can move the lens within the stage. Touch, reduced motion, and sustained slow rendering use a still treatment. Selection, printing, increased contrast, forced colors, and reduced transparency expose plain HTML. Frames stop after settling, offscreen, or while the document is hidden. No idle animation is scheduled.

DOM ranges and a temporary baseline mirror measure the fixed headline; complete line runs form a cached texture. The opaque optical interior prevents double letters. Unsupported measurements use non-overlapping decorative glass where space permits. WebKit uses that decorative fallback because its visual typography proof showed a raster seam despite matching widths. Crowded layouts can retain the heading alone. A nonuniform backdrop disables enhancement; the module documents these fixed-headline and solid-backdrop limits with `ponytail:` comments.

Provenance: optical field, normals, ray tracing, and reflection helpers adapted from [React Bits FluidGlass at 382dc89411ce8446ef2b2ed99e352c44a53a1b54](https://github.com/DavidHDev/react-bits/blob/382dc89411ce8446ef2b2ed99e352c44a53a1b54/src/content/Components/FluidGlass/FluidGlass.jsx). The complete matching MIT + Commons Clause notice remains in the module. No React, screenshot dependency, media asset, or external service was added.

Run `node story-glass.check.mjs`, `node designs.check.mjs`, and `node cityscape.check.mjs`. All passed on October 21, 2026. The glass check covers placement, crowded mobile fallback, input/accessibility modes, one-frame scheduling, cancellation, unavailable WebGL, initialization ownership, stale font callbacks, and cleanup.

Earlier browser checks on the superseded material passed selection, print handling, dynamic reduced motion, context recovery, and ten-second intervals with zero draws. Its Chromium motion trace recorded 10.5ms p95 intervals and a final draw about 501ms after input on an Apple M4 Mac mini; that is not a fresh performance result for the revised shader or a confirmed 60Hz hardware test. Current visual/shader startup verification is pending: the browser tool denied access to the existing preview under its URL security policy. Updated desktop/mobile screenshots, complete Safari viewport coverage, 200% zoom, quality downgrade measurements, physical-device interaction, and spoken screen-reader checks remain outstanding. No deployment has occurred.

## Artwork and registration

Original illustrations generated with the built-in imagegen tool from the approved Option B hover sketch. [Complete prompts and source IDs](liquid-city-prompts.md).

| Layout | File | Dimensions | Transfer size |
| --- | --- | --- | --- |
| 768px and wider | `liquid-city-desktop-v3.webp` | 1672 × 941, approximately 16:9 | 519,008 bytes |
| Below 768px | `liquid-city-portrait-v3.webp` | 900 × 1200, 3:4 | 375,678 bytes |

RGB WebP exports, quality 88, method 6. Desktop preserves generated size; portrait resizes from 1086 × 1448 using Lanczos. These are artistic interpretations, not photographs or geographically accurate maps.

The base uses the inline SVG `liquid-city-glass` color matrix for smoky blue/silver. All eight masked color layers reuse the exact same master pixels. This deliberate simplification prevents silhouette drift and lets the browser reuse a single cached download per layout. Color layers still decode independently and retain individual failure handling. No eight additional full-size assets are needed; combined transfer stays within both initial and overlay budgets.

All art fills the same stage. Full `--region` mask polygons and matching `--hit` target polygons are in the connected-city geometry section of `designs.css`. Never reposition a region independently of the master. Replacing a composition requires re-tracing that layout. Small architectural openings stay inside the outer hit polygon (documented `ponytail:` limit); mobile stadium/Ashram hit areas extend to at least 44px without scaling artwork.

### Traced bounds: x, y, width, height (%)

| Landmark | Desktop | Portrait |
| --- | --- | --- |
| pol | 0, 10.4, 35.8, 55.4 | 0, 23.7, 37.2, 36.9 |
| jaali | 0, 27.2, 17.6, 38.6 | 0, 36.7, 21.4, 23.8 |
| gate | 36.2, 41.4, 21.7, 27.4 | 36.3, 43.3, 26, 18.7 |
| chabutra | 62.2, 29.8, 8.1, 28.2 | 61.6, 30.7, 14.8, 21.9 |
| stadium | 74.9, 40.6, 20.5, 11.6 | 74.6, 37.3, 25.4, 8.2 |
| ashram | 72.8, 56.6, 23.7, 12 | 67.1, 53.1, 32.9, 9 |
| stepwell | 1.3, 70.5, 27.7, 27.1 | 0, 67, 47, 26.1 |
| bridge | 30.4, 72, 69.6, 20.3 | 42.4, 72, 57.6, 16.9 |

## Interaction and accessibility

Layer order: master 0, atmosphere 1, color regions 2, river sheen 3, native buttons 4, HTML identity 5, shared popup 10; navigation above the hero. Decorative art stays hidden from assistive technology. Named buttons expose expanded state and panel relationships; one always-mounted polite status region announces selection.

`cityscape.mjs` owns one active landmark and input ownership. Mouse exit has 350ms grace to reach the popup. Latest deliberate mouse/keyboard/touch input wins. Touch toggles, outside tap/close/Escape dismiss, and offscreen exit clears selection. Close returns focus without reopening. Resize preserves keyboard/touch selection and changes responsive art/masks together.

Desktop popup tries above/right/left/below while avoiding identity, navigation, selected target and viewport edges; the reserved slot is the fallback. Phones always use the slot. The heading, description and meetup link layer over the sky on desktop, matching the published composition. CSS grid places text above the artwork's visual layers. Phones, oversized text and the original static HTML use a separate normal-flow row above the city. The fit check measures the shared multilingual word box and available stage height. Atmosphere drift is clamped to 12px; artwork/hotspots remain locked. Reduced motion makes reveals immediate and decorations still.

A failed color layer keeps glass and story. A failed base shows the text landmark list. Optional source elements stay inert until the matching layout is chosen; the other layout does not download initially.

## Description references

- [Sidi Saiyyed jaali — Gujarat Tourism](https://gujarattourism.com/central-zone/ahmedabad/siddi-sayed-mosque.html)
- [Pols and community spaces — Gujarat Tourism](https://gujarattourism.com/accommodation/heritage-hotel/french-haveli.html)
- [Teen Darwaza's three arches — Gujarat Tourism](https://gujarattourism.com/central-zone/ahmedabad/jama--jumma--masjid.html)
- [Chabutra — Ahmedabad Municipal Corporation](https://heritage.ahmedabadcity.gov.in/details/30130/heritage_site/evening-walk/en), [bird-feeding tradition discussed by heritage officials](https://indianexpress.com/article/cities/ahmedabad/know-your-city-how-chabutros-ahmedabads-pol-culture-9013991/)
- [Narendra Modi Stadium — Gujarat Cricket Association](https://gujaratcricketassociation.com/narendra-modi-stadium/)
- [Hriday Kunj — Sabarmati Ashram](https://www.gandhiashramsabarmati.org/en/ashram-sites/ashramlocation/MTM1.html)
- [Adalaj Vav — Ahmedabad district](https://ahmedabad.nic.in/tourist-place/adalaj-vav/)
- [Atal Bridge — Gujarat Tourism](https://gujarattourism.com/central-zone/ahmedabad/atal-bridge.html)

## Restoring retired themes

Restore together: `RETIRED` chooser/world/SVG blocks in `designs.html`; archived selector branches in `designs.css`; comparison controller, Aurora dock/observer/room tabs and lifecycle hooks in `designs.js`; retired tests and three-world fixture in `designs.check.mjs`. Remove single-theme `syncLiquidLocation` initialization/listeners so they cannot fight the restored chooser. Restore comparison offsets and height measurements together. Retained assets currently have no active references.

## Verification and release

Run `node designs.check.mjs` and `node cityscape.check.mjs`. Tests cover single-theme markup, legacy URLs/anchors, JSON content/security/retries/gallery, reduced motion, state/input transitions, popup collision/travel, close/focus/Escape, hybrid touch, responsive loading, failed/slow assets, offscreen dismissal and image budgets.

Implementation QA: both Node checks passed again on 2026-10-12. Browser review covered Chromium at 320, 390, 768, 1024 and 1440px, keyboard selection of all eight landmarks, and Safari rendering with enlarged text. A locally served `/community/` project subpath loaded artwork and community data and resolved legacy theme URLs correctly. Touch transitions and image failures are covered by the event harness; physical iPhone interaction and spoken VoiceOver output still need device testing. The in-app browser was unavailable during the final continuation, so no fresh final screenshot was captured.

Publishing stays separate. Asset and JSON requests remain relative for GitHub Pages project subpaths. No build service, framework, API key or new dependency is required. Local Node checks are not part of the deployed runtime.

---

# Historical artwork and theme notes (retained)

# Design preview artwork

Generated with the built-in imagegen tool for the local design concepts. JPEG exports preserve the original composition. These are illustrative assets, not photographs of a Swift Ahmedabad event or venue.

## Liquid Night — independent landmarks

Liquid Night now uses eight independently positioned transparent landmarks, with the community mark, glass panels, labels, light trails and atmospheric background kept as HTML/SVG/CSS layers. Navigation, hero and community surfaces span the viewport with responsive internal gutters. The original dusk collage remains available for Theme 3.

Files: `liquid-jaali.webp`, `liquid-gate.webp`, `liquid-chabutra.webp`, `liquid-bridge.webp`, `liquid-pol.webp`, `liquid-ashram.webp`.

Generated using the built-in imagegen tool with `transparent_background: true`. The existing dusk collage was supplied as an architectural reference, not as the final composition. These are artistic interpretations, not accurate architectural models. WebP exports retain transparency.

Shared prompt, used once per subject below:

> Use case: stylized-concept. Asset type: individual transparent landmark asset for the Liquid Night Swift Ahmedabad website. Reference image is subject identity only, NOT its colors, background or composition. Render ONLY [subject]. Style: exquisite miniature architectural sculpture cast from translucent smoky optical glass and polished silver, restrained icy-blue and soft violet rim lighting, realistic beveled edges, physically convincing glass refractions, crisp detailed silhouette. Match a premium Apple-inspired dark #060609 interface, monochrome silver/periwinkle/indigo palette, restrained illumination with dark interiors. No warm sandstone, orange, pink, green or multicolored painted surfaces. No scene, skyline, backdrop, floor, sky, water, reflection plane, fog, surrounding objects, typography, logo or UI. Genuine transparent background including openings, ample tight clear margin around a complete uncropped single subject. Architectural identity recognisable; illustration, not a photograph. Asset must work independently from other landmarks.

Subjects:

- `jaali`: Sidi Saiyyed's Tree of Life jaali: one broad arched stone window with intricate branching tree lattice, framed by a clean substantial architectural arch. Front three-quarter view.
- `gate`: Teen Darwaza in Ahmedabad: a single freestanding historic gateway with THREE tall pointed arch openings, ornate parapet and carved facade. Wide horizontal three-quarter view.
- `chabutra`: Ahmedabad's traditional chabutra: one tall slender carved column supporting an ornate octagonal bird-feeding pavilion with columns and a pyramidal roof and finial, on a small stepped base. Full object from base to finial.
- `bridge`: Ahmedabad's Atal pedestrian Bridge: an elegant long low sweeping white tubular triangular truss footbridge with kite-inspired inset canopy panels and two slender piers. Entire bridge, wide horizontal three-quarter side view. No river or ground.
- `pol`: One small cluster of THREE Ahmedabad old-city pol houses with ornate carved wooden balconies, traditional facade windows and flat rooftops, compact frontal three-quarter view. No trees, ground or surrounding buildings.
- `ashram`: Sabarmati Ashram's Hriday Kunj: one modest single-storey house with distinctive low tiled sloped hip roof, open shaded verandah supported by simple columns, minimalist facade. Front three-quarter view. Full house isolated.

GitHub Pages compatibility: the preview is static HTML/CSS/JavaScript, with same-origin relative JSON and asset paths. Publish `designs.html`, `designs.css`, `designs.js`, the referenced JSON files and assets together to serve `/designs.html?design=glass`. The existing `index.html` is still the homepage; promoting Liquid Night to the root homepage is a separate release step.

## Open Studio

Theme 2 now follows the community-home pattern from [Swift Pune](https://swiftpune.org/): logo-led split hero, warm neutral surfaces, three program cards, a crew directory, a host note and history, community channels, and a grouped footer. It uses Ahmedabad’s own mark and existing JSON content. The previous illustration is retained as an unused concept asset.

File: `birds-in-flight.jpg`

Prompt:

> Use case: stylized-concept. Asset type: art-directed hero illustration for a modern Swift developer community event website, a clean white-and-coral event magazine. Create an exceptional sculptural 3D still-life on a solid vivid coral vermilion background #fa583d. Three beautiful abstract folded paper birds in offwhite / warm ivory, one large in center in flight, two smaller around it, strongly angular dynamic shapes evoking a swift bird without text or logos. A large offwhite sculptural hollow ring stands vertically at slight diagonal, with birds flying through it; small coral spheres, graphic cream shadow. Physical materials matte paper and smooth ceramic. Strong directional studio light, clean architectural shadows, playful contemporary art gallery installation. Frame full scene with generous but not excessive coral negative space. Sophisticated eye-catching composition, limited palette coral and cream only, no gradients as background, no metallic reflections, no text or letters, no frames, no UI, no watermark. Wide landscape ratio 3:2.

## City of Swift

Theme 3 takes visual inspiration from [Swift Bharat](https://swiftbharat.org/): bold dimensional type, a peach, lavender, ivory, copper, and midnight-blue dusk palette, an illustrated city collage, ticket-shaped event cards, and community tabs. All events, team members, links, and app content remain Ahmedabad's existing content.

File: `ahmedabad-landmarks-dusk.png` — the original illustration edited with the built-in imagegen tool to replace the lime sky with an Ahmedabad sunset. The earlier `ahmedabad-landmarks.png` is retained as an unused iteration. This is an artistic collage of Ahmedabad landmarks, not a photograph or a geographic reconstruction. The community's existing chabutra-and-bird mark remains in the navigation, welcome badge, and footer treatments. No Swift Bharat artwork was copied.

Landmark references: [Sidi Saiyyed's Tree of Life jaali](https://gujarattourism.com/central-zone/ahmedabad/siddi-sayed-mosque.html), [Ahmedabad heritage and pols](https://gujarattourism.com/central-zone/ahmedabad.html), [Atal Bridge](https://gujarattourism.com/central-zone/ahmedabad/atal-bridge.html), and [kite-inspired bridge design](https://www.sabarmatiriverfront.com/gujarati/atal-bridge.html).

Original illustration prompt:

> Use case: illustration-story. Asset type: original panoramic Ahmedabad city illustration for a bold Swift developer community website. Create an art-directed maximalist Indian city festival poster illustration, detailed hand-painted gouache and crisp screenprint collage, architectural silhouettes with intricate fine line detail. Landscape 3:2 composition. Background perfectly flat electric chartreuse lime #e6ff59. Composition: colourful Ahmedabad landmarks form a continuous wide skyline in the LOWER TWO THIRDS, with generous empty lime sky in the upper third for HTML lettering. At far LEFT a large sandstone arched Sidi Saiyyed Tree of Life jaali, recognisable delicate intertwining tree branches carved in the stone arched window, accompanied by colourful old-city pol wooden havelis with carved balconies. Slightly left of centre Teen Darwaza: historic Ahmedabad pale warm sandstone RECTANGULAR gateway with THREE equal pointed arch openings and short crenellated parapet, no domed towers. At centre a traditional Ahmedabad chabutra octagonal elevated bird feeder pavilion on a slim decorated pillar, with a pitched canopy and tiny flying swifts, prominent but not a logo. At RIGHT more Ahmedabad pol architecture, vivid blue/pink/yellow/terracotta havelis and the low red-tiled veranda of Sabarmati Ashram. In the FOREGROUND a sweeping cyan-blue Sabarmati river #7ccbeb with Atal pedestrian bridge spanning diagonally from centre-left to right, recognisable white curved tubular steel framework with interlocking leaf/diamond-shaped trusses and red, orange, yellow and turquoise kite-inspired canopy panels, NOT a suspension bridge, no tall pylons, no boats. A few tiny colourful diamond Uttarayan kites with looping strings float over the skyline at sides. Limited vivid festival palette: lime, indigo #303787, azure, warm terracotta, sandstone, saffron, magenta, forest teal. Strong physical paper texture within buildings, clean flat background sky, richly layered but legible and deliberate, believable landmark forms while clearly an artistic collage rather than a geographic panorama or photograph. Edge-to-edge skyline and cyan river along bottom edge. No words, letters, dates, logos, UI, frames or watermark. Do not include Mumbai Gateway of India, Sea Link, Mumbai domes, ferries, Delhi monuments or generic skyscrapers. Beautiful, confident, playful cultural identity. Make specifically Ahmedabad, Gujarat.

Sunset edit prompt (built-in imagegen, using the original local illustration as the reference):

> Edit the supplied Ahmedabad illustration, keeping the exact composition, architecture, landmark positions, bridge, river, birds, colorful kites and meticulous illustrated detail. The user loves this image but dislikes the fluorescent lime green sky. Replace all lime green sky and lime sky openings between architecture with a beautiful, sophisticated Ahmedabad dusk: a seamless pastel gradient from dusky periwinkle and muted lavender at the very top, through soft dusty rose, to luminous peach and pale warm apricot near the horizon. No green or chartreuse in the sky. A warm, dreamy twilight, rich but tasteful, with subtle atmospheric texture and soft golden light catching the sandstone. Preserve colorful historic pol houses, the Sidi Saiyyed tree lattice, Teen Darwaza, chabutra, Sabarmati Ashram, and Atal Bridge exactly. Keep foliage naturally green. Gently tune the river reflections to peach, lavender and blue from the new sky while retaining the vibrant turquoise water and kite-colored reflections. Avoid a dark night scene; this should remain bright, joyful and readable with beautiful contrast. Preserve original full frame and proportions. Do not add text, logos, new architecture, objects or borders.

## Previous lounge concept (unused)

File: `community-lounge.jpg`

Prompt:

> Use case: stylized-concept. Asset type: hero artwork for a sophisticated Swift developer community website called Swift Ahmedabad, dark forest-green and copper visual theme. Create a very high-end editorial 3D still life of a welcoming developer lounge, miniature architectural diorama, not a photograph of a real event. Wide landscape composition. A beautiful round rich walnut communal table with two slim open aluminum laptops, small ceramic coffee cups, a notebook, one small plant, comfortable moss green sculptural chairs, set in a deep forest green architectural space with large rounded arch alcoves, subtle carved architectural detail inspired by Ahmedabad. Warm copper sunlight enters diagonally from upper right making beautiful shadows, textured plaster and wood. Art-directed premium furniture catalog meets modern technology brand. Eye-level elevated three-quarter view, scene fills frame, no people. Right side dominated by glowing amber arch and table, left fades into deep forest green shadow. Colors: deep #132d28, muted sage, dark walnut, cream, copper #c99972. No text, no letters, no logo, no UI, no frames or watermarks. Make scene intimate, tactile, refined, welcoming, and stunning with exceptional material texture. Landscape ratio 3:2.

## Swift Ahmedabad mark

File: `ahmedabad-mark.png` — transparent monochrome adaptation of the existing `assets/swiftAhmedabad.jpg`, edited with the built-in imagegen tool. The site's SVG mask applies white/iridescent, muted rose/amber, or copper color to this same mark for each theme.

Prompt:

> Edit target: attached original Swift Ahmedabad community icon. Precise background extraction only. Remove the solid orange background completely and produce genuine transparent pixels there. Preserve EXACT original composition, square framing, Ahmedabad chabutra tower architectural silhouette, all tower line details and flying swift bird at upper right. Convert the entire existing foreground artwork (tower and bird) to a clean single white monochrome mark on transparency. Preserve visible linework and silhouette by making darker orange outlines transparent so the mark has the same negative-space architectural detail. Do not redesign, redraw, replace with Apple Swift logo, add text, move, simplify, or crop away any tower or bird. Output transparent PNG, original proportions, sharp clean antialiased edges. The final graphic will be tinted with CSS to fit three website color themes.

## Real event artwork

The event cover images are the public covers from Swift Ahmedabad's own Luma listings:

- `wwdc-2026.jpg`: [WWDC26 Watch Party](https://luma.com/b08evqjf)
- `july-2025-meetup.jpg`: [July 2025 Meetup](https://luma.com/fu6yaqfs)

The February 2025 listing links to [the original event](https://luma.com/ghp1rm2g). Its date graphic is a website treatment, not a claimed original event poster.

## Content maintenance

The active Liquid Night page uses these local content sources:

- `links.json`: community identity, descriptions, email, and nine social/community destinations.
- `programs.json`: program names, descriptions, statuses, and destinations.
- `team.json`: the complete team directory and LinkedIn profiles.
- `speakers.json`: 30 Ahmedabad speaker profiles in a separate section, with pinned Talks source URLs. Names and two recovered YAML links follow the user's confirmations; biographies reflect event submissions. Source-verified portraits live in `assets/speakers/`, with `imageSource` and `imageSha` provenance in each photo record. Original bytes are preserved; photos load lazily and failed images reveal initials. Gokul remains initials-only. The user confirmed the Nishchal Visavadiya, Tushar Thakar and Riddhi Khunti filename-spelling mappings; 29 speakers have approved portraits. Future unclear identity mappings require confirmation before use.
- `sponsors.json`: past hosts and the invitation to host. Optional `logo`, `logoSource` and `logoSha256` fields retain local original artwork, its exact official source URL and SHA256 checksum; see [Sponsor logos](#sponsor-logos).
- `app.json`: Community Talks identity, unchanged App Store/TestFlight destinations, and all 19 feature screenshots in `assets/CommunityTalksAssets/`. Shared by Liquid Night and retained bento app views.
- `contact.json` and `sponsorship-email.json`: speaker submissions, email contacts, and the existing sponsorship email draft.
- `events.json`: curated published event history, with direct source links. This is an editable archive, not a live Luma API feed. New events should be added here; the upcoming-event links always go to the community's Luma calendar.

The 2025 annual impact/statistics blocks are removed from both active pages. `stats.json` retains the historical Talks report values for reference, but neither page fetches or displays them. The report alone does not provide attendance records that independently validate participant totals or averages. Restore statistics only with supporting records.

Shared files also feed the homepage, whose speaker and team tabs remain separate. Serve the site over HTTP; content files are fetched from the same origin. Verify with `node designs.check.mjs` and `node navigation.check.mjs`; inspect both pages after shared profile changes.

## Community Talks and Connect marks

User approved the local preview November 2, 2026 and requested committing the Community Talks and Connect changes. The user subsequently requested publishing everything; this update is live in feedback version 11 on November 3. The user supplied `Community-Talks-Screenshots.zip` and `CommunityTalksLogo 2.png.zip`, confirmed replacing the entire old gallery with all 19 screenshots, approved the filename-based order/titles, and retained both download destinations. `app.json` now carries Community Talks branding, factual screen captions and relative local asset paths. Screenshots are 750×1624 JPEG web copies at quality 85; the supplied logo is a 360×360 PNG retaining alpha. Together the 20 web assets occupy 3,882,883 bytes, versus 40,661,973 source bytes. Originals remain in the supplied archives; source screenshots are neither cropped nor repainted. Old screenshot assets are retained but leave the displayed gallery. Existing feature identifiers are reused where equivalent; the old unmatched communities card is replaced by the confirmed new set.

The existing edge-to-edge manual gallery, phone frames and controls remain. Screenshot dimensions match the actual web copies; alternative text includes the current app name. Homepage app labels and retained app/support logo slots use the new identity. Narrow phones use a bounded app-title font size; through 900px the app destination remains in the navigation menu while its duplicate bar link is hidden to prevent tablet wrapping. Liquid Night JSON reads and both retained app-data readers revalidate cached responses using native `cache: 'no-cache'`, after browser review reproduced stale old JSON. Existing App Store/TestFlight URLs and version metadata are preserved.

The user's subsequent Connect-card screenshot request replaces the nine placeholder characters with decorative native SVG symbols in the existing homepage definitions. Six service paths reuse `app.js`'s existing brand artwork; Luma's star comes from its [official homepage](https://luma.com/), and the user explicitly confirmed the Zoho Arattai logo, whose geometry/colors come from its [official product icon](https://www.arattai.in/sites/oweb/images/producticon/arattai.svg). A location pin completes the set. Logo geometry is kept local, without runtime external image requests or a dependency. Link labels, destinations, card layout and accessible names remain intact. `links.json` is unchanged; the retained bento social renderer is separate.

Verification: extend `designs.check.mjs` for the 19 unique, ordered, readable asset paths, app identity, unchanged destinations and all nine resolved Connect symbols; `navigation.check.mjs` covers both app/support icons and all 19 retained feature cards. All four active Node checks pass. Local in-app HTTP review covered desktop, 768/390/320px layouts, complete screenshot loading, gallery progression/end bounds, keyboard button activation, retained feature navigation and no document overflow or captured warnings/errors. Physical-device, spoken screen-reader, fresh 200% zoom and Safari checks were not performed. The user accepted this preview and subsequently requested the full version 11 publication on November 3. Live desktop and 390/320px review passed; all 19 screenshots loaded and the original feedback link redirected correctly. See the [release record](../../phase-2-feedback.md#full-release--november-3-2026).

## Sponsor logos

The November 2 local P2-004 preview adds official artwork for all ten existing companies, without changing their names, order or destinations. Seven SVGs and three PNGs in `assets/sponsors/` are unchanged downloads referenced by the companies' own websites, including their linked CDNs. Pixster's original 1024px touch icon matches its inline header mark; no downloadable wordmark was available there. The source URLs and SHA256 checksums live with each record in `sponsors.json`. SVGs were checked for scripts, event handlers and external resources before inclusion.

Homepage cards keep the existing three-column desktop / one-column phone grid, with an 88px white logo panel above each visible company name. Full artwork is contained, without cropping or recoloring; PNGs use `scale-down` to avoid enlarging eClinicalWorks' small original. Images are lazy-loaded with empty alternative text because the adjacent name labels the same link. The existing captured image-error handler removes failed artwork, retaining readable text links. Only safe relative `assets/sponsors/` paths are accepted. The invitation has no logo. The retained bento renderer continues showing its existing text cards and ignores these optional fields.

Run `node designs.check.mjs` for local paths, source checksums, escaped names, destinations, missing artwork and failed-image fallback. `node navigation.check.mjs` covers the retained consumer. Desktop and 390/320px HTTP review passed for this preview. The user approved the sponsor logos on November 2 and requested committing them and updating the logs. Publication remains separate.

## Interactive Liquid Night cityscape

`cityscape.mjs` owns one active landmark. Names and descriptions live on the eight HTML controls; CSS positions artwork independently from hotspots. The bridge uses a broad polygon hit area matching its diagonal foreground span. Artwork is decorative; the buttons and shared live information panel provide accessible identification. Last deliberate input wins. Mouse exit has a 350 ms grace period to reach the panel. Keyboard focus reveals, Escape dismisses without moving focus, and touch/pen taps toggle. Blank-space presses dismiss. Resize clears hover selection and preserves keyboard/touch selection.

Desktop uses a panoramic collage; 761–1000 px adjusts its proportions, and 760 px and below uses a portrait composition. Reduced motion uses the site's existing global override. Eight optional `liquid-*-color.webp` images load independently near the scene after their glass counterpart loads. Failed color loads retain glass and usable controls/stories. Both versions stay in the same fixed artwork container; no node replacement or scale animation occurs.

Color counterparts were generated by editing each original transparent glass image. Export canvas dimensions match their source: jaali/gate/pol/ashram 900×600, chabutra 600×900, bridge 900×300. Generated architecture may have small local contour differences; these are illustrative material variants, not pixel-identical texture substitutions. Future asset replacement must preserve transparent canvas, crop, orientation and registration and be checked during the crossfade, not just at its endpoints.

Shared edit prompt:

> Edit this exact landmark cutout. Change ONLY surface materials and colors to its natural Ahmedabad appearance. Preserve exactly the input camera, silhouette, every architectural detail, original canvas aspect ratio, crop, object coordinates, margins, size and orientation. No geometry changes, no repositioning or zoom. Replace violet metallic glass appearance with warm realistic material colors in soft daylight. Same independent miniature illustration, no scene, people, additional objects, floor, shadow plane or background. Preserve transparent background and openings. This image will be opacity-overlaid on the original, so exact registration is critical.

Material directions: honey sandstone jaali; buff sandstone gateway; golden-brown wood/stone chabutra; white steel bridge with orange/red/turquoise/yellow panels; carved wood pol houses with turquoise/ochre/muted pink; cream plaster, brown columns and terracotta roof for the Ashram.

Include `cityscape.mjs` and all eight color assets alongside the existing preview files when publishing to GitHub Pages. No backend, build step or package dependency is required. Run `node cityscape.check.mjs` for interaction and asset checks and `node designs.check.mjs` for existing theme regressions. Visual checks should cover the connected composition, all eight reveals, focus outlines, hotspot overlap, 390 px portrait, tablet and desktop. A real touch-device and screen-reader pass remains useful before public release.


### Stadium, Stepwell and Riverfront expansion

New files: `liquid-stadium.webp`, `liquid-stadium-color.webp`, `liquid-stepwell.webp`, `liquid-stepwell-color.webp`, `liquid-riverfront.webp`. Stadium and Stepwell pairs use 900×600 transparent canvases. Riverfront uses 1200×400 and remains decorative, outside the paired-image loader. No numbered landmark markers remain. Invisible clipped buttons follow outer architecture outlines, with separate focus-outline wrappers so clipping cannot erase keyboard focus. Shared placement variables keep artwork and controls together; independently authored polygons exclude broad empty image margins.

Subjects use an elevated three-quarter miniature view. Stadium shows an open oval cricket bowl, roof ring and seating. Stepwell is an artistic cutaway of descending stairs, carved galleries and an octagonal well, not an architectural survey. Riverfront is a low two-level promenade with broad stairs, railings and sparse trees. Images are generated illustrations, not venue photographs.

Generation direction: exquisite detailed miniature sculpture of each subject made of smoky optical glass and polished silver, icy-blue/violet rim light, dark recesses; restrained silver/periwinkle palette; transparent background and openings; no labels, people, ground plane or surrounding buildings. Color edits preserve camera, geometry, canvas, crop, object coordinates and orientation: Stadium gains offwhite roof, orange/blue seating and green cricket field; Stepwell gains honey sandstone and softly shaded galleries. Compressed transparent WebP exports preserve the generated alpha.

Content/reference sources:
- [Gujarat Cricket Association: Narendra Modi Stadium](https://gujaratcricketassociation.com/narendra-modi-stadium/)
- [Gujarat Tourism: Adalaj ni Vav](https://gujarattourism.com/central-zone/gandhinagar/adalaj-ni-vav.html)
- [Sabarmati Riverfront](https://sabarmatiriverfront.com/)

Repositioning remains an artistic collage. Desktop/tablet separate the Stepwell from the jaali's main lattice; portrait places it below the jaali. Maintain eight keyboard controls and no numbered marker spans. Test at 320/390 px portrait, 820 px tablet and desktop, including empty-space and overlapping-architecture hit areas.
