package com.bulktext.app

import android.Manifest
import android.content.Intent
import android.os.Build
import android.telephony.SmsManager
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.bulktext.gateway.BackgroundGatewayService
import com.bulktext.gateway.Telephony
import com.bulktext.gateway.inventory.AndroidDeviceInventoryProvider
import com.bulktext.gateway.GatewayApp
import org.json.JSONObject

@CapacitorPlugin(
    name = "SmsGateway",
    permissions = [
        Permission(alias = "sms", strings = [Manifest.permission.SEND_SMS, Manifest.permission.READ_PHONE_STATE]),
        Permission(alias = "notifications", strings = [Manifest.permission.POST_NOTIFICATIONS])
    ]
)
class SmsGatewayPlugin : Plugin() {

    private val inventoryProvider: AndroidDeviceInventoryProvider
        get() = AndroidDeviceInventoryProvider(context)

    private val gatewayApp: GatewayApp
        get() = context.applicationContext as GatewayApp

    @PluginMethod
    fun getSimStatus(call: PluginCall) {
        try {
            if (!Telephony.permitted(context)) {
                call.reject("SMS and phone state permissions are required.")
                return
            }
            val snapshot = inventoryProvider.snapshot()
            val simsArray = JSArray()
            for (sim in snapshot.sims) {
                val obj = JSObject()
                obj.put("subscriptionId", sim.subscriptionId)
                obj.put("slotIndex", sim.slotIndex)
                obj.put("carrierName", sim.carrierName)
                obj.put("displayName", sim.displayName)
                obj.put("countryIso", sim.countryIso)
                obj.put("isEmbedded", sim.isEmbedded)
                obj.put("simIdentityHash", sim.simIdentityHash)
                simsArray.put(obj)
            }
            val ret = JSObject()
            ret.put("sims", simsArray)
            ret.put("batteryPercent", snapshot.batteryPercent)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to get SIM status: ${e.message}", e)
        }
    }

    @PluginMethod
    fun sendSms(call: PluginCall) {
        val phone = call.getString("phone")
        val message = call.getString("message")
        val subscriptionId = call.getInt("subscriptionId")

        if (phone.isNullOrBlank() || message.isNullOrBlank() || subscriptionId == null) {
            call.reject("phone, message, and subscriptionId are required.")
            return
        }

        try {
            if (!Telephony.permitted(context)) {
                call.reject("SMS permissions missing.")
                return
            }
            val smsManager = if (Build.VERSION.SDK_INT >= 31) {
                requireNotNull(context.getSystemService(SmsManager::class.java)).createForSubscriptionId(subscriptionId)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getSmsManagerForSubscriptionId(subscriptionId)
            }

            val parts = smsManager.divideMessage(message)
            smsManager.sendMultipartTextMessage(phone, null, parts, null, null)

            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to send SMS: ${e.message}", e)
        }
    }

    @PluginMethod
    fun startGateway(call: PluginCall) {
        try {
            gatewayApp.backgroundGatewayPreferences.enable()
            val intent = Intent(context, BackgroundGatewayService::class.java)
            if (Build.VERSION.SDK_INT >= 26) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to start gateway: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stopGateway(call: PluginCall) {
        try {
            gatewayApp.backgroundGatewayPreferences.disable()
            val intent = Intent(context, BackgroundGatewayService::class.java)
            context.stopService(intent)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to stop gateway: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getGatewayStatus(call: PluginCall) {
        try {
            val isEnabled = gatewayApp.backgroundGatewayPreferences.isEnabled()
            val statusText = gatewayApp.backgroundGatewayPreferences.lastStatus()
            val pausedReason = gatewayApp.backgroundGatewayPreferences.pausedReason()

            val ret = JSObject()
            ret.put("isEnabled", isEnabled)
            ret.put("statusText", statusText ?: "")
            ret.put("pausedReason", pausedReason ?: JSONObject.NULL)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to get gateway status: ${e.message}", e)
        }
    }
}
