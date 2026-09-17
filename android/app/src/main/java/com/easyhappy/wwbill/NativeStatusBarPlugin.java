package com.easyhappy.wwbill;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeStatusBar")
public class NativeStatusBarPlugin extends Plugin {
    private Integer backgroundColor;
    private boolean isLightBackground = true;

    @PluginMethod
    public void setAppearance(PluginCall call) {
        final int color;
        try {
            color = Color.parseColor(call.getString("color", "#f4f4f6"));
        } catch (IllegalArgumentException error) {
            call.reject("Invalid status bar background color", error);
            return;
        }
        final boolean lightBackground = call.getBoolean("isLightBackground", true);
        getActivity().runOnUiThread(() -> {
            backgroundColor = color;
            isLightBackground = lightBackground;
            applyAppearance();
            call.resolve();
        });
    }

    @SuppressWarnings("deprecation")
    private void applyAppearance() {
        if (backgroundColor == null)
            return;
        Window window = getActivity().getWindow();
        // Android 15+ draws behind transparent bars. Older WebViews may instead
        // expose the padded native parent; tint both without changing insets.
        window.getDecorView().setBackgroundColor(backgroundColor);
        ((View) getBridge().getWebView().getParent()).setBackgroundColor(backgroundColor);
        getBridge().getWebView().setBackgroundColor(backgroundColor);
        if (Build.VERSION.SDK_INT < 35)
            window.setStatusBarColor(backgroundColor);
        WindowCompat.getInsetsController(window, window.getDecorView())
            .setAppearanceLightStatusBars(isLightBackground);
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        getBridge().executeOnMainThread(this::applyAppearance);
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);
        // Queue after Capacitor SystemBars restores the system theme defaults.
        getBridge().executeOnMainThread(this::applyAppearance);
    }
}
