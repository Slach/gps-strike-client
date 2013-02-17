package org.apache.cordova.gpsstike;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Display;
import android.webkit.WebSettings.RenderPriority;
import android.view.WindowManager;
import android.content.Context;

import org.apache.cordova.*;

public class GPSStrike extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");

        // set some defaults
        this.appView.setBackgroundColor(0xffffff);
        this.appView.setInitialScale( 100 );

        this.appView.setHorizontalScrollBarEnabled(false);
        this.appView.setHorizontalScrollbarOverlay(false);
        this.appView.setVerticalScrollBarEnabled(false);
        this.appView.setVerticalScrollbarOverlay(false);

        // set some defaults on the web view
        this.appView.getSettings().setBuiltInZoomControls( true );
        this.appView.getSettings().setSupportZoom( true );
        this.appView.getSettings().setGeolocationEnabled( true );
        this.appView.getSettings().setLightTouchEnabled( true );
        this.appView.getSettings().setRenderPriority( RenderPriority.HIGH );



    }
}
