import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SayviBrandLogo,
  OpenStatusToggleCard,
} from '../components/SayviComponents';
import { UserProfileComponent } from '../components/UserProfileComponent';
import {
  UserProfile,
  SayviWave,
  Connection,
  ChatMessage,
  PrivacySettings,
  ConnectionVibeType,
  CONNECTION_VIBES,
  PROXIMITIES,
  UserProfileEntity,
} from '../types';
import {
  Shield,
  MessageCircle,
  Users,
  MapPin,
  Lock,
  MoreVertical,
  Send,
  ArrowLeft,
  Settings,
  UserX,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Check,
  CheckCheck,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  XCircle,
  MessageSquare,
  Sparkle,
} from 'lucide-react';

/* -------------------------------------------------------------
 * HOME SCREEN
 * ------------------------------------------------------------- */
interface HomeScreenProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  blockedUserIds: Set<string>;
  incomingWaves: SayviWave[];
  onToggleOpen: () => void;
  onNavigateToNearby: () => void;
  onNavigateToConnections: () => void;
  onOpenIncomingWave: (wave: SayviWave) => void;
  onOpenSafetyGuide: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  allUsers,
  blockedUserIds,
  incomingWaves,
  onToggleOpen,
  onNavigateToNearby,
  onOpenIncomingWave,
  onOpenSafetyGuide,
}) => {
  const nearbyOpenUsers = allUsers.filter(
    (u) => u.id !== currentUser.id && u.isOpen && !blockedUserIds.has(u.id)
  );
  const openCount = nearbyOpenUsers.length;

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto p-4 animate-fadeIn">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <SayviBrandLogo showTagline={false} />

        <div className="flex items-center space-x-2 px-3 py-1 bg-linear-to-b from-white to-[#F5F5F4] border border-[#E7E5E4] rounded-full shadow-[0_1px_3px_rgba(28,25,23,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <span className="text-sm drop-shadow-xs">{currentUser.avatarEmoji}</span>
          <span className="text-xs font-bold text-[#3730A3]">
            {currentUser.firstName}
          </span>
          <span className={`w-2 h-2 rounded-full ${currentUser.isOpen ? 'bg-[#0D9488] shadow-[0_0_4px_#0D9488]' : 'bg-[#D6D3D1]'}`} />
        </div>
      </div>

      {/* Greeting */}
      <div className="pt-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
          Good afternoon 👋
        </h2>
        <p className="text-xs sm:text-sm text-[#78716C]">
          Ready to connect without the awkward first move?
        </p>
      </div>

      {/* Status Toggle Card */}
      <OpenStatusToggleCard
        isOpen={currentUser.isOpen}
        onToggle={onToggleOpen}
      />

      {/* Incoming wave banner */}
      {incomingWaves.length > 0 && (
        <div
          onClick={() => onOpenIncomingWave(incomingWaves[0])}
          className="p-3.5 bg-linear-to-b from-amber-50 to-[#FFFBEB] border border-amber-300 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition shadow-[0_3px_8px_rgba(217,119,6,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] active:translate-y-[0.5px]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8.5 h-8.5 rounded-full bg-linear-to-b from-amber-400 to-amber-500 text-white flex items-center justify-center text-base border border-amber-500 shadow-xs">
              👋
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-950">
                Someone nearby wants to say hi!
              </h4>
              <p className="text-[11px] text-amber-800">
                Tap to review teaser & say hi back
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-950 px-2.5 py-1 bg-white/80 rounded-lg border border-amber-200 shadow-2xs">Review →</span>
        </div>
      )}

      {/* Main Radar Discovery Card (Tactile radar dish) */}
      <div className="sayvi-card p-6 text-center space-y-4.5">
        {/* Recessed radar well */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-linear-to-b from-[#F5F5F4] to-[#E7E5E4] border border-[#D6D3D1] shadow-[inset_0_2px_5px_rgba(28,25,23,0.12),inset_0_-1px_0_rgba(255,255,255,0.8)]">
          {currentUser.isOpen && (
            <div className="absolute inset-2 rounded-full border border-[#3730A3]/25 animate-ping opacity-40" />
          )}
          <div className="w-16 h-16 rounded-full bg-linear-to-b from-white to-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-3xl shadow-[0_2px_6px_rgba(55,48,163,0.12),inset_0_1px_0_rgba(255,255,255,1)]">
            <span className="drop-shadow-xs">{currentUser.isOpen ? '👀' : '😴'}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#1C1917] tracking-tight">People nearby</h3>
          <p className="text-xs text-[#78716C] max-w-xs mx-auto leading-relaxed">
            {currentUser.isOpen
              ? `${openCount} ${
                  openCount === 1 ? 'person' : 'people'
                } nearby open to connecting right now.`
              : "Turn on 'I'm Open' above to discover and wave to people nearby."}
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToNearby}
          disabled={!currentUser.isOpen}
          className="w-full py-3.5 sayvi-btn-primary text-sm rounded-xl cursor-pointer"
        >
          👋 Explore Nearby & Wave
        </button>

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#78716C] font-medium pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3730A3]" />
          <span>Daily discreet waves remaining:</span>
          <strong className="text-[#1C1917] font-bold">{currentUser.dailyWavesRemaining}/5</strong>
        </div>
      </div>

      {/* Safety & Privacy Card */}
      <div
        onClick={onOpenSafetyGuide}
        className="p-3.5 bg-linear-to-b from-white to-[#FAFAF9] border border-[#E7E5E4] rounded-2xl flex items-center space-x-3 cursor-pointer hover:bg-white transition shadow-[0_1px_3px_rgba(28,25,23,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] active:translate-y-[0.5px]"
      >
        <div className="w-8.5 h-8.5 rounded-full bg-linear-to-b from-[#F5F5F4] to-[#E7E5E4] border border-[#D6D3D1] text-[#1C1917] flex items-center justify-center shrink-0 shadow-2xs">
          <Shield className="w-4 h-4 text-[#3730A3]" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-xs text-[#1C1917]">
            Safe & Privacy-First Architecture
          </h4>
          <p className="text-[11px] text-[#78716C]">
            No exact GPS • Mutual consent only • Tap for principles
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#78716C]" />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * NEARBY SCREEN
 * ------------------------------------------------------------- */
interface NearbyScreenProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  blockedUserIds: Set<string>;
  sentWaves: Record<string, SayviWave>;
  connections: Connection[];
  onSendSayvi: (target: UserProfile) => void;
  onOpenChat: (conn: Connection) => void;
  onBlockUser: (target: UserProfile) => void;
  onReportUser: (target: UserProfile) => void;
}

export const NearbyScreen: React.FC<NearbyScreenProps> = ({
  currentUser,
  allUsers,
  blockedUserIds,
  sentWaves,
  connections,
  onSendSayvi,
  onOpenChat,
  onBlockUser,
  onReportUser,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<ConnectionVibeType | 'ALL'>('ALL');

  const nearbyUsers = allUsers.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (!u.isOpen) return false;
    if (blockedUserIds.has(u.id)) return false;
    if (selectedVibe !== 'ALL' && u.vibe !== selectedVibe) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto">
      {/* Header with Vibe filters */}
      <div className="bg-white border-b border-[#E7E5E4] p-4 space-y-3 shadow-[0_1px_3px_rgba(28,25,23,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1C1917] tracking-tight">Nearby People</h2>
            <p className="text-xs text-[#78716C]">
              People open to saying hi in this area
            </p>
          </div>
          <span className="px-3 py-1 bg-linear-to-b from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] text-[#0F766E] font-bold text-xs rounded-xl shadow-2xs">
            🟢 {nearbyUsers.length} Open
          </span>
        </div>

        {/* Vibe Chips */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedVibe('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedVibe === 'ALL'
                ? 'sayvi-btn-primary'
                : 'sayvi-btn-secondary'
            }`}
          >
            All Vibes
          </button>
          {Object.values(CONNECTION_VIBES).map((vibe) => (
            <button
              key={vibe.id}
              type="button"
              onClick={() => setSelectedVibe(vibe.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedVibe === vibe.id
                  ? 'sayvi-btn-primary'
                  : 'sayvi-btn-secondary'
              }`}
            >
              {vibe.emoji} {vibe.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {!currentUser.isOpen ? (
          <div className="sayvi-card p-8 text-center space-y-3">
            <span className="text-3xl">🔴</span>
            <h3 className="font-bold text-[#1C1917] text-base">
              You are currently Not Open
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-xs mx-auto">
              To discover nearby people and let them wave to you, turn on '🟢 I'm Open' on the Home screen.
            </p>
          </div>
        ) : nearbyUsers.length === 0 ? (
          <div className="sayvi-card p-8 text-center space-y-3">
            <span className="text-3xl">📡</span>
            <h3 className="font-bold text-[#1C1917] text-base">
              No one open matching this vibe
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-xs mx-auto">
              Try selecting 'All Vibes' or check back in a moment.
            </p>
          </div>
        ) : (
          nearbyUsers.map((user) => {
            const sentWave = sentWaves[user.id];
            const conn = connections.find((c) => c.partnerUser.id === user.id);
            const proxInfo = PROXIMITIES[user.proximity] || PROXIMITIES['NEARBY'];
            const vibeInfo = CONNECTION_VIBES[user.vibe] || CONNECTION_VIBES['FRIENDSHIP'];
            const userInterests = user.interests || [];

            return (
              <div
                key={user.id}
                className="sayvi-card p-4.5 space-y-3"
              >
                {/* Header: Avatar, Name, Badges, Menu */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl overflow-hidden sayvi-avatar-raised"
                      style={{ backgroundColor: user.photoPath ? '#F5F5F4' : (user.avatarBgHex || '#6366F1') }}
                    >
                      {user.photoPath ? (
                        <img
                          src={user.photoPath}
                          alt={user.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.avatarEmoji || '👤'
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-[#1C1917]">
                          {user.firstName || 'User'}
                        </h4>
                        <span className="text-xs text-[#78716C] font-medium">
                          {user.age || 22}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 mt-1">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold border shadow-2xs"
                          style={{
                            backgroundColor: proxInfo.badgeBg,
                            color: proxInfo.badgeColor,
                            borderColor: proxInfo.badgeColor + '40',
                          }}
                        >
                          📍 {proxInfo.label}
                        </span>

                        <span className="px-2 py-0.5 bg-linear-to-b from-white to-[#EEF2FF] text-[#3730A3] border border-[#E0E7FF] rounded-md text-[11px] font-semibold shadow-2xs">
                          {vibeInfo.emoji} {vibeInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Options */}
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => onReportUser(user)}
                      title="Report User"
                      className="p-1.5 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bio (Recessed Quote Panel) */}
                <p className="text-xs text-[#44403C] italic sayvi-recessed p-2.5">
                  “{user.bio || 'Open to saying hi 👋'}”
                </p>

                {/* Interests (Tactile Pills) */}
                <div className="flex flex-wrap gap-1.5">
                  {userInterests.map((interest) => (
                    <span
                      key={interest}
                      className="sayvi-pill"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                {conn ? (
                  <button
                    type="button"
                    onClick={() => onOpenChat(conn)}
                    className="w-full py-2.5 sayvi-btn-accent text-xs rounded-xl cursor-pointer"
                  >
                    Connected 🎉 • Open Chat
                  </button>
                ) : sentWave?.status === 'PENDING' ? (
                  <div className="w-full py-2.5 bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] text-[#3730A3] font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1.5 shadow-[inset_0_1.5px_3px_rgba(55,48,163,0.08)]">
                    <span>👋 Wave Sent • Waiting for response</span>
                  </div>
                ) : sentWave?.status === 'DECLINED' ? (
                  <div className="w-full py-2.5 sayvi-recessed text-[#78716C] font-medium text-xs rounded-xl text-center">
                    Passed for now • Anti-spam protection active
                  </div>
                ) : sentWave?.status === 'MAYBE_LATER' ? (
                  <button
                    type="button"
                    onClick={() => onSendSayvi(user)}
                    disabled={currentUser.dailyWavesRemaining <= 0}
                    className="w-full py-2.5 bg-linear-to-b from-amber-50 to-amber-100 border border-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                  >
                    Maybe Later Selected • Wave Again 👋
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSendSayvi(user)}
                    disabled={currentUser.dailyWavesRemaining <= 0}
                    className="w-full py-2.5 sayvi-btn-primary text-xs rounded-xl cursor-pointer"
                  >
                    👋 SAYVI
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * CONNECTIONS SCREEN & WAVE HISTORY
 * ------------------------------------------------------------- */
interface ConnectionsScreenProps {
  connections: Connection[];
  sentWaves: SayviWave[];
  incomingWaves: SayviWave[];
  allProfilesMap: Record<string, UserProfile>;
  currentUserId: string;
  onOpenChat: (conn: Connection) => void;
  onNavigateToNearby: () => void;
  onAcceptWave?: (wave: SayviWave) => void;
  onDeclineWave?: (wave: SayviWave, decision: 'DECLINED' | 'MAYBE_LATER') => void;
}

interface WaveHistoryEntry {
  id: string;
  direction: 'SENT' | 'RECEIVED';
  partnerUser: UserProfile;
  wave: SayviWave;
  timestamp: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE_LATER';
  note: string;
}

type WaveStatusFilter = 'ALL' | 'ACCEPTED' | 'PENDING' | 'PASSED';
type WaveDirectionFilter = 'ALL' | 'SENT' | 'RECEIVED';

export const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({
  connections,
  sentWaves = [],
  incomingWaves = [],
  allProfilesMap = {},
  currentUserId,
  onOpenChat,
  onNavigateToNearby,
  onAcceptWave,
  onDeclineWave,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'CHATS' | 'HISTORY'>('CHATS');
  const [statusFilter, setStatusFilter] = useState<WaveStatusFilter>('ALL');
  const [directionFilter, setDirectionFilter] = useState<WaveDirectionFilter>('ALL');

  // Format relative time for wave history
  const formatWaveTime = (timestamp: number): string => {
    if (!timestamp) return 'Just now';
    const diff = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Compile full chronological wave history list
  const fullWaveHistory = useMemo<WaveHistoryEntry[]>(() => {
    const list: WaveHistoryEntry[] = [];
    const seenIds = new Set<string>();

    // Sent Waves (from me to target)
    sentWaves.forEach((w) => {
      const partner = allProfilesMap[w.toUserId] || {
        id: w.toUserId,
        firstName: 'User',
        age: 22,
        bio: '',
        interests: [],
        avatarEmoji: '👤',
        avatarBgHex: '#6366F1',
        isOpen: true,
        vibe: 'FRIENDSHIP',
        proximity: 'NEARBY',
        venueNote: '',
        dailyWavesRemaining: 5,
      };
      seenIds.add(w.id);
      list.push({
        id: `sent_${w.id}`,
        direction: 'SENT',
        partnerUser: partner,
        wave: w,
        timestamp: w.timestamp || Date.now(),
        status: w.status || 'PENDING',
        note: w.note || 'Wants to say hi 👋',
      });
    });

    // Received Waves (from sender to me)
    incomingWaves.forEach((w) => {
      const partner = allProfilesMap[w.fromUserId] || {
        id: w.fromUserId,
        firstName: 'Someone',
        age: 22,
        bio: '',
        interests: [],
        avatarEmoji: '👤',
        avatarBgHex: '#6366F1',
        isOpen: true,
        vibe: 'FRIENDSHIP',
        proximity: 'NEARBY',
        venueNote: '',
        dailyWavesRemaining: 5,
      };
      list.push({
        id: `recv_${w.id}`,
        direction: 'RECEIVED',
        partnerUser: partner,
        wave: w,
        timestamp: w.timestamp || Date.now(),
        status: w.status || 'PENDING',
        note: w.note || 'Wants to say hi 👋',
      });
    });

    // Sort chronologically: newest waves first
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [sentWaves, incomingWaves, allProfilesMap]);

  // Statistics counters
  const totalCount = fullWaveHistory.length;
  const acceptedCount = fullWaveHistory.filter((w) => w.status === 'ACCEPTED').length;
  const pendingCount = fullWaveHistory.filter((w) => w.status === 'PENDING').length;
  const passedCount = fullWaveHistory.filter(
    (w) => w.status === 'DECLINED' || w.status === 'MAYBE_LATER'
  ).length;
  const sentCount = fullWaveHistory.filter((w) => w.direction === 'SENT').length;
  const receivedCount = fullWaveHistory.filter((w) => w.direction === 'RECEIVED').length;

  // Filtered Wave History
  const filteredWaves = useMemo(() => {
    return fullWaveHistory.filter((item) => {
      // Status filter
      if (statusFilter === 'ACCEPTED' && item.status !== 'ACCEPTED') return false;
      if (statusFilter === 'PENDING' && item.status !== 'PENDING') return false;
      if (
        statusFilter === 'PASSED' &&
        item.status !== 'DECLINED' &&
        item.status !== 'MAYBE_LATER'
      )
        return false;

      // Direction filter
      if (directionFilter === 'SENT' && item.direction !== 'SENT') return false;
      if (directionFilter === 'RECEIVED' && item.direction !== 'RECEIVED') return false;

      return true;
    });
  }, [fullWaveHistory, statusFilter, directionFilter]);

  // Open chat from wave history
  const handleOpenChatFromWave = (partner: UserProfile) => {
    const existing = connections.find((c) => c.partnerUser.id === partner.id);
    if (existing) {
      onOpenChat(existing);
    } else {
      const p1 = currentUserId < partner.id ? currentUserId : partner.id;
      const p2 = currentUserId < partner.id ? partner.id : currentUserId;
      onOpenChat({
        id: `conn_${p1}_${p2}`,
        partnerUser: partner,
        connectedAt: Date.now(),
        lastMessage: 'You both said hi! 👋',
        lastMessageTime: 'Just now',
        unreadCount: 0,
      });
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto">
      {/* Header & Segmented Sub-Navigation */}
      <div className="bg-white border-b border-[#E7E5E4] p-4 space-y-3 shadow-[0_1px_3px_rgba(28,25,23,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1C1917] tracking-tight">Connections</h2>
            <p className="text-xs text-[#78716C]">
              Mutual chats & wave activity log
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 bg-linear-to-b from-white to-[#F5F5F4] text-[#44403C] rounded-full border border-[#E7E5E4] shadow-2xs">
            {connections.length} Chats · {totalCount} Waves
          </span>
        </div>

        {/* Tactile Segmented Control Bar */}
        <div className="grid grid-cols-2 p-1 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4] text-xs font-semibold shadow-[inset_0_1.5px_3px_rgba(28,25,23,0.08)]">
          <button
            type="button"
            onClick={() => setActiveSubTab('CHATS')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeSubTab === 'CHATS'
                ? 'bg-white text-[#1C1917] shadow-[0_2px_4px_rgba(28,25,23,0.08),inset_0_1px_0_rgba(255,255,255,1)] font-bold border border-[#E7E5E4]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mutual Chats</span>
            {connections.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#EEF2FF] text-[#3730A3] rounded-full text-[10px] font-bold border border-[#C7D2FE]">
                {connections.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('HISTORY')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              activeSubTab === 'HISTORY'
                ? 'bg-white text-[#1C1917] shadow-[0_2px_4px_rgba(28,25,23,0.08),inset_0_1px_0_rgba(255,255,255,1)] font-bold border border-[#E7E5E4]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Wave History</span>
            {totalCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#F5F5F4] text-[#44403C] rounded-full text-[10px] font-bold border border-[#E7E5E4]">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          SUBTAB 1: ACTIVE CHATS & MUTUAL MATCHES
          ======================================================== */}
      {activeSubTab === 'CHATS' && (
        <div className="px-4 space-y-2.5">
          {connections.length === 0 ? (
            <div className="sayvi-card p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] text-[#3730A3] flex items-center justify-center text-2xl mx-auto border border-[#C7D2FE] shadow-2xs">
                🤝
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">
                No active chats yet
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed max-w-xs mx-auto">
                Send a discreet SAYVI to people nearby. When they say hi back,
                they'll appear here and you can chat privately.
              </p>
              <button
                type="button"
                onClick={onNavigateToNearby}
                className="py-2.5 px-5 sayvi-btn-primary text-xs rounded-xl cursor-pointer"
              >
                Explore Nearby People 👋
              </button>
            </div>
          ) : (
            connections.map((conn) => (
              <div
                key={conn.id}
                onClick={() => onOpenChat(conn)}
                className="p-3.5 sayvi-card flex items-center space-x-3.5 cursor-pointer hover:translate-y-[-0.5px] transition"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg overflow-hidden sayvi-avatar-raised"
                  style={{
                    backgroundColor: conn.partnerUser.photoPath
                      ? '#F5F5F4'
                      : conn.partnerUser.avatarBgHex || '#6366F1',
                  }}
                >
                  {conn.partnerUser.photoPath ? (
                    <img
                      src={conn.partnerUser.photoPath}
                      alt={conn.partnerUser.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    conn.partnerUser.avatarEmoji || '👤'
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#1C1917] truncate">
                      {conn.partnerUser.firstName || 'User'}, {conn.partnerUser.age || 22}
                    </h4>
                    <span className="text-[11px] text-[#78716C] font-medium">
                      {conn.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] truncate mt-0.5">
                    {conn.lastMessage}
                  </p>
                </div>

                {conn.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#3730A3] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {conn.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: WAVE HISTORY (CHRONOLOGICAL LOG)
          ======================================================== */}
      {activeSubTab === 'HISTORY' && (
        <div className="px-4 space-y-3.5">
          {/* Tactile Summary Metric Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="sayvi-card p-2.5 text-center">
              <span className="text-[10px] text-[#78716C] font-semibold block">Total Waves</span>
              <span className="text-base font-extrabold text-[#1C1917]">{totalCount}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[#99F6E4] bg-linear-to-b from-[#F0FDFA] to-[#CCFBF1]/40 text-center shadow-[0_2px_4px_rgba(15,118,110,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <span className="text-[10px] text-[#0F766E] font-semibold block">Mutual</span>
              <span className="text-base font-extrabold text-[#0D9488]">{acceptedCount}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[#FDE68A] bg-linear-to-b from-[#FFFBEB] to-[#FEF3C7]/40 text-center shadow-[0_2px_4px_rgba(217,119,6,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <span className="text-[10px] text-[#B45309] font-semibold block">Pending</span>
              <span className="text-base font-extrabold text-[#D97706]">{pendingCount}</span>
            </div>
          </div>

          {/* Status Category Filter Bar */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'sayvi-btn-primary'
                    : 'sayvi-btn-secondary'
                }`}
              >
                All Waves ({totalCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('ACCEPTED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition cursor-pointer ${
                  statusFilter === 'ACCEPTED'
                    ? 'sayvi-btn-accent'
                    : 'sayvi-btn-secondary'
                }`}
              >
                Mutual / Accepted ({acceptedCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition cursor-pointer ${
                  statusFilter === 'PENDING'
                    ? 'bg-linear-to-b from-amber-500 to-amber-600 text-white shadow-xs border border-amber-600'
                    : 'sayvi-btn-secondary'
                }`}
              >
                Pending ({pendingCount})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('PASSED')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition cursor-pointer ${
                  statusFilter === 'PASSED'
                    ? 'bg-[#78716C] text-white shadow-xs border border-[#57534E]'
                    : 'sayvi-btn-secondary'
                }`}
              >
                Passed ({passedCount})
              </button>
            </div>

            {/* Direction Filter Bar */}
            <div className="flex items-center justify-between text-[11px] text-[#78716C] pt-1">
              <span className="font-medium">Filter by direction:</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setDirectionFilter('ALL')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    directionFilter === 'ALL'
                      ? 'bg-[#E7E5E4] text-[#1C1917] font-bold shadow-2xs'
                      : 'hover:text-[#1C1917]'
                  }`}
                >
                  All
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setDirectionFilter('SENT')}
                  className={`px-2 py-0.5 rounded-md flex items-center space-x-0.5 transition cursor-pointer ${
                    directionFilter === 'SENT'
                      ? 'bg-linear-to-b from-white to-[#EEF2FF] text-[#3730A3] font-bold border border-[#C7D2FE] shadow-2xs'
                      : 'hover:text-[#1C1917]'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Sent ({sentCount})</span>
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setDirectionFilter('RECEIVED')}
                  className={`px-2 py-0.5 rounded-md flex items-center space-x-0.5 transition cursor-pointer ${
                    directionFilter === 'RECEIVED'
                      ? 'bg-linear-to-b from-white to-[#F0FDFA] text-[#0F766E] font-bold border border-[#99F6E4] shadow-2xs'
                      : 'hover:text-[#1C1917]'
                  }`}
                >
                  <ArrowDownLeft className="w-3 h-3" />
                  <span>Received ({receivedCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chronological Waves Feed */}
          {filteredWaves.length === 0 ? (
            <div className="sayvi-card p-7 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-b from-[#F5F5F4] to-[#E7E5E4] text-[#78716C] flex items-center justify-center mx-auto text-xl border border-[#D6D3D1] shadow-2xs">
                🌊
              </div>
              <h4 className="font-bold text-sm text-[#1C1917]">
                No waves in this category
              </h4>
              <p className="text-xs text-[#78716C] max-w-xs mx-auto leading-relaxed">
                {statusFilter === 'ALL' && directionFilter === 'ALL'
                  ? "You haven't sent or received any SAYVI waves yet. Waves you send or receive will appear here chronologically."
                  : 'Try selecting a different status category or direction above.'}
              </p>
              <button
                type="button"
                onClick={onNavigateToNearby}
                className="py-2.5 px-4 sayvi-btn-primary text-xs rounded-xl cursor-pointer"
              >
                Send a Wave to Someone Nearby 👋
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredWaves.map((item) => {
                const partner = item.partnerUser;
                const isSentByMe = item.direction === 'SENT';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sayvi-card space-y-3"
                  >
                    {/* Top Row: Partner info & Direction/Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-base overflow-hidden sayvi-avatar-raised"
                          style={{
                            backgroundColor: partner.photoPath
                              ? '#F5F5F4'
                              : partner.avatarBgHex || '#6366F1',
                          }}
                        >
                          {partner.photoPath ? (
                            <img
                              src={partner.photoPath}
                              alt={partner.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            partner.avatarEmoji || '👤'
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-bold text-xs text-[#1C1917]">
                              {partner.firstName || 'User'}
                            </h4>
                            <span className="text-[11px] text-[#78716C]">
                              {partner.age || 22}
                            </span>
                          </div>

                          {/* Direction Indicator Tag */}
                          {isSentByMe ? (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-linear-to-b from-white to-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE] shadow-2xs mt-0.5">
                              <ArrowUpRight className="w-2.5 h-2.5" />
                              <span>Sent by you</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-linear-to-b from-white to-[#F0FDFA] text-[#0F766E] border border-[#99F6E4] shadow-2xs mt-0.5">
                              <ArrowDownLeft className="w-2.5 h-2.5" />
                              <span>Received wave</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-[11px] text-[#78716C]">
                        <Clock className="w-3 h-3 text-[#A8A29E]" />
                        <span>{formatWaveTime(item.timestamp)}</span>
                      </div>
                    </div>

                    {/* Note message (Recessed Quote) */}
                    <div className="sayvi-recessed px-3 py-1.5 text-xs text-[#44403C] italic flex items-center justify-between">
                      <span>“{item.note}”</span>
                      {partner.venueNote && (
                        <span className="text-[10px] not-italic text-[#78716C] bg-white px-1.5 py-0.5 rounded border border-[#E7E5E4] shadow-2xs">
                          📍 {partner.venueNote}
                        </span>
                      )}
                    </div>

                    {/* Status & Action Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#F5F5F4]">
                      {/* Status Badges */}
                      {item.status === 'ACCEPTED' && (
                        <div className="flex items-center space-x-1 text-[#0D9488]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span className="text-xs font-bold">Mutual Connection 👋</span>
                        </div>
                      )}

                      {item.status === 'PENDING' && isSentByMe && (
                        <div className="flex items-center space-x-1 text-[#D97706]">
                          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                          <span className="text-xs font-medium">
                            Awaiting {partner.firstName}'s reply
                          </span>
                        </div>
                      )}

                      {item.status === 'PENDING' && !isSentByMe && (
                        <div className="flex items-center space-x-1 text-[#3730A3]">
                          <Sparkles className="w-3.5 h-3.5 text-[#3730A3]" />
                          <span className="text-xs font-bold">Wants to connect!</span>
                        </div>
                      )}

                      {item.status === 'MAYBE_LATER' && (
                        <div className="flex items-center space-x-1 text-[#78716C]">
                          <Clock className="w-3.5 h-3.5 text-[#78716C]" />
                          <span className="text-xs font-medium">Saved for later</span>
                        </div>
                      )}

                      {item.status === 'DECLINED' && (
                        <div className="flex items-center space-x-1 text-[#78716C]">
                          <XCircle className="w-3.5 h-3.5 text-[#78716C]" />
                          <span className="text-xs font-medium">Passed</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div>
                        {item.status === 'ACCEPTED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenChatFromWave(partner)}
                            className="px-3 py-1.5 sayvi-btn-primary rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Open Chat</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.status === 'PENDING' && !isSentByMe && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onAcceptWave?.(item.wave)}
                              className="px-3 py-1.5 sayvi-btn-accent rounded-xl text-xs cursor-pointer"
                            >
                              Say Hi Back 👋
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeclineWave?.(item.wave, 'MAYBE_LATER')}
                              className="px-2.5 py-1.5 sayvi-btn-secondary rounded-xl text-xs cursor-pointer"
                            >
                              Later
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * CHAT SCREEN
 * ------------------------------------------------------------- */
interface ChatScreenProps {
  connection: Connection;
  messages: ChatMessage[];
  isPartnerTyping?: boolean;
  onSendMessage: (text: string) => void;
  onBack: () => void;
  onBlockUser: () => void;
  onReportUser: () => void;
  onShowSafetyTips: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  connection,
  messages,
  isPartnerTyping = false,
  onSendMessage,
  onBack,
  onBlockUser,
  onReportUser,
  onShowSafetyTips,
}) => {
  const [inputText, setInputText] = useState('');
  const partner = connection.partnerUser;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const icebreakers = [
    `👋 Hey ${partner.firstName}!`,
    '☕ What are you working on?',
    '🎵 Love that you enjoy music too',
    '✨ Are you nearby right now?',
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between max-w-md mx-auto animate-fadeIn">
      {/* Top App Bar */}
      <div className="bg-white border-b border-[#E7E5E4] p-3 flex items-center justify-between sticky top-0 z-10 shadow-[0_1px_3px_rgba(28,25,23,0.05)]">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg cursor-pointer transition active:translate-y-[0.5px]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base overflow-hidden sayvi-avatar-raised"
            style={{
              backgroundColor: partner.photoPath
                ? '#F5F5F4'
                : partner.avatarBgHex,
            }}
          >
            {partner.photoPath ? (
              <img
                src={partner.photoPath}
                alt={partner.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              partner.avatarEmoji
            )}
          </div>

          <div>
            <h4 className="font-bold text-xs text-[#1C1917] leading-tight">
              {partner.firstName}
            </h4>
            <span className="text-[11px] text-[#0D9488] font-semibold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mr-1 shadow-[0_0_3px_#0D9488]" />
              {isPartnerTyping ? (
                <span className="text-[#3730A3] font-semibold animate-pulse">Typing...</span>
              ) : (
                'Mutual Connection'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={onShowSafetyTips}
            className="p-2 text-[#3730A3] hover:bg-[#EEF2FF] rounded-lg cursor-pointer transition"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onBlockUser}
            className="p-2 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
          >
            <UserX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mutual Consent Info Banner */}
      <div className="bg-linear-to-b from-[#F0FDFA] to-[#CCFBF1] border-b border-[#99F6E4] py-1.5 px-4 text-center flex items-center justify-center space-x-1.5 text-[11px] text-[#0F766E] font-semibold shadow-2xs">
        <Lock className="w-3 h-3" />
        <span>Discreet Direct Chat • Mutual consent active</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Connection card */}
        <div className="p-3.5 sayvi-card text-center space-y-1">
          <p className="text-xs font-bold text-[#1C1917]">
            🎉 You both said hi to each other!
          </p>
          <p className="text-[11px] text-[#78716C]">
            {partner.firstName || 'Partner'}'s Interests: {(partner.interests || []).join(' ') || 'Social proximity'}
          </p>
        </div>

        {messages.map((msg) => {
          const isMe = msg.isMe;
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isMe ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-linear-to-b from-[#4338CA] to-[#3730A3] text-white rounded-br-xs shadow-[0_2px_5px_rgba(55,48,163,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#312E81]'
                    : 'bg-linear-to-b from-white to-[#FAFAF9] text-[#1C1917] rounded-bl-xs border border-[#E7E5E4] shadow-[0_2px_4px_rgba(28,25,23,0.06),inset_0_1px_0_rgba(255,255,255,1)]'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-[#78716C] mt-1 px-1">
                <span>{time}</span>
                {isMe && (
                  msg.isRead ? (
                    <span className="flex items-center space-x-0.5 text-[#0D9488] font-bold" title="Read by partner">
                      <CheckCheck className="w-3 h-3 text-[#0D9488]" />
                      <span>Read</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-0.5 text-[#A8A29E]" title="Sent">
                      <Check className="w-3 h-3 text-[#A8A29E]" />
                      <span>Sent</span>
                    </span>
                  )
                )}
              </div>
            </div>
          );
        })}

        {/* Subtle Typing Indicator */}
        {isPartnerTyping && (
          <div className="flex flex-col items-start pt-1 transition-opacity duration-300">
            <div className="flex items-end space-x-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs overflow-hidden sayvi-avatar-raised shrink-0 mb-1"
                style={{
                  backgroundColor: partner.photoPath ? '#F5F5F4' : partner.avatarBgHex,
                }}
              >
                {partner.photoPath ? (
                  <img
                    src={partner.photoPath}
                    alt={partner.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  partner.avatarEmoji
                )}
              </div>

              <div className="bg-white text-[#78716C] rounded-2xl rounded-bl-xs border border-[#E7E5E4] px-3.5 py-2.5 shadow-2xs flex items-center space-x-2">
                <span className="text-[11px] text-[#78716C] font-normal tracking-tight">
                  {partner.firstName} is typing
                </span>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78716C] animate-bounce [animation-delay:-0.32s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78716C] animate-bounce [animation-delay:-0.16s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78716C] animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Bar with Icebreakers & Input */}
      <div className="bg-white border-t border-[#E7E5E4] p-3 space-y-2 sticky bottom-0 shadow-[0_-2px_6px_rgba(28,25,23,0.04)]">
        {/* Icebreakers */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {icebreakers.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(prompt)}
              className="px-2.5 py-1 bg-linear-to-b from-white to-[#EEF2FF] hover:from-[#EEF2FF] hover:to-[#E0E7FF] text-[#3730A3] rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition border border-[#C7D2FE] shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a discreet message..."
            className="flex-1 px-3.5 py-2.5 sayvi-input text-[#1C1917] placeholder-[#78716C] text-xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl sayvi-btn-primary disabled:opacity-40 flex items-center justify-center cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * PROFILE SCREEN
 * ------------------------------------------------------------- */
interface ProfileScreenProps {
  currentUser: UserProfile;
  savedEntity: UserProfileEntity | null;
  onToggleOpen: () => void;
  onSaveToRoom: (displayName: string, bio: string, photoPath: string | null, age: number) => void;
  onPhotoUpdated: (photoPath: string | null) => void;
  onOpenPrivacy: () => void;
  onOpenSafetyGuide: () => void;
  onOpenBlockedUsers: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  savedEntity,
  onToggleOpen,
  onSaveToRoom,
  onPhotoUpdated,
  onOpenPrivacy,
  onOpenSafetyGuide,
  onOpenBlockedUsers,
  onLogout,
}) => {
  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto p-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1C1917] tracking-tight">My Profile</h2>
      </div>

      {/* Open Status Toggle */}
      <OpenStatusToggleCard
        isOpen={currentUser.isOpen}
        onToggle={onToggleOpen}
      />

      {/* Main User Profile Editor Component with Camera and Room persistence */}
      <UserProfileComponent
        user={currentUser}
        savedEntity={savedEntity}
        onSaveToRoom={onSaveToRoom}
        onPhotoUpdated={onPhotoUpdated}
      />

      {/* Settings Options */}
      <div className="sayvi-card p-2 space-y-1">
        <button
          type="button"
          onClick={onOpenPrivacy}
          className="w-full p-3 flex items-center justify-between hover:bg-[#F5F5F4] rounded-xl transition cursor-pointer text-left active:translate-y-[0.5px]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-b from-[#F5F5F4] to-[#E7E5E4] border border-[#D6D3D1] text-[#1C1917] flex items-center justify-center shadow-2xs">
              <Lock className="w-4 h-4 text-[#3730A3]" />
            </div>
            <span className="text-xs font-semibold text-[#1C1917]">
              Privacy & Proximity Settings
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#78716C]" />
        </button>

        <button
          type="button"
          onClick={onOpenSafetyGuide}
          className="w-full p-3 flex items-center justify-between hover:bg-[#F5F5F4] rounded-xl transition cursor-pointer text-left active:translate-y-[0.5px]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-b from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center shadow-2xs">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#1C1917]">
              Safe Community Guidelines
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#78716C]" />
        </button>

        <button
          type="button"
          onClick={onOpenBlockedUsers}
          className="w-full p-3 flex items-center justify-between hover:bg-[#F5F5F4] rounded-xl transition cursor-pointer text-left active:translate-y-[0.5px]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-b from-rose-50 to-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
              <UserX className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#1C1917]">
              Blocked Users List
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#78716C]" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full p-3 flex items-center justify-between hover:bg-rose-50/70 rounded-xl transition cursor-pointer text-left text-rose-600 active:translate-y-[0.5px]"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">Log Out</span>
          </div>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * PRIVACY SETTINGS SCREEN
 * ------------------------------------------------------------- */
interface PrivacySettingsScreenProps {
  settings: PrivacySettings;
  onUpdate: (newSettings: PrivacySettings) => void;
  onBack: () => void;
  onOpenDiagnostics?: () => void;
}

export const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({
  settings,
  onUpdate,
  onBack,
  onOpenDiagnostics,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] max-w-md mx-auto p-4 space-y-4 animate-fadeIn">
      <div className="flex items-center space-x-3 sayvi-card p-3.5">
        <button
          type="button"
          onClick={onBack}
          className="p-1 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-[#1C1917]">Privacy Settings</h2>
      </div>

      <div className="sayvi-card p-5 space-y-4">
        {/* Ghost mode */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-[#1C1917]">Ghost Mode</h4>
            <p className="text-[11px] text-[#78716C]">
              Browse nearby without appearing in their open list
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.ghostMode}
            onChange={(e) =>
              onUpdate({ ...settings, ghostMode: e.target.checked })
            }
            className="w-4 h-4 accent-[#3730A3] rounded cursor-pointer"
          />
        </div>

        <div className="border-t border-[#E7E5E4]" />

        {/* Approximate distance only */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-[#1C1917]">
              Approximate Distance Only
            </h4>
            <p className="text-[11px] text-[#78716C]">
              Show tags like 'Nearby' rather than exact distance
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.approximateDistanceOnly}
            onChange={(e) =>
              onUpdate({
                ...settings,
                approximateDistanceOnly: e.target.checked,
              })
            }
            className="w-4 h-4 accent-[#3730A3] rounded cursor-pointer"
          />
        </div>

        <div className="border-t border-[#E7E5E4]" />

        {/* In-app banners only */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-[#1C1917]">
              In-App Discreet Banners
            </h4>
            <p className="text-[11px] text-[#78716C]">
              Only notify of waves when actively using the app
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.inAppBannersOnly}
            onChange={(e) =>
              onUpdate({ ...settings, inAppBannersOnly: e.target.checked })
            }
            className="w-4 h-4 accent-[#3730A3] rounded cursor-pointer"
          />
        </div>
      </div>

      {onOpenDiagnostics && (
        <div className="bg-linear-to-b from-[#292524] to-[#1C1917] text-[#FAFAF9] rounded-2xl p-4 border border-[#44403C] shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-[#EEF2FF]">
                🛠️ Hardware & BLE Diagnostics
              </h4>
              <p className="text-[10px] text-[#A8A29E]">
                View internal RSSI, scanning telemetry & temporary IDs
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDiagnostics}
              className="px-3 py-1.5 sayvi-btn-primary text-xs font-mono"
            >
              Open &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * BLOCKED USERS SCREEN
 * ------------------------------------------------------------- */
interface BlockedUsersScreenProps {
  blockedIds: Set<string>;
  allUsers: UserProfile[];
  onUnblock: (userId: string) => void;
  onBack: () => void;
}

export const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({
  blockedIds,
  allUsers,
  onUnblock,
  onBack,
}) => {
  const blockedUsers = allUsers.filter((u) => blockedIds.has(u.id));

  return (
    <div className="min-h-screen bg-[#FAFAF9] max-w-md mx-auto p-4 space-y-4 animate-fadeIn">
      <div className="flex items-center space-x-3 sayvi-card p-3.5">
        <button
          type="button"
          onClick={onBack}
          className="p-1 text-[#78716C] hover:bg-[#F5F5F4] rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-[#1C1917]">Blocked Users</h2>
      </div>

      <div className="sayvi-card p-5 space-y-3">
        {blockedUsers.length === 0 ? (
          <p className="text-xs text-[#78716C] text-center py-6">
            You haven't blocked any users.
          </p>
        ) : (
          blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2.5 sayvi-recessed rounded-xl"
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-lg">{user.avatarEmoji}</span>
                <span className="text-xs font-bold text-[#1C1917]">
                  {user.firstName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUnblock(user.id)}
                className="px-3 py-1 sayvi-btn-secondary text-xs cursor-pointer"
              >
                Unblock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
