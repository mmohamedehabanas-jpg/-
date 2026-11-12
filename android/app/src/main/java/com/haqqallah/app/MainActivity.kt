package com.haqqallah.app

import android.annotation.SuppressLint
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONObject
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var updateManager: UpdateManager
    private var isImmersiveActive: Boolean = false
    private var pendingVerifiedApk: File? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        updateManager = UpdateManager(this)

        // 1. Wake the screen and display over lockscreen when prayer alarm triggers
        setupLockscreenWake()

        // 2. Setup WebView container hosting the offline Vite/PWA bundle
        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false

                    // Handle deep links: WhatsApp, Phone calls, APK downloads, and external browsers
                    if (url.startsWith("tel:") || url.startsWith("mailto:")) {
                        val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                        startActivity(intent)
                        return true
                    }
                    if (url.startsWith("https://wa.me") || url.startsWith("https://whatsapp.com") || url.contains("channel")) {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    }
                    return false
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    request?.grant(request.resources)
                }
            }

            // Expose native Android interface to JavaScript for exact alarms, widget sync, audio, and updates
            addJavascriptInterface(HaqqAllahNativeBridge(this@MainActivity), "AndroidNative")
        }

        setContentView(webView)

        // Load built web assets from local android asset folder
        webView.loadUrl("file:///android_asset/dist/index.html")

        // Handle intent extras if opened from widget, lockscreen alarm, or deep link
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    override fun onResume() {
        super.onResume()
        // If user just returned from granting "Install Unknown Apps" permission, resume install prompt
        val pendingApk = pendingVerifiedApk
        if (pendingApk != null && pendingApk.exists() && updateManager.canRequestPackageInstalls()) {
            pendingVerifiedApk = null
            updateManager.promptUserInstall(pendingApk)
        }
    }

    private fun handleIntent(intent: Intent?) {
        val dataUri = intent?.data
        if (dataUri != null && dataUri.scheme == "haqqallah" && dataUri.host == "download") {
            webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('haqqallah:open-download'));", null)
            return
        }

        val target = intent?.getStringExtra("EXTRA_TARGET_SCREEN") ?: return
        when (target) {
            "QURAN" -> webView.evaluateJavascript("window.location.hash = '#quran';", null)
            "AZKAR" -> webView.evaluateJavascript("window.location.hash = '#azkar';", null)
            "DOWNLOAD" -> webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('haqqallah:open-download'));", null)
            "ATHAN_LOCK" -> {
                val prayerName = intent.getStringExtra("EXTRA_PRAYER_NAME") ?: "FAJR"
                webView.evaluateJavascript("if (window.triggerLockdown) { window.triggerLockdown('$prayerName'); }", null)
            }
        }
    }

    private fun setupLockscreenWake() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
            keyguardManager.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
    }

    /**
     * Toggles Full-Screen Immersive Mode (Status Bar & Navigation Bar auto-hide)
     */
    fun toggleImmersiveMode(enable: Boolean) {
        runOnUiThread {
            isImmersiveActive = enable
            val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
            windowInsetsController.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

            if (enable) {
                windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())
            } else {
                windowInsetsController.show(WindowInsetsCompat.Type.systemBars())
            }
        }
    }

    private fun emitJsEvent(eventName: String, payload: JSONObject) {
        val escaped = JSONObject.quote(payload.toString())
        runOnUiThread {
            webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('$eventName', { detail: JSON.parse($escaped) }));",
                null
            )
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    /**
     * Native JavaScript Bridge for Web App Integration
     */
    inner class HaqqAllahNativeBridge(private val context: Context) {
        @JavascriptInterface
        fun getAppInfoJson(): String {
            return updateManager.getInstalledAppInfo().toString()
        }

        @JavascriptInterface
        fun canRequestPackageInstalls(): Boolean {
            return updateManager.canRequestPackageInstalls()
        }

        @JavascriptInterface
        fun openInstallPermissionSettings() {
            updateManager.openInstallPermissionSettings()
        }

        @JavascriptInterface
        fun downloadAndInstallUpdate(apkUrl: String, expectedSha256: String?) {
            updateManager.downloadAndVerifyApk(
                apkUrl = apkUrl,
                expectedSha256 = expectedSha256,
                onProgress = { downloaded, total, percent, stage ->
                    val payload = JSONObject().apply {
                        put("downloadedBytes", downloaded)
                        put("totalBytes", total)
                        put("percent", percent)
                        put("stage", stage)
                    }
                    emitJsEvent("haqqallah:update-progress", payload)
                },
                onComplete = { success, message, apkFile, actualSha256 ->
                    val payload = JSONObject().apply {
                        put("success", success)
                        put("message", message)
                        put("sha256", actualSha256 ?: "")
                        put("needsInstallPermission", success && !updateManager.canRequestPackageInstalls())
                    }
                    if (success && apkFile != null) {
                        if (updateManager.canRequestPackageInstalls()) {
                            updateManager.promptUserInstall(apkFile)
                        } else {
                            pendingVerifiedApk = apkFile
                        }
                    }
                    emitJsEvent("haqqallah:update-complete", payload)
                }
            )
        }

        @JavascriptInterface
        fun shareAppLink(title: String, text: String, url: String) {
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, title)
                putExtra(Intent.EXTRA_TEXT, "$text\n$url")
            }
            val chooser = Intent.createChooser(shareIntent, title).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
        }

        @JavascriptInterface
        fun openExternalUrl(url: String) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }

        @JavascriptInterface
        fun setImmersive(enabled: Boolean) {
            toggleImmersiveMode(enabled)
        }

        @JavascriptInterface
        fun scheduleExactAthan(prayerName: String, triggerTimeMillis: Long) {
            AthanAlarmReceiver.scheduleExactAlarm(context, prayerName, triggerTimeMillis)
        }

        @JavascriptInterface
        fun startAthanService(prayerName: String) {
            val serviceIntent = Intent(context, AthanForegroundService::class.java).apply {
                action = AthanForegroundService.ACTION_START_ATHAN
                putExtra(AthanForegroundService.EXTRA_PRAYER_NAME, prayerName)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }

        @JavascriptInterface
        fun stopAthanService() {
            val serviceIntent = Intent(context, AthanForegroundService::class.java).apply {
                action = AthanForegroundService.ACTION_STOP_ATHAN
            }
            context.startService(serviceIntent)
        }

        @JavascriptInterface
        fun updateAppWidget(nextPrayerName: String, countdownText: String, hijriDate: String, city: String) {
            HaqqAllahAppWidget.updateWidgetData(context, nextPrayerName, countdownText, hijriDate, city)
        }
    }
}
