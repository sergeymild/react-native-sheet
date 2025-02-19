//
//  AppFittedSheet.swift
//  PopupMenu
//
//  Created by Sergei Golishnikov on 14/02/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation
import UIKit
import React

class ModalHostShadowView: RCTShadowView {
  static var attachedViews: [Int: HostFittedSheet] = [:]
  override func insertReactSubview(_ subview: RCTShadowView!, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)
    if subview != nil {
        let s = viewPort()
      let orientation = UIDevice.current.orientation
      var width = s.width
      if orientation == .landscapeLeft || orientation == .landscapeRight {
        width = s.height
      }
      (subview as RCTShadowView).width = YGValue.init(value: Float(width), unit: .point)
      subview.position = .absolute
    }
  }
  
  func renderSizes(subviews: [RCTShadowView]?) {
    guard let subviews else { return }
    for v in subviews {
      debugPrint(v)
      renderSizes(subviews: v.reactSubviews())
    }
  }
  
  override func layoutSubviews(with layoutContext: RCTLayoutContext) {
    super.layoutSubviews(with: layoutContext)
    
    RCTExecuteOnMainQueue { [weak self] in
      guard let self else { return }
      let view = RCTBridge.current().uiManager.view(
        forReactTag: self.reactTag) as? HostFittedSheet
      let v = self.reactSubviews()[0]
      let size = v.contentFrame.size
      debugPrint("😀 ModalHostShadowView.layoutSubviews", size)
      view?._modalViewController?.setSizes([.fixed(size.height)])
    }
  }
}

let FITTED_SHEET_SCROLL_VIEW = "fittedSheetScrollView"

@objc(SheetViewManager)
class SheetViewManager: RCTViewManager {
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    let v = HostFittedSheet(bridge: bridge)
    return v
  }
  
  private func getSheetView(withTag tag: NSNumber) -> HostFittedSheet {
    // swiftlint:disable force_cast
    return bridge.uiManager.view(forReactTag: tag) as! HostFittedSheet
  }
  
  @objc
  final func dismiss(_ node: NSNumber) {
    DispatchQueue.main.async {
      let component = self.getSheetView(withTag: node)
      component._modalViewController?.dismiss(animated: true)
      debugPrint("😀dismiss")
    }
  }
  
  @objc
  func viewportSize() -> [String: CGFloat] {
    let size = viewPort()
    return ["width": size.width, "height": size.height]
  }
  
  override func shadowView() -> RCTShadowView! {
    return ModalHostShadowView()
  }
  
  deinit {
    debugPrint("😀 deinit view manager")
  }
}

func viewPort() -> CGSize {
  var size: CGSize = .zero
  RCTUnsafeExecuteOnMainQueueSync {
    size = RCTViewportSize()
  }
  return size
}

class HostFittedSheet: UIView {
  var _modalViewController: SheetViewController?
  let viewController = UIViewController()
  var _touchHandler: RCTTouchHandler?
  var _reactSubview: UIView?
  var _bridge: RCTBridge?
  var _isPresented = false
  var _sheetSize: NSNumber?
  var _scrollViewTag: NSNumber?
  
  private var _alertWindow: UIWindow?
  private lazy var presentViewController: UIViewController = {
    _alertWindow = UIWindow(frame: .init(origin: .zero, size: viewPort()))
    let controller = UIViewController()
    _alertWindow?.rootViewController = controller
    _alertWindow?.windowLevel = UIWindow.Level.alert
    _alertWindow?.isHidden = false
    _alertWindow?.makeKeyAndVisible()
    return controller
  }()
  
  @objc
  private var onSheetDismiss: RCTDirectEventBlock?
  
  var sheetMaxWidthSize: NSNumber?
  private var dismissable = true
  var sheetMaxHeightSize: NSNumber?
  var sheetMinHeightSize: NSNumber?
  private var topLeftRightCornerRadius: NSNumber?
  private var sheetBackgroundColor: UIColor?
  
  @objc
  func setPassScrollViewReactTag(_ tag: NSNumber) {
    debugPrint("😀 setPassScrollViewReactTag", tag)
    guard let scrollView = self._bridge?.uiManager.view(forReactTag: tag) as? RCTScrollView else {
      return
    }
    if self._modalViewController == nil {
      self._scrollViewTag = tag
    }
    debugPrint("😀 setPassScrollViewReactTag found", scrollView, self._modalViewController)
    self._modalViewController?.handleScrollView(scrollView.scrollView)
  }
  
  @objc
  var fittedSheetParams: NSDictionary? {
    didSet {
      debugPrint("😀 ", fittedSheetParams ?? "nil")
      sheetMaxWidthSize = (fittedSheetParams?["maxWidth"] as? NSNumber)
      sheetMaxHeightSize = (fittedSheetParams?["maxHeight"] as? NSNumber)
      sheetMinHeightSize = (fittedSheetParams?["minHeight"] as? NSNumber)
      dismissable = (fittedSheetParams?["dismissable"] as? Bool) ?? true
      topLeftRightCornerRadius = (fittedSheetParams?["topLeftRightCornerRadius"] as? NSNumber)
      sheetBackgroundColor = RCTConvert.uiColor(fittedSheetParams?["backgroundColor"])
    }
  }
  
  var sheetWidth: CGFloat {
      return CGFloat(sheetMaxWidthSize?.floatValue ?? Float(viewPort().width))
  }
  
  init(bridge: RCTBridge) {
    self._bridge = bridge
    super.init(frame: .zero)
    _touchHandler = RCTTouchHandler(bridge: bridge)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    debugPrint("😀insertReactSubview")
    super.insertReactSubview(subview, at: atIndex)
    _touchHandler?.attach(to: subview)
    viewController.view.insertSubview(subview, at: 0)
    _reactSubview = subview
  }
  
  override func removeReactSubview(_ subview: UIView!) {
    debugPrint("😀removeReactSubview")
    super.removeReactSubview(subview)
    _touchHandler?.detach(from: subview)
    _reactSubview = nil
    //destroy()
  }
  
  // need to leave it empty
  override func didUpdateReactSubviews() {}
  
  override func didMoveToWindow() {
    super.didMoveToWindow()
    tryToPresent()
  }
  
  
  
  override func removeFromSuperview() {
    super.removeFromSuperview()
    debugPrint("😀removeFromSuperview")
    //destroy()
  }
  
  override func didMoveToSuperview() {
    super.didMoveToSuperview()
    debugPrint("😀didMoveToSuperview _isPresented: \(_isPresented), superviewNil: \(superview == nil)")
    if _isPresented && superview == nil {
        destroy()
    } else {
        tryToPresent()
    }
  }
  
  private func tryToPresent() {
    if (!self.isUserInteractionEnabled && self.superview?.reactSubviews().contains(self) != nil) {
      return;
    }
    
    if (!_isPresented) {
      _isPresented = true
      var size: CGSize = .zero
      DispatchQueue.main.async { [weak self] in
        guard let self = self else { return }
        if self._sheetSize?.floatValue == nil {
          self._reactSubview?.setNeedsLayout()
          self._reactSubview?.layoutIfNeeded()
          self._reactSubview?.sizeToFit()
          size = self._reactSubview?.frame.size ?? .zero
          debugPrint("😀 self._sheetSize?.floatValue == nil", size)
        } else {
          size = .init(width: self.sheetWidth, height: CGFloat(self._sheetSize!.floatValue))
          debugPrint("😀 else", size)
        }
        
        if size.width > self.sheetWidth {
          size.width = self.sheetWidth
        }
        // if maxSize is present notify react native view
        if self.sheetMaxHeightSize != nil && size.height > self.sheetMaxHeightSize!.doubleValue {
          size.height = self.sheetMaxHeightSize!.doubleValue
        }
        // if maxSize is present notify react native view
        if self.sheetMinHeightSize != nil && size.height < self.sheetMinHeightSize!.doubleValue {
          size.height = self.sheetMinHeightSize!.doubleValue
        }
        
        self._modalViewController = SheetViewController(
          controller: self.viewController,
          sizes: [.fixed(size.height)],
          options: .init(
            pullBarHeight: 0,
            shouldExtendBackground: false,
            shrinkPresentingViewController: false,
            maxWidth: self.sheetWidth
          )
        )
        self._modalViewController?.allowPullingPastMaxHeight = false
        self._modalViewController?.dismissOnOverlayTap = self.dismissable
        self._modalViewController?.autoAdjustToKeyboard = false
        self._modalViewController?.dismissOnPull = self.dismissable
        self._modalViewController?.cornerRadius = self.topLeftRightCornerRadius?.doubleValue ?? 12
        self._modalViewController?.contentBackgroundColor = self.sheetBackgroundColor ?? .clear
        debugPrint("😀 attachedViews \(self.reactTag.intValue)")
        ModalHostShadowView.attachedViews[self.reactTag.intValue] = self
        
        if let tag = self._scrollViewTag {
          self.setPassScrollViewReactTag(tag)
        } else {
          let scrollView = self._reactSubview?.find(FITTED_SHEET_SCROLL_VIEW, deepIndex: 0) as? RCTScrollView
          if scrollView != nil {
            self._modalViewController?.handleScrollView(scrollView!.scrollView)
          }
        }
        
        self.presentViewController.present(self._modalViewController!, animated: true)
        //self.reactViewController().present(self._modalViewController!, animated: true)
        
        self._modalViewController?.didDismiss = { [weak self] _ in
          debugPrint("😀didDismiss \(self?.onSheetDismiss)")
          self?.onSheetDismiss?([:])
        }
      }
    }
  }
  
  func destroy() {
    debugPrint("😀destroy")
    _isPresented = false
    
    let cleanup = { [weak self] in
      guard let self = self else { return }
      debugPrint("😀 cleanup")
      ModalHostShadowView.attachedViews.removeValue(forKey: self.reactTag.intValue)
      self._modalViewController = nil
      self._reactSubview?.removeFromSuperview()
      if let v = self._reactSubview {
        self._touchHandler?.detach(from: self._reactSubview)
      }
      self._touchHandler = nil
      self._bridge = nil
      self.onSheetDismiss = nil
      self._sheetSize = nil
      self.sheetMaxWidthSize = nil
      self._reactSubview = nil
      self._alertWindow = nil
    }
    
    if self._modalViewController?.isBeingDismissed != true {
      debugPrint("😀dismissViewController")
      self._modalViewController?.dismiss(animated: true, completion: cleanup)
    } else {
      cleanup()
    }
    
  }
  
  deinit {
    debugPrint("😀deinit")
  }
  
}


extension UIView {
  func find(_ nId: String, deepIndex: Int) -> UIView? {
    if deepIndex >= 10 { return nil }
    if self.nativeID?.contains(nId) == true || self.accessibilityIdentifier?.contains(nId) == true {
      return self
    }
    
    let index = deepIndex + 1
    for subview in subviews {
      if let v = subview.find(nId, deepIndex: index) {
        return v
      }
    }
    
    return nil
  }
}
