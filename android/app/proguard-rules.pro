# ==============================================================================
# Haqq Allah V2.8 - Enterprise ProGuard / R8 Rules for Multi-Tech Architecture
# Covers: Native Android, Jetpack Compose, Flutter Engine, React Native / Hermes
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. General Android & Kotlin Configuration
# ------------------------------------------------------------------------------
-dontpreverify
-repackageclasses ''
-allowaccessmodification
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*
-optimizationpasses 5

# Keep Kotlin intrinsics, reflection, and metadata
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-keepclassmembers class kotlin.Metadata { *; }
-dontwarn kotlin.**

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory { *; }
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler { *; }
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}
-dontwarn kotlinx.coroutines.**

# ------------------------------------------------------------------------------
# 2. AndroidX & Jetpack Compose Rules
# ------------------------------------------------------------------------------
-keep class androidx.compose.** { *; }
-keepclassmembers class androidx.compose.** { *; }
-keep class androidx.compose.ui.platform.AndroidComposeView { *; }
-dontwarn androidx.compose.**

# AndroidX Core, Lifecycle, and WorkManager
-keep class androidx.core.** { *; }
-keep class androidx.lifecycle.** { *; }
-keep class androidx.work.** { *; }
-keepclassmembers class * extends androidx.work.Worker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}
-keepclassmembers class * extends androidx.work.CoroutineWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# ------------------------------------------------------------------------------
# 3. Media3 & ExoPlayer Rules (Background Audio & Lockscreen)
# ------------------------------------------------------------------------------
-keep class androidx.media3.exoplayer.** { *; }
-keep class androidx.media3.session.** { *; }
-keep class androidx.media3.ui.** { *; }
-keep class androidx.media3.common.** { *; }
-keep class androidx.media.** { *; }
-dontwarn androidx.media3.**

# ------------------------------------------------------------------------------
# 4. Flutter Embedding & Dart VM Rules
# ------------------------------------------------------------------------------
# Keep Flutter engine JNI entrypoints and platform channels
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep native methods called by Flutter Engine
-keepclasseswithmembernames class * {
    native <methods>;
}

# Preserve method channel callback signatures
-keepclassmembers class * implements io.flutter.plugin.common.MethodChannel$MethodCallHandler {
    public void onMethodCall(io.flutter.plugin.common.MethodCall, io.flutter.plugin.common.MethodChannel$Result);
}

# Prevent obfuscation of generated plugin registries
-keep class io.flutter.plugins.GeneratedPluginRegistrant { *; }

-dontwarn io.flutter.**

# ------------------------------------------------------------------------------
# 5. React Native & Hermes Engine Rules
# ------------------------------------------------------------------------------
# Keep React Native core, bridge, and TurboModules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.module.annotations.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.yoga.** { *; }
-keep class com.facebook.soloader.** { *; }

# Keep native modules annotated with @ReactMethod
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.bridge.ReactMethodSync *;
}

# Keep JavaScript Executor and TurboModule specs
-keep class * implements com.facebook.react.bridge.JavaScriptExecutorFactory { *; }
-keep class * implements com.facebook.react.bridge.ReactPackage { *; }
-keep class * implements com.facebook.react.TurboReactPackage { *; }

# Keep Yoga layout bindings
-keepclassmembers class com.facebook.yoga.YogaNode {
    private long mNativePointer;
}

# Keep Hermes bytecode and JNI references
-keep class com.facebook.hermes.unicode.** { *; }
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.react.**

# ------------------------------------------------------------------------------
# 6. Haqq Allah Core Application Classes & JavaScript Bridge
# ------------------------------------------------------------------------------
-keep class com.haqqallah.app.** { *; }
-keepclassmembers class com.haqqallah.app.MainActivity$HaqqAllahNativeBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.haqqallah.app.AthanForegroundService { *; }
-keep class com.haqqallah.app.AthanAlarmReceiver { *; }
-keep class com.haqqallah.app.UpdateManager { *; }
-keep class com.haqqallah.app.BuildConfig { *; }
-keep class com.haqqallah.app.HaqqAllahAppWidget { *; }
-keepclassmembers class * extends android.appwidget.AppWidgetProvider {
    public void onUpdate(android.content.Context, android.appwidget.AppWidgetManager, int[]);
}

