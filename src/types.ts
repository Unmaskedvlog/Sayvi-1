export type ProximityType = 'VERY_CLOSE' | 'NEARBY' | 'IN_THE_AREA';

export interface ProximityInfo {
  label: string;
  badgeColor: string;
  badgeBg: string;
}

export const PROXIMITIES: Record<ProximityType, ProximityInfo> = {
  VERY_CLOSE: {
    label: 'Very close',
    badgeColor: '#0D9488',
    badgeBg: '#F0FDFA',
  },
  NEARBY: {
    label: 'Nearby',
    badgeColor: '#3730A3',
    badgeBg: '#EEF2FF',
  },
  IN_THE_AREA: {
    label: 'In the area',
    badgeColor: '#78716C',
    badgeBg: '#F5F5F4',
  },
};

export type ConnectionVibeType =
  | 'FRIENDSHIP'
  | 'DATING'
  | 'NETWORKING'
  | 'COFFEE_STUDY'
  | 'CASUAL_CHAT';

export interface ConnectionVibeInfo {
  id: ConnectionVibeType;
  label: string;
  emoji: string;
}

export const CONNECTION_VIBES: Record<ConnectionVibeType, ConnectionVibeInfo> = {
  FRIENDSHIP: { id: 'FRIENDSHIP', label: 'Make Friends', emoji: '🤝' },
  DATING: { id: 'DATING', label: 'Dating', emoji: '✨' },
  NETWORKING: { id: 'NETWORKING', label: 'Networking', emoji: '💼' },
  COFFEE_STUDY: { id: 'COFFEE_STUDY', label: 'Coffee & Study', emoji: '☕' },
  CASUAL_CHAT: { id: 'CASUAL_CHAT', label: 'Casual Chat', emoji: '💬' },
};

export interface UserProfile {
  id: string;
  firstName: string;
  age: number;
  bio: string;
  avatarEmoji: string;
  avatarBgHex: string;
  interests: string[];
  photoPath?: string | null;
  isOpen: boolean;
  vibe: ConnectionVibeType;
  proximity: ProximityType;
  venueNote: string;
  dailyWavesRemaining: number;
}

export type WaveStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE_LATER';

export interface SayviWave {
  id: string;
  fromUserId: string;
  toUserId: string;
  timestamp: number;
  status: WaveStatus;
  note: string;
}

export interface Connection {
  id: string;
  partnerUser: UserProfile;
  connectedAt: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  timestamp: number;
  isMe: boolean;
  isRead?: boolean;
}

export type ReportCategory =
  | 'SPAM_OR_BOT'
  | 'HARASSMENT'
  | 'UNCOMFORTABLE'
  | 'IMPERSONATION'
  | 'OTHER';

export interface ReportCategoryInfo {
  id: ReportCategory;
  title: string;
}

export const REPORT_CATEGORIES: ReportCategoryInfo[] = [
  { id: 'SPAM_OR_BOT', title: 'Spam or Advertising' },
  { id: 'HARASSMENT', title: 'Harassment or Inappropriate Behavior' },
  { id: 'UNCOMFORTABLE', title: 'Made me feel uncomfortable' },
  { id: 'IMPERSONATION', title: 'Fake account or Impersonation' },
  { id: 'OTHER', title: 'Other Safety Concern' },
];

export interface PrivacySettings {
  ghostMode: boolean;
  approximateDistanceOnly: boolean;
  allowWavesFrom: string;
  inAppBannersOnly: boolean;
  pauseAllNotifications: boolean;
}

export interface UserProfileEntity {
  id: string;
  displayName: string;
  bio: string;
  photoPath: string | null;
  avatarEmoji: string;
  avatarBgHex: string;
  age: number;
  interestsCsv: string;
  isOpen: boolean;
  updatedAt: number;
}

/* -------------------------------------------------------------
 * BLE & PROXIMITY ARCHITECTURE TYPES
 * ------------------------------------------------------------- */
export type EstimatedProximity =
  | 'VERY_CLOSE'
  | 'NEARBY'
  | 'IN_THE_AREA'
  | 'UNKNOWN';

export type ProximitySource = 'SIMULATED' | 'BLE' | 'HYBRID';

export interface NearbyDevice {
  temporaryId: string;
  detectedAt: number;
  lastSeenAt: number;
  estimatedProximity: EstimatedProximity;
  confidence: number; // Range: 0.0 to 1.0
  source: ProximitySource;
  protocolVersion: number;
  rawRssi?: number;
  smoothedRssi?: number;
}

export interface TemporaryProximityIdentity {
  temporaryId: string;
  createdAt: number;
  expiresAt: number;
  protocolVersion: number;
}

export type ProximityStatus =
  | 'STOPPED'
  | 'STARTING'
  | 'RUNNING'
  | 'PERMISSIONS_DENIED'
  | 'BLUETOOTH_DISABLED'
  | 'UNSUPPORTED'
  | 'ERROR';

export interface ProximityDiagnostics {
  providerType: 'SIMULATED' | 'BLE';
  status: ProximityStatus;
  isAdvertising: boolean;
  isScanning: boolean;
  detectedCount: number;
  lastDetectionTime: number | null;
  bluetoothAvailable: boolean;
  permissionGranted: boolean;
  devices: NearbyDevice[];
  currentTemporaryId?: string;
  protocolVersion: number;
}

export interface NativeProximityBridge {
  initialize(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  startAdvertising(payloadHex: string): Promise<boolean>;
  stopAdvertising(): Promise<boolean>;
  startScanning(): Promise<boolean>;
  stopScanning(): Promise<boolean>;
  getBluetoothState(): Promise<'POWERED_ON' | 'POWERED_OFF' | 'UNAUTHORIZED' | 'UNSUPPORTED'>;
  onDeviceDetected?: (device: { temporaryId: string; rssi: number; timestamp: number }) => void;
  onDeviceLost?: (temporaryId: string) => void;
}

