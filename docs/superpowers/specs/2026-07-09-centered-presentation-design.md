# Design: Centered presentation mode (`presentationStyle: 'center'`)

Date: 2026-07-09

## Goal

Add a new presentation mode to `react-native-sheet` where the sheet appears as a
floating card in the **vertical center** of the screen (like a modal dialog)
instead of being anchored to the bottom. The entire screen behind the card is
dimmed. The card is dismissed by **swiping down** (the card follows the finger
and flies off) or by **tapping the dimmed background** (when `dismissable`).

The mode is opt-in via a flag, controlled entirely by the consumer app (e.g. the
app may enable it for tablets). No automatic device detection is built into the
library.

Platforms: **iOS and Android**, both delivered together, plus example screen,
unit test, and README docs.

## Non-goals

- No automatic tablet detection inside the library (the consuming app decides).
- No change to the existing bottom-anchored behavior (100% backward compatible;
  the new mode is off by default).
- No native corner-radius handling — corner rounding stays on the React Native
  content view, passed as a style property, per existing project convention.
- Centered mode does **not** combine with `useInlinePresentation`. When
  `presentationStyle: 'center'` is set, the sheet is always presented modally
  (own `UIWindow` on iOS / plain `Dialog` on Android); the inline flag is ignored.

## Public API

New optional params on `FittedSheetParams` (`src/FittedSheet.tsx`):

```ts
export interface FittedSheetParams {
  // ...existing...

  /**
   * Presentation placement.
   * - 'bottom' (default): sheet is anchored to the bottom of the screen.
   * - 'center': sheet floats in the vertical center as a dialog card, the whole
   *   screen is dimmed, dismissed by swiping down or tapping the dim.
   * When 'center', `useInlinePresentation` is ignored (always modal).
   */
  presentationStyle?: 'bottom' | 'center';

  /**
   * Enter/exit animation for `presentationStyle: 'center'`. Ignored otherwise.
   * - 'fade' (default): card fades + scales in (0.9 -> 1.0) at the center.
   * - 'slide': card slides up from the bottom and settles at the center.
   * Swipe-down dismissal (card follows the finger) is identical for both.
   */
  centerAnimation?: 'fade' | 'slide';
}
```

Defaults: `presentationStyle = 'bottom'`, `centerAnimation = 'fade'`.

Sizing is unchanged: width comes from `maxPortraitWidth` / `maxLandscapeWidth`,
height auto-sizes to content (`calculatedHeight`) capped by `maxHeight` and the
available screen height minus safe-area insets. A centered card whose content is
nearly full-height will visually resemble the bottom mode — acceptable.

## Prop plumbing (shared)

1. `src/SheetViewNativeComponent.ts` — add two string props to `NativeProps`:
   `presentationStyle?: string;` and `centerAnimation?: string;` (codegen source
   of truth). Enums are passed as strings, consistent with `windowLevel`.
2. `src/FittedSheet.tsx` — surface both on `FittedSheetParams`, forward to the
   native `<SheetView>` element in `render()` (mirrors `windowLevel` at line 218).
3. Native side reads the props (see per-platform sections). Because props are
   re-applied on every `updateProps` (Fabric recycling), the native setters must
   be idempotent.

## iOS

Reference points (from research):
- Bottom anchor: `SheetViewController.addContentView()`
  (`ios/FittedSheets/SheetViewController.swift:306-331`), specifically
  `$0.bottom.pinToSuperview()` at line 328.
- Full-screen dim: `overlayView` in `addOverlay()` (`:261-268`) — already covers
  the full container in the modal own-`UIWindow` path (window is at `.alert`
  level, full screen). No dim changes needed.
- Tap-to-dismiss surface: `overlayTapView` (`:280-300`) — currently only covers
  the area above the card (`bottom.align(with: contentView.top)` at line 289).
- Pan gesture: `panned(_:)` (`:340-484`) — height-mutation model, not directly
  reusable for a translating centered card; the `.ended` dismiss branch and its
  `CGAffineTransform(translationX:0, y: bounds.height)` animation are reusable.
- Prop plumbing: `SheetView.mm updateProps:` (`:99-132`) → `HostFittedSheet`
  `@objc` setters → `SheetOptions` / `SheetViewController` at
  `initializeSheet` (`HostFittedSheet.swift:207-225`). Presentation path:
  modal own-`UIWindow` in `tryToPresent()` (`:253-389`).

Changes:
1. Add `presentationStyle` + `centerAnimation` fields to `SheetOptions`
   (`ios/FittedSheets/SheetOptions.swift`) and setters on `HostFittedSheet`
   following the `setWindowLevel` pattern; read them in `SheetView.mm updateProps`.
2. Force the modal own-`UIWindow` path when centered (ignore inline).
3. In `addContentView()`, when centered: replace the bottom pin (line 328) with
   `centerY.alignWithSuperview()`; keep centerX (line 319) and the height
   constraint (line 320); relax the top `>=` guard (line 329).
4. In `addOverlayTapView()`, when centered: make the tap-dismiss surface cover
   the whole screen minus the card (so taps below the card also dismiss),
   gated by `dismissable`.
5. In `panned(_:)`, add a centered branch: track a downward `contentView.transform`
   translation following the finger, fade `overlayView.alpha` proportionally,
   ignore upward drag and size-stepping; on `.ended` past a translation/velocity
   threshold, dismiss via the existing transform-out animation, else spring back
   to center.
6. Enter/exit animation by `centerAnimation`:
   - `'fade'`: animate `contentView.alpha` 0->1 and `transform` scale 0.9->1.0 on
     present; reverse on programmatic/tap dismiss.
   - `'slide'`: reuse the existing slide-up transition
     (`SheetTransition.swift:29-104`) but settle at center.

## Android — Strategy B (centered `Dialog`, do not touch `BottomSheetBehavior`)

Reference points (from research):
- Bottom anchoring comes from `BottomSheetBehavior` offset math, not an explicit
  gravity (`BottomSheetBehavior.java:582-596`); the vendored behavior is shared
  with the bottom path and must not be modified.
- Dialog window is full screen (`CustomBottomSheetDialog.java:82`) and the
  default `Theme.AppCompat.Dialog` window dim already covers the whole screen
  (`styles.xml:6-14`) — free full-screen dim.
- Apply point: `AppFittedSheet.showOrUpdate()` (`AppFittedSheet.kt:154-220`),
  already branches on `useInlinePresentation` (`:160-165`).
- Prop setters: generated overrides in `Sheet2ViewManager.kt` (model on
  `setUseInlinePresentation` `:92-94`).
- Fabric coordinate sync: `pushContentOriginOffset()` (`AppFittedSheet.kt:87-107`),
  called after layout in the other paths.
- Ready-made assets: `res/anim/{fade_in,fade_out,slide_up,slide_down}.xml` and
  themes `Custom.Theme.FullScreenDialog.{Slide,Fade}` (`styles.xml:51-64`).

Changes:
1. Add `presentationStyle` + `centerAnimation` string props via
   `SheetViewNativeComponent.ts` → new `Sheet2ViewManager` setters → fields on
   `AppFittedSheet`.
2. In `showOrUpdate()`, add a third branch for `presentationStyle == 'center'`
   (takes precedence over `useInlinePresentation`) that presents `mHostView` in a
   new centered presenter.
3. New presenter class (alongside `FragmentModalBottomSheet` /
   `InlineSheetPresenter`): a plain `Dialog`/`AppCompatDialog` with
   `window.setGravity(Gravity.CENTER)`, `WRAP_CONTENT` card, full-screen window
   dim, and tap-outside → dismiss (gated by `dismissable`).
4. A lightweight vertical-drag `GestureDetector`/`OnTouchListener` on the card:
   translate the card down with the finger; past a translation/velocity threshold
   dismiss (fade+translate out using existing `fade_out`/`slide_down`), else
   spring back to center.
5. Enter animation by `centerAnimation`: `'fade'` → fade+scale window animation
   (`Custom.Theme.FullScreenDialog.Fade`); `'slide'` → slide-up
   (`Custom.Theme.FullScreenDialog.Slide`).
6. Call `post { pushContentOriginOffset() }` after the centered layout, matching
   the other paths, so Fabric/Pressability touch coordinates stay correct.
7. `BottomSheetBehavior.java` is untouched — zero regression risk for the bottom
   path.

## Examples

- New screen `example/src/screens/modal/CenteredExample.tsx`: a toggle to switch
  between `presentationStyle: 'bottom'` and `'center'`, a second toggle for
  `centerAnimation: 'fade' | 'slide'`, a card with some content and a close
  button, demonstrating the full-screen dim, swipe-down and tap-outside dismiss.
- Register it in `example/src/screens/index.tsx` (import + entry in `screens`).

## Tests

- Unit test (Jest / Testing Library, in `src/__tests__/`): rendering a
  `FittedSheet` with `params={{ presentationStyle: 'center', centerAnimation:
  'slide' }}` forwards `presentationStyle` and `centerAnimation` to the native
  `SheetView` element (mirrors existing prop-forwarding assertions in
  `FittedSheet.test.tsx`). Also assert the default (`'bottom'` / undefined) when
  the param is omitted.

## Documentation

- README: new subsection documenting `presentationStyle` and `centerAnimation`
  under the SheetParams table and a short usage snippet (tablet-style centered
  dialog), noting the mutual exclusion with `useInlinePresentation`.

## Risks / open points

- iOS pan-gesture centered branch is the most delicate part (translation model vs
  the existing height model); it is isolated to a branch inside `panned(_:)` and
  does not affect the bottom path.
- Android needs a small custom drag gesture (there is no behavior physics to
  inherit in the centered `Dialog` path); kept minimal and self-contained in the
  new presenter.
- `centerAnimation: 'slide'` on iOS settling at center reuses the existing
  transition — verify the settle position matches the centered constraint.
```
