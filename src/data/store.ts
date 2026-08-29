import {
  UserProfile,
  SayviWave,
  ChatMessage,
  PrivacySettings,
  UserProfileEntity,
  ConnectionVibeType,
  ProximityType,
} from '../types';
import {
  INITIAL_ALL_USERS,
  USER_ALEX,
  USER_JORDAN,
} from './sampleData';

export interface StoredConnectionRecord {
  id: string;
  user1Id: string;
  user2Id: string;
  connectedAt: number;
  lastMessage: string;
  lastMessageTime: string;
}

export interface SayviStoreState {
  users: UserProfile[];
  waves: SayviWave[];
  connections: StoredConnectionRecord[];
  messages: ChatMessage[];
  blockedMap: Record<string, string[]>; // userId -> blocked userIds
  currentUserId: string;
  privacySettingsMap: Record<string, PrivacySettings>;
}

const STORAGE_KEY = 'sayvi_multiuser_store_v2';

const DEFAULT_PRIVACY: PrivacySettings = {
  ghostMode: false,
  approximateDistanceOnly: true,
  allowWavesFrom: 'EVERYONE_OPEN',
  inAppBannersOnly: false,
  pauseAllNotifications: false,
};

export const getInitialStoreState = (): SayviStoreState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.waves)) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved state, resetting to defaults', e);
    }
  }

  // Initial fresh demo setup with Alex and Jordan both Open and no pre-existing fake match
  return {
    users: INITIAL_ALL_USERS.map((u) => ({
      ...u,
      isOpen: true,
      dailyWavesRemaining: 5,
    })),
    waves: [],
    connections: [],
    messages: [],
    blockedMap: {
      user_alex: [],
      user_jordan: [],
    },
    currentUserId: 'user_alex',
    privacySettingsMap: {
      user_alex: { ...DEFAULT_PRIVACY },
      user_jordan: { ...DEFAULT_PRIVACY },
    },
  };
};

export const saveStoreState = (state: SayviStoreState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save store state to localStorage', e);
  }
};

export const resetStoreToDefault = (): SayviStoreState => {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = getInitialStoreState();
  saveStoreState(fresh);
  return fresh;
};
