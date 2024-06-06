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


private class ModalHostShadowView: RCTShadowView {
    static var attachedViews: [Int: HostFittedSheet] = [:]
    override func insertReactSubview(_ subview: RCTShadowView!, at atIndex: Int) {
        super.insertReactSubview(subview, at: atIndex)
        if subview != nil {
            (subview as RCTShadowView).width = YGValue.init(value: Float(RCTScreenSize().width), unit: .point)
            subview.position = .absolute
        }
    }

    override func layoutSubviews(with layoutContext: RCTLayoutContext) {
        super.layoutSubviews(with: layoutContext)
        let tag = self.reactTag.intValue
        var size = reactSubviews()[0].contentFrame.size
        let view = ModalHostShadowView.attachedViews[tag]
        let maxheight = view?.sheetMaxHeightSize?.doubleValue ?? Double.infinity

        DispatchQueue.main.async {
            if size.height > maxheight {
                debugPrint("😀 ModalHostShadowView.constraint \(tag) \(size) \(maxheight)")
                size.height = maxheight
                view!.notifyForBoundsChange(newBounds: size)
            }
            view?._modalViewController?.setSizes([.fixed(size.height)])
        }
        debugPrint("😀 ModalHostShadowView.layout(with \(tag) \(size) \(maxheight)")
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

    private func getSheetView(withTag tag: NSNumber) -> HostFittedSheet? {
        // swiftlint:disable force_cast
        return bridge.uiManager.view(forReactTag: tag) as? HostFittedSheet
    }

    @objc
    final func dismiss(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.getSheetView(withTag: node)
            component?._modalViewController?.dismiss(animated: true)
            debugPrint("😀 SheetViewManager.dismiss")
        }
    }

    override func shadowView() -> RCTShadowView! {
        return ModalHostShadowView()
    }

    deinit {
        debugPrint("😀 SheetViewManager.deinit")
    }
}


private class HostFittedSheet: UIView {
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
        _alertWindow = UIWindow(frame: .init(origin: .zero, size: RCTScreenSize()))
        let controller = UIViewController()
        _alertWindow?.rootViewController = controller
        _alertWindow?.windowLevel = UIWindow.Level.alert
        _alertWindow?.isHidden = false
        return controller
    }()

    @objc
    private var onSheetDismiss: RCTDirectEventBlock?

    @objc
    func setIncreaseHeight(_ by: NSNumber) {
        if by.floatValue == 0 { return }
        debugPrint("😀 HostFittedSheet.setIncreaseHeight", by.floatValue)
        changeHeight(by.floatValue)
    }

    @objc
    func setDecreaseHeight(_ by: NSNumber) {
        if by.floatValue == 0 { return }
        debugPrint("😀 HostFittedSheet.setDecreaseHeight", -by.floatValue)
        changeHeight(-by.floatValue)
    }

    @objc
    func setPassScrollViewReactTag(_ tag: NSNumber) {
        debugPrint("😀 HostFittedSheet.setPassScrollViewReactTag", tag)
        guard let scrollView = self._bridge?.uiManager.view(forReactTag: tag) as? RCTScrollView else {
            return
        }
        if self._modalViewController == nil {
            self._scrollViewTag = tag
        }
        debugPrint("😀 HostFittedSheet.setPassScrollViewReactTag found", scrollView, self._modalViewController)
        self._modalViewController?.handleScrollView(scrollView.scrollView)
    }

    private func changeHeight(_ by: Float) {
        if !_isPresented { return }
        guard let reactSubView = _reactSubview else { return }

        let newHeight = CGFloat(by)
        if reactSubView.frame.height == newHeight { return }
        let increasedHeight = reactSubView.frame.height + newHeight
        debugPrint("HostFittedSheet.changeHeight from", reactSubView.frame.height, "to", increasedHeight)
        let sizes: [SheetSize] = [.fixed(increasedHeight)]
        self._modalViewController?.sizes = sizes
        self._modalViewController?.resize(to: sizes[0], animated: true)
        self.notifyForBoundsChange(newBounds: .init(width: reactSubView.frame.width, height: increasedHeight))
    }

    private var sheetMaxWidthSize: NSNumber?
    private var dismissable = true
    var sheetMaxHeightSize: NSNumber?
    private var topLeftRightCornerRadius: NSNumber?
    private var sheetBackgroundColor: UIColor?

    @objc
    var fittedSheetParams: NSDictionary? {
        didSet {
            sheetMaxWidthSize = (fittedSheetParams?["maxWidth"] as? NSNumber)
            sheetMaxHeightSize = (fittedSheetParams?["maxHeight"] as? NSNumber)
            dismissable = (fittedSheetParams?["dismissable"] as? Bool) ?? true
            topLeftRightCornerRadius = (fittedSheetParams?["topLeftRightCornerRadius"] as? NSNumber)
            sheetBackgroundColor = RCTConvert.uiColor(fittedSheetParams?["backgroundColor"])
        }
    }

    private var sheetWidth: CGFloat {
        return CGFloat(sheetMaxWidthSize?.floatValue ?? Float(UIScreen.main.bounds.width))
    }

    init(bridge: RCTBridge) {
        self._bridge = bridge
        super.init(frame: .zero)
        _touchHandler = RCTTouchHandler(bridge: bridge)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func notifyForBoundsChange(newBounds: CGSize) {
      if (_reactSubview != nil && _isPresented) {
          debugPrint("😀 HostFittedSheet.notifyForBoundsChange \(newBounds)")
          _bridge?.uiManager.setSize(newBounds, for: _reactSubview!)
      }
    }

    override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        debugPrint("😀 HostFittedSheet.insertReactSubview")
        super.insertReactSubview(subview, at: atIndex)
        _touchHandler?.attach(to: subview)
        viewController.view.insertSubview(subview, at: 0)
        _reactSubview = subview
    }

    override func removeReactSubview(_ subview: UIView!) {
        debugPrint("😀 HostFittedSheet.removeReactSubview")
        super.removeReactSubview(subview)
        _touchHandler?.detach(from: subview)
        _reactSubview = nil
        //destroy()
    }

    // need to leave it empty
    override func didUpdateReactSubviews() {}

    override func didMoveToWindow() {
        super.didMoveToWindow()

        // In the case where there is a LayoutAnimation, we will be reinserted into the view hierarchy but only for aesthetic
        // purposes. In such a case, we should NOT represent the <Modal>.

        if (!self.isUserInteractionEnabled && self.superview?.reactSubviews().contains(self) != nil) {
          return;
        }

        if (!_isPresented && self.window != nil) {
            _isPresented = true
            var size: CGSize = .zero
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                if self._sheetSize?.floatValue == nil {
                    self._reactSubview?.setNeedsLayout()
                    self._reactSubview?.layoutIfNeeded()
                    self._reactSubview?.sizeToFit()
                    size = self._reactSubview?.frame.size ?? .zero
                } else {
                    size = .init(width: self.sheetWidth, height: CGFloat(self._sheetSize!.floatValue))
                }
                if size.width > self.sheetWidth {
                    size.width = self.sheetWidth
                }
                // if maxSize is present notify react native view
                if self.sheetMaxHeightSize != nil && size.height > self.sheetMaxHeightSize!.doubleValue {
                    size.height = self.sheetMaxHeightSize!.doubleValue
                    self.notifyForBoundsChange(newBounds: size)
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
                debugPrint("😀 HostFittedSheet.attachedViews \(self.reactTag.intValue)")
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
                    debugPrint("😀 HostFittedSheet.didDismiss \(self?.onSheetDismiss)")
                    self?.onSheetDismiss?([:])
                }
            }
        }
    }

    override func removeFromSuperview() {
        super.removeFromSuperview()
        debugPrint("😀 HostFittedSheet.removeFromSuperview")
        //destroy()
    }

    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        if _isPresented && superview == nil {
            debugPrint("😀 HostFittedSheet.didMoveToSuperview")
            destroy()
        }
    }

    func destroy() {
        debugPrint("😀 HostFittedSheet.destroy")
        _isPresented = false

        let cleanup = { [weak self] in
            guard let self = self else { return }
            debugPrint("😀 HostFittedSheet.cleanup")
            ModalHostShadowView.attachedViews.removeValue(forKey: self.reactTag.intValue)
            self._modalViewController = nil
            self._reactSubview?.removeFromSuperview()
            self._touchHandler?.detach(from: self._reactSubview)
            self._touchHandler = nil
            self._bridge = nil
            self.onSheetDismiss = nil
            self._sheetSize = nil
            self.sheetMaxWidthSize = nil
            self._reactSubview = nil
            self._alertWindow = nil
        }

        if self._modalViewController?.isBeingDismissed != true {
            debugPrint("😀 HostFittedSheet.dismissViewController")
            self._modalViewController?.dismiss(animated: true, completion: cleanup)
        } else {
            cleanup()
        }

    }

    deinit {
        debugPrint("😀 HostFittedSheet.deinit")
    }

}
