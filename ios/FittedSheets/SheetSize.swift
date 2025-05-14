//
//  SheetDockSize.swift
//  FittedSheets
//
//  Created by Gordon Tucker on 8/27/18.
//  Copyright © 2018 Gordon Tucker. All rights reserved.
//

#if os(iOS) || os(tvOS) || os(watchOS)
import CoreGraphics

public enum SheetSize: Equatable {
    case fixed(CGFloat)
}

#endif // os(iOS) || os(tvOS) || os(watchOS)
