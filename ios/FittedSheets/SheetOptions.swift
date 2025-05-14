//
//  HandleOptions.swift
//  FittedSheetsPod
//
//  Created by Gordon Tucker on 7/29/20.
//  Copyright © 2020 Gordon Tucker. All rights reserved.
//

#if os(iOS) || os(tvOS) || os(watchOS)
import UIKit

public struct SheetOptions {
    public static var `default` = SheetOptions()
    
    public enum TransitionOverflowType {
        case color(color: UIColor)
        case view(view: UIView)
        case none
        case automatic
    }
    
    public var presentingViewCornerRadius: CGFloat = 12

    public var transitionAnimationOptions: UIView.AnimationOptions = [.curveEaseInOut]
    public var transitionDuration: TimeInterval = 0.4
    /// Transition velocity base value. Automatically adjusts based on the initial size of the sheet.
    public var transitionVelocity: CGFloat = 0.8
    public var transitionOverflowType: TransitionOverflowType = .automatic
    
    /// Default value 500, greater value will require more velocity to dismiss. Lesser values will do opposite.
    public var pullDismissThreshod: CGFloat = 500.0

    public var shrinkPresentingViewController = true
    /// Set true to be able to use the sheet view controller as a subview instead of a modal. Defaults to false.
    public var useInlineMode = false
    
    public var maxWidth: CGFloat?
    
    /// Experimental flag that attempts to shrink the nested presentations more each time a new sheet is presented. This must be set before any sheet is presented.
    public static var shrinkingNestedPresentingViewControllers = false
    
    public init() { }
    public init(presentingViewCornerRadius: CGFloat? = nil,
                shrinkPresentingViewController: Bool? = nil,
                useInlineMode: Bool? = nil,
                maxWidth: CGFloat? = nil) {
        let defaultOptions = SheetOptions.default
        self.presentingViewCornerRadius = presentingViewCornerRadius ?? defaultOptions.presentingViewCornerRadius
        self.shrinkPresentingViewController = shrinkPresentingViewController ?? defaultOptions.shrinkPresentingViewController
        self.useInlineMode = useInlineMode ?? defaultOptions.useInlineMode
        let maxWidth = maxWidth ?? defaultOptions.maxWidth
        self.maxWidth = maxWidth == 0 ? nil : maxWidth
    }
}

#endif // os(iOS) || os(tvOS) || os(watchOS)
