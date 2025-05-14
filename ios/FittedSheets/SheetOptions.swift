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
    
    public var presentingViewCornerRadius: CGFloat = 12

    public var transitionAnimationOptions: UIView.AnimationOptions = [.curveEaseInOut]
    public var transitionDuration: TimeInterval = 0.4
    
    /// Default value 500, greater value will require more velocity to dismiss. Lesser values will do opposite.
    public var pullDismissThreshod: CGFloat = 500.0
    
    public var maxWidth: CGFloat?
    
    public init() { }
    public init(presentingViewCornerRadius: CGFloat? = nil, maxWidth: CGFloat? = nil) {
        let defaultOptions = SheetOptions.default
        self.presentingViewCornerRadius = presentingViewCornerRadius ?? defaultOptions.presentingViewCornerRadius
        let maxWidth = maxWidth ?? defaultOptions.maxWidth
        self.maxWidth = maxWidth == 0 ? nil : maxWidth
    }
}

#endif // os(iOS) || os(tvOS) || os(watchOS)
