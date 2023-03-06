package com.sheet;

import android.view.View;

import com.facebook.react.bridge.GuardedRunnable;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerModule;

public class ReactNativeReflection {
  static void setSize(View view, int width, int height) {
    final View v = view;
    ReactContext context = (ReactContext) v.getContext();
    context.runOnNativeModulesQueueThread(new GuardedRunnable(context) {
      @Override
      public void runGuarded() {
        if (v.getParent() == null) return;
        if (!v.isAttachedToWindow()) return;
        UIManagerModule managerModule = context.getNativeModule(UIManagerModule.class);
        if (managerModule == null) return;
        managerModule.updateNodeSize(v.getId(), width, height);
      }
    });
  }
}
