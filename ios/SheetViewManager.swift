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

final class HostFittedSheet: UIView {
  private(set) var _modalViewController: SheetViewController?
  private let viewController = UIViewController()
  private var _touchHandler: RCTTouchHandler?
  @objc
  private var onSheetDismiss: RCTDirectEventBlock?
  private var _reactSubview: UIView?
  private var _bridge: RCTBridge?
  private var _isPresented = false
  private var _sheetSize: CGFloat?
  private var _scrollViewTag: NSNumber?
  private var sheetMaxWidthSize: CGFloat?
  private var dismissable = true
  private var topLeftRightCornerRadius: CGFloat?
  private var sheetBackgroundColor: UIColor?
  
  private var sheetMaxWidth: CGFloat {
      return sheetMaxWidthSize ?? viewPort().width
  }
  
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
  func setFittedSheetParams(_ params: NSDictionary) {
    debugPrint("😀 setFittedSheetParams", params)
    sheetMaxWidthSize = RCTConvert.cgFloat(params["maxPortraitWidth"])
    
    if UIDevice.current.orientation.isLandscape {
      sheetMaxWidthSize = RCTConvert.cgFloat(params["maxLandscapeWidth"])
    }

    dismissable = params["dismissable"] as? Bool ?? true
    topLeftRightCornerRadius = RCTConvert.cgFloat(params["topLeftRightCornerRadius"])
    sheetBackgroundColor = RCTConvert.uiColor(params["backgroundColor"])
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
    debugPrint("😀 insertReactSubview")
    super.insertReactSubview(subview, at: atIndex)
    _touchHandler?.attach(to: subview)
    viewController.view.insertSubview(subview, at: 0)
    _reactSubview = subview
  }
  
  override func removeReactSubview(_ subview: UIView!) {
    debugPrint("😀 removeReactSubview")
    super.removeReactSubview(subview)
    _touchHandler?.detach(from: subview)
    _reactSubview = nil
  }
  
  // need to leave it empty
  override func didUpdateReactSubviews() {}
  
  override func didMoveToWindow() {
    super.didMoveToWindow()
    tryToPresent()
  }
  
  override func didMoveToSuperview() {
    super.didMoveToSuperview()
    debugPrint("😀 didMoveToSuperview _isPresented: \(_isPresented), superviewNil: \(superview == nil)")
    if _isPresented && superview == nil {
        destroy()
    } else {
        tryToPresent()
    }
  }
  
  // MARK: calculatedSize
  @objc
  func setCalculatedHeight(_ height: NSNumber) {
    debugPrint("😀 setCalculatedHeight", height)
    _sheetSize = RCTConvert.cgFloat(height)
    _modalViewController?.setSizes([.fixed(_sheetSize ?? 0)])
  }
  
  private func initializeSheet(_ size: CGSize) {
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
    self._modalViewController?.contentBackgroundColor = self.sheetBackgroundColor ?? .clear
  }

  private func tryAttachScrollView() {
    if let tag = self._scrollViewTag {
      self.setPassScrollViewReactTag(tag)
    } else {
      let scrollView = self._reactSubview?.find(FITTED_SHEET_SCROLL_VIEW, deepIndex: 0) as? RCTScrollView
      if scrollView != nil {
        self._modalViewController?.handleScrollView(scrollView!.scrollView)
      }
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
        
        self.initializeSheet(size)
        self.tryAttachScrollView()
        self.presentViewController.present(self._modalViewController!, animated: true)
        self._modalViewController?.didDismiss = { [weak self] _ in
          debugPrint("😀 _modalViewController.didDismiss")
          self?.onSheetDismiss?([:])
        }
      }
    }
  }
  
  func destroy() {
    debugPrint("😀 destroy")
    _isPresented = false
    
    let cleanup = { [weak self] in
      guard let self = self else { return }
      debugPrint("😀 cleanup")
      //ModalHostShadowView.attachedViews.removeValue(forKey: self.reactTag.intValue)
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
