package com.sheet;

import android.annotation.SuppressLint;
import android.graphics.Outline;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewOutlineProvider;
import android.widget.FrameLayout;

import androidx.annotation.IdRes;
import androidx.annotation.LayoutRes;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.StyleRes;
import androidx.appcompat.app.AppCompatDialog;

import com.behavior.BottomSheetBehavior;

public class CustomBottomSheetDialog extends AppCompatDialog {
  private BottomSheetBehavior<FrameLayout> behavior;
  private FrameLayout container;
  boolean dismissWithAnimation;
  boolean cancelable = true;

  protected int startState = BottomSheetBehavior.STATE_EXPANDED;

  public void setCornerRadius(final float r) {
    ViewGroup contentContainer = getContentContainer();
    if (contentContainer == null) return;
    contentContainer.setOutlineProvider(new ViewOutlineProvider() {
      @Override
      public void getOutline(View view, Outline outline) {
        int left = 0;
        int top = 0;
        int right = view.getWidth();
        int bottom = view.getHeight();
        int cornerRadius = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, r, view.getResources().getDisplayMetrics());

        outline.setRoundRect(left, top, right, bottom + cornerRadius, cornerRadius);
      }
    });
    contentContainer.setClipToOutline(true);
  }

  public void setSheetBackgroundColor(int sheetBackgroundColor) {
    ViewGroup contentContainer = getContentContainer();
    if (contentContainer == null) return;
    contentContainer.setBackgroundColor(sheetBackgroundColor);
  }
  public ViewGroup getContainerView() {
    ensureContainerAndBehavior();
    return container;
  }

  @LayoutRes
  public int getDialogLayout() {
    return R.layout.dialog_bottom_sheet;
  }

  @IdRes
  public int getContentContainerId() {
    return R.id.dialog_bottom_sheet_content_container;
  }

  @Nullable
  public ViewGroup getContentContainer() {
    return getContainerView().findViewById(getContentContainerId());
  }

  public CustomBottomSheetDialog(@NonNull android.content.Context context, @StyleRes int theme) {
    super(context, getThemeResId(context, theme));
    // We hide the title bar for any style configuration. Otherwise, there will be a gap
    // above the bottom sheet when it is expanded.
    supportRequestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
  }

  @Override
  public void setContentView(@LayoutRes int layoutResId) {
    super.setContentView(wrapInBottomSheet(layoutResId, null, null));
  }

  @Override
  protected void onCreate(android.os.Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    android.view.Window window = getWindow();
    if (window != null) {
      window.clearFlags(android.view.WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
      window.addFlags(android.view.WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
      window.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    }
  }

  @Override
  public void setContentView(View view) {
    super.setContentView(wrapInBottomSheet(0, view, null));
    setup();
  }

  @Override
  public void setContentView(View view, ViewGroup.LayoutParams params) {
    super.setContentView(wrapInBottomSheet(0, view, params));
  }

  @Override
  public void setCancelable(boolean cancelable) {
    super.setCancelable(cancelable);
    if (this.cancelable != cancelable) {
      this.cancelable = cancelable;
      if (behavior != null) {
        behavior.setHideable(cancelable);
        behavior.setDraggable(cancelable);
      }
    }
  }

  private void setup() {
    behavior.setPeekHeight(10, true);
    behavior.setSkipCollapsed(true);
    startState = BottomSheetBehavior.STATE_EXPANDED;
  }

  @Override
  protected void onStart() {
    super.onStart();
    if (behavior != null && behavior.getState() == BottomSheetBehavior.STATE_HIDDEN) {
      behavior.setState(BottomSheetBehavior.STATE_COLLAPSED);
    }
    if (behavior != null) behavior.setState(startState);
  }

  /**
   * This function can be called from a few different use cases, including Swiping the dialog down
   * or calling `dismiss()` from a `BottomSheetDialogFragment`, tapping outside a dialog, etc...
   *
   * <p>If this function is called from a swipe down interaction, or dismissWithAnimation is false,
   * then keep the default behavior.
   *
   * <p>Else, since this is a terminal event which will finish this dialog, we override the attached
   * {@link BottomSheetBehavior.BottomSheetCallback} to call this function, after {@link
   * BottomSheetBehavior#STATE_HIDDEN} is set. This will enforce the swipe down animation before
   * canceling this dialog.
   */
  @Override
  public void cancel() {
    BottomSheetBehavior<FrameLayout> behavior = getBehavior();

    if (!dismissWithAnimation || behavior.getState() == BottomSheetBehavior.STATE_HIDDEN) {
      super.cancel();
    } else {
      behavior.setState(BottomSheetBehavior.STATE_HIDDEN);
    }
  }

  @NonNull
  public BottomSheetBehavior<FrameLayout> getBehavior() {
    if (behavior == null) {
      // The content hasn't been set, so the behavior doesn't exist yet. Let's create it.
      ensureContainerAndBehavior();
    }
    return behavior;
  }

  /**
   * Set to perform the swipe down animation when dismissing instead of the window animation for the
   * dialog.
   *
   * @param dismissWithAnimation True if swipe down animation should be used when dismissing.
   */
  public void setDismissWithAnimation(boolean dismissWithAnimation) {
    this.dismissWithAnimation = dismissWithAnimation;
  }

  /**
   * Returns if dismissing will perform the swipe down animation on the bottom sheet, rather than
   * the window animation for the dialog.
   */
  public boolean getDismissWithAnimation() {
    return dismissWithAnimation;
  }

  /**
   * Creates the container layout which must exist to find the behavior
   */
  private FrameLayout ensureContainerAndBehavior() {
    if (container == null) {
      container =
        (FrameLayout) View.inflate(getContext(), getDialogLayout(), null);

      FrameLayout bottomSheet = (FrameLayout) container.findViewById(R.id.design_bottom_sheet);
      behavior = BottomSheetBehavior.from(bottomSheet);
      behavior.addBottomSheetCallback(bottomSheetCallback);
      behavior.setHideable(cancelable);
    }
    return container;
  }

  @SuppressLint("ClickableViewAccessibility")
  private View wrapInBottomSheet(
    int layoutResId, @Nullable View view, @Nullable ViewGroup.LayoutParams params) {
    ensureContainerAndBehavior();
    androidx.coordinatorlayout.widget.CoordinatorLayout coordinator = container.findViewById(R.id.coordinator);
    if (layoutResId != 0 && view == null) {
      view = getLayoutInflater().inflate(layoutResId, coordinator, false);
    }

    FrameLayout bottomSheet = container.findViewById(R.id.design_bottom_sheet);
    FrameLayout contentContainer = (FrameLayout) getContentContainer();
    contentContainer.removeAllViews();
    if (params == null) {
      contentContainer.addView(view);
    } else {
      contentContainer.addView(view, params);
    }
    // We treat the CoordinatorLayout as outside the dialog though it is technically inside
    coordinator
      .findViewById(R.id.touch_outside)
      .setOnClickListener(
        view12 -> {if (cancelable && isShowing()) cancel();});
    // Handle accessibility events
    bottomSheet.setOnTouchListener((view1, event) -> true);
    return container;
  }

  private static int getThemeResId(@NonNull android.content.Context context, int themeId) {
    if (themeId == 0) {
      // If the provided theme is 0, then retrieve the dialogTheme from our theme
      TypedValue outValue = new TypedValue();
      if (context.getTheme().resolveAttribute(R.attr.bottomSheetDialogTheme, outValue, true)) {
        themeId = outValue.resourceId;
      } else {
        // bottomSheetDialogTheme is not provided; we default to our light theme
        themeId = R.style.Theme_Design_Light_BottomSheetDialog;
      }
    }
    return themeId;
  }

  @NonNull
  private BottomSheetBehavior.BottomSheetCallback bottomSheetCallback =
    new BottomSheetBehavior.BottomSheetCallback() {
      @Override
      public void onStateChanged(
        @NonNull View bottomSheet, @BottomSheetBehavior.State int newState) {
        if (newState == BottomSheetBehavior.STATE_HIDDEN) {
          cancel();
        }
      }

      @Override
      public void onSlide(@NonNull View bottomSheet, float slideOffset) {
      }
    };
}
