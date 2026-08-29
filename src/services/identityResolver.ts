/**
 * SAYVI Proximity Identity Resolver
 * 
 * Abstraction layer to securely resolve temporary ephemeral BLE identifiers
 * into User Profiles without exposing private information over the air.
 */

import { UserProfile } from '../types';
import { INITIAL_ALL_USERS } from '../data/sampleData';
import { SayviService } from './sayviService';

export class IdentityResolver {
  private static ephemeralToUserMap: Map<string, string> = new Map();
  private static userToEphemeralMap: Map<string, string> = new Map();
  private static profileCache: Map<string, { profile: UserProfile; cachedAt: number }> = new Map();
  private static CACHE_TTL_MS = 60 * 1000; // 1 minute local cache

  /**
   * Registers or updates the temporary mapping for a user.
   * In a future production backend, this will sync with a secure, ephemeral KV store.
   */
  public static registerTemporaryMapping(userId: string, temporaryId: string): void {
    this.ephemeralToUserMap.set(temporaryId, userId);
    this.userToEphemeralMap.set(userId, temporaryId);
  }

  /**
   * Resolves a temporaryId to a user ID.
   */
  public static getUserIdForTemporaryId(temporaryId: string): string | null {
    // Check if direct mapping exists
    if (this.ephemeralToUserMap.has(temporaryId)) {
      return this.ephemeralToUserMap.get(temporaryId)!;
    }

    // In simulation mode, temporaryIds are format "sim_userId" or mapped directly
    if (temporaryId.startsWith('sim_')) {
      return temporaryId.replace('sim_', '');
    }

    return null;
  }

  /**
   * Gets or generates a temporary ID for a given user.
   */
  public static getTemporaryIdForUser(userId: string): string {
    if (this.userToEphemeralMap.has(userId)) {
      return this.userToEphemeralMap.get(userId)!;
    }
    const tempId = `sim_${userId}`;
    this.registerTemporaryMapping(userId, tempId);
    return tempId;
  }

  /**
   * Resolves a temporary BLE identity into a verified UserProfile.
   * Uses local cache and fallback to Firestore or seeded users.
   */
  public static async resolveProximityIdentity(
    temporaryId: string,
    allProfiles?: UserProfile[]
  ): Promise<UserProfile | null> {
    const userId = this.getUserIdForTemporaryId(temporaryId);
    if (!userId) return null;

    // Check memory cache
    const cached = this.profileCache.get(userId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.profile;
    }

    // Check provided profiles list
    if (allProfiles) {
      const found = allProfiles.find((p) => p.id === userId);
      if (found) {
        this.profileCache.set(userId, { profile: found, cachedAt: Date.now() });
        return found;
      }
    }

    // Check sample users
    const sample = INITIAL_ALL_USERS.find((u) => u.id === userId);
    if (sample) {
      this.profileCache.set(userId, { profile: sample, cachedAt: Date.now() });
      return sample;
    }

    // Query Firestore (rate-limited)
    try {
      const profile = await SayviService.getUserProfile(userId);
      if (profile) {
        this.profileCache.set(userId, { profile, cachedAt: Date.now() });
        return profile;
      }
    } catch (e) {
      console.warn(`Could not resolve profile for userId ${userId}:`, e);
    }

    return null;
  }

  /**
   * Clear resolution cache
   */
  public static clearCache(): void {
    this.profileCache.clear();
  }
}
