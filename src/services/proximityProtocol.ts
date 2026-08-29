/**
 * SAYVI BLE Protocol Specification v1
 * 
 * Defines the standard constants, packet structure, and ephemeral token
 * generator for native BLE discovery.
 * 
 * PACKET STRUCTURE (20 bytes max standard manufacturer/service data):
 * - Byte 0: Protocol Version (0x01)
 * - Byte 1: Flags / Capability (0x01 = Discovery Open)
 * - Bytes 2-17: 16-Byte Ephemeral Temporary ID (Token)
 * - Bytes 18-19: Checksum / reserved
 */

import { TemporaryProximityIdentity, EstimatedProximity } from '../types';

/**
 * Dedicated 128-bit Service UUID for SAYVI BLE Discovery.
 * Custom UUID to avoid collisions with standard Bluetooth SIG services.
 */
export const SAYVI_BLE_SERVICE_UUID = 'a7e85a56-4c28-4e31-9f93-017e8d356789';

export const SAYVI_BLE_PROTOCOL_VERSION = 1;

/**
 * Ephemeral Identifier Rotation Interval (e.g., 15 minutes)
 * Prevents passive tracking across different physical locations.
 */
export const TOKEN_ROTATION_INTERVAL_MS = 15 * 60 * 1000;

/**
 * RSSI Thresholds for coarse proximity categorization.
 * Note: RSSI is noisy and treated as a rough indication, never exact meters.
 */
export const RSSI_THRESHOLDS = {
  VERY_CLOSE: -60,   // ~ < 2-3m in typical environments
  NEARBY: -75,       // ~ 3-8m
  IN_THE_AREA: -90,  // ~ 8-15m
};

/**
 * Maps a smoothed RSSI value to an estimated proximity tier.
 */
export function classifyProximityFromRssi(rssi: number): EstimatedProximity {
  if (rssi >= RSSI_THRESHOLDS.VERY_CLOSE) {
    return 'VERY_CLOSE';
  } else if (rssi >= RSSI_THRESHOLDS.NEARBY) {
    return 'NEARBY';
  } else if (rssi >= RSSI_THRESHOLDS.IN_THE_AREA) {
    return 'IN_THE_AREA';
  }
  return 'UNKNOWN';
}

/**
 * Generates an ephemeral cryptographic-quality temporary proximity token.
 */
export function generateTemporaryProximityIdentity(
  protocolVersion: number = SAYVI_BLE_PROTOCOL_VERSION
): TemporaryProximityIdentity {
  const now = Date.now();
  // Generate a random 16-byte hex string (32 characters)
  const randomBytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const temporaryId = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    temporaryId: `tid_${temporaryId}`,
    createdAt: now,
    expiresAt: now + TOKEN_ROTATION_INTERVAL_MS,
    protocolVersion,
  };
}

/**
 * Validates if an ephemeral token is still within its validity window.
 */
export function isTemporaryIdentityValid(identity: TemporaryProximityIdentity): boolean {
  const now = Date.now();
  return now >= identity.createdAt && now < identity.expiresAt;
}
