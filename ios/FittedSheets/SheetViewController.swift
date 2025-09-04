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
  @objc
  public var dismissAll = false
  

	/// Default value for allowPullingPastMaxHeight. Defaults to true.
	public static var allowPullingPastMaxHeight = true
    /// Allow pulling past the maximum height and bounce back. Defaults to true.
    public var allowPullingPastMaxHeight = SheetViewController.allowPullingPastMaxHeight

	/// Default value for allowPullingPastMinHeight. Defaults to true.
	public static var allowPullingPastMinHeight = true
	/// Allow pulling below the minimum height and bounce back. Defaults to true.
	public var allowPullingPastMinHeight = SheetViewController.allowPullingPastMinHeight

    /// The sizes that the sheet will attempt to pin to. Defaults to intrinsic only.
    public var sizes: [SheetSize] = [.intrinsic] {
        didSet {
            self.updateOrderedSizes()
        }
    }
    public var orderedSizes: [SheetSize] = []
    public private(set) var currentSize: SheetSize = .intrinsic
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

    public static var hasBlurBackground = false
    public var hasBlurBackground = SheetViewController.hasBlurBackground {
        didSet {
            blurView.isHidden = !hasBlurBackground
            overlayView.backgroundColor = hasBlurBackground ? .clear : self.overlayColor
        }
    }

    public static var minimumSpaceAbovePullBar: CGFloat = 0
    public var minimumSpaceAbovePullBar: CGFloat {
        didSet {
            if self.isViewLoaded {
                self.resize(to: self.currentSize)
            }
        }
    }

    /// The default color of the overlay background
    public static var overlayColor = UIColor(white: 0, alpha: 0.25)
    /// The color of the overlay background
    public var overlayColor = SheetViewController.overlayColor {
        didSet {
            self.overlayView.backgroundColor = self.hasBlurBackground ? .clear : self.overlayColor
        }
    }

    public static var blurEffect: UIBlurEffect = {
        return UIBlurEffect(style: .prominent)
    }()

    public var blurEffect = SheetViewController.blurEffect {
        didSet {
            self.blurView.effect = blurEffect
        }
    }
    public static var allowGestureThroughOverlay: Bool = false
    public var allowGestureThroughOverlay: Bool = SheetViewController.allowGestureThroughOverlay {
        didSet {
            self.overlayTapView.isUserInteractionEnabled = !self.allowGestureThroughOverlay
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

    public static var gripSize: CGSize = CGSize (width: 50, height: 6)
    public var gripSize: CGSize {
        get { return self.contentViewController.gripSize }
        set { self.contentViewController.gripSize = newValue }
    }

    public static var gripColor: UIColor = UIColor(white: 0.868, black: 0.1)
    public var gripColor: UIColor? {
        get { return self.contentViewController.gripColor }
        set { self.contentViewController.gripColor = newValue }
    }

    public static var pullBarBackgroundColor: UIColor = UIColor.clear
    public var pullBarBackgroundColor: UIColor? {
        get { return self.contentViewController.pullBarBackgroundColor }
        set { self.contentViewController.pullBarBackgroundColor = newValue }
    }

    public static var treatPullBarAsClear: Bool = false
    public var treatPullBarAsClear: Bool {
        get { return self.contentViewController.treatPullBarAsClear }
        set { self.contentViewController.treatPullBarAsClear = newValue }
    }

    let transition: SheetTransition

  public var didDismiss: ((SheetViewController, Bool) -> Void)?
    public var sizeChanged: ((SheetViewController, SheetSize, CGFloat) -> Void)?

    public private(set) var contentViewController: SheetContentViewController
    var overlayView = UIView()
    var blurView = UIVisualEffectView()
    var overlayTapView = UIView()
    var overflowView = UIView()
    var overlayTapGesture: UITapGestureRecognizer?
    private var contentViewHeightConstraint: NSLayoutConstraint!
    private var contentViewWidthConstraint: NSLayoutConstraint!

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

    public init(controller: UIViewController, sizes: [SheetSize] = [.intrinsic], options: SheetOptions? = nil) {
        let options = options ?? SheetOptions.default
        self.contentViewController = SheetContentViewController(childViewController: controller, options: options)
        if #available(iOS 13.0, *) {
            self.contentViewController.contentBackgroundColor = UIColor.systemBackground
        } else {
            self.contentViewController.contentBackgroundColor = UIColor.white
        }
        self.sizes = sizes.count > 0 ? sizes : [.intrinsic]
        self.options = options
        self.transition = SheetTransition(options: options)
        self.minimumSpaceAbovePullBar = SheetViewController.minimumSpaceAbovePullBar
        super.init(nibName: nil, bundle: nil)
        debugPrint("SheetViewController.init", self)
        self.gripColor = SheetViewController.gripColor
        self.gripSize = SheetViewController.gripSize
        self.pullBarBackgroundColor = SheetViewController.pullBarBackgroundColor
        self.cornerRadius = SheetViewController.cornerRadius
        self.updateOrderedSizes()
        self.modalPresentationStyle = .custom
        self.transitioningDelegate = self
    }

    public required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func loadView() {
        if self.options.useInlineMode {
            let sheetView = SheetView()
            sheetView.delegate = self
            self.view = sheetView
        } else {
            super.loadView()
        }
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

        self.compatibleAdditionalSafeAreaInsets = UIEdgeInsets(top: -self.options.pullBarHeight, left: 0, bottom: 0, right: 0)

        self.view.backgroundColor = UIColor.clear
        self.addPanGestureRecognizer()
        self.addOverlay()
        self.addBlurBackground()
        self.addContentView()
        self.addOverlayTapView()
        self.resize(to: self.sizes.first ?? .intrinsic, animated: false)
    }

    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.updateOrderedSizes()
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
              self.didDismiss?(self, self.dismissAll)
            })
        } else if !self.options.useInlineMode {
          //debugPrint(parent, view, view.superview)
            self.didDismiss?(self, dismissAll)
        }
    }

    /// Handle a scroll view in the child view controller by watching for the offset for the scrollview and taking priority when at the top (so pulling up/down can grow/shrink the sheet instead of bouncing the child's scroll view)
    public func handleScrollView(_ scrollView: UIScrollView) {
        scrollView.panGestureRecognizer.require(toFail: panGestureRecognizer)
        self.childScrollView = scrollView
    }

    /// Change the sizes the sheet should try to pin to
    public func setSizes(_ sizes: [SheetSize], animated: Bool = true) {
        guard sizes.count > 0 else { return }
        self.sizes = sizes
        self.resize(to: sizes[0], animated: animated)
    }

    func updateOrderedSizes() {
        var concreteSizes: [(SheetSize, CGFloat)] = self.sizes.map {
            return ($0, self.height(for: $0))
        }
        concreteSizes.sort { $0.1 < $1.1 }
        self.orderedSizes = concreteSizes.map({ size, _ in size })
    }

    private func addOverlay() {
        self.view.addSubview(self.overlayView)
        Constraints(for: self.overlayView) {
            $0.edges(.top, .left, .right, .bottom).pinToSuperview()
        }
        self.overlayView.isUserInteractionEnabled = false
        self.overlayView.backgroundColor = self.hasBlurBackground ? .clear : self.overlayColor
    }

    private func addBlurBackground() {
        self.overlayView.addSubview(self.blurView)
        blurView.effect = blurEffect
        Constraints(for: self.blurView) {
            $0.edges(.top, .left, .right, .bottom).pinToSuperview()
        }
        self.blurView.isUserInteractionEnabled = false
        self.blurView.isHidden = !self.hasBlurBackground
    }

    private func addOverlayTapView() {
        let overlayTapView = self.overlayTapView
        overlayTapView.backgroundColor = .clear
        overlayTapView.isUserInteractionEnabled = !self.allowGestureThroughOverlay
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
  
  func updateMaxWidth(value: CGFloat) {
    self.contentViewWidthConstraint.constant = value
  }

    private func addContentView() {
        self.contentViewController.willMove(toParent: self)
        self.addChild(self.contentViewController)
        self.view.addSubview(self.contentViewController.view)
        self.contentViewController.didMove(toParent: self)
        self.contentViewController.delegate = self
        Constraints(for: self.contentViewController.view) {
            $0.left.pinToSuperview().priority = UILayoutPriority(999)
            $0.left.pinToSuperview(inset: self.options.horizontalPadding, relation: .greaterThanOrEqual)
            if let maxWidth = self.options.maxWidth {
              self.contentViewWidthConstraint = $0.width.set(maxWidth, relation: .equal)
            }

            $0.centerX.alignWithSuperview()
            self.contentViewHeightConstraint = $0.height.set(self.height(for: self.currentSize))

            let top: CGFloat
            if (self.options.useFullScreenMode) {
                top = 0
            } else {
                top = max(12, UIApplication.shared.windows.first(where:  { $0.isKeyWindow })?.compatibleSafeAreaInsets.top ?? 12)
            }
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

        let minHeight: CGFloat = self.height(for: self.orderedSizes.first)
        let maxHeight: CGFloat
        if self.allowPullingPastMaxHeight {
            maxHeight = self.height(for: .fullscreen) // self.view.bounds.height
        } else {
            maxHeight = max(self.height(for: self.orderedSizes.last), self.prePanHeight)
        }

        var newHeight = max(0, self.prePanHeight + (self.firstPanPoint.y - point.y))
        var offset: CGFloat = 0
        if newHeight < minHeight {
            if self.allowPullingPastMinHeight {
                offset = minHeight - newHeight
            }
            newHeight = minHeight
        }
        if newHeight > maxHeight {
            if options.isRubberBandEnabled {
                newHeight = logConstraintValueForYPosition(verticalLimit: maxHeight, yPosition: newHeight)
            } else {
                newHeight = maxHeight
            }
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
                        usingSpringWithDamping: self.options.transitionDampening,
                        initialSpringVelocity: self.options.transitionVelocity,
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
                if point.y < 0 {
                    // We need to move to the next larger one
                    newSize = self.orderedSizes.last ?? self.currentSize
                    for size in self.orderedSizes.reversed() {
                        if finalHeight < self.height(for: size) {
                            newSize = size
                        } else {
                            break
                        }
                    }
                } else {
                    // We need to move to the next smaller one
                    newSize = self.orderedSizes.first ?? self.currentSize
                    for size in self.orderedSizes {
                        if finalHeight > self.height(for: size) {
                            newSize = size
                        } else {
                            break
                        }
                    }
                }
                let previousSize = self.currentSize
                self.currentSize = newSize

                let newContentHeight = self.height(for: newSize)
                UIView.animate(
                    withDuration: animationDuration,
                    delay: 0,
                    usingSpringWithDamping: self.options.transitionDampening,
                    initialSpringVelocity: self.options.transitionVelocity,
                    options: self.options.transitionAnimationOptions,
                    animations: {
                    self.contentViewController.view.transform = CGAffineTransform.identity
                    self.contentViewHeightConstraint.constant = newContentHeight
                    self.transition.setPresentor(percentComplete: 0)
                    self.overlayView.alpha = 1
                    self.view.layoutIfNeeded()
                }, completion: { complete in
                    self.isPanning = false
                    if previousSize != newSize {
                        self.sizeChanged?(self, newSize, newContentHeight)
                    }
                })
            case .possible:
                break
            @unknown default:
                break // Do nothing
        }
    }

    private func height(for size: SheetSize?) -> CGFloat {
        guard let size = size else { return 0 }
        let contentHeight: CGFloat
        let fullscreenHeight: CGFloat
        if self.options.useFullScreenMode {
            fullscreenHeight = self.view.bounds.height - self.minimumSpaceAbovePullBar
        } else {
            fullscreenHeight = self.view.bounds.height - self.view.compatibleSafeAreaInsets.top - self.minimumSpaceAbovePullBar
        }
        switch (size) {
            case .fixed(let height):
                contentHeight = height
            case .fullscreen:
                contentHeight = fullscreenHeight
            case .intrinsic:
                contentHeight = self.contentViewController.preferredHeight
            case .percent(let percent):
                if (percent > 1) {
                    debugPrint("Size percent should be less than or equal to 1.0, but was set to \(percent))")
                }
                contentHeight = (self.view.bounds.height) * CGFloat(percent)
            case .marginFromTop(let margin):
                contentHeight = (self.view.bounds.height) - margin
        }
        return min(fullscreenHeight, contentHeight)
    }

    // https://medium.com/thoughts-on-thoughts/recreating-apple-s-rubber-band-effect-in-swift-dbf981b40f35
    private func logConstraintValueForYPosition(verticalLimit: CGFloat, yPosition : CGFloat) -> CGFloat {
      return verticalLimit * (1 + log10(yPosition/verticalLimit))
    }

    public func resize(to size: SheetSize,
                       duration: TimeInterval = 0.2,
                       options: UIView.AnimationOptions = [.curveEaseOut],
                       animated: Bool = true,
                       complete: (() -> Void)? = nil) {
        //debugPrint("ShetViewController.resizeTo", size)
        let previousSize = self.currentSize
        self.currentSize = size

        let oldConstraintHeight = self.contentViewHeightConstraint.constant

        let newHeight = self.height(for: size)

        guard oldConstraintHeight != newHeight else { return }

        if animated {
            UIView.animate(withDuration: duration, delay: 0, options: options, animations: { [weak self] in
                guard let self = self, let constraint = self.contentViewHeightConstraint else { return }
                constraint.constant = newHeight
                self.overlayView.alpha = newHeight == 0 ? 0 : 1
                self.view.layoutIfNeeded()
            }, completion: { _ in
                if previousSize != size {
                    self.sizeChanged?(self, size, newHeight)
                }
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
        if self.options.useInlineMode {
            if animated {
                self.animateOut {
                  self.didDismiss?(self, self.dismissAll)
                }
            } else {
                self.view.removeFromSuperview()
                self.removeFromParent()
                self.didDismiss?(self, dismissAll)
            }
        } else {
            self.dismiss(animated: animated, completion: nil)
        }
    }

    /// Recalculates the intrinsic height of the sheet based on the content, and updates the sheet height to match.
    ///
    /// **Note:** Only meant for use with `.intrinsic` sheet size
    public func updateIntrinsicHeight() {
        contentViewController.updatePreferredHeight()
    }

   
    /// Animates the sheet out, but only if presenting using the inline mode
    public func animateOut(duration: TimeInterval = 0.3, completion: (() -> Void)? = nil) {
        guard self.options.useInlineMode else { return }
        let contentView = self.contentViewController.view!

        UIView.animate(
            withDuration: duration,
            delay: 0,
            usingSpringWithDamping: self.options.transitionDampening,
            initialSpringVelocity: self.options.transitionVelocity,
            options: self.options.transitionAnimationOptions,
            animations: {
                contentView.transform = CGAffineTransform(translationX: 0, y: contentView.bounds.height)
                self.overlayView.alpha = 0
            },
            completion: { _ in
                self.view.removeFromSuperview()
                self.removeFromParent()
                completion?()
            }
        )
    }
  
  deinit {
    debugPrint("SheetViewController.deinit", self)
  }
}

extension SheetViewController: SheetViewDelegate {
    func sheetPoint(inside point: CGPoint, with event: UIEvent?) -> Bool {
        let isInOverlay = self.overlayTapView.bounds.contains(point)
        if self.allowGestureThroughOverlay, isInOverlay {
            return false
        } else {
            return true
        }
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
            return height(for: self.orderedSizes.last) > containerHeight && containerHeight < height(for: SheetSize.fullscreen)
        } else {
            return true
        }
    }
}

extension SheetViewController: SheetContentViewDelegate {
    func pullBarTapped() {
        // Tapping the pull bar is just for accessibility
        guard UIAccessibility.isVoiceOverRunning else { return }
        let shouldDismiss = self.allowGestureThroughOverlay && (self.dismissOnOverlayTap || self.dismissOnPull)
        guard !shouldDismiss else {
            self.attemptDismiss(animated: true)
            return
        }

        if self.sizes.count > 1 {
            let index = (self.sizes.firstIndex(of: self.currentSize) ?? 0) + 1
            if index >= self.sizes.count {
                self.resize(to: self.sizes[0])
            } else {
                self.resize(to: self.sizes[index])
            }
        }
    }

    func preferredHeightChanged(oldHeight: CGFloat, newSize: CGFloat) {
        if self.sizes.contains(.intrinsic) {
            self.updateOrderedSizes()
        }
        // If our intrinsic size changed and that is what we are sized to currently, use that
        if self.currentSize == .intrinsic, !self.isPanning {
            self.resize(to: .intrinsic)
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
