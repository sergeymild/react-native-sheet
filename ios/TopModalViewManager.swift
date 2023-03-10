//
//  TopModalViewManager.swift
//  Sheet
//
//  Created by Sergei Golishnikov on 10/03/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import UIKit
import React
import FittedSheets


class TopModalShadowView: RCTShadowView {
    static var attachedViews: [Int: HostFittedSheet] = [:]
    override func insertReactSubview(_ subview: RCTShadowView!, at atIndex: Int) {
        super.insertReactSubview(subview, at: atIndex)
        if subview != nil {
            (subview as RCTShadowView).width = YGValue.init(value: Float(RCTScreenSize().width), unit: .point)
            subview.position = .absolute
            subview.alignItems = .flexEnd
        }
    }
}

@objc(TopModalViewManager)
class TopModalViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func customBubblingEventTypes() -> [String]! {
        return ["onTopModalDismiss"]
    }

    override func view() -> UIView! {
        let v = TopModalView(bridge: bridge)
        return v
    }
    
    private func getSheetView(withTag tag: NSNumber) -> TopModalView {
        // swiftlint:disable force_cast
        return bridge.uiManager.view(forReactTag: tag) as! TopModalView
    }

    @objc
    final func dismiss(_ node: NSNumber) {
        DispatchQueue.main.async {
            let component = self.getSheetView(withTag: node)
            component.dismissVC()
            debugPrint("😀dismiss")
        }
    }

    override func shadowView() -> RCTShadowView! {
        return ModalHostShadowView()
    }

    deinit {
        debugPrint("😀 deinit view manager")
    }
}


class TopModalView: UIView {
    let viewController = UIViewController()
    var _touchHandler: RCTTouchHandler?
    var _reactSubview: UIView?
    var _bridge: RCTBridge?
    weak var manager: SheetViewManager?
    var _isPresented = false
    var _scrollViewTag: NSNumber?
    
    private var _alertWindow: UIWindow?
    private lazy var presentViewController: UIViewController = {
        _alertWindow = UIWindow(frame: .init(origin: .zero, size: RCTScreenSize()))
        let controller = UIViewController()
        _alertWindow?.rootViewController = controller
        _alertWindow?.windowLevel = UIWindow.Level.alert + 10
        _alertWindow?.isHidden = false
        viewController.modalPresentationStyle = .fullScreen
        viewController.view.backgroundColor = .yellow
        return controller
    }()

    @objc
    private var onModalDismiss: RCTBubblingEventBlock?
    
    
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
        if (!self.isUserInteractionEnabled && self.superview?.reactSubviews().contains(self) != nil) {
          return;
        }

        if (!_isPresented && self.window != nil) {
            _isPresented = true
            DispatchQueue.main.async { [weak self] in
                guard let self = self else {return}
                self.viewController.view.addSubview(self._reactSubview!)
                self.presentViewController.present(self.viewController, animated: true)
            }
        }
    }

    override func removeFromSuperview() {
        super.removeFromSuperview()
        debugPrint("😀removeFromSuperview")
        //destroy()
    }

    override func didMoveToSuperview() {
        super.didMoveToSuperview()
        if _isPresented && superview == nil {
            debugPrint("😀didMoveToSuperview")
            destroy()
        }
    }
    
    func dismissVC() {
        self.viewController.dismiss(animated: true) {
            debugPrint("😀 dismissVC \(self.onModalDismiss)")
            self.onModalDismiss?([:])
        }
    }

    func destroy() {
        debugPrint("😀destroy")
        _isPresented = false
        
        let cleanup = { [weak self] in
            guard let self = self else { return }
            debugPrint("😀 cleanup")
            self._reactSubview?.removeFromSuperview()
            self._touchHandler?.detach(from: self._reactSubview)
            self._touchHandler = nil
            self._bridge = nil
            self.onModalDismiss = nil
            self._reactSubview = nil
            self._alertWindow = nil
        }
        
        
        if self.viewController.isBeingDismissed != true {
            debugPrint("😀dismissViewController")
            self.viewController.dismiss(animated: true, completion: cleanup)
        } else {
            cleanup()
        }
        
    }

    deinit {
        debugPrint("😀deinit")
    }
}
