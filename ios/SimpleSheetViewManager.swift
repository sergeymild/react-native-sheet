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
    static var attachedViews: [Int: HostFittedSheet2] = [:]

    override func layoutSubviews(with layoutContext: RCTLayoutContext) {
        super.layoutSubviews(with: layoutContext)
        let tag = self.reactTag.intValue
        var size = reactSubviews()[0].contentFrame.size
        let view = ModalHostShadowView.attachedViews[tag]
        let maxheight = view?.sheetMaxHeightSize?.doubleValue ?? RCTScreenSize().height

        DispatchQueue.main.async {
            if size.height > maxheight {
                debugPrint("😀 ModalHostShadowView.constraint \(tag) \(size) \(maxheight)")
                size.height = maxheight
                view?.notifyForBoundsChange(newBounds: size)
            }
            
            if let view {
                var sizes: [SheetSize] = []
                
                if let sheetMinHeightSize = view.sheetMinHeightSize {
                    sizes.append(.fixed(sheetMinHeightSize.doubleValue))
                }
                sizes.append(.fixed(size.height))
                
                view.frame.size.height = size.height
                view._modalViewController?.setSizes(sizes, skipHeightConstraint: true)
                debugPrint("😀 ModalHostShadowView.layout(with \(tag) height: \(size.height) maxheight: \(maxheight)", sizes)
            }
        }
    }
    
    deinit {
        debugPrint("ModalHostShadowView.deinit")
    }
}

@objc(SimpleSheetViewManager)
class SimpleSheetViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        let v = HostFittedSheet2(bridge: bridge)
        return v
    }

    private func getSheetView(withTag tag: NSNumber) -> HostFittedSheet2 {
        // swiftlint:disable force_cast
        return bridge.uiManager.view(forReactTag: tag) as! HostFittedSheet2
    }

    @objc
    final func dismiss(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.getSheetView(withTag: node)
            component._modalViewController?.dismiss(animated: true)
            debugPrint("😀 SimpleSheetViewManager.dismiss")
        }
    }

    override func shadowView() -> RCTShadowView! {
        return ModalHostShadowView()
    }

    deinit {
        debugPrint("😀 SimpleSheetViewManager.deinit")
    }
}


private class HostFittedSheet2: UIView {
    var _modalViewController: SheetViewController?
    let viewController = UIViewController()
    var _touchHandler: RCTTouchHandler?
    var _reactSubview: UIView?
    var _bridge: RCTBridge?
    var _isPresented = false
    var _sheetSize: NSNumber?
    var _scrollViewTag: NSNumber?

    @objc
    private var onSheetDismiss: RCTDirectEventBlock?

    @objc
    func setIncreaseHeight(_ by: NSNumber) {
        if by.floatValue == 0 { return }
        debugPrint("😀 HostFittedSheet2.setIncreaseHeight", by.floatValue)
        changeHeight(by.floatValue)
    }

    @objc
    func setDecreaseHeight(_ by: NSNumber) {
        if by.floatValue == 0 { return }
        debugPrint("😀 HostFittedSheet2.setDecreaseHeight", -by.floatValue)
        changeHeight(-by.floatValue)
    }

    @objc
    func setPassScrollViewReactTag(_ tag: NSNumber) {
        debugPrint("😀 HostFittedSheet2.setPassScrollViewReactTag", tag)
        guard let scrollView = self._bridge?.uiManager.view(forReactTag: tag) as? RCTScrollView else {
            return
        }
        if self._modalViewController == nil {
            self._scrollViewTag = tag
        }
        debugPrint("😀 HostFittedSheet2.setPassScrollViewReactTag found", scrollView, self._modalViewController)
        self._modalViewController?.handleScrollView(scrollView.scrollView)
    }

    private func changeHeight(_ by: Float) {
        if !_isPresented { return }
        guard let reactSubView = _reactSubview else { return }

        let newHeight = CGFloat(by)
        if reactSubView.frame.height == newHeight { return }
        var increasedHeight = reactSubView.frame.height + newHeight
        let _min = sheetMinHeightSize?.doubleValue ?? 0
        let _max = sheetMaxHeightSize?.doubleValue ?? RCTScreenSize().height
        increasedHeight = max(_min, increasedHeight)
        increasedHeight = min(_max, increasedHeight)
        
        debugPrint("😀 HostFittedSheet2.changeHeight from", reactSubView.frame.height, "to", increasedHeight, "self", self.frame.size.height)
        let sizes: [SheetSize] = [.fixed(increasedHeight)]
        self._modalViewController?.setSizes(sizes)
        self.notifyForBoundsChange(newBounds: .init(width: reactSubView.frame.width, height: increasedHeight))
        self.frame.size.height = increasedHeight
        setNeedsLayout()
        layoutSubviews()
    }

    private var sheetMaxWidthSize: NSNumber?
    private var dismissable = true
    var sheetMaxHeightSize: NSNumber?
    var sheetMinHeightSize: NSNumber?
    private var topLeftRightCornerRadius: NSNumber?
    private var sheetBackgroundColor: UIColor?

    @objc
    var fittedSheetParams: NSDictionary? {
        didSet {
            sheetMaxWidthSize = (fittedSheetParams?["maxWidth"] as? NSNumber)
            sheetMaxHeightSize = (fittedSheetParams?["maxHeight"] as? NSNumber)
            sheetMinHeightSize = (fittedSheetParams?["minHeight"] as? NSNumber)
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
          debugPrint("😀 HostFittedSheet2.notifyForBoundsChange \(newBounds)")
          _bridge?.uiManager.setSize(newBounds, for: _reactSubview!)
      }
    }

    override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        super.insertReactSubview(subview, at: atIndex)
        _touchHandler?.attach(to: subview)
        viewController.view.insertSubview(subview, at: 0)
        _reactSubview = subview
    }

    override func removeReactSubview(_ subview: UIView!) {
        debugPrint("😀 HostFittedSheet2.removeReactSubview")
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
                backgroundColor = .green
                var sizes: [SheetSize] = []
                if let sheetMinHeightSize {
                    sizes.append(.fixed(sheetMinHeightSize.doubleValue))
                }
                sizes.append(.fixed(size.height))
//                if let sheetMaxHeightSize {
//                    sizes.append(.fixed(sheetMaxHeightSize.doubleValue))
//                }
                debugPrint("😀 HostFittedSheet2.sizes", sizes)
                self._modalViewController = SheetViewController(
                    controller: self.viewController,
                    sizes: sizes,
                    options: .init(
                        pullBarHeight: 0,
                        shouldExtendBackground: false,
                        shrinkPresentingViewController: false,
                        useInlineMode: true,
                        maxWidth: self.sheetWidth
                    )
                )
                self._modalViewController?.allowPullingPastMaxHeight = false
                self._modalViewController?.dismissOnOverlayTap = self.dismissable
                self._modalViewController?.autoAdjustToKeyboard = false
                self._modalViewController?.dismissOnPull = self.dismissable
                self._modalViewController?.overlayColor = .clear
                self._modalViewController?.cornerRadius = self.topLeftRightCornerRadius?.doubleValue ?? 12
                self._modalViewController?.contentBackgroundColor = self.sheetBackgroundColor ?? .clear
                _modalViewController?.allowGestureThroughOverlay = true
                _modalViewController?.animateIn(to: self)
                debugPrint("😀 HostFittedSheet2.attachedViews \(self.reactTag.intValue)")
                ModalHostShadowView.attachedViews[self.reactTag.intValue] = self

                if let tag = self._scrollViewTag {
                    self.setPassScrollViewReactTag(tag)
                } else {
                    let scrollView = self._reactSubview?.find(FITTED_SHEET_SCROLL_VIEW, deepIndex: 0) as? RCTScrollView
                    if scrollView != nil {
                        self._modalViewController?.handleScrollView(scrollView!.scrollView)
                    }
                }

                self.backgroundColor = .clear
                self.accessibilityLabel = "sheetViewController"
                self._modalViewController?.didDismiss = { [weak self] _ in
                    debugPrint("😀 HostFittedSheet2.didDismiss \(self?.onSheetDismiss)")
                    self?.onSheetDismiss?([:])
                }
            }
        }
    }

    override func removeFromSuperview() {
        super.removeFromSuperview()
        debugPrint("😀 HostFittedSheet2.removeFromSuperview")
        //destroy()
    }

    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        if _isPresented && superview == nil {
            debugPrint("😀 HostFittedSheet2.didMoveToSuperview")
            destroy()
        }
    }

    func destroy() {
        debugPrint("😀 HostFittedSheet2.destroy")
        _isPresented = false

        let cleanup = { [weak self] in
            guard let self = self else { return }
            debugPrint("😀 HostFittedSheet2.cleanup")
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
        }

        if self._modalViewController?.isBeingDismissed != true {
            debugPrint("😀 HostFittedSheet2.dismissViewController")
            self._modalViewController?.dismiss(animated: true, completion: cleanup)
        } else {
            cleanup()
        }

    }

    deinit {
        debugPrint("😀 HostFittedSheet2.deinit")
    }
    
    
    // Override the hitTest method
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        // First, check if the point is within the bounds of this view
        if self.point(inside: point, with: event) {
            // Loop through the subviews in reverse order (front-to-back)
            for subview in self.subviews.reversed() {
                // Convert the point to the subview's coordinate system
                let convertedPoint = subview.convert(point, from: self)
                // Perform a hit test on the subview
                if let hitView = subview.hitTest(convertedPoint, with: event) {
                    return hitView
                }
            }
            // If no subview contains the point, return self
            return nil
        }
        // If the point is outside the bounds of this view, return nil
        return nil
    }
    
}


extension UIView {
    func find(_ nId: String, deepIndex: Int) -> UIView? {
        if deepIndex >= 10 { return nil }
        if self.nativeID == nId || self.accessibilityIdentifier == nId {
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
