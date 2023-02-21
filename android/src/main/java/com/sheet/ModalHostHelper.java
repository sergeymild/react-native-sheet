/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.sheet;

import android.content.Context;
import android.graphics.Point;

import java.lang.reflect.Method;

/** Helper class for Modals. */
public class ModalHostHelper {
  public static Point getModalHostSize(Context context) {
    try {
      Class<?> aClass = Class.forName("com.facebook.react.views.modal.ModalHostHelper");
      Method getModalHostSize = aClass.getDeclaredMethod("getModalHostSize", Context.class);
      Object result = getModalHostSize.invoke(null, context);
      return (Point) result;
    } catch (Throwable e) {
      e.printStackTrace();
    }
    return new Point(0, 0);
  }
}
