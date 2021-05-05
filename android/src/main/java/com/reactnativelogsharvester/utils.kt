package com.reactnativelogsharvester

import android.content.Context
import android.os.Handler
import android.os.HandlerThread
import timber.log.Timber
import java.io.File
import java.io.FileOutputStream

val logsHandler by lazy {
    HandlerThread("Logs").let {
        it.start()
        Handler(it.looper)
    }
}

fun saveLogcatSessionToFile(context: Context, completion: ((fileName: String) -> Unit)? = null) {
    try {
        val bytes = Runtime.getRuntime().exec("logcat -d").inputStream.use {
            it.readBytes()
        }
        val dir = File(context.filesDir, "nl")
        if (!dir.exists()) dir.mkdirs()
        val file = File(dir, "${System.currentTimeMillis()}-nativeLogFIle.txt")
        if (!file.exists()) file.createNewFile()
        val fos = FileOutputStream(file)
        fos.use {
            it.write(bytes)
        }
        completion?.invoke(file.absolutePath)
    } catch (e: Exception) {
        Timber.e(e)
        completion?.invoke("")
    }
}
