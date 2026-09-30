package com.easyhappy.wwbill;

import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "NativeAppUpdate")
public class NativeAppUpdatePlugin extends Plugin {
    private static final long MAX_APK_BYTES = 150L * 1024 * 1024;
    private static final String APK_MIME = "application/vnd.android.package-archive";
    private final AtomicBoolean downloading = new AtomicBoolean(false);

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String downloadUrl = call.getString("url");
        Integer versionCode = call.getInt("versionCode");
        if (downloadUrl == null || versionCode == null || versionCode < 1 || !isHttps(downloadUrl)) {
            call.reject("A valid HTTPS APK URL and version code are required", "INVALID_UPDATE");
            return;
        }
        if (!downloading.compareAndSet(false, true)) {
            call.reject("An update download is already in progress", "UPDATE_IN_PROGRESS");
            return;
        }

        new Thread(() -> {
            File updateDirectory = new File(getContext().getCacheDir(), "client-updates");
            File temporaryFile = new File(updateDirectory, "update.partial.apk");
            File apkFile = new File(updateDirectory, "update.apk");
            try {
                if (!updateDirectory.exists() && !updateDirectory.mkdirs()) {
                    throw new IllegalStateException("Unable to create update cache");
                }
                if (apkFile.exists() && !apkFile.delete()) {
                    throw new IllegalStateException("Unable to replace previous APK");
                }
                download(downloadUrl, temporaryFile);
                validateApk(temporaryFile, versionCode);
                if (!temporaryFile.renameTo(apkFile)) {
                    throw new IllegalStateException("Unable to prepare APK for installation");
                }
                getBridge().executeOnMainThread(() -> openInstaller(call, apkFile));
            } catch (Exception error) {
                temporaryFile.delete();
                downloading.set(false);
                call.reject("Unable to download or validate the update APK", "UPDATE_DOWNLOAD_FAILED", error);
            }
        }, "ww-bill-apk-download").start();
    }

    private void openInstaller(PluginCall call, File apkFile) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
                Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
                getActivity().startActivity(settings);
                call.reject("Allow app installs from this source, then tap update again", "INSTALL_PERMISSION_REQUIRED");
                return;
            }

            Uri uri = FileProvider.getUriForFile(getContext(),
                getContext().getPackageName() + ".fileprovider", apkFile);
            Intent install = new Intent(Intent.ACTION_INSTALL_PACKAGE);
            install.setDataAndType(uri, APK_MIME);
            install.setClipData(ClipData.newRawUri("app-update", uri));
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(install);
            call.resolve();
        } catch (Exception error) {
            call.reject("Unable to open the Android package installer", "INSTALLER_OPEN_FAILED", error);
        } finally {
            downloading.set(false);
        }
    }

    private void validateApk(File apkFile, int expectedVersionCode) {
        PackageInfo archive = getContext().getPackageManager().getPackageArchiveInfo(apkFile.getAbsolutePath(), 0);
        if (archive == null || !getContext().getPackageName().equals(archive.packageName)) {
            throw new IllegalArgumentException("The downloaded file is not this app's APK");
        }
        long archiveVersion = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
            ? archive.getLongVersionCode() : archive.versionCode;
        if (archiveVersion != expectedVersionCode) {
            throw new IllegalArgumentException("The downloaded APK version does not match the release");
        }
    }

    private void download(String initialUrl, File target) throws Exception {
        URL url = new URL(initialUrl);
        for (int redirectCount = 0; redirectCount < 6; redirectCount++) {
            if (!"https".equalsIgnoreCase(url.getProtocol())) {
                throw new IllegalArgumentException("Update downloads must use HTTPS");
            }
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(30000);
            try {
                int status = connection.getResponseCode();
                if (status >= 300 && status < 400) {
                    String location = connection.getHeaderField("Location");
                    if (location == null) {
                        throw new IllegalStateException("Update redirect has no destination");
                    }
                    url = new URL(url, location);
                    continue;
                }
                if (status != HttpURLConnection.HTTP_OK || connection.getContentLengthLong() > MAX_APK_BYTES) {
                    throw new IllegalStateException("Update download returned an invalid response");
                }
                try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(target)) {
                    byte[] buffer = new byte[64 * 1024];
                    long totalBytes = 0;
                    int bytesRead;
                    while ((bytesRead = input.read(buffer)) != -1) {
                        totalBytes += bytesRead;
                        if (totalBytes > MAX_APK_BYTES) {
                            throw new IllegalStateException("Update APK is too large");
                        }
                        output.write(buffer, 0, bytesRead);
                    }
                    if (totalBytes == 0) {
                        throw new IllegalStateException("Update APK is empty");
                    }
                }
                return;
            } finally {
                connection.disconnect();
            }
        }
        throw new IllegalStateException("Too many update redirects");
    }

    private boolean isHttps(String value) {
        try {
            return "https".equalsIgnoreCase(new URL(value).getProtocol());
        } catch (Exception error) {
            return false;
        }
    }
}
