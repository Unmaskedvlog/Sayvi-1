/**
 * Proximity Service Facade
 * 
 * Re-exports the Proximity Provider, Engine, Protocol, and Identity Resolver
 * to ensure 100% backward compatibility for existing components.
 */

export * from './proximityProtocol';
export * from './proximityProvider';
export * from './proximityEngine';
export * from './identityResolver';

import { Capacitor } from '@capacitor/core';
import { ProximityEngine } from './proximityEngine';
import {
  SimulatedProximityProvider,
  AndroidBleProximityProvider,
  ProximityProvider,
} from './proximityProvider';

// Determine if running inside native Android wrapper
export const isNativePlatform =
  typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

// Shared singleton instances
export const defaultProximityProvider: ProximityProvider = isNativePlatform
  ? new AndroidBleProximityProvider()
  : new SimulatedProximityProvider();

export const defaultProximityEngine = new ProximityEngine(defaultProximityProvider);

