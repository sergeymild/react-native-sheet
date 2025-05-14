//
//  SheetContentViewController.swift
//  FittedSheetsPod
//
//  Created by Gordon Tucker on 7/29/20.
//  Copyright © 2020 Gordon Tucker. All rights reserved.
//

#if os(iOS) || os(tvOS) || os(watchOS)
import UIKit

public class SheetContentViewController: UIViewController {

    public private(set) var childViewController: UIViewController

    private var options: SheetOptions
    private(set) var size: CGFloat = 0
    private(set) var preferredHeight: CGFloat

    public var contentBackgroundColor: UIColor? {
        get { self.childContainerView.backgroundColor }
        set { self.childContainerView.backgroundColor = newValue }
    }

    private var _cornerCurve: Any? = nil
    @available(iOS 13.0, *)
    public var cornerCurve: CALayerCornerCurve {
        get {
            return _cornerCurve as? CALayerCornerCurve ?? CALayerCornerCurve.circular }
        set {
            _cornerCurve = newValue
            self.updateCornerCurve()
        }
    }

    public var cornerRadius: CGFloat = 0 {
        didSet {
            self.updateCornerRadius()
        }
    }

    public var gripSize: CGSize = CGSize(width: 50, height: 6) {
        didSet {
            self.gripSizeConstraints.forEach({ $0.isActive = false })
            Constraints(for: self.gripView) {
                self.gripSizeConstraints = $0.size.set(self.gripSize)
            }
            self.gripView.layer.cornerRadius = self.gripSize.height / 2
        }
    }

    public var gripColor: UIColor? {
        get { return self.gripView.backgroundColor }
        set { self.gripView.backgroundColor = newValue }
    }

    weak var delegate: SheetContentViewDelegate?

    public var contentWrapperView = UIView()
    public var contentView = UIView()
    private var contentTopConstraint: NSLayoutConstraint?
    private var contentBottomConstraint: NSLayoutConstraint?
    private var navigationHeightConstraint: NSLayoutConstraint?
    private var gripSizeConstraints: [NSLayoutConstraint] = []
    public var childContainerView = UIView()
    public var gripView = UIView()
    private let overflowView = UIView()

    public init(childViewController: UIViewController, options: SheetOptions) {
        self.options = options
        self.childViewController = childViewController
        self.preferredHeight = 0
        super.init(nibName: nil, bundle: nil)

        if options.setIntrinsicHeightOnNavigationControllers, let navigationController = self.childViewController as? UINavigationController {
            navigationController.delegate = self
        }
    }

    public required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

        self.setupContentView()
        self.setupChildContainerView()
        self.setupChildViewController()
        self.updatePreferredHeight()
        if #available(iOS 13.0, *) {
            self.updateCornerCurve()
        }
        self.updateCornerRadius()
        self.setupOverflowView()

        NotificationCenter.default.addObserver(self, selector: #selector(contentSizeDidChange), name: UIContentSizeCategory.didChangeNotification, object: nil)
    }

    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        UIView.performWithoutAnimation {
            self.view.layoutIfNeeded()
        }
        self.updatePreferredHeight()
    }

    public override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        self.updatePreferredHeight()
    }

    public override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.updateAfterLayout()
    }

    func updateAfterLayout() {
        self.size = self.childViewController.view.bounds.height
        //self.updatePreferredHeight()
    }

    func adjustForKeyboard(height: CGFloat) {
        self.updateChildViewControllerBottomConstraint(adjustment: -height)
    }

    @available(iOS 13.0, *)
    private func updateCornerCurve() {
        self.contentWrapperView.layer.cornerCurve = self.cornerCurve
        self.childContainerView.layer.cornerCurve = self.cornerCurve
    }

    private func updateCornerRadius() {
        self.contentWrapperView.layer.cornerRadius = self.cornerRadius
        self.childContainerView.layer.cornerRadius = self.cornerRadius
    }

    private func setupOverflowView() {
        switch (self.options.transitionOverflowType) {
            case .view(view: let view):
                overflowView.backgroundColor = .clear
                overflowView.addSubview(view) {
                    $0.edges.pinToSuperview()
                }
            case .automatic:
                overflowView.backgroundColor = self.childViewController.view.backgroundColor
            case .color(color: let color):
                overflowView.backgroundColor = color
            case .none:
                overflowView.backgroundColor = .clear
        }
    }

    private func updateNavigationControllerHeight() {
        // UINavigationControllers don't set intrinsic size, this is a workaround to fix that
        guard self.options.setIntrinsicHeightOnNavigationControllers, let navigationController = self.childViewController as? UINavigationController else { return }
        self.navigationHeightConstraint?.isActive = false
        self.contentTopConstraint?.isActive = false

        if let viewController = navigationController.visibleViewController {
           let size = viewController.view.systemLayoutSizeFitting(CGSize(width: view.bounds.width, height: 0))

            if self.navigationHeightConstraint == nil {
                self.navigationHeightConstraint = navigationController.view.heightAnchor.constraint(equalToConstant: size.height)
            } else {
                self.navigationHeightConstraint?.constant = size.height
            }
        }
        self.navigationHeightConstraint?.isActive = true
        self.contentTopConstraint?.isActive = true
    }

    func updatePreferredHeight() {
        self.updateNavigationControllerHeight()
        let width = self.view.bounds.width > 0 ? self.view.bounds.width : UIScreen.main.bounds.width
        let oldPreferredHeight = self.preferredHeight
        var fittingSize = UIView.layoutFittingCompressedSize;
        fittingSize.width = width;

        self.contentTopConstraint?.isActive = false
        UIView.performWithoutAnimation {
            self.contentView.layoutSubviews()
        }

        self.preferredHeight = self.contentView.systemLayoutSizeFitting(fittingSize, withHorizontalFittingPriority: .required, verticalFittingPriority: .defaultLow).height
        self.contentTopConstraint?.isActive = true
        UIView.performWithoutAnimation {
            self.contentView.layoutSubviews()
        }

        self.delegate?.preferredHeightChanged(oldHeight: oldPreferredHeight, newSize: self.preferredHeight)
    }

    private func updateChildViewControllerBottomConstraint(adjustment: CGFloat) {
        self.contentBottomConstraint?.constant = adjustment
    }

    private func setupChildViewController() {
        self.childViewController.willMove(toParent: self)
        self.addChild(self.childViewController)
        self.childContainerView.addSubview(self.childViewController.view)
        Constraints(for: self.childViewController.view) { view in
            view.left.pinToSuperview()
            view.right.pinToSuperview()
            self.contentBottomConstraint = view.bottom.pinToSuperview()
                view.top.pinToSuperview()
        }

        self.childViewController.didMove(toParent: self)

        self.childContainerView.layer.masksToBounds = true
        self.childContainerView.layer.compatibleMaskedCorners = [.layerMaxXMinYCorner, .layerMinXMinYCorner]
    }

    private func setupContentView() {
        self.view.addSubview(self.contentView)
        Constraints(for: self.contentView) {
            $0.left.pinToSuperview()
            $0.right.pinToSuperview()
            $0.bottom.pinToSuperview()
            self.contentTopConstraint = $0.top.pinToSuperview()
        }
        self.contentView.addSubview(self.contentWrapperView) {
            $0.edges.pinToSuperview()
        }

        self.contentWrapperView.layer.masksToBounds = true
        self.contentWrapperView.layer.compatibleMaskedCorners = [.layerMaxXMinYCorner, .layerMinXMinYCorner]

        self.contentView.addSubview(overflowView) {
            $0.edges(.left, .right).pinToSuperview()
            $0.height.set(200)
            $0.top.align(with: self.contentView.al.bottom - 1)
        }
    }

    private func setupChildContainerView() {
        self.contentWrapperView.addSubview(self.childContainerView)

        Constraints(for: self.childContainerView) { view in
          view.top.pinToSuperview()
          view.left.pinToSuperview()
          view.right.pinToSuperview()
          view.bottom.pinToSuperview()
        }
    }

    @objc func contentSizeDidChange() {
        self.updatePreferredHeight()
    }
}

extension SheetContentViewController: UINavigationControllerDelegate {
    public func navigationController(_ navigationController: UINavigationController, willShow viewController: UIViewController, animated: Bool) {
        navigationController.view.endEditing(true)
    }

    public func navigationController(_ navigationController: UINavigationController, didShow viewController: UIViewController, animated: Bool) {
        self.navigationHeightConstraint?.isActive = true
        self.updatePreferredHeight()
    }
}

#endif // os(iOS) || os(tvOS) || os(watchOS)
