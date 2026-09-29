import Foundation
import UIKit
import os

/**
 Every place where this library moves a view React Native believes it owns —
 the iOS half of the Android `SheetTreeLog`.

 On iOS the crashes do carry our symbols (`HostFittedSheet.setFittedSheetParams`,
 `dismissSheet` inside `RCTMountingManager.performTransaction`), so what is
 missing there is not the name but the state: which subview was mounted, which
 one was taken away, and whether the sheet was already being destroyed. That is
 what these entries carry.

 The trail lives in memory and in the unified log under the `com.sheet2`
 subsystem; `getTreeLog()` on the Sheet module hands the last entries to JS.
 */
@objc public class SheetTreeLog: NSObject {
  private static let capacity = 32
  private static let lock = NSLock()
  private static var entries: [String] = []
  private static let osLog = OSLog(subsystem: "com.sheet2", category: "tree")

  @objc public static func log(_ op: String, details: String) {
    let entry = "\(op) \(details)"

    lock.lock()
    entries.append(entry)
    if entries.count > capacity {
      entries.removeFirst(entries.count - capacity)
    }
    lock.unlock()

    os_log("%{public}@", log: osLog, type: .debug, entry)
  }

  @objc public static func snapshot() -> [String] {
    lock.lock()
    defer { lock.unlock() }
    return entries
  }

  /// A view named the way a crash report names it: the React tag when the view
  /// carries one, and the address, which is what an EXC_BAD_ACCESS points at.
  @objc public static func name(_ view: UIView?) -> String {
    guard let view else { return "-" }
    return "tag=\(view.tag)/\(Unmanaged.passUnretained(view).toOpaque())"
  }
}
