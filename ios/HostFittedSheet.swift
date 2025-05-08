import UIKit
import React

func viewPort() -> CGSize {
  var size: CGSize = .zero
  RCTUnsafeExecuteOnMainQueueSync {
    size = RCTViewportSize()
  }
  return size
}

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
  private var sheetMaxWidth: CGFloat {
    return sheetMaxWidthSize ?? viewPort().width
  }

  private var _alertWindow: UIWindow?
  var presentViewController: UIViewController?
  func createViewController() {
    if presentViewController != nil { return }
    debugPrint("😀 createViewController")
    _alertWindow = UIWindow(frame: .init(origin: .zero, size: viewPort()))
    let controller = UIViewController()
    _alertWindow?.rootViewController = controller
    _alertWindow?.windowLevel = UIWindow.Level.alert
    _alertWindow?.isHidden = false
    _alertWindow?.makeKeyAndVisible()

    presentViewController = controller
  }


  @objc
  public func setPassScrollViewReactTag() {
    debugPrint("😀 setPassScrollViewReactTag")
    tryAttachScrollView()
  }

  @objc
  public func setFittedSheetParams(_ params: NSDictionary) {
    debugPrint("😀 setFittedSheetParams", params)
    sheetMaxWidthSize = RCTConvert.cgFloat(params["maxWidth"])
    dismissable = params["dismissable"] as? Bool ?? true
    topLeftRightCornerRadius = RCTConvert.cgFloat(params["topLeftRightCornerRadius"])
  }

  public override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    debugPrint("😀 insertReactSubview", subview.tag as Any)
    //super.insertReactSubview(subview, at: atIndex)
    _touchHandler = RCTSurfaceTouchHandler()
    _touchHandler?.attach(to: subview)
    viewController.view.insertSubview(subview, at: 0)
    _reactSubview = subview
  }

  public override func removeReactSubview(_ subview: UIView!) {
    debugPrint("😀 removeReactSubview", subview.tag as Any)
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
    debugPrint("😀 finalizeUpdates _isPresented: \(_isPresented), superviewNil: \(superview == nil)")
    if _isPresented && superview == nil {
      destroy()
    } else {
      tryToPresent()
    }
  }

  // MARK: calculatedSize
  @objc
  public func setCalculatedHeight(_ height: CGFloat) {
    debugPrint("😀 setCalculatedHeight", height)
    _sheetSize = RCTConvert.cgFloat(height)
    _modalViewController?.setSizes([.fixed(_sheetSize ?? 0)])
  }

  private func initializeSheet(_ size: CGSize) {
    debugPrint("😀 initializeSheet", size)
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
    self._modalViewController?.autoAdjustToKeyboard = false
    self._modalViewController?.dismissOnPull = self.dismissable
    self._modalViewController?.cornerRadius = self.topLeftRightCornerRadius ?? 12
    self._modalViewController?.contentBackgroundColor = .clear
  }

  private func tryAttachScrollView() {
    guard let controller = _modalViewController else { return }
    debugPrint("😀 tryAttachScrollView")
    let scrollView = self._reactSubview?.find(deepIndex: 0)
    if let v = scrollView {
      debugPrint("😀 tryAttachScrollView.found")
      controller.handleScrollView(v)
    }
  }

  private func tryToPresent() {
    if (!self.isUserInteractionEnabled && self.superview?.reactSubviews().contains(self) != nil) {
      return;
    }

    if (!_isPresented) {
      _isPresented = true
      let size: CGSize = .init(width: self.sheetMaxWidth, height: _sheetSize ?? 0)
      debugPrint("😀 tryToPresent", size)
      RCTExecuteOnMainQueue { [weak self] in
        guard let self else { return }

        self.createViewController()
        self.initializeSheet(size)
        self.tryAttachScrollView()
        self.presentViewController?.present(self._modalViewController!, animated: true)
        self._modalViewController?.didDismiss = { [weak self] _ in
          debugPrint("😀 _modalViewController.didDismiss")
          self?.onSheetDismiss?()
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
    debugPrint("😀 destroy")
    _isPresented = false

    let cleanup = { [weak self] in
      guard let self = self else { return }
      debugPrint("😀 cleanup")
      self._modalViewController = nil
      self._reactSubview?.removeFromSuperview()
      if let v = self._reactSubview {
        self._touchHandler?.detach(from: v)
      }
      self._touchHandler = nil
      self._sheetSize = nil
      self.sheetMaxWidthSize = nil
      self._reactSubview = nil
      self.presentViewController = nil
      self._alertWindow = nil
    }

    if self._modalViewController?.isBeingDismissed != true {
      debugPrint("😀 dismissViewController")
      self._modalViewController?.dismiss(animated: true, completion: cleanup)
    } else {
      cleanup()
    }

  }

  deinit {
    debugPrint("😀 deinit")
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

