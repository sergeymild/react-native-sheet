//
//  SheetViewController.swift
//  FittedSheetsPod
//
//  Created by Gordon Tucker on 7/29/20.
//  Copyright © 2020 Gordon Tucker. All rights reserved.
//

#if os(iOS) || os(tvOS) || os(watchOS)
import UIKit

public class SheetViewController: UIViewController {
    public private(set) var options: SheetOptions

	/// Default value for allowPullingPastMinHeight. Defaults to true.
	public static var allowPullingPastMinHeight = true
	/// Allow pulling below the minimum height and bounce back. Defaults to true.
	public var allowPullingPastMinHeight = SheetViewController.allowPullingPastMinHeight

  public private(set) var currentSize: CGFloat = 0
    /// Allows dismissing of the sheet by pulling down
    public var dismissOnPull: Bool = true
    /// Dismisses the sheet by tapping on the background overlay
    public var dismissOnOverlayTap: Bool = true
    /// If true you can pull using UIControls (so you can grab and drag a button to control the sheet)
    public var shouldRecognizePanGestureWithUIControls: Bool = true

    /// The view controller being presented by the sheet currently
    public var childViewController: UIViewController {
        return self.contentViewController.childViewController
    }

    public override var childForStatusBarStyle: UIViewController? {
        childViewController
    }

    public override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return childViewController.supportedInterfaceOrientations
    }

    /// The default color of the overlay background
    public static var overlayColor = UIColor(white: 0, alpha: 0.25)
    /// The color of the overlay background
    public var overlayColor = SheetViewController.overlayColor {
        didSet {
            self.overlayView.backgroundColor = self.overlayColor
        }
    }

    public static var cornerRadius: CGFloat = 12
    public var cornerRadius: CGFloat {
        get { return self.contentViewController.cornerRadius }
        set { self.contentViewController.cornerRadius = newValue }
    }

    @available(iOS 13.0, *)
    public static var cornerCurve: CALayerCornerCurve = .circular

    @available(iOS 13.0, *)
    public var cornerCurve: CALayerCornerCurve {
        get { return self.contentViewController.cornerCurve }
        set { self.contentViewController.cornerCurve = newValue }
    }

    let transition: SheetTransition

    public var didDismiss: ((SheetViewController) -> Void)?

    public private(set) var contentViewController: SheetContentViewController
    var overlayView = UIView()
    var overlayTapView = UIView()
    var overflowView = UIView()
    var overlayTapGesture: UITapGestureRecognizer?
    private var contentViewHeightConstraint: NSLayoutConstraint!

    /// The child view controller's scroll view we are watching so we can override the pull down/up to work on the sheet when needed
    private weak var childScrollView: UIScrollView?


    private var firstPanPoint: CGPoint = CGPoint.zero
    private var panOffset: CGFloat = 0
    private var panGestureRecognizer: InitialTouchPanGestureRecognizer!
    private var prePanHeight: CGFloat = 0
    private var isPanning: Bool = false

    public var contentBackgroundColor: UIColor? {
        get { self.contentViewController.contentBackgroundColor }
        set { self.contentViewController.contentBackgroundColor = newValue }
    }

    public init(controller: UIViewController, size: CGFloat = 0, options: SheetOptions? = nil) {
        let options = options ?? SheetOptions.default
        self.contentViewController = SheetContentViewController(childViewController: controller, options: options)
        if #available(iOS 13.0, *) {
            self.contentViewController.contentBackgroundColor = UIColor.systemBackground
        } else {
            self.contentViewController.contentBackgroundColor = UIColor.white
        }
        self.currentSize = size
        self.options = options
        self.transition = SheetTransition(options: options)
        super.init(nibName: nil, bundle: nil)
        self.cornerRadius = SheetViewController.cornerRadius
        self.modalPresentationStyle = .custom
        self.transitioningDelegate = self
    }

    public required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

      self.additionalSafeAreaInsets = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)

        self.view.backgroundColor = UIColor.clear
        self.addPanGestureRecognizer()
        self.addOverlay()
        self.addContentView()
        self.addOverlayTapView()
      self.resize(to: self.currentSize, animated: false)
    }

    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.contentViewController.updatePreferredHeight()
        self.resize(to: self.currentSize, animated: false)
    }

    public override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
    }

    public override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        if let presenter = self.transition.presenter, self.options.shrinkPresentingViewController {
            self.transition.restorePresentor(presenter, completion: { _ in
                self.didDismiss?(self)
            })
        } else {
            self.didDismiss?(self)
        }
    }

    /// Handle a scroll view in the child view controller by watching for the offset for the scrollview and taking priority when at the top (so pulling up/down can grow/shrink the sheet instead of bouncing the child's scroll view)
    public func handleScrollView(_ scrollView: UIScrollView) {
        scrollView.panGestureRecognizer.require(toFail: panGestureRecognizer)
        self.childScrollView = scrollView
    }

    /// Change the sizes the sheet should try to pin to
    public func setSize(_ size: CGFloat, animated: Bool = true) {
      self.currentSize = size
        self.resize(to: size, animated: animated)
    }

    private func addOverlay() {
        self.view.addSubview(self.overlayView)
        Constraints(for: self.overlayView) {
            $0.edges(.top, .left, .right, .bottom).pinToSuperview()
        }
        self.overlayView.isUserInteractionEnabled = false
        self.overlayView.backgroundColor = self.overlayColor
    }

    private func addOverlayTapView() {
        let overlayTapView = self.overlayTapView
        overlayTapView.backgroundColor = .clear
        overlayTapView.isUserInteractionEnabled = true
        self.view.addSubview(overlayTapView)
        Constraints(for: overlayTapView, self.contentViewController.view) {
            $0.top.pinToSuperview()
            $0.left.pinToSuperview()
            $0.right.pinToSuperview()
            $0.bottom.align(with: $1.top)
        }

        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(overlayTapped))
        self.overlayTapGesture = tapGestureRecognizer
        overlayTapView.addGestureRecognizer(tapGestureRecognizer)
    }

    @objc func overlayTapped(_ gesture: UITapGestureRecognizer) {
        guard self.dismissOnOverlayTap else { return }
        self.attemptDismiss(animated: true)
    }

    private func addContentView() {
        self.contentViewController.willMove(toParent: self)
        self.addChild(self.contentViewController)
        self.view.addSubview(self.contentViewController.view)
        self.contentViewController.didMove(toParent: self)
        Constraints(for: self.contentViewController.view) {
            $0.left.pinToSuperview().priority = UILayoutPriority(999)
            $0.left.pinToSuperview(inset: 0, relation: .greaterThanOrEqual)
            if let maxWidth = self.options.maxWidth {
                $0.width.set(maxWidth, relation: .lessThanOrEqual)
            }

            $0.centerX.alignWithSuperview()
            self.contentViewHeightConstraint = $0.height.set(self.height(for: self.currentSize))

            let top: CGFloat
            top = 0
            $0.bottom.pinToSuperview()
            $0.top.pinToSuperview(inset: top, relation: .greaterThanOrEqual).priority = UILayoutPriority(999)
        }
    }

    private func addPanGestureRecognizer() {
        let panGestureRecognizer = InitialTouchPanGestureRecognizer(target: self, action: #selector(panned(_:)))
        self.view.addGestureRecognizer(panGestureRecognizer)
        panGestureRecognizer.delegate = self
        self.panGestureRecognizer = panGestureRecognizer
    }

    @objc func panned(_ gesture: UIPanGestureRecognizer) {
        let point = gesture.translation(in: gesture.view?.superview)
        if gesture.state == .began {
            self.firstPanPoint = point
            self.prePanHeight = self.contentViewController.view.bounds.height
            self.isPanning = true
        }

      let minHeight: CGFloat = currentSize
        let maxHeight: CGFloat
        maxHeight = max(currentSize, self.prePanHeight)

        var newHeight = max(0, self.prePanHeight + (self.firstPanPoint.y - point.y))
        var offset: CGFloat = 0
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
                    self.contentViewController.view.transform = CGAffineTransform.identity
                    self.contentViewHeightConstraint.constant = self.height(for: self.currentSize)
                    self.transition.setPresentor(percentComplete: 0)
                    self.overlayView.alpha = 1
                }, completion: { _ in
                    self.isPanning = false
                })

            case .began, .changed:
                self.contentViewHeightConstraint.constant = newHeight

                if offset > 0 {
                    let percent = max(0, min(1, offset / max(1, newHeight)))
                    self.transition.setPresentor(percentComplete: percent)
                    self.overlayView.alpha = 1 - percent
                    self.contentViewController.view.transform = CGAffineTransform(translationX: 0, y: offset)
                } else {
                    self.contentViewController.view.transform = CGAffineTransform.identity
                }
            case .ended:
                let velocity = (0.2 * gesture.velocity(in: self.view).y)
                var finalHeight = newHeight - offset - velocity
                if velocity > options.pullDismissThreshod {
                    // They swiped hard, always just close the sheet when they do
                    finalHeight = -1
                }

                let animationDuration = TimeInterval(abs(velocity*0.0002) + 0.2)
            
                if (finalHeight <= 0 || finalHeight < (self.height(for: currentSize) / 2)) && dismissOnPull {
                    // Dismiss
                    UIView.animate(
                        withDuration: animationDuration,
                        delay: 0,
                        options: self.options.transitionAnimationOptions,
                        animations: {
                        self.contentViewController.view.transform = CGAffineTransform(translationX: 0, y: self.contentViewController.view.bounds.height)
                        self.view.backgroundColor = UIColor.clear
                        self.transition.setPresentor(percentComplete: 1)
                        self.overlayView.alpha = 0
                    }, completion: { complete in
                        self.attemptDismiss(animated: false)
                    })
                    return
                }


                var newSize = self.currentSize

                let newContentHeight = self.height(for: newSize)
                UIView.animate(
                    withDuration: animationDuration,
                    delay: 0,
                    options: self.options.transitionAnimationOptions,
                    animations: {
                    self.contentViewController.view.transform = CGAffineTransform.identity
                    self.contentViewHeightConstraint.constant = newContentHeight
                    self.transition.setPresentor(percentComplete: 0)
                    self.overlayView.alpha = 1
                    self.view.layoutIfNeeded()
                }, completion: { complete in
                    self.isPanning = false
                })
            case .possible:
                break
            @unknown default:
                break // Do nothing
        }
    }

    private func height(for size: CGFloat) -> CGFloat {
        let contentHeight: CGFloat
        let fullscreenHeight: CGFloat
        fullscreenHeight = self.view.bounds.height
      contentHeight = size
        return min(fullscreenHeight, contentHeight)
    }

    public func resize(to size: CGFloat,
                       duration: TimeInterval = 0.2,
                       options: UIView.AnimationOptions = [.curveEaseOut],
                       animated: Bool = true,
                       complete: (() -> Void)? = nil) {
        self.currentSize = size

        let oldConstraintHeight = self.contentViewHeightConstraint.constant

        let newHeight = self.height(for: size)

        guard oldConstraintHeight != newHeight else {
            return
        }

        if animated {
            UIView.animate(withDuration: duration, delay: 0, options: options, animations: { [weak self] in
                guard let self = self, let constraint = self.contentViewHeightConstraint else { return }
                constraint.constant = newHeight
                self.view.layoutIfNeeded()
            }, completion: { _ in
                self.contentViewController.updateAfterLayout()
                complete?()
            })
        } else {
            UIView.performWithoutAnimation {
                self.contentViewHeightConstraint?.constant = self.height(for: size)
                self.contentViewController.view.layoutIfNeeded()
            }
            complete?()
        }
    }

    public func attemptDismiss(animated: Bool) {
      self.dismiss(animated: animated, completion: nil)
    }
}

extension SheetViewController: SheetViewDelegate {
    func sheetPoint(inside point: CGPoint, with event: UIEvent?) -> Bool {
      return true
    }
}

extension SheetViewController: UIGestureRecognizerDelegate {
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
        guard let panGestureRecognizer = gestureRecognizer as? InitialTouchPanGestureRecognizer else { return true }
        guard let childScrollView = self.childScrollView else { return true }
        guard let point = panGestureRecognizer.initialTouchLocation else { return true }

        let pointInChildScrollView = self.view.convert(point, to: childScrollView).y - childScrollView.contentOffset.y

        let velocity = panGestureRecognizer.velocity(in: panGestureRecognizer.view?.superview)
        guard pointInChildScrollView > 0, pointInChildScrollView < childScrollView.bounds.height else {
            return true
        }
        let topInset = childScrollView.contentInset.top

        if !(abs(velocity.y) > abs(velocity.x) && childScrollView.contentOffset.y <= -topInset) {
            return false
        }

        if velocity.y < 0 {
            let containerHeight = height(for: self.currentSize)
          return currentSize > containerHeight
        } else {
            return true
        }
    }
}

extension SheetViewController: UIViewControllerTransitioningDelegate {
    public func animationController(forPresented presented: UIViewController, presenting: UIViewController, source: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        transition.presenting = true
        return transition
    }

    public func animationController(forDismissed dismissed: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        transition.presenting = false
        return transition
    }
}

#endif // os(iOS) || os(tvOS) || os(watchOS)
