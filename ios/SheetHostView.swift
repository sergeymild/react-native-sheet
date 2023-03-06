//
//  SheetHostView.swift
//  Sheet
//
//  Created by Sergei Golishnikov on 21/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import UIKit
import React
import FittedSheets

@objc(SheetHostViewManager)
class SheetHostViewManager: RCTViewManager {

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func customBubblingEventTypes() -> [String]! {
        return ["onSheetDismiss"]
    }

    override func view() -> UIView! {
        let v = SheetHostView(bridge: bridge, delegate: self)
        return v
    }

    @objc
    func dismiss() {
        debugPrint("🥲dismiss")
    }

    override func shadowView() -> RCTShadowView! {
        return ModalHostShadowView()
    }
    
    func presentModalHostView(_ modalHostView: SheetHostView, _ viewController: UIViewController) {
        
    }

    deinit {
        debugPrint("🥲 deinit view manager")
    }
}

class SheetHostView: UIView {
    private let bridge: RCTBridge;
    private weak var delegate: SheetHostViewManager?
    var _reactSubview: UIView?
    let _modalViewController = SheetHostViewController()
    var _sheetViewController: SheetViewController?
    var _isPresented = false
    
    init(bridge: RCTBridge, delegate: SheetHostViewManager?) {
        self.bridge = bridge
        self.delegate = delegate
        
        super.init(frame: .zero)

        _isPresented = false
//        _modalViewController.boundsDidChangeBlock = { [weak self] newBounds in
//            self?.notifyForBoundsChange(newBounds)
//        }
    }
    
    func notifyForBoundsChange(_ newBounds: CGRect) {
        debugPrint("🥲 ++++++++ \(newBounds)")
        if _reactSubview != nil && _isPresented {
            bridge.uiManager.setSize(newBounds.size, for: _reactSubview!)
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        super.insertReactSubview(subview, at: atIndex)
        _modalViewController.view.addSubview(subview)
        _reactSubview = subview
        
        
    }
    
    override func removeReactSubview(_ subview: UIView!) {
        super.removeReactSubview(subview)
        _reactSubview = nil
        ModalHostShadowView.attachedViews.removeValue(forKey: reactTag.intValue)
    }
    
    override func didUpdateReactSubviews() {
        
    }
    
    func dismissModalViewController() {
        if _isPresented {
//          [_delegate dismissModalHostView:self withViewController:_modalViewController animated:[self hasAnimationType]];
          _isPresented = false;
        }
    }
    
    override func didMoveToWindow() {
        super.didMoveToWindow()
        if !self.isUserInteractionEnabled && !self.superview!.reactSubviews().contains(self) {
            return
        }
        ensurePresentedOnlyIfNeeded()
    }
    
    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        ensurePresentedOnlyIfNeeded()
    }
    
    func ensurePresentedOnlyIfNeeded() {
        let shouldBePresented = !_isPresented && self.window != nil
        if shouldBePresented {
            _modalViewController.addPanGestureRecognizer()
            delegate?.presentModalHostView(self, _modalViewController)
            _isPresented = true;
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        debugPrint("🥲 subvewiheight ----- \(_reactSubview?.frame.size.height ?? 0)")
        self.frame.size.height = _reactSubview?.frame.size.height ?? 0
        //self.delegate?._modalViewController?.setSizes([.fixed(self.frame.size.height)])
    }
}
