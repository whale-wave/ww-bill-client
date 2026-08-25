package com.easyhappy.wwbill;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GalleryImagePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
