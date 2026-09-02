# Centered Presentation Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `presentationStyle: 'center'` mode to `react-native-sheet` that shows the sheet as a floating, full-screen-dimmed card in the vertical center of the screen, dismissed by swiping down or tapping the dim, on both iOS and Android.

**Architecture:** A new string prop pair (`presentationStyle`, `centerAnimation`) flows JS → Fabric codegen → native. iOS reuses the existing modal own-`UIWindow` path and swaps the content card's bottom-pin constraint for center-Y plus a translation-based pan branch. Android adds a third presentation path — a plain centered `Dialog` with a custom down-swipe gesture — leaving the shared `BottomSheetBehavior` untouched.

**Tech Stack:** React Native 0.81 (Fabric/codegen), TypeScript, Jest + @testing-library/react-native, Swift + Obj-C++ (iOS), Kotlin + Java (Android).

## Global Constraints

- `presentationStyle` defaults to `'bottom'`; existing bottom behavior must be 100% unchanged when the prop is absent or `'bottom'`.
- `centerAnimation` defaults to `'fade'`; only meaningful when `presentationStyle === 'center'`.
- When `presentationStyle === 'center'`, `useInlinePresentation` is ignored (always modal presentation).
- Enum values cross the bridge as **strings** (matches `windowLevel`).
- Native prop setters must be idempotent — Fabric re-applies all props on every `updateProps` (see `ios/SheetView.mm:106-114`).
- Corner radius stays on the RN content view (`topLeftRightCornerRadius`); do not add native corner handling for centered mode.
- Do NOT modify `android/src/main/java/com/behavior/BottomSheetBehavior.java`.
- Spec: `docs/superpowers/specs/2026-07-09-centered-presentation-design.md`.

**Reality note on TDD:** Only the JS layer (Task 1) has automated tests. The native layers (Tasks 3, 4) are verified by building and running the example app's `Centered` screen (Task 2) on a simulator/emulator and observing behavior — there is no native unit-test harness in this repo. Each native task ends with an explicit build + run + observe verification.

---

### Task 1: JS API + prop plumbing (TDD)

**Files:**
- Modify: `src/SheetViewNativeComponent.ts:15-29` (add native props)
- Modify: `src/FittedSheet.tsx:17-40` (extend `FittedSheetParams`), `src/FittedSheet.tsx:202-223` (forward props)
- Test: `src/__tests__/FittedSheet.test.tsx` (add prop-forwarding cases)

**Interfaces:**
- Produces: `FittedSheetParams.presentationStyle?: 'bottom' | 'center'`, `FittedSheetParams.centerAnimation?: 'fade' | 'slide'`. Native `SheetView` receives string props `presentationStyle` and `centerAnimation`.

- [ ] **Step 1: Inspect the existing forwarding test to copy its pattern**

Read `src/__tests__/FittedSheet.test.tsx` and find how it asserts a param (e.g. `windowLevel` or `topLeftRightCornerRadius`) reaches the mocked native `SheetView`. Reuse that exact query/mock style in Step 2. (If no such assertion exists, the mock renders `SheetView` as a host component whose props can be read via the test renderer tree — assert on that.)

- [ ] **Step 2: Write the failing test**

Add to `src/__tests__/FittedSheet.test.tsx`:

```tsx
it('forwards presentationStyle and centerAnimation to the native component', () => {
  const ref = React.createRef<FittedSheetRef>();
  const tree = render(
    <FittedSheet
      ref={ref}
      params={{ presentationStyle: 'center', centerAnimation: 'slide' }}
    >
      <View />
    </FittedSheet>
  );
  act(() => ref.current?.show());
  const native = tree.UNSAFE_getByType(SheetViewNativeComponent);
  expect(native.props.presentationStyle).toBe('center');
  expect(native.props.centerAnimation).toBe('slide');
});

it('defaults presentationStyle to bottom and centerAnimation to fade', () => {
  const ref = React.createRef<FittedSheetRef>();
  const tree = render(
    <FittedSheet ref={ref}>
      <View />
    </FittedSheet>
  );
  act(() => ref.current?.show());
  const native = tree.UNSAFE_getByType(SheetViewNativeComponent);
  expect(native.props.presentationStyle).toBe('bottom');
  expect(native.props.centerAnimation).toBe('fade');
});
```

Match the existing test file's imports (`render`, `act`, `View`, `FittedSheet`, and the native-component import used elsewhere — align the `SheetViewNativeComponent` reference with how sibling tests reach the native element).

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx jest src/__tests__/FittedSheet.test.tsx -t "presentationStyle"`
Expected: FAIL — `presentationStyle` is `undefined` on the native props.

- [ ] **Step 4: Add the native props to the codegen spec**

In `src/SheetViewNativeComponent.ts`, inside `interface NativeProps` (after `useInlinePresentation?: boolean;` at line 27):

```ts
  presentationStyle?: string;
  centerAnimation?: string;
```

- [ ] **Step 5: Extend `FittedSheetParams`**

In `src/FittedSheet.tsx`, inside `interface FittedSheetParams` (after the `useInlinePresentation` block, line 35):

```ts
  /**
   * Presentation placement.
   * - 'bottom' (default): anchored to the bottom of the screen.
   * - 'center': floats in the vertical center as a dialog card, the whole
   *   screen is dimmed, dismissed by swiping down or tapping the dim.
   * When 'center', `useInlinePresentation` is ignored (always modal).
   */
  presentationStyle?: 'bottom' | 'center';
  /**
   * Enter/exit animation for `presentationStyle: 'center'`. Ignored otherwise.
   * - 'fade' (default): fades + scales in at the center.
   * - 'slide': slides up from the bottom and settles at the center.
   */
  centerAnimation?: 'fade' | 'slide';
```

- [ ] **Step 6: Forward the props to the native element**

In `src/FittedSheet.tsx`, in `render()`'s `<_FittedSheet ...>` (after `useInlinePresentation={...}` at line 219):

```tsx
        presentationStyle={this.props.params?.presentationStyle ?? 'bottom'}
        centerAnimation={this.props.params?.centerAnimation ?? 'fade'}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx jest src/__tests__/FittedSheet.test.tsx -t "presentationStyle"`
Expected: PASS (both new cases).

- [ ] **Step 8: Run the full JS suite + typecheck (no regressions)**

Run: `npx jest && npx tsc --noEmit`
Expected: all tests pass, no type errors.

- [ ] **Step 9: Commit**

```bash
git add src/SheetViewNativeComponent.ts src/FittedSheet.tsx src/__tests__/FittedSheet.test.tsx
git commit -m "feat: add presentationStyle and centerAnimation props (JS)"
```

---

### Task 2: Example screen (`CenteredExample`)

**Files:**
- Create: `example/src/screens/modal/CenteredExample.tsx`
- Modify: `example/src/screens/index.tsx:1-135` (import + register)

**Interfaces:**
- Consumes: `FittedSheetParams.presentationStyle`, `FittedSheetParams.centerAnimation` from Task 1.

- [ ] **Step 1: Create the example screen**

Create `example/src/screens/modal/CenteredExample.tsx`:

```tsx
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

/**
 * Demonstrates `presentationStyle: 'center'` — the sheet floats in the vertical
 * center as a dialog card, the whole screen is dimmed, and it is dismissed by
 * swiping down or tapping the dim. Toggle the placement and the enter animation.
 */
export const CenteredExample = () => {
  const sheetRef = useRef<FittedSheetRef>(null);
  const [centered, setCentered] = useState(true);
  const [animation, setAnimation] = useState<'fade' | 'slide'>('fade');

  return (
    <View style={styles.container}>
      <Button
        label={`Placement: ${centered ? 'center' : 'bottom'} (tap to toggle)`}
        onPress={() => setCentered((v) => !v)}
      />
      <Button
        label={`Center animation: ${animation} (tap to toggle)`}
        onPress={() => setAnimation((a) => (a === 'fade' ? 'slide' : 'fade'))}
      />
      <Button label="Present" onPress={() => sheetRef.current?.show()} />

      <FittedSheet
        key={`${centered}-${animation}`}
        ref={sheetRef}
        params={{
          maxHeight: 360,
          maxPortraitWidth: 420,
          maxLandscapeWidth: 420,
          backgroundColor: 'white',
          topLeftRightCornerRadius: 20,
          presentationStyle: centered ? 'center' : 'bottom',
          centerAnimation: animation,
        }}
        rootViewStyle={styles.sheetRoot}
      >
        <View style={styles.content}>
          <View style={styles.handle} />
          <Text style={styles.title}>Centered dialog</Text>
          <Text style={styles.subtitle}>
            Swipe down or tap the dimmed background to dismiss.
          </Text>
          <Button label="Close" onPress={() => sheetRef.current?.hide()} />
        </View>
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 100, gap: 12 },
  sheetRoot: { borderRadius: 20, overflow: 'hidden' },
  content: { padding: 24, gap: 16, alignItems: 'stretch' },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center' },
});
```

If `Button` in this repo uses a `title` prop instead of `label`, match the existing example screens' usage (check `example/src/components/button/Button.tsx`).

- [ ] **Step 2: Register the screen**

In `example/src/screens/index.tsx`, add the import near the other imports (after line 22):

```tsx
import { CenteredExample } from './modal/CenteredExample';
```

And add an entry as the FIRST item of the `screens` array (line 24, before the `Overlay` entry):

```tsx
  {
    name: 'Centered',
    slug: 'Modal/Centered',
    getScreen: () => CenteredExample,
  },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add example/src/screens/modal/CenteredExample.tsx example/src/screens/index.tsx
git commit -m "feat: add Centered example screen"
```

---

### Task 3: iOS centered presentation

**Files:**
- Modify: `ios/SheetView.mm:99-132` (read new props)
- Modify: `ios/HostFittedSheet.swift:64-106` (setters), `ios/HostFittedSheet.swift:207-225` (pass into `SheetOptions`)
- Modify: `ios/FittedSheets/SheetOptions.swift:12-98` (add `centered`, `centerAnimation` fields)
- Modify: `ios/FittedSheets/SheetViewController.swift` — `addContentView()` (`:306-331`), `addOverlayTapView()` (`:280-295`), `panned(_:)` (`:340-484`), and present-in animation

**Interfaces:**
- Consumes: string props `presentationStyle`, `centerAnimation` from the Fabric layer.
- Produces (Swift): `HostFittedSheet.setPresentationStyle(_ value: NSString)`, `HostFittedSheet.setCenterAnimation(_ value: NSString)`; `SheetOptions.centered: Bool`, `SheetOptions.centerSlide: Bool`.

- [ ] **Step 1: Read the props in the Fabric wrapper**

In `ios/SheetView.mm updateProps:`, after line 121 (`[_view2 setUseInlinePresentation:...]`):

```objc
  [_view2 setPresentationStyle:[[NSString alloc] initWithUTF8String:newViewProps.presentationStyle.c_str()]];
  [_view2 setCenterAnimation:[[NSString alloc] initWithUTF8String:newViewProps.centerAnimation.c_str()]];
```

- [ ] **Step 2: Add `@objc` setters on `HostFittedSheet`**

In `ios/HostFittedSheet.swift`, add stored properties near the other private state (e.g. beside `_useInlinePresentation`):

```swift
  private var _centered: Bool = false
  private var _centerSlide: Bool = false
```

Add setters after `setUseInlinePresentation` (line 84):

```swift
  @objc
  public func setPresentationStyle(_ value: NSString) {
    _centered = (value as String) == "center"
  }

  @objc
  public func setCenterAnimation(_ value: NSString) {
    _centerSlide = (value as String) == "slide"
  }
```

- [ ] **Step 3: Add fields to `SheetOptions` and pass them from `initializeSheet`**

In `ios/FittedSheets/SheetOptions.swift`, add stored properties to the struct (after `maxWidth` at line 45):

```swift
    public var centered: Bool = false
    public var centerSlide: Bool = false
```

In `ios/HostFittedSheet.swift initializeSheet(_:)` (line 207), set them on the options after construction (the `SheetOptions.init` does not need new params — set directly). Replace the `options: .init(...)` construction with a local var so the new fields can be assigned:

```swift
    var opts = SheetOptions(
      pullBarHeight: 0,
      shouldExtendBackground: false,
      shrinkPresentingViewController: false,
      useInlineMode: _useInlinePresentation && !_centered,
      maxWidth: self.sheetMaxWidth
    )
    opts.centered = _centered
    opts.centerSlide = _centerSlide
    self._modalViewController = SheetViewController(
      controller: self.viewController,
      sizes: [.fixed(size.height)],
      options: opts
    )
```

Note `useInlineMode: _useInlinePresentation && !_centered` enforces the "center ignores inline" rule (Global Constraints).

- [ ] **Step 4: Center the content card**

In `ios/FittedSheets/SheetViewController.swift addContentView()` (line 306-331), replace the bottom pin block (lines 322-329) so that when `options.centered` the card is centered vertically instead of bottom-pinned:

```swift
            if self.options.centered {
                $0.centerY.alignWithSuperview()
            } else {
                let top: CGFloat
                if (self.options.useFullScreenMode) {
                    top = 0
                } else {
                    top = max(12, UIApplication.shared.windows.first(where: { $0.isKeyWindow })?.compatibleSafeAreaInsets.top ?? 12)
                }
                $0.bottom.pinToSuperview()
                $0.top.pinToSuperview(inset: top, relation: .greaterThanOrEqual).priority = UILayoutPriority(999)
            }
```

Keep `centerX` (line 319) and the height constraint (line 320) unchanged for both branches.

- [ ] **Step 5: Widen the tap-dismiss surface for centered mode**

In `addOverlayTapView()` (line 280-295), when centered the tap surface should cover the whole screen (taps above AND below the card dismiss). Replace the constraint block (lines 285-290):

```swift
        if self.options.centered {
            Constraints(for: overlayTapView) {
                $0.edges(.top, .left, .right, .bottom).pinToSuperview()
            }
        } else {
            Constraints(for: overlayTapView, self.contentViewController.view) {
                $0.top.pinToSuperview()
                $0.left.pinToSuperview()
                $0.right.pinToSuperview()
                $0.bottom.align(with: $1.top)
            }
        }
```

The card sits in front of `overlayTapView` (added later / higher z-order), so taps on the card itself are not intercepted; taps in the surrounding dim dismiss.

- [ ] **Step 6: Add a centered branch to the pan gesture**

In `panned(_:)` (line 340), guard the centered path at the top of the handler so it translates the card instead of resizing it. Add, immediately after computing `point` (line 341):

```swift
        if self.options.centered {
            self.pannedCentered(gesture, point: point)
            return
        }
```

Then add a new method near `panned`:

```swift
    private func pannedCentered(_ gesture: UIPanGestureRecognizer, point: CGPoint) {
        let card = self.contentViewController.view!
        switch gesture.state {
        case .began:
            self.isPanning = true
        case .changed:
            // Follow the finger downward only; clamp upward drag to 0.
            let dy = max(0, point.y - (self.firstPanPoint?.y ?? point.y == point.y ? 0 : 0))
            let ty = max(0, point.y)
            card.transform = CGAffineTransform(translationX: 0, y: ty)
            let progress = min(1, ty / max(1, card.bounds.height))
            self.overlayView.alpha = 1 - progress
            _ = dy
        case .ended, .cancelled:
            self.isPanning = false
            let ty = card.transform.ty
            let velocity = gesture.velocity(in: gesture.view).y
            let shouldDismiss = self.dismissOnPull && (ty > card.bounds.height / 3 || velocity > 800)
            if shouldDismiss {
                self.attemptDismiss(animated: true)
            } else {
                UIView.animate(withDuration: 0.25) {
                    card.transform = .identity
                    self.overlayView.alpha = 1
                }
            }
        default:
            break
        }
    }
```

Use `self.firstPanPoint` consistently with how the existing `.began` branch initializes it (line 343). If `firstPanPoint` is not set in the centered path, set it in the `.began` case here: `self.firstPanPoint = point`. (Simplify the `dy` line to just `let ty = max(0, point.y)` — the translation is already relative to gesture start.)

- [ ] **Step 7: Present-in animation (fade vs slide)**

Find where the modal transition animates the card in — `ios/FittedSheets/SheetTransition.swift:29-104` (slides `contentView` from `+bounds.height`). For centered mode:
- `centerSlide == true`: keep the existing slide-up (it will settle at the centered constraint).
- `centerSlide == false` (fade, default): instead of the translation slide, animate `contentView.alpha` 0→1 and `transform` from `scale(0.9)` to `.identity`, and fade the overlay in.

Gate this on the option. In `SheetTransition.animateTransition` (or wherever the sheet VC triggers its show animation), branch:

```swift
        if sheetVC.options.centered && !sheetVC.options.centerSlide {
            contentView.alpha = 0
            contentView.transform = CGAffineTransform(scaleX: 0.9, y: 0.9)
            overlayView.alpha = 0
            UIView.animate(withDuration: sheetVC.options.transitionDuration) {
                contentView.alpha = 1
                contentView.transform = .identity
                overlayView.alpha = 1
            }
        } else {
            // existing slide-up path
        }
```

Access to `sheetVC.options` / `overlayView` must match the transition file's existing references — read `SheetTransition.swift` and adapt to the actual variable names in scope. The dismiss animation (translate down + fade) already works for centered via `attemptDismiss`.

- [ ] **Step 8: Build the example for iOS**

Run:
```bash
cd example && npx pod-install ios && npm run ios
```
(Or open `example/ios` in Xcode and run.) Expected: build succeeds, app launches on the iOS Simulator.

- [ ] **Step 9: Verify behavior on the `Centered` screen**

In the running app open the `Centered` screen and check:
1. Placement `center` + `Present`: card appears centered, entire screen dimmed.
2. Animation `fade`: card fades + scales in. Toggle to `slide`: card slides up into center.
3. Swipe the card down: it follows the finger and dismisses past ~1/3; a small drag springs back.
4. Tap the dim above and below the card: dismisses (when `dismissable`).
5. Toggle Placement back to `bottom`: unchanged bottom behavior (regression check).

- [ ] **Step 10: Commit**

```bash
git add ios src/SheetViewNativeComponent.ts
git commit -m "feat: iOS centered presentation mode"
```

---

### Task 4: Android centered presentation

**Files:**
- Modify: `android/src/main/java/com/sheet2/Sheet2ViewManager.kt:88-99` (new setters)
- Modify: `android/src/main/java/com/sheet2/AppFittedSheet.kt` (fields + `showOrUpdate()` branch `:154-220`)
- Create: `android/src/main/java/com/sheet2/CenteredSheetDialog.kt` (new centered Dialog presenter)
- Modify (if needed): `android/src/main/res/values/styles.xml` (reuse/confirm `Custom.Theme.FullScreenDialog.Fade` / `.Slide` at `:51-64`)

**Interfaces:**
- Consumes: string props `presentationStyle`, `centerAnimation`.
- Produces (Kotlin): `Sheet2View.presentationStyle: String`, `Sheet2View.centerAnimation: String`; `CenteredSheetDialog(context, contentView, dismissable, slide, onDismiss)` with `show()` / `dismiss()`.

- [ ] **Step 1: Add the generated setters**

In `android/src/main/java/com/sheet2/Sheet2ViewManager.kt`, after `setUseInlinePresentation` (line 92-94):

```kotlin
  override fun setPresentationStyle(view: Sheet2View, value: String?) {
    view.presentationStyle = value ?: "bottom"
  }

  override fun setCenterAnimation(view: Sheet2View, value: String?) {
    view.centerAnimation = value ?: "fade"
  }
```

(These override methods exist only after the codegen spec from Task 1 regenerates `SheetViewManagerInterface`. If the interface has not regenerated, run the Android build once — codegen runs as part of the Gradle build — or `npm run gen`.)

- [ ] **Step 2: Add fields to `AppFittedSheet`**

In `android/src/main/java/com/sheet2/AppFittedSheet.kt`, add near the other view-state fields (e.g. beside `useInlinePresentation`):

```kotlin
  var presentationStyle: String = "bottom"
  var centerAnimation: String = "fade"
  private var centeredDialog: CenteredSheetDialog? = null
```

- [ ] **Step 3: Branch `showOrUpdate()` for centered mode**

In `AppFittedSheet.showOrUpdate()` (line 154), add a centered branch BEFORE the `if (useInlinePresentation)` check (line 160), so center takes precedence:

```kotlin
    if (presentationStyle == "center") {
      if (centeredDialog == null || centeredDialog?.isShowing != true) {
        // mHostView may still be attached to a previous parent; detach first.
        (mHostView.parent as? ViewGroup)?.removeView(mHostView)
        centeredDialog = CenteredSheetDialog(
          context = getCurrentActivity() ?: context,
          contentView = mHostView,
          dismissable = dismissable,
          slide = centerAnimation == "slide",
        ) {
          (mHostView.parent as? ViewGroup)?.removeView(mHostView)
          centeredDialog = null
          onSheetDismiss()
        }
        centeredDialog?.show()
        post { pushContentOriginOffset() }
      }
      return
    }
```

Match `getCurrentActivity()` to the helper used elsewhere in this file (line 204 uses `getCurrentActivity()?.supportFragmentManager`). Ensure `dismiss()` on `AppFittedSheet` also dismisses `centeredDialog` — locate the existing `dismiss()`/teardown method in this file and add `centeredDialog?.dismiss()` there.

- [ ] **Step 4: Create the centered Dialog presenter**

Create `android/src/main/java/com/sheet2/CenteredSheetDialog.kt`:

```kotlin
package com.sheet2

import android.app.Dialog
import android.content.Context
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import android.widget.FrameLayout
import kotlin.math.abs

/**
 * Presents [contentView] as a floating card in the vertical center of the
 * screen with a full-screen window dim. Dismissed by swiping the card down or
 * (when [dismissable]) tapping the dimmed background.
 *
 * Deliberately does NOT use BottomSheetBehavior — a plain centered Dialog plus a
 * small vertical-drag gesture keeps the shared bottom-sheet path untouched.
 */
class CenteredSheetDialog(
  context: Context,
  private val contentView: View,
  private val dismissable: Boolean,
  private val slide: Boolean,
  private val onDismiss: () -> Unit,
) {
  private val dialog = Dialog(context)
  val isShowing: Boolean get() = dialog.isShowing

  init {
    dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

    val container = FrameLayout(context)
    val lp = FrameLayout.LayoutParams(
      ViewGroup.LayoutParams.WRAP_CONTENT,
      ViewGroup.LayoutParams.WRAP_CONTENT,
    ).apply { gravity = Gravity.CENTER }
    container.addView(contentView, lp)
    dialog.setContentView(container)

    dialog.window?.apply {
      setBackgroundDrawableResource(android.R.color.transparent)
      setLayout(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
      )
      setGravity(Gravity.CENTER)
      // Full-screen dim behind the card.
      addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
      setDimAmount(0.5f)
      // Enter/exit window animation: reuse existing fade/slide themes.
      attributes = attributes.apply {
        windowAnimations = if (slide) {
          R.style.Custom_Theme_FullScreenDialog_Slide
        } else {
          R.style.Custom_Theme_FullScreenDialog_Fade
        }
      }
    }

    dialog.setCancelable(dismissable)
    dialog.setCanceledOnTouchOutside(dismissable)
    dialog.setOnCancelListener { onDismiss() }

    attachSwipeToDismiss(contentView)
  }

  fun show() = dialog.show()

  fun dismiss() {
    if (dialog.isShowing) dialog.dismiss()
  }

  private fun attachSwipeToDismiss(card: View) {
    var downY = 0f
    var dragging = false
    val threshold = card.resources.displayMetrics.density * 96 // ~96dp
    card.setOnTouchListener { v, event ->
      when (event.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
          downY = event.rawY
          dragging = false
          false // let children receive the down so taps still work
        }
        MotionEvent.ACTION_MOVE -> {
          val dy = event.rawY - downY
          if (dy > 0) {
            dragging = true
            v.translationY = dy
          }
          dragging
        }
        MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
          val dy = event.rawY - downY
          if (dragging && dy > threshold && dismissable) {
            v.animate().translationY(v.height.toFloat()).alpha(0f).setDuration(180)
              .withEndAction { onDismiss(); dialog.dismiss() }.start()
          } else {
            v.animate().translationY(0f).alpha(1f).setDuration(180).start()
          }
          val handled = dragging && abs(dy) > 4
          dragging = false
          handled
        }
        else -> false
      }
    }
  }
}
```

Confirm the theme resource names: `R.style.Custom_Theme_FullScreenDialog_Fade` / `_Slide` correspond to `Custom.Theme.FullScreenDialog.Fade` / `.Slide` in `android/src/main/res/values/styles.xml:51-64`. If those themes define only the `windowEnterAnimation`/`windowExitAnimation` items you need; otherwise add a minimal `windowAnimations` style referencing `res/anim/fade_in.xml`/`fade_out.xml` (fade) and `slide_up.xml`/`slide_down.xml` (slide).

- [ ] **Step 5: Build the example for Android**

Run:
```bash
cd example && npm run android
```
Expected: Gradle build succeeds (codegen regenerates the `SheetViewManagerInterface` with the two new setters), app launches on the emulator.

If the build fails because `setPresentationStyle`/`setCenterAnimation` are not on `SheetViewManagerInterface`, run a clean codegen: `cd example/android && ./gradlew generateCodegenArtifactsFromSchema` then rebuild.

- [ ] **Step 6: Verify behavior on the `Centered` screen**

Open the `Centered` screen on the emulator and check the same 5 points as iOS Task 3 Step 9 (centered + full dim, fade vs slide enter, swipe-down dismiss with follow + spring-back, tap-outside dismiss above and below, bottom mode unchanged).

- [ ] **Step 7: Commit**

```bash
git add android
git commit -m "feat: Android centered presentation mode"
```

---

### Task 5: README documentation

**Files:**
- Modify: `README.md` (SheetParams table ~line 499-509, plus a short usage snippet)

**Interfaces:**
- Consumes: the final `presentationStyle` / `centerAnimation` API from Task 1.

- [ ] **Step 1: Add the params to the SheetParams table**

In `README.md`, add two rows to the `SheetParams` table (after the `isSystemUILight` row, line 509):

```markdown
| `presentationStyle` | `'bottom' \| 'center'` | `'bottom'` | `'center'` shows the sheet as a dialog card in the vertical center with a full-screen dim; dismiss by swiping down or tapping the dim. Ignores `useInlinePresentation`. |
| `centerAnimation` | `'fade' \| 'slide'` | `'fade'` | Enter animation for `presentationStyle: 'center'`. `'fade'` = fade + scale in; `'slide'` = slide up into center. |
```

- [ ] **Step 2: Add a usage snippet**

Add a new subsection under "Advanced Examples" (before "Platform-Specific Notes", ~line 662):

```markdown
### Centered / Tablet Dialog

Show the sheet as a centered dialog card (useful for tablets) instead of a
bottom sheet. The whole screen dims and the card is dismissed by swiping down or
tapping outside:

\`\`\`tsx
<FittedSheet
  ref={sheetRef}
  params={{
    presentationStyle: 'center',
    centerAnimation: 'fade', // or 'slide'
    maxPortraitWidth: 420,
    maxLandscapeWidth: 420,
    backgroundColor: 'white',
    topLeftRightCornerRadius: 20,
  }}
>
  <YourContent />
</FittedSheet>
\`\`\`

`presentationStyle: 'center'` always presents modally — `useInlinePresentation`
is ignored in this mode.
```

(Write the snippet with real backticks in the actual file — the escaped ones above are only to keep this plan valid.)

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document presentationStyle and centerAnimation"
```

---

## Self-Review

**Spec coverage:**
- API (`presentationStyle`, `centerAnimation`, defaults, inline exclusion) → Task 1. ✓
- Prop plumbing (codegen spec, FittedSheet forwarding) → Task 1. ✓
- iOS (center constraint, full dim reuse, widened tap region, translation pan, fade/slide) → Task 3. ✓
- Android Strategy B (centered Dialog, custom swipe, window dim, BottomSheetBehavior untouched, Fabric offset sync) → Task 4. ✓
- Example screen → Task 2. ✓
- Unit test → Task 1. ✓
- README → Task 5. ✓

**Placeholder scan:** No "TBD"/"handle edge cases" without code. Native steps that require adapting to exact surrounding lines say so explicitly and give the concrete code to insert — acceptable given codegen/native constraints.

**Type consistency:** `presentationStyle`/`centerAnimation` are strings across all layers; Swift maps to `_centered`/`_centerSlide` and `SheetOptions.centered`/`centerSlide`; Kotlin keeps `presentationStyle`/`centerAnimation` strings and a `slide: Boolean` in `CenteredSheetDialog`. Consistent.

**Ordering:** JS (1) → example (2, the manual test harness) → iOS (3) → Android (4) → docs (5). Native tasks depend on 1; verification depends on 2.
