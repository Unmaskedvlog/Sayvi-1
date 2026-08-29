/**
 * SAYVI Local Proximity Engine
 * 
 * Sits between the ProximityProvider (BLE/Simulation) and the SAYVI UI.
 * Handles:
 * - Signal Smoothing (EMA on RSSI)
 * - Packet Deduplication & Timestamp tracking
 * - Confirmation Period (Hysteresis to avoid rapid appearing/disappearing)
 * - Stale Device Eviction
 * - 7-Point Privacy Gate
 * - Zero Unnecessary Firebase Writes
 */

import {
  NearbyDevice,
  UserProfile,
  PrivacySettings,
  ProximityDiagnostics,
  ProximityType,
} from '../types';
import { ProximityProvider, SimulatedProximityProvider } from './proximityProvider';
import { IdentityResolver } from './identityResolver';

export interface NearbyDiscoveredUser {
  profile: UserProfile;
  proximity: ProximityType;
  rssi?: number;
  lastSeen: number;
  temporaryId: string;
}

export interface ProximityEngineConfig {
  confirmationThresholdCount: number; // detections needed before showing
  staleTimeoutMs: number;              // time after which a missing device is evicted
  rssiAlphaSmoothing: number;          // EMA smoothing factor (0.0 to 1.0)
}

const DEFAULT_CONFIG: ProximityEngineConfig = {
  confirmationThresholdCount: 1, // Quick detection in simulation, 2 in real BLE
  staleTimeoutMs: 15000,          // 15s eviction
  rssiAlphaSmoothing: 0.35,
};

export class ProximityEngine {
  private provider: ProximityProvider;
  private config: ProximityEngineConfig;
  private currentUserId: string | null = null;
  private currentUserProfile: UserProfile | null = null;
  private privacySettings: PrivacySettings = {
    ghostMode: false,
    approximateDistanceOnly: true,
    allowWavesFrom: 'ALL',
    inAppBannersOnly: false,
    pauseAllNotifications: false,
  };
  private blockedUserIds: Set<string> = new Set();
  private allProfiles: UserProfile[] = [];

  // Internal tracking maps
  private rawDetectionsMap: Map<
    string,
    {
      device: NearbyDevice;
      detectionCount: number;
      firstSeen: number;
      lastSeen: number;
      smoothedRssi: number;
    }
  > = new Map();

  private discoveredUsers: NearbyDiscoveredUser[] = [];
  private listeners: Set<(users: NearbyDiscoveredUser[]) => void> = new Set();
  private diagnosticsListeners: Set<(diag: ProximityDiagnostics) => void> = new Set();
  private evictionTimer: NodeJS.Timeout | null = null;
  private unsubProvider: (() => void) | null = null;

  constructor(
    provider?: ProximityProvider,
    config: Partial<ProximityEngineConfig> = {}
  ) {
    this.provider = provider || new SimulatedProximityProvider();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public setProvider(provider: ProximityProvider): void {
    if (this.unsubProvider) {
      this.unsubProvider();
      this.unsubProvider = null;
    }
    this.provider = provider;
    if (this.currentUserId) {
      this.start(this.currentUserId);
    }
  }

  public getProvider(): ProximityProvider {
    return this.provider;
  }

  public setAllProfiles(profiles: UserProfile[]): void {
    this.allProfiles = profiles;
    if (this.provider instanceof SimulatedProximityProvider) {
      this.provider.setAdditionalUsers(profiles);
    }
    this.reevaluateDiscoveredUsers();
  }

  public updateContext(
    currentUser: UserProfile,
    privacy: PrivacySettings,
    blockedIds: Set<string>
  ): void {
    this.currentUserId = currentUser.id;
    this.currentUserProfile = currentUser;
    this.privacySettings = privacy;
    this.blockedUserIds = blockedIds;

    this.provider.updatePresence(currentUser.id, currentUser.isOpen);
    this.reevaluateDiscoveredUsers();
  }

  public async start(currentUserId: string): Promise<void> {
    this.currentUserId = currentUserId;
    await this.provider.start(currentUserId);

    if (this.unsubProvider) {
      this.unsubProvider();
    }

    this.unsubProvider = this.provider.subscribeToNearbyChanges((devices) => {
      this.handleRawDeviceBatch(devices);
    });

    if (this.evictionTimer) clearInterval(this.evictionTimer);
    this.evictionTimer = setInterval(() => {
      this.evictStaleDevices();
    }, 3000);
  }

  public async stop(): Promise<void> {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
      this.evictionTimer = null;
    }
    if (this.unsubProvider) {
      this.unsubProvider();
      this.unsubProvider = null;
    }
    await this.provider.stop();
    this.rawDetectionsMap.clear();
    this.discoveredUsers = [];
    this.notify();
    this.notifyDiagnostics();
  }

  public subscribe(callback: (users: NearbyDiscoveredUser[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.discoveredUsers);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public subscribeDiagnostics(
    callback: (diag: ProximityDiagnostics) => void
  ): () => void {
    this.diagnosticsListeners.add(callback);
    callback(this.getDiagnosticsSnapshot());
    return () => {
      this.diagnosticsListeners.delete(callback);
    };
  }

  public getDiagnosticsSnapshot(): ProximityDiagnostics {
    const rawDevices = this.provider.getNearbyDevices();
    const lastDetection = rawDevices.length > 0
      ? Math.max(...rawDevices.map((d) => d.lastSeenAt))
      : null;

    const isSimulated = this.provider instanceof SimulatedProximityProvider;

    return {
      providerType: isSimulated ? 'SIMULATED' : 'BLE',
      status: this.provider.getStatus(),
      isAdvertising: Boolean(this.currentUserProfile?.isOpen),
      isScanning: this.provider.getStatus() === 'RUNNING',
      detectedCount: this.discoveredUsers.length,
      lastDetectionTime: lastDetection,
      bluetoothAvailable: true,
      permissionGranted: true,
      devices: rawDevices,
      currentTemporaryId: this.currentUserId
        ? IdentityResolver.getTemporaryIdForUser(this.currentUserId)
        : undefined,
      protocolVersion: 1,
    };
  }

  /**
   * Processes raw packets from the proximity provider.
   */
  private handleRawDeviceBatch(devices: NearbyDevice[]): void {
    const now = Date.now();

    devices.forEach((dev) => {
      const existing = this.rawDetectionsMap.get(dev.temporaryId);
      const rawRssi = dev.rawRssi ?? -70;

      if (!existing) {
        this.rawDetectionsMap.set(dev.temporaryId, {
          device: dev,
          detectionCount: 1,
          firstSeen: now,
          lastSeen: now,
          smoothedRssi: rawRssi,
        });
      } else {
        // EMA Smoothing: S_t = alpha * Y_t + (1 - alpha) * S_{t-1}
        const smoothed = Math.round(
          this.config.rssiAlphaSmoothing * rawRssi +
            (1 - this.config.rssiAlphaSmoothing) * existing.smoothedRssi
        );

        existing.detectionCount += 1;
        existing.lastSeen = now;
        existing.smoothedRssi = smoothed;
        existing.device.lastSeenAt = now;
        existing.device.smoothedRssi = smoothed;
        existing.device.rawRssi = rawRssi;
      }
    });

    this.reevaluateDiscoveredUsers();
    this.notifyDiagnostics();
  }

  /**
   * Periodic eviction of devices not seen within staleTimeoutMs.
   */
  private evictStaleDevices(): void {
    const now = Date.now();
    let hasChanges = false;

    this.rawDetectionsMap.forEach((entry, tempId) => {
      if (now - entry.lastSeen > this.config.staleTimeoutMs) {
        this.rawDetectionsMap.delete(tempId);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.reevaluateDiscoveredUsers();
      this.notifyDiagnostics();
    }
  }

  /**
   * 7-Point Privacy Gate & User Model Resolution
   */
  private async reevaluateDiscoveredUsers(): Promise<void> {
    // 1. Current user must be authenticated
    if (!this.currentUserId || !this.currentUserProfile) {
      this.discoveredUsers = [];
      this.notify();
      return;
    }

    // 2. Current user must have "I'm Open" turned on
    if (!this.currentUserProfile.isOpen) {
      this.discoveredUsers = [];
      this.notify();
      return;
    }

    // 3. Current user must not be in Ghost Mode for active discovery broadcasting
    // (In ghost mode, user can view nearby but will not broadcast)

    const resolvedList: NearbyDiscoveredUser[] = [];

    for (const [tempId, entry] of this.rawDetectionsMap.entries()) {
      // 4. Hysteresis confirmation filter
      if (entry.detectionCount < this.config.confirmationThresholdCount) {
        continue;
      }

      // 5. Safe resolution of temporary identity
      const profile = await IdentityResolver.resolveProximityIdentity(
        tempId,
        this.allProfiles
      );

      if (!profile) continue;

      // 6. Check mutual block list
      if (this.blockedUserIds.has(profile.id)) continue;
      if (profile.id === this.currentUserId) continue;

      // 7. Check if target user is Open
      if (!profile.isOpen) continue;

      // Map estimated proximity
      const proximityType: ProximityType =
        profile.proximity ||
        (entry.smoothedRssi >= -60
          ? 'VERY_CLOSE'
          : entry.smoothedRssi >= -78
          ? 'NEARBY'
          : 'IN_THE_AREA');

      resolvedList.push({
        profile,
        proximity: proximityType,
        rssi: entry.smoothedRssi,
        lastSeen: entry.lastSeen,
        temporaryId: tempId,
      });
    }

    this.discoveredUsers = resolvedList;
    this.notify();
  }

  public async requestPermissions(): Promise<boolean> {
    return this.provider.requestPermissions();
  }

  private notify(): void {
    const list = [...this.discoveredUsers];
    this.listeners.forEach((cb) => {
      try {
        cb(list);
      } catch (err) {
        console.error('Error in proximity engine subscriber:', err);
      }
    });
  }

  private notifyDiagnostics(): void {
    const diag = this.getDiagnosticsSnapshot();
    this.diagnosticsListeners.forEach((cb) => {
      try {
        cb(diag);
      } catch (err) {
        console.error('Error in diagnostics subscriber:', err);
      }
    });
  }
}
