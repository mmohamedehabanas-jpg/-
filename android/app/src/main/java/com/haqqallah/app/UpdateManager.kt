package com.haqqallah.app

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors

/**
 * Native Android Update & Integrity Manager for Haqq Allah.
 * - Fetches HTTPS release manifest
 * - Compares installed versionCode against latestVersionCode & minSupportedVersionCode
 * - Downloads APK with real byte progress reporting
 * - Verifies cryptographic SHA-256 checksum before launching system installer
 * - Preserves all user data (localStorage, SharedPreferences, databases) by upgrading in-place
 */
class UpdateManager(private val context: Context) {

    private val executor = Executors.newSingleThreadExecutor()

    fun getInstalledAppInfo(): JSONObject {
        val pm = context.packageManager
        val pkgInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            pm.getPackageInfo(context.packageName, PackageManager.PackageInfoFlags.of(0))
        } else {
            @Suppress("DEPRECATION")
            pm.getPackageInfo(context.packageName, 0)
        }

        val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            pkgInfo.longVersionCode
        } else {
            @Suppress("DEPRECATION")
            pkgInfo.versionCode.toLong()
        }

        return JSONObject().apply {
            put("isNativeAndroid", true)
            put("applicationId", context.packageName)
            put("versionName", pkgInfo.versionName ?: BuildConfig.VERSION_NAME)
            put("versionCode", versionCode)
            put("sdkInt", Build.VERSION.SDK_INT)
            put("canRequestPackageInstalls", canRequestPackageInstalls())
            put("updateManifestUrl", BuildConfig.UPDATE_MANIFEST_URL)
            put("distributionPageUrl", BuildConfig.DISTRIBUTION_PAGE_URL)
        }
    }

    fun canRequestPackageInstalls(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true
        }
    }

    fun openInstallPermissionSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(
                Settings.ACTION_MANAGE_UNKNOWN_SOURCE_APPS,
                Uri.parse("package:${context.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }

    fun downloadAndVerifyApk(
        apkUrl: String,
        expectedSha256: String?,
        onProgress: (downloadedBytes: Long, totalBytes: Long, percent: Int, stage: String) -> Unit,
        onComplete: (success: Boolean, message: String, apkFile: File?, actualSha256: String?) -> Unit
    ) {
        executor.execute {
            var connection: HttpURLConnection? = null
            try {
                if (!apkUrl.startsWith("https://") && !apkUrl.startsWith("http://localhost") && !apkUrl.startsWith("http://10.0.2.2")) {
                    onComplete(false, "Secure HTTPS connection is required for APK updates.", null, null)
                    return@execute
                }

                val updatesDir = File(context.filesDir, "updates").apply {
                    if (!exists()) mkdirs()
                }
                // Clean stale partial APKs
                updatesDir.listFiles()?.forEach { file ->
                    if (file.name.endsWith(".apk") || file.name.endsWith(".tmp")) {
                        file.delete()
                    }
                }

                val tempFile = File(updatesDir, "haqq-allah-update.tmp")
                val finalApk = File(updatesDir, "haqq-allah-update.apk")

                onProgress(0L, 0L, 0, "connecting")

                val url = URL(apkUrl)
                connection = (url.openConnection() as HttpURLConnection).apply {
                    connectTimeout = 20_000
                    readTimeout = 30_000
                    instanceFollowRedirects = true
                    requestMethod = "GET"
                }

                val responseCode = connection.responseCode
                if (responseCode !in 200..299) {
                    onComplete(false, "Download failed with HTTP status $responseCode", null, null)
                    return@execute
                }

                val totalBytes = connection.contentLengthLong
                val digest = MessageDigest.getInstance("SHA-256")
                var downloadedBytes = 0L

                BufferedInputStream(connection.inputStream).use { input ->
                    FileOutputStream(tempFile).use { output ->
                        val buffer = ByteArray(16 * 1024)
                        var bytesRead: Int
                        var lastEmitTime = 0L

                        while (input.read(buffer).also { bytesRead = it } != -1) {
                            output.write(buffer, 0, bytesRead)
                            digest.update(buffer, 0, bytesRead)
                            downloadedBytes += bytesRead

                            val now = System.currentTimeMillis()
                            if (now - lastEmitTime >= 120) {
                                lastEmitTime = now
                                val pct = if (totalBytes > 0) {
                                    ((downloadedBytes * 100) / totalBytes).toInt().coerceIn(0, 99)
                                } else {
                                    0
                                }
                                onProgress(downloadedBytes, totalBytes, pct, "downloading")
                            }
                        }
                        output.flush()
                    }
                }

                onProgress(downloadedBytes, totalBytes, 100, "verifying")

                val actualSha256 = digest.digest().joinToString("") { "%02x".format(it) }
                if (!expectedSha256.isNullOrBlank() && !actualSha256.equals(expectedSha256.trim(), ignoreCase = true)) {
                    tempFile.delete()
                    onComplete(
                        false,
                        "SHA-256 integrity verification failed. Downloaded file was discarded.",
                        null,
                        actualSha256
                    )
                    return@execute
                }

                // Verify the downloaded file is a valid ZIP/APK archive matching this applicationId
                if (!verifyApkPackageArchive(tempFile)) {
                    tempFile.delete()
                    onComplete(false, "Downloaded file is not a valid Android APK for ${context.packageName}.", null, actualSha256)
                    return@execute
                }

                if (!tempFile.renameTo(finalApk)) {
                    tempFile.copyTo(finalApk, overwrite = true)
                    tempFile.delete()
                }

                onComplete(true, "APK verified and ready for installation.", finalApk, actualSha256)
            } catch (e: Exception) {
                onComplete(false, e.localizedMessage ?: "Update download failed.", null, null)
            } finally {
                connection?.disconnect()
            }
        }
    }

    private fun verifyApkPackageArchive(apkFile: File): Boolean {
        return try {
            val pm = context.packageManager
            val archiveInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getPackageArchiveInfo(apkFile.absolutePath, PackageManager.PackageInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getPackageArchiveInfo(apkFile.absolutePath, 0)
            }
            archiveInfo != null && archiveInfo.packageName == context.packageName
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Launches Android's standard Package Installer confirmation UI using FileProvider.
     * Never silently installs; respects Android 8+ install permission and user confirmation.
     */
    fun promptUserInstall(apkFile: File): Boolean {
        if (!apkFile.exists()) return false
        if (!canRequestPackageInstalls()) {
            openInstallPermissionSettings()
            return false
        }

        val apkUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            apkFile
        )

        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
        }
        context.startActivity(installIntent)
        return true
    }

    fun computeFileSha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        FileInputStream(file).use { fis ->
            val buf = ByteArray(16 * 1024)
            var read: Int
            while (fis.read(buf).also { read = it } != -1) {
                digest.update(buf, 0, read)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }
}
