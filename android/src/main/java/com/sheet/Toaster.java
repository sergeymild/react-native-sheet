package com.sheet;

import static com.facebook.react.uimanager.PixelUtil.toPixelFromDIP;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;

import com.facebook.react.uimanager.PixelUtil;

public class Toaster extends Toast{

  private final String title;
  private final String description;
  private final int duration;
  private final Status status;
  private final Context context;


  public static class Builder {

    private String title;
    private String description;
    private int duration;
    private Status status;
    private Context context;

    public Builder(@NonNull Context context) {
      this.context = context;
    }

    private void generateMessage() {
      Toast toast = new Toast(context);
      View toastLayout = LayoutInflater.from(context).inflate(R.layout.toaster_layout, null, false);

      TextView title = toastLayout.findViewById(R.id.title);
      TextView description = toastLayout.findViewById(R.id.description);
      ImageView icon = toastLayout.findViewById(R.id.icon);
      ViewGroup toastContainer = toastLayout.findViewById(R.id.toast_container);
      ViewGroup parent = toastLayout.findViewById(R.id.parent);

      if (parent.getLayoutParams() == null) {
        parent.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
      }
      parent.getLayoutParams().width =
        (int) (context.getResources().getDisplayMetrics().widthPixels - toPixelFromDIP(16) - toPixelFromDIP(16));

      parent.setBackgroundColor(Color.RED);
      //icon.setImageDrawable(utils.setStatusIcon());

      if (this.title != null) {
        title.setText(this.title);
        title.setVisibility(View.VISIBLE);
      }

      if (this.description != null) {
        description.setText(this.description);
        description.setVisibility(View.VISIBLE);
      }

      toast.setView(toastLayout);
      toast.setDuration(duration);

      toast.show();
    }



    public Builder setTitle(String title) {
      this.title = title;
      return this;
    }

    public Builder setDescription(String description) {
      this.description = description;
      return this;
    }

    public Builder setDuration(int duration) {
      this.duration = duration;
      return this;
    }

    public Builder setStatus(Status status) {
      this.status = status;
      return this;
    }

    public Toaster show() {
      generateMessage();
      return new Toaster(this);
    }
  }

  private Toaster(Builder builder) {
    super(builder.context);
    this.title = builder.title;
    this.description = builder.description;
    this.duration = builder.duration;
    this.status = builder.status;
    this.context = builder.context;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public int getDuration() {
    return duration;
  }

  public Status getStatus() {
    return status;
  }

  public Context getContext() {
    return context;
  }

  public enum Status {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
  }
}
