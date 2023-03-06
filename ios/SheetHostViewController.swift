//
//  SheetHostViewController.swift
//  Sheet
//
//  Created by Sergei Golishnikov on 27/02/2023.
//  Copyright © 2023 Facebook. All rights reserved.
//

import Foundation
import UIKit

class InitialTouchPanGestureRecognizer: UIPanGestureRecognizer {
    var initialTouchLocation: CGPoint?
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesBegan(touches, with: event)
        initialTouchLocation = touches.first?.location(in: view)
    }
}

class SheetHostViewController: UIViewController {
    
    let overlayView = UIView()
    /// The default color of the overlay background
    public static var overlayColor = UIColor(white: 0, alpha: 0.25)
    /// The color of the overlay background
    public var overlayColor = SheetHostViewController.overlayColor {
        didSet { self.overlayView.backgroundColor = self.overlayColor }
    }
    
    
    private var firstPanPoint: CGPoint = CGPoint.zero
    private var panOffset: CGFloat = 0
    private var panGestureRecognizer: InitialTouchPanGestureRecognizer!
    private var prePanHeight: CGFloat = 0
    private var isPanning: Bool = false
    private var allowPullingPastMinHeight: Bool = true
    private var allowPullingPastMaxHeight: Bool = true
    private var shouldRecognizePanGestureWithUIControls: Bool = true
    public var pullDismissThreshod: CGFloat = 500.0
    private weak var childScrollView: UIScrollView?
    
    var viewHeight: CGFloat {
        get { view.subviews[1].frame.size.height }
    }
    
    var panView: UIView {
        get { view.subviews[1] }
    }
    
    
    init() {
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .overFullScreen
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.addOverlay()
    }
    
    private func addOverlay() {
        self.view.addSubview(self.overlayView)
        self.overlayView.isUserInteractionEnabled = false
        self.overlayView.backgroundColor = self.overlayColor
    }
    
    
    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
        overlayView.frame = .init(origin: .zero, size: view.frame.size)
        view.subviews[1].frame.origin.y = view.frame.size.height - view.subviews[1].frame.size.height
    }
    
    
    
    func addPanGestureRecognizer() {
        let panGestureRecognizer = InitialTouchPanGestureRecognizer(target: self, action: #selector(panned(_:)))
        self.panView.addGestureRecognizer(panGestureRecognizer)
        panGestureRecognizer.delegate = self
        self.panGestureRecognizer = panGestureRecognizer
    }
    
    
    @objc
    func panned(_ gesture: UIPanGestureRecognizer) {
        let point = gesture.translation(in: gesture.view?.superview)
        if gesture.state == .began {
            self.firstPanPoint = point
            self.prePanHeight = self.viewHeight
            self.isPanning = true
        }
        
        let minHeight: CGFloat = 10
        let maxHeight: CGFloat = self.viewHeight
        
        var newHeight = max(0, self.prePanHeight + (self.firstPanPoint.y - point.y))
        var offset: CGFloat = newHeight
        if newHeight < minHeight {
            if self.allowPullingPastMinHeight {
                offset = minHeight - newHeight
            }
            newHeight = minHeight
        }
        if newHeight > maxHeight {
            newHeight = maxHeight
        }
        
        switch gesture.state {
        case .cancelled, .failed:
            UIView.animate(withDuration: 0.3, delay: 0, options: [.curveEaseOut], animations: {
                self.view.transform = CGAffineTransform.identity
                //self.panView.constant = self.viewHeight
                //self.transition.setPresentor(percentComplete: 0)
                self.overlayView.alpha = 1
            }, completion: { _ in
                self.isPanning = false
            })
            
        case .began, .changed:
            //self.contentViewHeightConstraint.constant = newHeight
            if offset > 0 {
                let percent = max(0, min(1, offset / max(1, maxHeight)))
                
                let m = (percent * maxHeight)
                let m2 = offset - maxHeight
                debugPrint("==== \(percent) \(m)")
                //self.transition.setPresentor(percentComplete: percent)
                self.overlayView.alpha = percent
                self.panView.transform = .init(translationX: 0, y: m2)
            } else {
                //self.panView.transform = CGAffineTransform.identity
            }
        case .ended:
            break
//            let velocity = (0.2 * gesture.velocity(in: self.view).y)
//            var finalHeight = newHeight - offset - velocity
//            if velocity > pullDismissThreshod {
//                // They swiped hard, always just close the sheet when they do
//                finalHeight = -1
//            }
//
//            let animationDuration = TimeInterval(abs(velocity*0.0002) + 0.2)
//
//            guard finalHeight > 0 else {
//                // Dismiss
//                UIView.animate(
//                    withDuration: animationDuration,
//                    delay: 0,
//                    //usingSpringWithDamping: self.options.transitionDampening,
//                    //initialSpringVelocity: self.options.transitionVelocity,
//                    //options: self.options.transitionAnimationOptions,
//                    animations: {
//                        self.panView.transform = CGAffineTransform(translationX: 0, y: self.panView.bounds.height)
//                        self.view.backgroundColor = UIColor.clear
//                        //self.transition.setPresentor(percentComplete: 1)
//                        self.overlayView.alpha = 0
//                    }, completion: { complete in
//                        self.attemptDismiss(animated: false)
//                    })
//                return
//            }
//
//            let newContentHeight = self.viewHeight
//            UIView.animate(
//                withDuration: animationDuration,
//                delay: 0,
//                //usingSpringWithDamping: self.options.transitionDampening,
//                //initialSpringVelocity: self.options.transitionVelocity,
//                //options: self.options.transitionAnimationOptions,
//                animations: {
//                    self.panView.transform = CGAffineTransform.identity
//                    //self.contentViewHeightConstraint.constant = newContentHeight
//                    //self.transition.setPresentor(percentComplete: 0)
//                    self.overlayView.alpha = 1
//                    self.view.layoutIfNeeded()
//                }, completion: { complete in
//                    self.isPanning = false
//                })
        case .possible:
            break
        @unknown default:
            break // Do nothing
        }
    }
    
    public func attemptDismiss(animated: Bool) {
//        if self.shouldDismiss?(self) != false {
//            if self.options.useInlineMode {
//                if animated {
//                    self.animateOut {
//                        self.didDismiss?(self)
//                    }
//                } else {
//                    self.view.removeFromSuperview()
//                    self.removeFromParent()
//                    self.didDismiss?(self)
//                }
//            } else {
//                self.dismiss(animated: animated, completion: nil)
//            }
//        }
    }
}


extension SheetHostViewController: UIGestureRecognizerDelegate {
    public func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        // Allowing gesture recognition on a UIControl seems to prevent its events from firing properly sometimes
        if !shouldRecognizePanGestureWithUIControls {
            if let view = touch.view {
                return !(view is UIControl)
            }
        }
        return true
    }
    
    public func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        guard let panGestureRecognizer = gestureRecognizer as? InitialTouchPanGestureRecognizer, let childScrollView = self.childScrollView, let point = panGestureRecognizer.initialTouchLocation else { return true }
        
        if let pan = gestureRecognizer as? UIPanGestureRecognizer {
            return true
        }
        
        let pointInChildScrollView = self.view.convert(point, to: childScrollView).y - childScrollView.contentOffset.y
        
        let velocity = panGestureRecognizer.velocity(in: panGestureRecognizer.view?.superview)
        guard pointInChildScrollView > 0, pointInChildScrollView < childScrollView.bounds.height else {
            return true
        }
        let topInset = childScrollView.contentInset.top
        
        guard abs(velocity.y) > abs(velocity.x), childScrollView.contentOffset.y <= -topInset else { return false }
        
        if velocity.y < 0 {
            return false
            //let containerHeight = height(for: self.currentSize)
            //return self.viewHeight > containerHeight && containerHeight < view.frame.height
        } else {
            return true
        }
    }
}
