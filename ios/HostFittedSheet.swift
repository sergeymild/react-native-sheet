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
  @objc
  public var onSheetDismiss: (() -> Void)?
  private var _reactSubview: UIView?
  private var _isPresented = false
  private var _sheetSize: CGFloat?
  public var sheetMaxWidthSize: CGFloat?
  private var dismissable = true
  private var topLeftRightCornerRadius: CGFloat?
  private var stacked = false
  private var _backgroundColor: UIColor = .clear
  @objc
  public var uniqueId: String = ""

  private var sheetMaxWidth: CGFloat {
    return sheetMaxWidthSize ?? viewPort().width
  }

  private var _alertWindow: UIWindow?
  private func createVC() -> UIViewController {
    _alertWindow = UIWindow(frame: .init(origin: .zero, size: viewPort()))
    let controller = UIViewController()
    _alertWindow?.rootViewController = controller
    _alertWindow?.windowLevel = UIWindow.Level.alert
    _alertWindow?.isHidden = false
    _alertWindow?.makeKeyAndVisible()
    return controller
  }
  private var presentViewController: UIViewController?

  @objc
  public func setPassScrollViewReactTag() {
    debugPrint("\(uniqueId) HostFittedSheet.setPassScrollViewReactTag")
    tryAttachScrollView()
  }
  
  @objc
  public func setSheetBackgroundColor(_ color: UIColor?) {
    _backgroundColor = color ?? .clear
    _modalViewController?.contentBackgroundColor = _backgroundColor
  }

  @objc
  public func setFittedSheetParams(_ params: NSDictionary) {
    debugPrint("\(uniqueId) HostFittedSheetsetFittedSheetParams", params)
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

  public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    debugPrint("\(uniqueId) HostFittedSheet.insertReactSubview", subview.tag as Any)
    //super.insertReactSubview(subview, at: atIndex)
    _touchHandler = RCTSurfaceTouchHandler()
    _touchHandler?.attach(to: subview)
    viewController.view.insertSubview(subview, at: 0)
    _reactSubview = subview
  }

  public override func removeReactSubview(_ subview: UIView!) {
    debugPrint("\(uniqueId) HostFittedSheet.removeReactSubview", subview.tag as Any)
    //super.removeReactSubview(subview)
    _touchHandler?.detach(from: subview)
    _reactSubview?.removeFromSuperview()
    _reactSubview = nil
  }

  // need to leave it empty
  public override func didUpdateReactSubviews() {}

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    //tryToPresent()
  }


  @objc
  public func finalizeUpdates() {
    debugPrint("\(uniqueId) HostFittedSheet.finalizeUpdates _isPresented: \(_isPresented), superviewNil: \(superview == nil)")
    if _isPresented && superview == nil {
      destroy()
    } else {
      tryToPresent()
    }
  }

  // MARK: calculatedSize
  @objc
  public func setCalculatedHeight(_ height: CGFloat) {
    debugPrint("\(uniqueId) HostFittedSheet.setCalculatedHeight", height)
    // prevent show on change orientation for stack
    if let m = _modalViewController, presentedSheets.contains(m) {
      return
    }
    _sheetSize = RCTConvert.cgFloat(height)
    _modalViewController?.setSizes([.fixed(_sheetSize ?? 0)])
  }

  private func initializeSheet(_ size: CGSize) {
    debugPrint("\(uniqueId) HostFittedSheet.initializeSheet", size)
    self._modalViewController = SheetViewController(
      controller: self.viewController,
      sizes: [.fixed(size.height)],
      options: .init(
        pullBarHeight: 0,
        shouldExtendBackground: false,
        shrinkPresentingViewController: false,
        maxWidth: self.sheetMaxWidth
      )
    )

    self._modalViewController?.allowPullingPastMaxHeight = false
    self._modalViewController?.dismissOnOverlayTap = self.dismissable
    self._modalViewController?.dismissOnPull = self.dismissable
    self._modalViewController?.cornerRadius = self.topLeftRightCornerRadius ?? 12
    self._modalViewController?.contentBackgroundColor = _backgroundColor
  }

  private func tryAttachScrollView() {
    guard let controller = _modalViewController else { return }
    debugPrint("\(uniqueId) HostFittedSheet.tryAttachScrollView")
    let scrollView = self._reactSubview?.find(deepIndex: 0)
    if let v = scrollView {
      debugPrint("\(uniqueId) HostFittedSheet.tryAttachScrollView.found")
      controller.handleScrollView(v)
    }
  }

  private func tryToPresent() {
    if (!self.isUserInteractionEnabled && self.superview?.reactSubviews().contains(self) != nil) {
      return;
    }

    if (!_isPresented) {
      presentViewController = createVC()
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
      debugPrint("\(uniqueId) HostFittedSheet.tryToPresent", self.presentViewController)
      RCTExecuteOnMainQueue { [weak self] in
        guard let self else { return }

        self.initializeSheet(size)
        self.presentViewController?.present(self._modalViewController!, animated: true)
        self._modalViewController?.didDismiss = { [weak self] old, silent in
          guard let self else { return }
          debugPrint("\(uniqueId) HostFittedSheet._modalViewController.didDismiss", presentedSheets.count, RCTPresentedViewController())
          onSheetDismiss?()
          if old.dismissAll == true {
            debugPrint("\(uniqueId) HostFittedSheet._modalViewController.dismissingSilently")
            if stacked, let popped = presentedSheets.popLast() {
              popped.dismissAll = true
              popped.dismiss(animated: false)
            }
            return
          }
          if stacked, let popped = presentedSheets.popLast() {
            popped.setSizes(lastPresentedSheetSizes.popLast() ?? [])
          }
          debugPrint("______", presentedSheets)
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
    _modalViewController?.dismiss(animated: true)
  }

  @objc
  public func destroy() {
    debugPrint("\(uniqueId) HostFittedSheet.destroy")
    _isPresented = false

    let cleanup = { [weak self] in
      guard let self else { return }
      debugPrint("\(uniqueId) HostFittedSheet.cleanup")
      self.viewController.removeFromParent()
      self.viewController.view.removeFromSuperview()
      self._reactSubview?.removeFromSuperview()
      if let v = self._reactSubview {
        self._touchHandler?.detach(from: v)
      }
      self.presentViewController = nil
      self._modalViewController = nil
      self._touchHandler = nil
      self._sheetSize = nil
      self.sheetMaxWidthSize = nil
      self._reactSubview = nil
      self._alertWindow = nil
    }

    if self._modalViewController?.isBeingDismissed != true {
      debugPrint("\(uniqueId) HostFittedSheet._modalViewController?.isBeingDismissed")
      self._modalViewController?.dismiss(animated: true, completion: cleanup)
    } else {
      debugPrint("\(uniqueId) HostFittedSheet._modalViewController.cleanup")
      cleanup()
    }

  }

  deinit {
    debugPrint("\(uniqueId) HostFittedSheet.HostFittedSheet.deinit")
  }

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
}

