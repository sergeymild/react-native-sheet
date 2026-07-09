import UIKit
import React

func viewPort() -> CGSize {
  var size: CGSize = .zero
  RCTUnsafeExecuteOnMainQueueSync {
    size = RCTViewportSize()
  }
  return size
}

var presentedSheets: [SheetViewController] = []
var lastPresentedSheetSizes: [[SheetSize]] = []

public final class HostFittedSheet: UIView {
  private(set) var _modalViewController: SheetViewController?
  private let viewController = UIViewController()
  private var _touchHandler: RCTSurfaceTouchHandler?
  private weak var _touchHandlerAttachedView: UIView?
  @objc
  public var onSheetDismiss: (() -> Void)?
  private var _reactSubview: UIView?
  private var _overlaySubview: UIView?
  private var _isPresented = false
  private var _sheetSize: CGFloat?
  public var sheetMaxWidthSize: CGFloat?
  private var dismissable = true
  private var topLeftRightCornerRadius: CGFloat?
  private var stacked = false
  private var _backgroundColor: UIColor = .clear
  private var _windowLevel: UIWindow.Level = .alert
  private var _useInlinePresentation = false
  private var _centered: Bool = false
  private var _centerSlide: Bool = false
  @objc
  public var uniqueId: String = ""

  // Wired by SheetView.mm to push a contentOriginOffset through Fabric state.
  // Used only in inline containment — in dialog mode the sheet lives in its
  // own UIWindow so the Yoga-computed position already matches the physical
  // one and no delta is needed.
  @objc
  public var stateUpdater: ((Float, Float) -> Void)?

  private var sheetMaxWidth: CGFloat {
    return sheetMaxWidthSize ?? viewPort().width
  }

  private var _alertWindow: UIWindow?
  private func createVC() -> UIViewController {
    if let scene = RCTKeyWindow()?.windowScene {
      _alertWindow = UIWindow(windowScene: scene)
    } else {
      _alertWindow = UIWindow(frame: .init(origin: .zero, size: viewPort()))
    }

    let controller = UIViewController()
    _alertWindow?.rootViewController = controller
    _alertWindow?.windowLevel = _windowLevel
    _alertWindow?.isHidden = false
    _alertWindow?.makeKeyAndVisible()
    return controller
  }
  private var presentViewController: UIViewController?

  @objc
  public func setWindowLevel(_ level: NSString) {
    let str = level as String
    switch str {
    case "normal":
      _windowLevel = .normal
    case "statusBar":
      _windowLevel = .statusBar
    default:
      _windowLevel = .alert
    }
  }

  @objc
  public func setUseInlinePresentation(_ value: Bool) {
    _useInlinePresentation = value
    // Re-place the overlay for the current mode. Safe to call in either mode:
    // attachOverlaySubview no-ops until both the overlay subview and the
    // sheet VC's view exist (the sheet isn't initialized yet at this point).
    attachOverlaySubview()
  }

  @objc
  public func setPresentationStyle(_ value: NSString) {
    _centered = (value as String) == "center"
  }

  @objc
  public func setCenterAnimation(_ value: NSString) {
    _centerSlide = (value as String) == "slide"
  }

  @objc
  public func setPassScrollViewReactTag() {
    tryAttachScrollView()
  }

  @objc
  public func setSheetBackgroundColor(_ color: UIColor?) {
    _backgroundColor = color ?? .clear
    _modalViewController?.contentBackgroundColor = _backgroundColor
  }

  @objc
  public func setFittedSheetParams(_ params: NSDictionary) {
    sheetMaxWidthSize = RCTConvert.cgFloat(params["maxWidth"])
    dismissable = params["dismissable"] as? Bool ?? true
    topLeftRightCornerRadius = RCTConvert.cgFloat(params["topLeftRightCornerRadius"])

    if let value = sheetMaxWidthSize {
      _modalViewController?.updateMaxWidth(value: value)
    }
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  public override func removeFromSuperview() {
    super.removeFromSuperview()
    if _isPresented {
      destroy()
    }
  }

  public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if atIndex > 0 {
      _overlaySubview = subview
      subview.isUserInteractionEnabled = false
      attachOverlaySubview()
      return
    }

    _touchHandler = RCTSurfaceTouchHandler()
    _touchHandler?.attach(to: subview)
    _touchHandlerAttachedView = subview
    viewController.view.insertSubview(subview, at: 0)
    _reactSubview = subview
  }

  public override func removeReactSubview(_ subview: UIView!) {
    if let overlaySubview = _overlaySubview, subview === overlaySubview {
      _overlaySubview?.removeFromSuperview()
      _overlaySubview = nil
      return
    }

    detachTouchHandler()
    _reactSubview?.removeFromSuperview()
    _reactSubview = nil
  }

  private func attachOverlaySubview() {
    // Works in both inline containment and modal presentation: in both cases
    // the sheet's root view is `_modalViewController?.view`, so the visual,
    // non-interactive overlay is placed on top of it the same way.
    guard let overlaySubview = _overlaySubview,
          let sheetView = _modalViewController?.view else { return }

    overlaySubview.removeFromSuperview()
    overlaySubview.frame = sheetView.bounds
    overlaySubview.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    overlaySubview.isUserInteractionEnabled = false
    sheetView.addSubview(overlaySubview)
    sheetView.bringSubviewToFront(overlaySubview)
    overlaySubview.setNeedsLayout()
    overlaySubview.layoutIfNeeded()
  }

  private func detachTouchHandler() {
    if let v = _touchHandlerAttachedView {
      _touchHandler?.detach(from: v)
    }
    _touchHandlerAttachedView = nil
  }

  // need to leave it empty
  public override func didUpdateReactSubviews() {}

  public override func didMoveToWindow() {
    super.didMoveToWindow()
  }


  @objc
  public func finalizeUpdates() {
    if _isPresented && superview == nil {
      destroy()
    } else {
      tryToPresent()
    }
  }

  // MARK: calculatedSize
  @objc
  public func setCalculatedHeight(_ height: CGFloat) {
    // prevent show on change orientation for stack
    if let m = _modalViewController, presentedSheets.contains(m) {
      return
    }
    _sheetSize = RCTConvert.cgFloat(height)
    _modalViewController?.setSizes([.fixed(_sheetSize ?? 0)])
    // Inline-containment mode: tryToPresent early-returned while height was
    // still 0 — now that we have a real size, try again.
    if _useInlinePresentation && !_isPresented && (_sheetSize ?? 0) > 0 {
      tryToPresent()
    }
  }

  private func initializeSheet(_ size: CGSize) {
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

    self._modalViewController?.allowPullingPastMaxHeight = false
    self._modalViewController?.dismissOnOverlayTap = self.dismissable
    self._modalViewController?.dismissOnPull = self.dismissable
    self._modalViewController?.cornerRadius = self.topLeftRightCornerRadius ?? 12
    self._modalViewController?.contentBackgroundColor = _backgroundColor
  }

  private func tryAttachScrollView() {
    guard let controller = _modalViewController else { return }
    let scrollView = self._reactSubview?.find(deepIndex: 0)
    if let v = scrollView {
      controller.handleScrollView(v)
    }
  }

  /// Pushes the delta between this view's Yoga position (where the Fabric
  /// shadow tree thinks the sheet content lives) and the physical
  /// on-screen position of the RN subview after child-VC containment.
  /// Consumed by `SheetViewShadowNode::getContentOriginOffset` so that
  /// `measure()` / Pressability region checks report window-relative coords
  /// matching the real touch positions. Only meaningful in inline
  /// containment — dialog mode has matching coords and needs no offset.
  private func pushContentOriginOffset() {
    guard _useInlinePresentation else { return }
    guard self.window != nil else { return }
    guard let reactSubview = _reactSubview, reactSubview.window != nil else { return }
    let yogaPos = self.convert(CGPoint.zero, to: nil)
    let physicalPos = reactSubview.convert(CGPoint.zero, to: nil)
    let offsetX = Float(physicalPos.x - yogaPos.x)
    let offsetY = Float(physicalPos.y - yogaPos.y)
    stateUpdater?(offsetX, offsetY)
  }

  private func tryToPresent() {
    if (!self.isUserInteractionEnabled && self.superview?.reactSubviews().contains(self) != nil) {
      return;
    }

    // Inline-containment mode needs a real height on first present: the
    // contentVC.view height constraint is set to `_sheetSize` at init time,
    // and changes to sheet sizes go through `setSizes` (which expects a
    // presented sheet). If we present at height 0, contentVC.view has 0
    // height, its hit-testable bounds are 0, and touches on RN content never
    // reach the RN view. Wait for the JS-side onLayout to push a non-zero
    // height first.
    if (_useInlinePresentation && !_isPresented && (_sheetSize ?? 0) <= 0) {
      return
    }

    if (!_isPresented) {
      if _useInlinePresentation {
        // Present on the current react-navigation Screen's VC (found via
        // UIResponder chain), so the sheet lives inside the same nav
        // subtree and react-native-screens `fullScreenModal` push covers
        // the sheet naturally. `RCTPresentedViewController()` would return
        // the app's ROOT VC — fallback only.
        presentViewController = self.findEnclosingViewController()
          ?? RCTPresentedViewController()
      } else {
        presentViewController = createVC()
      }
      // sheet already presented
      if stacked {
        if let controller = presentViewController as? SheetViewController {
          if !presentedSheets.contains(controller) {
            lastPresentedSheetSizes.append(controller.sizes)
            presentedSheets.append(controller)
          }

          controller.setSizes([.fixed(0)])
        }
      }

      _isPresented = true
      let size: CGSize = .init(width: self.sheetMaxWidth, height: _sheetSize ?? 0)
      RCTExecuteOnMainQueue { [weak self] in
        guard let self else { return }

        self.initializeSheet(size)
        guard let sheetVC = self._modalViewController,
              let hostVC = self.presentViewController else { return }

        if self._useInlinePresentation {
          // Child-VC containment: sheet is a child of host VC, NOT a modal.
          // This prevents react-native-screens from auto-dismissing the
          // sheet when it pushes a new fullScreenModal (rn-screens calls
          // dismiss on the current presentedViewController before
          // presenting a new modal; as a child VC we don't appear as
          // presentedViewController).
          sheetVC.willMove(toParent: hostVC)
          hostVC.addChild(sheetVC)
          sheetVC.view.frame = hostVC.view.bounds
          sheetVC.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
          hostVC.view.addSubview(sheetVC.view)
          sheetVC.didMove(toParent: hostVC)
          self.attachOverlaySubview()
          sheetVC.view.setNeedsLayout()
          sheetVC.view.layoutIfNeeded()

          // Don't attach our own RCTSurfaceTouchHandler in inline
          // containment: the sheet's subtree stays within the main Fabric
          // surface (RNSScreenStackView/RNSScreen are Fabric views), so
          // the main surface's touch handler already receives touches via
          // UIKit hit-test and dispatches them through Fabric's normal
          // pipeline. Keeping our own handler duplicates every touch event
          // and breaks Pressability state after the first tap.
          self.detachTouchHandler()

          // Push the visual delta (Yoga-position → physical on-screen
          // position) into the Fabric state so that descendants' measure()
          // / Pressability region checks report the real window-relative
          // coords. Without this, containment breaks taps on any button
          // inside the sheet (same root cause as the Android fix). Run on
          // the next layout tick so hostVC.view and self have settled
          // window positions.
          DispatchQueue.main.async { [weak self] in
            self?.pushContentOriginOffset()
          }

          // Slide-in animation — UIKit's modal transition isn't used in
          // containment, so do it manually (mirror of animateOut: translate
          // content down, fade overlay, then animate back to resting).
          sheetVC.view.layoutIfNeeded()
          let contentView = sheetVC.contentViewController.view!
          let startY = max(contentView.bounds.height, 1)
          contentView.transform = CGAffineTransform(translationX: 0, y: startY)
          sheetVC.overlayView.alpha = 0
          UIView.animate(
            withDuration: 0.3,
            delay: 0,
            usingSpringWithDamping: 1,
            initialSpringVelocity: 0,
            options: [.curveEaseOut],
            animations: {
              contentView.transform = .identity
              sheetVC.overlayView.alpha = 1
            },
            completion: nil
          )
        } else {
          hostVC.present(sheetVC, animated: true) { [weak self] in
            // Modal presentation: attach the overlay once the sheet VC's view
            // is on screen (mirrors the inline-containment attach above).
            self?.attachOverlaySubview()
          }
        }
        sheetVC.didDismiss = { [weak self] old, silent in
          guard let self else { return }
          onSheetDismiss?()
          if old.dismissAll == true {
            if stacked, let popped = presentedSheets.popLast() {
              popped.dismissAll = true
              popped.dismiss(animated: false)
            }
            return
          }
          if stacked, let popped = presentedSheets.popLast() {
            popped.setSizes(lastPresentedSheetSizes.popLast() ?? [])
          }
        }

        // some delay to wait rn render
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
          guard let self else { return }
          if !_isPresented { return }
          tryAttachScrollView()
        }
      }
    }
  }

  @objc
  public func dismiss() {
    if _useInlinePresentation {
      // attemptDismiss handles both inline (removeFromSuperview +
      // removeFromParent) and modal paths internally.
      _modalViewController?.attemptDismiss(animated: true)
    } else {
      _modalViewController?.dismiss(animated: true)
    }
  }

  @objc
  public func destroy() {
    if !_isPresented && _modalViewController == nil {
      return
    }

    _isPresented = false

    // Remove from global array if present
    if let modalVC = _modalViewController, let index = presentedSheets.firstIndex(of: modalVC) {
      presentedSheets.remove(at: index)
      if lastPresentedSheetSizes.count > index {
        lastPresentedSheetSizes.remove(at: index)
      }
    }

    let cleanup = { [weak self] in
      guard let self else {
        return
      }

      // Clear dismiss callback first to prevent retain cycles
      self._modalViewController?.didDismiss = nil
      self.onSheetDismiss = nil

      // Remove view hierarchy
      self._overlaySubview?.removeFromSuperview()
      self._reactSubview?.removeFromSuperview()
      self.detachTouchHandler()
      self.viewController.view.removeFromSuperview()
      self.viewController.removeFromParent()

      // Clear window - make sure to resign key window status
      if let alertWindow = self._alertWindow {
        alertWindow.isHidden = true
        alertWindow.windowScene = nil
        alertWindow.rootViewController = nil
        // Make sure main window becomes key again
        if let mainWindow = RCTKeyWindow() {
          mainWindow.makeKeyAndVisible()
        }
      }

      // Nil out all references
      self.presentViewController = nil
      self._modalViewController = nil
      self._touchHandler = nil
      self._sheetSize = nil
      self.sheetMaxWidthSize = nil
      self._overlaySubview = nil
      self._reactSubview = nil
      self._alertWindow = nil
    }

    if let modalVC = self._modalViewController, modalVC.isBeingDismissed != true && modalVC.isBeingPresented != true {
      if _useInlinePresentation {
        // Containment path — no modal presenter, run animateOut then cleanup.
        modalVC.attemptDismiss(animated: true)
        cleanup()
      } else {
        modalVC.dismiss(animated: true, completion: cleanup)
      }
    } else {
      cleanup()
    }
  }

  deinit {}

}


extension UIView {
  func find(deepIndex: Int) -> UIScrollView? {
    if deepIndex >= 100 { return nil }
    if self is UIScrollView { return self as? UIScrollView }

    let index = deepIndex + 1
    for subview in subviews {
      if let v = subview.find(deepIndex: index) {
        return v
      }
    }

    return nil
  }

  /// Walks the UIResponder chain to find the nearest enclosing
  /// `UIViewController` (standard RN pattern — see
  /// `node_modules/react-native/React/Views/UIView+React.m`).
  /// Used for inline sheet presentation so the sheet is attached to the
  /// current react-navigation Screen's VC (not app root), allowing
  /// react-native-screens `fullScreenModal` to cover the sheet.
  fileprivate func findEnclosingViewController() -> UIViewController? {
    var responder: UIResponder? = self.next
    while let r = responder {
      if let vc = r as? UIViewController { return vc }
      responder = r.next
    }
    return nil
  }
}
