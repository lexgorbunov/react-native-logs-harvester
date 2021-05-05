package com.reactnativelogsharvester

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class LogsHarvesterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LogsHarvester"
    }

    /** For Android only */
    @ReactMethod
    fun readLogcat(promise: Promise) {
        logsHandler.post {
            saveLogcatSessionToFile(reactApplicationContext.baseContext, promise::resolve)
        }
    }
}
