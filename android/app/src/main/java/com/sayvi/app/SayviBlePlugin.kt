package com.sayvi.app

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanFilter
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.ParcelUuid
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import java.util.UUID

@CapacitorPlugin(
    name = "SayviBle",
    permissions = [
        Permission(
            alias = "bluetooth",
            strings = [
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT
            ]
        )
    ]
)
class SayviBlePlugin : Plugin() {

    companion object {
        const val SAYVI_BLE_SERVICE_UUID_STRING = "a7e85a56-4c28-4e31-9f93-017e8d356789"
        val SAYVI_SERVICE_UUID: UUID = UUID.fromString(SAYVI_BLE_SERVICE_UUID_STRING)
        val SAYVI_PARCEL_UUID: ParcelUuid = ParcelUuid(SAYVI_SERVICE_UUID)
        const val PROTOCOL_VERSION: Byte = 0x01
        const val CAPABILITY_FLAG_OPEN: Byte = 0x01
    }

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var advertiser: BluetoothLeAdvertiser? = null
    private var scanner: BluetoothLeScanner? = null

    private var isAdvertising = false
    private var isScanning = false
    private var currentAdvertiseCallback: AdvertiseCallback? = null
    private var currentScanCallback: ScanCallback? = null

    private var bluetoothStateReceiver: BroadcastReceiver? = null

    override fun load() {
        super.load()
        initBluetoothAdapter()
        registerStateReceiver()
    }

    private fun initBluetoothAdapter() {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bluetoothAdapter = bluetoothManager?.adapter
    }

    private fun registerStateReceiver() {
        if (bluetoothStateReceiver == null) {
            bluetoothStateReceiver = object : BroadcastReceiver() {
                override fun onReceive(c: Context?, intent: Intent?) {
                    if (intent?.action == BluetoothAdapter.ACTION_STATE_CHANGED) {
                        val state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR)
                        val stateStr = when (state) {
                            BluetoothAdapter.STATE_ON -> "POWERED_ON"
                            BluetoothAdapter.STATE_OFF, BluetoothAdapter.STATE_TURNING_OFF -> "POWERED_OFF"
                            else -> "UNKNOWN"
                        }
                        val ret = JSObject().apply {
                            put("state", stateStr)
                        }
                        notifyListeners("onBluetoothStateChanged", ret)
                    }
                }
            }
            val filter = IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED)
            context.registerReceiver(bluetoothStateReceiver, filter)
        }
    }

    override fun handleOnDestroy() {
        stopAdvertisingInternal()
        stopScanningInternal()
        if (bluetoothStateReceiver != null) {
            try {
                context.unregisterReceiver(bluetoothStateReceiver)
            } catch (ignored: Exception) {}
            bluetoothStateReceiver = null
        }
        super.handleOnDestroy()
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        initBluetoothAdapter()
        val isSupported = context.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE) && (bluetoothAdapter != null)
        val state = getInternalBluetoothState()

        val ret = JSObject().apply {
            put("success", true)
            put("supported", isSupported)
            put("state", state)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getBluetoothState(call: PluginCall) {
        val state = getInternalBluetoothState()
        val ret = JSObject().apply {
            put("state", state)
            put("isAdvertising", isAdvertising)
            put("isScanning", isScanning)
        }
        call.resolve(ret)
    }

    private fun getInternalBluetoothState(): String {
        val adapter = bluetoothAdapter ?: return "UNSUPPORTED"
        if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            return "UNSUPPORTED"
        }
        if (!hasRequiredPermissions()) {
            return "UNAUTHORIZED"
        }
        return if (adapter.isEnabled) "POWERED_ON" else "POWERED_OFF"
    }

    private fun hasRequiredPermissions(): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val scanGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED
            val advGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_ADVERTISE) == PackageManager.PERMISSION_GRANTED
            val connGranted = ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
            return scanGranted && advGranted && connGranted
        }
        return true
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!hasRequiredPermissions()) {
                requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback")
                return
            }
        }
        val ret = JSObject().apply {
            put("granted", true)
        }
        call.resolve(ret)
    }

    @PermissionCallback
    fun bluetoothPermsCallback(call: PluginCall) {
        val granted = hasRequiredPermissions()
        val ret = JSObject().apply {
            put("granted", granted)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun startAdvertising(call: PluginCall) {
        val temporaryId = call.getString("temporaryId")
        if (temporaryId.isNullOrEmpty()) {
            call.reject("temporaryId is required to start advertising")
            return
        }

        if (!hasRequiredPermissions()) {
            call.reject("Bluetooth permissions not granted")
            return
        }

        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            call.reject("Bluetooth is not enabled or unsupported")
            return
        }

        advertiser = adapter.bluetoothLeAdvertiser
        if (advertiser == null) {
            call.reject("BLE Advertiser not supported on this device hardware")
            return
        }

        // Stop any existing advertisement before starting a new one
        stopAdvertisingInternal()

        try {
            val payload = buildAdvertisementPayload(temporaryId)
            val settings = AdvertiseSettings.Builder()
                .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
                .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
                .setConnectable(false)
                .setTimeout(0)
                .build()

            val data = AdvertiseData.Builder()
                .setIncludeDeviceName(false)
                .setIncludeTxPowerLevel(false)
                .addServiceData(SAYVI_PARCEL_UUID, payload)
                .build()

            val callback = object : AdvertiseCallback() {
                override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                    isAdvertising = true
                    val ret = JSObject().apply {
                        put("success", true)
                        put("isAdvertising", true)
                    }
                    call.resolve(ret)
                }

                override fun onStartFailure(errorCode: Int) {
                    isAdvertising = false
                    val errorMsg = when (errorCode) {
                        ADVERTISE_FAILED_DATA_TOO_LARGE -> "ADVERTISE_FAILED_DATA_TOO_LARGE"
                        ADVERTISE_FAILED_TOO_MANY_ADVERTISERS -> "ADVERTISE_FAILED_TOO_MANY_ADVERTISERS"
                        ADVERTISE_FAILED_ALREADY_STARTED -> "ADVERTISE_FAILED_ALREADY_STARTED"
                        ADVERTISE_FAILED_INTERNAL_ERROR -> "ADVERTISE_FAILED_INTERNAL_ERROR"
                        ADVERTISE_FAILED_FEATURE_UNSUPPORTED -> "ADVERTISE_FAILED_FEATURE_UNSUPPORTED"
                        else -> "ADVERTISE_FAILED_ERROR_$errorCode"
                    }
                    call.reject("BLE Advertising failed: $errorMsg", errorMsg)
                }
            }

            currentAdvertiseCallback = callback
            advertiser?.startAdvertising(settings, data, callback)
        } catch (e: SecurityException) {
            call.reject("SecurityException starting advertising: ${e.message}")
        } catch (e: Exception) {
            call.reject("Exception starting advertising: ${e.message}")
        }
    }

    @PluginMethod
    fun stopAdvertising(call: PluginCall) {
        stopAdvertisingInternal()
        val ret = JSObject().apply {
            put("success", true)
            put("isAdvertising", false)
        }
        call.resolve(ret)
    }

    private fun stopAdvertisingInternal() {
        if (isAdvertising && advertiser != null && currentAdvertiseCallback != null) {
            try {
                advertiser?.stopAdvertising(currentAdvertiseCallback)
            } catch (ignored: Exception) {}
        }
        isAdvertising = false
        currentAdvertiseCallback = null
    }

    @PluginMethod
    fun startScanning(call: PluginCall) {
        if (!hasRequiredPermissions()) {
            call.reject("Bluetooth permissions not granted")
            return
        }

        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            call.reject("Bluetooth is not enabled or unsupported")
            return
        }

        scanner = adapter.bluetoothLeScanner
        if (scanner == null) {
            call.reject("BLE Scanner not supported on this device")
            return
        }

        stopScanningInternal()

        try {
            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .setReportDelay(0)
                .build()

            // Filter for SAYVI service UUID
            val filter = ScanFilter.Builder()
                .setServiceData(SAYVI_PARCEL_UUID, null)
                .build()

            val callback = object : ScanCallback() {
                override fun onScanResult(callbackType: Int, result: ScanResult?) {
                    result?.let { handleScanResult(it) }
                }

                override fun onBatchScanResults(results: MutableList<ScanResult>?) {
                    results?.forEach { handleScanResult(it) }
                }

                override fun onScanFailed(errorCode: Int) {
                    val errorMsg = "SCAN_FAILED_ERROR_$errorCode"
                    isScanning = false
                    val ret = JSObject().apply {
                        put("error", errorMsg)
                    }
                    notifyListeners("onScanError", ret)
                }
            }

            currentScanCallback = callback
            scanner?.startScan(listOf(filter), settings, callback)
            isScanning = true

            val ret = JSObject().apply {
                put("success", true)
                put("isScanning", true)
            }
            call.resolve(ret)
        } catch (e: SecurityException) {
            call.reject("SecurityException starting scan: ${e.message}")
        } catch (e: Exception) {
            call.reject("Exception starting scan: ${e.message}")
        }
    }

    @PluginMethod
    fun stopScanning(call: PluginCall) {
        stopScanningInternal()
        val ret = JSObject().apply {
            put("success", true)
            put("isScanning", false)
        }
        call.resolve(ret)
    }

    private fun stopScanningInternal() {
        if (isScanning && scanner != null && currentScanCallback != null) {
            try {
                scanner?.stopScan(currentScanCallback)
            } catch (ignored: Exception) {}
        }
        isScanning = false
        currentScanCallback = null
    }

    /**
     * Parses raw scan result and extracts SAYVI ephemeral token.
     */
    private fun handleScanResult(result: ScanResult) {
        val record = result.scanRecord ?: return
        val serviceData = record.getServiceData(SAYVI_PARCEL_UUID) ?: return

        // Packet validation: Min 18 bytes (Version + Flags + 16-byte token)
        if (serviceData.size < 18) return
        val version = serviceData[0]
        if (version != PROTOCOL_VERSION) return

        // Extract 16-byte token
        val tokenBytes = ByteArray(16)
        System.arraycopy(serviceData, 2, tokenBytes, 0, 16)
        val tempId = "tid_" + tokenBytes.joinToString("") { "%02x".format(it) }

        val event = JSObject().apply {
            put("temporaryId", tempId)
            put("rssi", result.rssi)
            put("timestamp", System.currentTimeMillis())
        }

        notifyListeners("onDeviceDetected", event)
    }

    /**
     * Constructs the 18-byte SAYVI BLE payload.
     * Byte 0: 0x01 (Version)
     * Byte 1: 0x01 (Flags)
     * Bytes 2-17: 16-byte token
     */
    private fun buildAdvertisementPayload(temporaryId: String): ByteArray {
        val payload = ByteArray(18)
        payload[0] = PROTOCOL_VERSION
        payload[1] = CAPABILITY_FLAG_OPEN

        // Strip "tid_" prefix if present
        val cleanHex = temporaryId.removePrefix("tid_").take(32).padEnd(32, '0')
        for (i in 0 until 16) {
            val start = i * 2
            val byteStr = cleanHex.substring(start, start + 2)
            payload[2 + i] = byteStr.toInt(16).toByte()
        }

        return payload
    }
}
