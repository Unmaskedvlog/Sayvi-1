/**
 * ProximityProvider Platform-Independent Service
 * 
 * Defines the core abstraction for discovering nearby devices either via
 * simulation (web prototype) or native Android/iOS BLE layers.
 */

import {
  NearbyDevice,
  ProximityStatus,
  NativeProximityBridge,
  UserProfile,
} from '../types';
import { INITIAL_ALL_USERS } from '../data/sampleData';
import {
  classifyProximityFromRssi,
  SAYVI_BLE_PROTOCOL_VERSION,
} from './proximityProtocol';
import { IdentityResolver } from './identityResolver';
import { Capacitor, registerPlugin } from '@capacitor/core';

export interface SayviBlePluginInterface {
  initialize(): Promise<{ success: boolean; supported: boolean; state: string }>;
  getBluetoothState(): Promise<{ state: string; isAdvertising: boolean; isScanning: boolean }>;
  requestPermissions(): Promise<{ granted: boolean }>;
  startAdvertising(options: { temporaryId: string }): Promise<{ success: boolean; isAdvertising: boolean }>;
  stopAdvertising(): Promise<{ success: boolean; isAdvertising: boolean }>;
  startScanning(): Promise<{ success: boolean; isScanning: boolean }>;
  stopScanning(): Promise<{ success: boolean; isScanning: boolean }>;
  addListener(
    eventName: 'onDeviceDetected',
    listenerFunc: (data: { temporaryId: string; rssi: number; timestamp: number }) => void
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'onBluetoothStateChanged',
    listenerFunc: (data: { state: string }) => void
  ): Promise<{ remove: () => void }>;
  addListener(
    eventName: 'onScanError',
    listenerFunc: (data: { error: string }) => void
  ): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}

export const SayviBle = registerPlugin<SayviBlePluginInterface>('SayviBle');

export interface ProximityProvider {
  /**
   * Initializes and starts the proximity discovery service for the current user.
   */
  start(currentUserId: string): Promise<void>;

  /**
   * Stops proximity scanning and advertising.
   */
  stop(): Promise<void>;

  /**
   * Requests necessary platform permissions (e.g. BLUETOOTH_SCAN, BLUETOOTH_ADVERTISE).
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Returns current provider status.
   */
  getStatus(): ProximityStatus;

  /**
   * Returns snapshot of currently detected nearby devices.
   */
  getNearbyDevices(): NearbyDevice[];

  /**
   * Subscribes to changes in detected devices.
   */
  subscribeToNearbyChanges(callback: (devices: NearbyDevice[]) => void): () => void;

  /**
   * Unsubscribes all listeners.
   */
  unsubscribe(): void;

  /**
   * Updates the broadcast presence state ("I'm Open" flag).
   */
  updatePresence(userId: string, isOpen: boolean): Promise<void>;
}

/**
 * ------------------------------------------------------------------
 * SIMULATED PROXIMITY PROVIDER
 * ------------------------------------------------------------------
 * Preserves the existing prototype behavior for web and non-native environments.
 */
export class SimulatedProximityProvider implements ProximityProvider {
  private currentUserId: string | null = null;
  private status: ProximityStatus = 'STOPPED';
  private listeners: Set<(devices: NearbyDevice[]) => void> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private registeredUsers: UserProfile[] = INITIAL_ALL_USERS;
  private detectedDevices: NearbyDevice[] = [];
  private isOpenPresence: boolean = true;

  public setAdditionalUsers(users: UserProfile[]): void {
    this.registeredUsers = users;
    // Register temporary IDs for all users in the IdentityResolver
    users.forEach((u) => {
      IdentityResolver.getTemporaryIdForUser(u.id);
    });
    this.tick();
  }

  public async start(currentUserId: string): Promise<void> {
    this.currentUserId = currentUserId;
    this.status = 'RUNNING';

    // Register all initial users
    this.registeredUsers.forEach((u) => {
      IdentityResolver.getTemporaryIdForUser(u.id);
    });

    this.tick();

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 4000);
  }

  public async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.status = 'STOPPED';
    this.detectedDevices = [];
    this.notify();
  }

  public async requestPermissions(): Promise<boolean> {
    return true; // Simulation granted
  }

  public getStatus(): ProximityStatus {
    return this.status;
  }

  public getNearbyDevices(): NearbyDevice[] {
    return [...this.detectedDevices];
  }

  public subscribeToNearbyChanges(callback: (devices: NearbyDevice[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.detectedDevices);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public unsubscribe(): void {
    this.listeners.clear();
  }

  public async updatePresence(userId: string, isOpen: boolean): Promise<void> {
    if (userId === this.currentUserId) {
      this.isOpenPresence = isOpen;
    }
    this.registeredUsers = this.registeredUsers.map((u) =>
      u.id === userId ? { ...u, isOpen } : u
    );
    this.tick();
  }

  private tick(): void {
    if (this.status !== 'RUNNING' || !this.currentUserId) return;

    const now = Date.now();
    const activeOpenUsers = this.registeredUsers.filter(
      (u) => u.id !== this.currentUserId && u.isOpen
    );

    this.detectedDevices = activeOpenUsers.map((user) => {
      const tempId = IdentityResolver.getTemporaryIdForUser(user.id);
      
      // Simulated RSSI based on user proximity classification with slight jitter
      let baseRssi = -72;
      if (user.proximity === 'VERY_CLOSE') baseRssi = -55;
      else if (user.proximity === 'IN_THE_AREA') baseRssi = -85;
      const jitter = Math.floor(Math.random() * 6) - 3;
      const rawRssi = baseRssi + jitter;

      return {
        temporaryId: tempId,
        detectedAt: now - 3000,
        lastSeenAt: now,
        estimatedProximity: user.proximity || classifyProximityFromRssi(rawRssi),
        confidence: 0.95,
        source: 'SIMULATED',
        protocolVersion: SAYVI_BLE_PROTOCOL_VERSION,
        rawRssi,
        smoothedRssi: baseRssi,
      };
    });

    this.notify();
  }

  private notify(): void {
    const list = this.getNearbyDevices();
    this.listeners.forEach((cb) => {
      try {
        cb(list);
      } catch (err) {
        console.error('Error in proximity listener:', err);
      }
    });
  }
}

/**
 * ------------------------------------------------------------------
 * ANDROID BLE PROXIMITY PROVIDER (NATIVE BRIDGE INTEGRATION)
 * ------------------------------------------------------------------
 * Prepares the architecture for the native Android BLE bridge.
 * Interacts with window.AndroidSAYVIBridge when running inside a WebView/native wrapper.
 */
export class AndroidBleProximityProvider implements ProximityProvider {
  private status: ProximityStatus = 'STOPPED';
  private currentUserId: string | null = null;
  private listeners: Set<(devices: NearbyDevice[]) => void> = new Set();
  private detectedDevicesMap: Map<string, NearbyDevice> = new Map();
  private nativeBridge: NativeProximityBridge | null = null;
  private activeListeners: Array<{ remove: () => void }> = [];
  private isCapacitor = false;

  constructor(bridge?: NativeProximityBridge) {
    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform()) {
      this.isCapacitor = true;
    } else if (bridge) {
      this.nativeBridge = bridge;
    } else if (
      typeof window !== 'undefined' &&
      (window as unknown as { AndroidSAYVIBridge?: NativeProximityBridge }).AndroidSAYVIBridge
    ) {
      this.nativeBridge = (window as unknown as { AndroidSAYVIBridge: NativeProximityBridge }).AndroidSAYVIBridge;
    }
  }

  public async start(currentUserId: string): Promise<void> {
    this.currentUserId = currentUserId;
    this.status = 'STARTING';

    if (this.isCapacitor) {
      try {
        const initResult = await SayviBle.initialize();
        if (!initResult.supported) {
          console.warn('BLE is not supported on this device hardware.');
          this.status = 'UNSUPPORTED';
          return;
        }

        const permResult = await SayviBle.requestPermissions();
        if (!permResult.granted) {
          this.status = 'PERMISSIONS_DENIED';
          return;
        }

        const stateResult = await SayviBle.getBluetoothState();
        if (stateResult.state === 'POWERED_OFF') {
          this.status = 'BLUETOOTH_DISABLED';
          return;
        } else if (stateResult.state === 'UNAUTHORIZED') {
          this.status = 'PERMISSIONS_DENIED';
          return;
        } else if (stateResult.state === 'UNSUPPORTED') {
          this.status = 'UNSUPPORTED';
          return;
        }

        // Attach event listeners
        await this.clearListeners();
        const detectSub = await SayviBle.addListener('onDeviceDetected', (event) => {
          this.handleRawDeviceDetection(event.temporaryId, event.rssi, event.timestamp);
        });
        const stateSub = await SayviBle.addListener('onBluetoothStateChanged', (event) => {
          if (event.state === 'POWERED_OFF') {
            this.status = 'BLUETOOTH_DISABLED';
          } else if (event.state === 'POWERED_ON') {
            this.status = 'RUNNING';
          }
        });
        this.activeListeners.push(detectSub, stateSub);

        // Start scanning
        await SayviBle.startScanning();
        this.status = 'RUNNING';
      } catch (err) {
        console.error('Failed to start Capacitor BLE Proximity Provider:', err);
        this.status = 'ERROR';
      }
      return;
    }

    if (!this.nativeBridge) {
      console.warn('Android BLE Bridge is not available on this platform. Status: UNSUPPORTED');
      this.status = 'UNSUPPORTED';
      return;
    }

    try {
      const initialized = await this.nativeBridge.initialize();
      if (!initialized) {
        this.status = 'ERROR';
        return;
      }

      const permGranted = await this.nativeBridge.requestPermissions();
      if (!permGranted) {
        this.status = 'PERMISSIONS_DENIED';
        return;
      }

      const state = await this.nativeBridge.getBluetoothState();
      if (state === 'POWERED_OFF') {
        this.status = 'BLUETOOTH_DISABLED';
        return;
      }

      // Wire device detection callback from native bridge
      this.nativeBridge.onDeviceDetected = (event) => {
        this.handleRawDeviceDetection(event.temporaryId, event.rssi, event.timestamp);
      };

      this.nativeBridge.onDeviceLost = (temporaryId) => {
        this.detectedDevicesMap.delete(temporaryId);
        this.notify();
      };

      await this.nativeBridge.startScanning();
      this.status = 'RUNNING';
    } catch (e) {
      console.error('Failed to start Android BLE Proximity:', e);
      this.status = 'ERROR';
    }
  }

  public async stop(): Promise<void> {
    if (this.isCapacitor) {
      try {
        await SayviBle.stopScanning();
        await SayviBle.stopAdvertising();
        await this.clearListeners();
      } catch (e) {
        console.error('Error stopping Capacitor SayviBle:', e);
      }
    } else if (this.nativeBridge) {
      await this.nativeBridge.stopScanning().catch(() => {});
      await this.nativeBridge.stopAdvertising().catch(() => {});
    }
    this.status = 'STOPPED';
    this.detectedDevicesMap.clear();
    this.notify();
  }

  public async requestPermissions(): Promise<boolean> {
    if (this.isCapacitor) {
      try {
        const res = await SayviBle.requestPermissions();
        return res.granted;
      } catch {
        return false;
      }
    }
    if (this.nativeBridge) {
      return this.nativeBridge.requestPermissions();
    }
    return false;
  }

  public getStatus(): ProximityStatus {
    return this.status;
  }

  public getNearbyDevices(): NearbyDevice[] {
    return Array.from(this.detectedDevicesMap.values());
  }

  public subscribeToNearbyChanges(callback: (devices: NearbyDevice[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getNearbyDevices());
    return () => {
      this.listeners.delete(callback);
    };
  }

  public unsubscribe(): void {
    this.listeners.clear();
  }

  public async updatePresence(userId: string, isOpen: boolean): Promise<void> {
    if (this.status !== 'RUNNING') return;
    const tempId = IdentityResolver.getTemporaryIdForUser(userId);

    if (this.isCapacitor) {
      try {
        if (isOpen) {
          await SayviBle.startAdvertising({ temporaryId: tempId });
        } else {
          await SayviBle.stopAdvertising();
        }
      } catch (err) {
        console.error('Error updating presence with SayviBle:', err);
      }
      return;
    }

    if (this.nativeBridge) {
      if (isOpen) {
        await this.nativeBridge.startAdvertising(tempId);
      } else {
        await this.nativeBridge.stopAdvertising();
      }
    }
  }

  private async clearListeners(): Promise<void> {
    for (const l of this.activeListeners) {
      try {
        l.remove();
      } catch (ignored) {}
    }
    this.activeListeners = [];
  }

  private handleRawDeviceDetection(temporaryId: string, rssi: number, timestamp: number): void {
    const existing = this.detectedDevicesMap.get(temporaryId);
    const smoothedRssi = existing?.smoothedRssi
      ? Math.round(existing.smoothedRssi * 0.7 + rssi * 0.3)
      : rssi;

    const device: NearbyDevice = {
      temporaryId,
      detectedAt: existing ? existing.detectedAt : timestamp,
      lastSeenAt: timestamp,
      estimatedProximity: classifyProximityFromRssi(smoothedRssi),
      confidence: 0.9,
      source: 'BLE',
      protocolVersion: SAYVI_BLE_PROTOCOL_VERSION,
      rawRssi: rssi,
      smoothedRssi,
    };

    this.detectedDevicesMap.set(temporaryId, device);
    this.notify();
  }

  private notify(): void {
    const list = this.getNearbyDevices();
    this.listeners.forEach((cb) => cb(list));
  }
}
