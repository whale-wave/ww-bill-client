package com.easyhappy.wwbill;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.ClipData;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@CapacitorPlugin(
    name = "GalleryImage",
    permissions = {
        @Permission(alias = "storage", strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE })
    }
)
public class GalleryImagePlugin extends Plugin {

    @PluginMethod
    public void saveImageToGallery(PluginCall call) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P
            && getPermissionState("storage") != PermissionState.GRANTED) {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
            return;
        }
        save(call);
    }

    @PluginMethod
    public void shareImage(PluginCall call) {
        String value = call.getString("uri");
        if (value == null || value.isEmpty()) {
            call.reject("Image URI is required", "INVALID_IMAGE_URI");
            return;
        }

        try {
            Uri uri = Uri.parse(value);
            if (!ContentResolver.SCHEME_CONTENT.equals(uri.getScheme())) {
                call.reject("Image URI must be a content URI", "INVALID_IMAGE_URI");
                return;
            }
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("image/png");
            shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
            shareIntent.setClipData(ClipData.newRawUri("bill-image", uri));
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(shareIntent, "分享账单图片"));
            call.resolve();
        } catch (Exception error) {
            call.reject("Unable to open image share sheet", "IMAGE_SHARE_FAILED", error);
        }
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        if (getPermissionState("storage") != PermissionState.GRANTED) {
            call.reject("Gallery storage permission was denied", "PERMISSION_DENIED");
            return;
        }
        save(call);
    }

    private void save(PluginCall call) {
        String encodedData = call.getString("data");
        String requestedName = call.getString("fileName", "image.png");
        if (encodedData == null || encodedData.isEmpty()) {
            call.reject("Image data is required", "INVALID_IMAGE_DATA");
            return;
        }

        try {
            int commaIndex = encodedData.indexOf(',');
            String base64 = commaIndex >= 0 ? encodedData.substring(commaIndex + 1) : encodedData;
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            String fileName = uniqueFileName(requestedName);
            Uri uri = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? saveWithMediaStore(bytes, fileName)
                : saveLegacy(bytes, fileName);
            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to save image to gallery", "GALLERY_WRITE_FAILED", error);
        }
    }

    private Uri saveWithMediaStore(byte[] bytes, String fileName) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
        values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
        values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_DCIM + "/Camera");
        values.put(MediaStore.Images.Media.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IllegalStateException("MediaStore did not create an image URI");
        }
        try {
            try (OutputStream output = resolver.openOutputStream(uri)) {
                if (output == null) {
                    throw new IllegalStateException("MediaStore did not open an output stream");
                }
                output.write(bytes);
            }
            ContentValues published = new ContentValues();
            published.put(MediaStore.Images.Media.IS_PENDING, 0);
            resolver.update(uri, published, null, null);
            return uri;
        } catch (Exception error) {
            resolver.delete(uri, null, null);
            throw error;
        }
    }

    @SuppressWarnings("deprecation")
    private Uri saveLegacy(byte[] bytes, String fileName) throws Exception {
        File dcim = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM);
        File camera = new File(dcim, "Camera");
        if (!camera.exists() && !camera.mkdirs()) {
            throw new IllegalStateException("Unable to create camera directory");
        }
        File image = new File(camera, fileName);
        try (OutputStream output = new FileOutputStream(image)) {
            output.write(bytes);
        }
        MediaScannerConnection.scanFile(
            getContext(),
            new String[] { image.getAbsolutePath() },
            new String[] { "image/png" },
            null
        );
        return FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", image);
    }

    private String uniqueFileName(String requestedName) {
        String sanitized = requestedName
            .replaceAll("[\\\\/:*?\"<>|\\x00-\\x1F]", "_")
            .replaceAll("(?i)\\.png$", "");
        if (sanitized.trim().isEmpty()) {
            sanitized = "image";
        }
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss_SSS", Locale.US).format(new Date());
        return sanitized + "_" + timestamp + ".png";
    }
}
