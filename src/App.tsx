import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { auth, validateFirestoreConnection } from './services/firebase';
import { SayviService } from './services/sayviService';
import {
  UserProfile,
  SayviWave,
  Connection,
  ChatMessage,
  PrivacySettings,
  UserProfileEntity,
  ReportCategory,
  WaveStatus,
} from './types';
import {
  INITIAL_ALL_USERS,
  USER_ALEX,
  USER_JORDAN,
} from './data/sampleData';
import {
  SplashScreen,
  WelcomeScreen,
  SignUpScreen,
  CreateProfileScreen,
} from './screens/AuthScreens';
import {
  HomeScreen,
  NearbyScreen,
  ConnectionsScreen,
  ChatScreen,
  ProfileScreen,
  PrivacySettingsScreen,
  BlockedUsersScreen,
} from './screens/MainScreens';
import {
  IncomingWaveModal,
  SayviSentModal,
  MutualMatchModal,
  BlockModal,
  ReportModal,
  SafetyModal,
  PrototypeSimulatorBar,
} from './components/SayviComponents';
import {
  Home,
  Compass,
  MessageSquare,
  User as UserIcon,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

import { ProximityDiagnosticsScreen } from './screens/ProximityDiagnosticsScreen';
import {
  defaultProximityEngine,
  defaultProximityProvider,
  SimulatedProximityProvider,
  NearbyDiscoveredUser,
} from './services/proximity';

type AppNavScreen = 'AUTH' | 'MAIN';
type AuthStep = 'SPLASH' | 'WELCOME' | 'SIGN_UP' | 'CREATE_PROFILE';
type BottomTab = 'HOME' | 'NEARBY' | 'CONNECTIONS' | 'PROFILE';
type SubScreen = 'NONE' | 'CHAT' | 'PRIVACY' | 'BLOCKED_USERS' | 'DIAGNOSTICS';

// Proximity Provider Singleton Instance (Preserved for compatibility)
const proximityScanner = defaultProximityProvider;

export function App() {
  // Navigation State
  const [navScreen, setNavScreen] = useState<AppNavScreen>('MAIN');
  const [authStep, setAuthStep] = useState<AuthStep>('SPLASH');
  const [activeTab, setActiveTab] = useState<BottomTab>('HOME');
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen>('NONE');

  // Firebase Auth State
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isConnectedToFirebase, setIsConnectedToFirebase] = useState<boolean>(true);

  // Helper to load device-specific persona
  const getInitialDeviceUser = (): UserProfile => {
    try {
      const savedId = localStorage.getItem('sayvi_active_device_user_id');
      if (savedId === 'user_jordan') {
        return { ...USER_JORDAN, id: 'user_jordan', isOpen: true, dailyWavesRemaining: 5 };
      }
      if (savedId && savedId !== 'user_alex') {
        const found = INITIAL_ALL_USERS.find((u) => u.id === savedId);
        if (found) return { ...found, isOpen: true, dailyWavesRemaining: 5 };
      }
    } catch {
      // fallback
    }
    return { ...USER_ALEX, id: 'user_alex', isOpen: true, dailyWavesRemaining: 5 };
  };

  // Active User Data in Firestore
  const [currentUser, setCurrentUser] = useState<UserProfile>(getInitialDeviceUser);

  // Firestore Real-Time Data Collections
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(INITIAL_ALL_USERS);
  const [incomingWaves, setIncomingWaves] = useState<SayviWave[]>([]);
  const [allIncomingWavesList, setAllIncomingWavesList] = useState<SayviWave[]>([]);
  const [sentWavesList, setSentWavesList] = useState<SayviWave[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active chat connection
  const [activeChatConnId, setActiveChatConnId] = useState<string | null>(null);

  // Modals & Overlays
  const [reviewingIncomingWave, setReviewingIncomingWave] = useState<SayviWave | null>(null);
  const [sentModalTarget, setSentModalTarget] = useState<UserProfile | null>(null);
  const [celebrationPartner, setCelebrationPartner] = useState<UserProfile | null>(null);
  const [blockModalTarget, setBlockModalTarget] = useState<UserProfile | null>(null);
  const [reportModalTarget, setReportModalTarget] = useState<UserProfile | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Track known connections for mutual celebration detection
  const knownConnectionsCountRef = React.useRef<number>(0);

  // Privacy Settings (Local Client State)
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    ghostMode: false,
    approximateDistanceOnly: true,
    allowWavesFrom: 'EVERYONE_OPEN',
    inAppBannersOnly: false,
    pauseAllNotifications: false,
  });

  const currentUserId = currentUser.id;

  // Initialize and check Firestore connectivity
  useEffect(() => {
    validateFirestoreConnection().then((connected) => {
      setIsConnectedToFirebase(connected);
    });
  }, []);

  // Monitor Firebase Auth state & auto sign in anonymously if unauthenticated
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAuthUid(firebaseUser.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.warn('Anonymous sign-in on start:', e);
        }
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Seed sample users to Firestore if they don't exist yet
  const ensureSeededUsersInFirestore = useCallback(async () => {
    try {
      for (const u of INITIAL_ALL_USERS) {
        const existing = await SayviService.getUserProfile(u.id);
        if (!existing) {
          await SayviService.saveUserProfile({
            ...u,
            isOpen: true,
            dailyWavesRemaining: 5,
          });
        }
      }
    } catch (e) {
      console.warn('Seeding check:', e);
    }
  }, []);

  useEffect(() => {
    ensureSeededUsersInFirestore();
  }, [ensureSeededUsersInFirestore]);

  // Subscribe to Current User Profile from Firestore
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = SayviService.subscribeToUserProfile(
      currentUserId,
      (profile) => {
        if (profile) {
          setCurrentUser(profile);
        }
      }
    );
    return () => unsub();
  }, [currentUserId]);

  // Subscribe to all profiles from Firestore
  useEffect(() => {
    const unsub = SayviService.subscribeToAllProfiles((profiles) => {
      if (profiles.length > 0) {
        // Merge with sample users to ensure complete community
        const map = new Map<string, UserProfile>();
        INITIAL_ALL_USERS.forEach((u) => map.set(u.id, u));
        profiles.forEach((p) => map.set(p.id, p));
        const merged = Array.from(map.values());
        setAllProfiles(merged);
        if ('setAdditionalUsers' in proximityScanner && typeof (proximityScanner as unknown as { setAdditionalUsers: (users: UserProfile[]) => void }).setAdditionalUsers === 'function') {
          (proximityScanner as unknown as { setAdditionalUsers: (users: UserProfile[]) => void }).setAdditionalUsers(merged);
        }
      }
    });
    return () => unsub();
  }, []);

  // Map of all profiles by ID
  const allProfilesMap = useMemo(() => {
    const map: Record<string, UserProfile> = {};
    allProfiles.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [allProfiles]);

  // Subscribe to Blocked Users from Firestore
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = SayviService.subscribeToBlockedUsers(currentUserId, (ids) => {
      setBlockedIds(ids);
    });
    return () => unsub();
  }, [currentUserId]);

  const blockedUserIdsSet = useMemo(() => new Set(blockedIds), [blockedIds]);

  // Sync Proximity Engine with current state
  useEffect(() => {
    defaultProximityEngine.setAllProfiles(allProfiles);
  }, [allProfiles]);

  useEffect(() => {
    if (currentUserId) {
      defaultProximityEngine.start(currentUserId);
    }
    return () => {
      defaultProximityEngine.stop();
    };
  }, [currentUserId]);

  useEffect(() => {
    defaultProximityEngine.updateContext(
      currentUser,
      privacySettings,
      blockedUserIdsSet
    );
  }, [currentUser, privacySettings, blockedUserIdsSet]);

  // Subscribe to Incoming Waves from Firestore
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = SayviService.subscribeToIncomingWaves(currentUserId, (waves) => {
      setAllIncomingWavesList(waves);
      const pending = waves.filter(
        (w) => w.status === 'PENDING' && !blockedUserIdsSet.has(w.fromUserId)
      );
      setIncomingWaves(pending);
    });
    return () => unsub();
  }, [currentUserId, blockedUserIdsSet]);

  // Subscribe to Sent Waves from Firestore
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = SayviService.subscribeToSentWaves(currentUserId, (waves) => {
      setSentWavesList(waves);
    });
    return () => unsub();
  }, [currentUserId]);

  const sentWavesMap = useMemo(() => {
    const map: Record<string, SayviWave> = {};
    sentWavesList.forEach((w) => {
      map[w.toUserId] = w;
    });
    return map;
  }, [sentWavesList]);

  // Stable refs for background checks
  const allProfilesMapRef = React.useRef<Record<string, UserProfile>>(allProfilesMap);
  allProfilesMapRef.current = allProfilesMap;
  const blockedUserIdsSetRef = React.useRef<Set<string>>(blockedUserIdsSet);
  blockedUserIdsSetRef.current = blockedUserIdsSet;
  const activeSubScreenRef = React.useRef<SubScreen>(activeSubScreen);
  activeSubScreenRef.current = activeSubScreen;

  // Subscribe to Connections from Firestore & trigger celebration when a connection is formed
  useEffect(() => {
    if (!currentUserId) return;
    const unsub = SayviService.subscribeToConnections(
      currentUserId,
      allProfilesMapRef.current,
      (conns) => {
        const filtered = conns.filter(
          (c) => !blockedUserIdsSetRef.current.has(c.partnerUser.id)
        );
        // If a new connection just arrived and user isn't in chat, show celebration popup!
        if (
          filtered.length > knownConnectionsCountRef.current &&
          knownConnectionsCountRef.current > 0
        ) {
          const newest = filtered[0];
          if (newest && activeSubScreenRef.current !== 'CHAT') {
            setCelebrationPartner(newest.partnerUser);
          }
        }
        knownConnectionsCountRef.current = filtered.length;
        setConnections(filtered);
      }
    );
    return () => unsub();
  }, [currentUserId]);

  // Subscribe to Messages for active chat from Firestore
  useEffect(() => {
    if (!activeChatConnId || !currentUserId) return;
    SayviService.markMessagesAsRead(activeChatConnId, currentUserId);
    const unsub = SayviService.subscribeToMessages(
      activeChatConnId,
      currentUserId,
      (msgs) => {
        setActiveChatMessages(msgs);
        // Auto-mark incoming unread messages while chat is open
        const hasUnread = msgs.some((m) => !m.isMe && !m.isRead);
        if (hasUnread) {
          SayviService.markMessagesAsRead(activeChatConnId, currentUserId);
        }
      }
    );
    return () => unsub();
  }, [activeChatConnId, currentUserId]);

  // Active chat connection object (with robust fallback so Chat never fails to render)
  const activeChatConnection = useMemo<Connection | null>(() => {
    if (!activeChatConnId) return null;
    const existing = connections.find((c) => c.id === activeChatConnId);
    if (existing) return existing;

    // Derive partner ID from connectionId string (e.g. conn_user_alex_user_jordan)
    let partnerId: string | null = null;
    if (activeChatConnId.startsWith('conn_')) {
      const parts = activeChatConnId.replace('conn_', '').split('_');
      // Look for any user ID that isn't me
      for (const p of parts) {
        const candidate = `user_${p}`;
        if (candidate !== currentUserId && allProfilesMap[candidate]) {
          partnerId = candidate;
          break;
        }
      }
    }
    const partner = (partnerId ? allProfilesMap[partnerId] : null) || (currentUserId === 'user_alex' ? USER_JORDAN : USER_ALEX);
    return {
      id: activeChatConnId,
      partnerUser: partner,
      connectedAt: Date.now(),
      lastMessage: 'You both said hi! 👋',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };
  }, [connections, activeChatConnId, currentUserId, allProfilesMap]);

  /* -------------------------------------------------------------
   * ACTION HANDLERS
   * ------------------------------------------------------------- */

  // 1. Toggle Open Status
  const handleToggleOpen = async () => {
    const nextState = !currentUser.isOpen;
    setCurrentUser((prev) => ({ ...prev, isOpen: nextState }));
    await SayviService.toggleOpen(currentUserId, nextState);
    await proximityScanner.updatePresence(currentUserId, nextState);
  };

  // 2. Send SAYVI Wave
  const handleSendSayvi = async (target: UserProfile) => {
    if (currentUser.dailyWavesRemaining <= 0) {
      alert('You have reached your limit of 5 waves for today.');
      return;
    }

    if (blockedUserIdsSet.has(target.id)) return;

    if (!target.isOpen) {
      alert(`${target.firstName} is currently not open to receiving SAYVIs.`);
      return;
    }

    // Optimistically update sent waves list immediately
    const optimisticWave: SayviWave = {
      id: `sayvi_${currentUser.id}_${target.id}_${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: target.id,
      status: 'PENDING',
      note: 'Wants to say hi 👋',
      timestamp: Date.now(),
    };
    setSentWavesList((prev) => [
      ...prev.filter((w) => w.toUserId !== target.id),
      optimisticWave,
    ]);

    const res = await SayviService.sendSayvi(currentUser, target);
    if (!res.success) {
      alert(res.error || 'Could not send wave.');
      // Revert optimistic update on failure
      setSentWavesList((prev) => prev.filter((w) => w.id !== optimisticWave.id));
      return;
    }

    setSentModalTarget(target);
  };

  // 3. Accept Incoming Wave (Say Hi Back 👋)
  const handleAcceptIncomingWave = async (wave: SayviWave) => {
    const sender = allProfilesMap[wave.fromUserId] || {
      id: wave.fromUserId,
      firstName: 'Someone',
      age: 21,
      bio: 'Open to meeting',
      interests: ['Friends'],
      avatarEmoji: '👋',
      avatarBgHex: '#6366F1',
      isOpen: true,
      vibe: 'FRIENDSHIP',
      proximity: 'NEARBY',
      venueNote: '',
      dailyWavesRemaining: 5,
    };

    await SayviService.respondToWave(wave, 'ACCEPTED');
    setReviewingIncomingWave(null);
    setCelebrationPartner(sender);
  };

  // 4. Decline Wave ("No Thanks" / "Maybe Later")
  const handleDeclineWave = async (
    wave: SayviWave,
    decision: 'DECLINED' | 'MAYBE_LATER'
  ) => {
    await SayviService.respondToWave(wave, decision);
    setReviewingIncomingWave(null);
  };

  // 5. Send Real Chat Message
  const handleSendMessage = async (text: string) => {
    if (!activeChatConnection) return;
    const partnerId = activeChatConnection.partnerUser.id;
    const connId = activeChatConnection.id;
    const partner = activeChatConnection.partnerUser;

    await SayviService.sendMessage(
      connId,
      currentUserId,
      partnerId,
      text
    );

    // Natural companion reply simulation for smooth prototyping
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const lower = text.toLowerCase();
    let replyText = `Hey ${currentUser.firstName}! So glad we said hi 👋`;
    if (lower.includes('coffee') || lower.includes('tea') || lower.includes('drink')) {
      replyText = `Sounds lovely! I'm grabbing a coffee right now ☕`;
    } else if (lower.includes('working') || lower.includes('work') || lower.includes('doing')) {
      replyText = `Just wrapping up a few tasks and taking a breather ✨`;
    } else if (lower.includes('music') || lower.includes('song') || lower.includes('listen')) {
      replyText = `I love ambient and indie tracks! What are you listening to? 🎵`;
    } else if (lower.includes('near') || lower.includes('here') || lower.includes('where')) {
      replyText = `Yeah, I'm right around here as well!`;
    } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      replyText = `Hey ${currentUser.firstName}! How is your day going?`;
    }

    typingTimeoutRef.current = setTimeout(async () => {
      // Partner reads the latest message
      await SayviService.markMessagesAsRead(connId, partner.id);
      setIsPartnerTyping(true);
      typingTimeoutRef.current = setTimeout(async () => {
        setIsPartnerTyping(false);
        await SayviService.sendMessage(
          connId,
          partner.id,
          currentUserId,
          replyText
        );
      }, 2200);
    }, 1000);
  };

  // 6. Block User
  const handleConfirmBlock = async (target: UserProfile) => {
    await SayviService.blockUser(currentUserId, target.id);
    setBlockModalTarget(null);
    if (activeChatConnection?.partnerUser.id === target.id) {
      setActiveSubScreen('NONE');
    }
  };

  // 7. Report User
  const handleConfirmReport = async (category: ReportCategory, notes: string) => {
    if (reportModalTarget) {
      await SayviService.reportUser(
        currentUserId,
        reportModalTarget.id,
        category,
        notes
      );
      setReportModalTarget(null);
      alert('Thank you for reporting. The user has been blocked for your safety.');
    }
  };

  // 8. Switch Active Prototype User (Alex <-> Jordan)
  const handleSwitchUser = async (userId: string) => {
    const targetProfile =
      allProfilesMap[userId] || (userId === 'user_alex' ? USER_ALEX : USER_JORDAN);
    try {
      localStorage.setItem('sayvi_active_device_user_id', targetProfile.id);
    } catch {}
    setCurrentUser(targetProfile);
    setActiveSubScreen('NONE');
    setActiveChatConnId(null);
    await SayviService.saveUserProfile(targetProfile);
  };

  // 9. Reset Demo Data
  const handleResetData = async () => {
    if (window.confirm('Reset prototype data to initial clean test state?')) {
      const alex = {
        ...USER_ALEX,
        id: 'user_alex',
        isOpen: true,
        dailyWavesRemaining: 5,
      };
      const jordan = {
        ...USER_JORDAN,
        id: 'user_jordan',
        isOpen: true,
        dailyWavesRemaining: 5,
      };

      await SayviService.saveUserProfile(alex);
      await SayviService.saveUserProfile(jordan);
      setCurrentUser(alex);
      setActiveSubScreen('NONE');
      setActiveChatConnId(null);
      setActiveTab('HOME');
    }
  };

  // 10. Quick Demo Login for testing
  const handleQuickDemoLogin = async (userKey: 'alex' | 'jordan') => {
    const target = userKey === 'alex' ? USER_ALEX : USER_JORDAN;
    const profile: UserProfile = {
      ...target,
      id: userKey === 'alex' ? 'user_alex' : 'user_jordan',
      isOpen: true,
      dailyWavesRemaining: 5,
    };
    await SayviService.saveUserProfile(profile);
    setCurrentUser(profile);
    setNavScreen('MAIN');
    setActiveTab('HOME');
  };

  // 11. Profile Edit Save
  const handleSaveToRoom = async (
    displayName: string,
    bio: string,
    photoPath: string | null,
    age: number
  ) => {
    const updated: UserProfile = {
      ...currentUser,
      firstName: displayName,
      bio,
      photoPath,
      age,
    };
    setCurrentUser(updated);
    await SayviService.saveUserProfile(updated);
  };

  const handlePhotoUpdated = async (photoPath: string | null) => {
    const updated: UserProfile = { ...currentUser, photoPath };
    setCurrentUser(updated);
    await SayviService.saveUserProfile(updated);
  };

  // Entity for Room compatibility view
  const savedEntity: UserProfileEntity = {
    id: currentUser.id,
    displayName: currentUser.firstName,
    bio: currentUser.bio,
    photoPath: currentUser.photoPath || null,
    avatarEmoji: currentUser.avatarEmoji,
    avatarBgHex: currentUser.avatarBgHex,
    age: currentUser.age,
    interestsCsv: currentUser.interests.join(','),
    isOpen: currentUser.isOpen,
    updatedAt: Date.now(),
  };

  /* -------------------------------------------------------------
   * RENDER ROUTING
   * ------------------------------------------------------------- */

  // Auth flow screens
  if (navScreen === 'AUTH') {
    if (authStep === 'SPLASH') {
      return <SplashScreen onFinish={() => setAuthStep('WELCOME')} />;
    }

    if (authStep === 'WELCOME') {
      return (
        <WelcomeScreen
          onGetStarted={() => setAuthStep('CREATE_PROFILE')}
          onAlreadyHaveAccount={() => setAuthStep('SIGN_UP')}
          onQuickDemoLogin={handleQuickDemoLogin}
        />
      );
    }

    if (authStep === 'SIGN_UP') {
      return (
        <SignUpScreen
          onSuccess={(uid, isNewUser) => {
            if (isNewUser) {
              setAuthStep('CREATE_PROFILE');
            } else {
              setNavScreen('MAIN');
              setActiveTab('HOME');
            }
          }}
          onNavigateToLogin={() => setAuthStep('WELCOME')}
        />
      );
    }

    if (authStep === 'CREATE_PROFILE') {
      return (
        <CreateProfileScreen
          initialName={currentUser.firstName}
          onComplete={async (name, age, bio, avatarEmoji, interests) => {
            const newProfile: UserProfile = {
              ...currentUser,
              firstName: name,
              age,
              bio,
              avatarEmoji,
              interests,
              isOpen: true,
              dailyWavesRemaining: 5,
            };
            setCurrentUser(newProfile);
            await SayviService.saveUserProfile(newProfile);
            setNavScreen('MAIN');
            setActiveTab('HOME');
          }}
        />
      );
    }
  }

  // Active SubScreens inside Main App
  if (activeSubScreen === 'CHAT' && activeChatConnection) {
    return (
      <div className="bg-[#FAFAF9] min-h-screen">
        <PrototypeSimulatorBar
          currentUserId={currentUserId}
          allUsers={allProfiles}
          pendingWavesCount={incomingWaves.length}
          onSwitchUser={handleSwitchUser}
          onResetData={handleResetData}
        />
        <ChatScreen
          connection={activeChatConnection}
          messages={activeChatMessages}
          isPartnerTyping={isPartnerTyping}
          onSendMessage={handleSendMessage}
          onBack={() => {
            setIsPartnerTyping(false);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            setActiveSubScreen('NONE');
          }}
          onBlockUser={() =>
            setBlockModalTarget(activeChatConnection.partnerUser)
          }
          onReportUser={() =>
            setReportModalTarget(activeChatConnection.partnerUser)
          }
          onShowSafetyTips={() => setShowSafetyModal(true)}
        />
      </div>
    );
  }

  if (activeSubScreen === 'PRIVACY') {
    return (
      <div className="bg-[#FAFAF9] min-h-screen">
        <PrototypeSimulatorBar
          currentUserId={currentUserId}
          allUsers={allProfiles}
          pendingWavesCount={incomingWaves.length}
          onSwitchUser={handleSwitchUser}
          onResetData={handleResetData}
          onOpenDiagnostics={() => setActiveSubScreen('DIAGNOSTICS')}
        />
        <PrivacySettingsScreen
          settings={privacySettings}
          onUpdate={(s) => setPrivacySettings(s)}
          onBack={() => setActiveSubScreen('NONE')}
          onOpenDiagnostics={() => setActiveSubScreen('DIAGNOSTICS')}
        />
      </div>
    );
  }

  if (activeSubScreen === 'BLOCKED_USERS') {
    return (
      <div className="bg-[#FAFAF9] min-h-screen">
        <PrototypeSimulatorBar
          currentUserId={currentUserId}
          allUsers={allProfiles}
          pendingWavesCount={incomingWaves.length}
          onSwitchUser={handleSwitchUser}
          onResetData={handleResetData}
          onOpenDiagnostics={() => setActiveSubScreen('DIAGNOSTICS')}
        />
        <BlockedUsersScreen
          blockedIds={blockedUserIdsSet}
          allUsers={allProfiles}
          onUnblock={async (uid) => {
            await SayviService.unblockUser(currentUserId, uid);
          }}
          onBack={() => setActiveSubScreen('NONE')}
        />
      </div>
    );
  }

  if (activeSubScreen === 'DIAGNOSTICS') {
    return (
      <div className="bg-[#1C1917] min-h-screen">
        <PrototypeSimulatorBar
          currentUserId={currentUserId}
          allUsers={allProfiles}
          pendingWavesCount={incomingWaves.length}
          onSwitchUser={handleSwitchUser}
          onResetData={handleResetData}
        />
        <ProximityDiagnosticsScreen
          onBack={() => setActiveSubScreen('NONE')}
        />
      </div>
    );
  }

  // Main Tabs App Shell
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between">
      {/* Top Prototype Testing Bar */}
      <PrototypeSimulatorBar
        currentUserId={currentUserId}
        allUsers={allProfiles}
        pendingWavesCount={incomingWaves.length}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onOpenDiagnostics={() => setActiveSubScreen('DIAGNOSTICS')}
      />

      {/* Screen Content Container */}
      <div className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'HOME' && (
          <HomeScreen
            currentUser={currentUser}
            allUsers={allProfiles}
            blockedUserIds={blockedUserIdsSet}
            incomingWaves={incomingWaves}
            onToggleOpen={handleToggleOpen}
            onNavigateToNearby={() => setActiveTab('NEARBY')}
            onNavigateToConnections={() => setActiveTab('CONNECTIONS')}
            onOpenIncomingWave={(wave) => setReviewingIncomingWave(wave)}
            onOpenSafetyGuide={() => setShowSafetyModal(true)}
          />
        )}

        {activeTab === 'NEARBY' && (
          <NearbyScreen
            currentUser={currentUser}
            allUsers={allProfiles}
            blockedUserIds={blockedUserIdsSet}
            sentWaves={sentWavesMap}
            connections={connections}
            onSendSayvi={handleSendSayvi}
            onOpenChat={(conn) => {
              setActiveChatConnId(conn.id);
              setActiveSubScreen('CHAT');
            }}
            onBlockUser={(target) => setBlockModalTarget(target)}
            onReportUser={(target) => setReportModalTarget(target)}
          />
        )}

        {activeTab === 'CONNECTIONS' && (
          <ConnectionsScreen
            connections={connections}
            sentWaves={sentWavesList}
            incomingWaves={allIncomingWavesList}
            allProfilesMap={allProfilesMap}
            currentUserId={currentUserId}
            onOpenChat={(conn) => {
              setActiveChatConnId(conn.id);
              setActiveSubScreen('CHAT');
            }}
            onNavigateToNearby={() => setActiveTab('NEARBY')}
            onAcceptWave={handleAcceptIncomingWave}
            onDeclineWave={handleDeclineWave}
          />
        )}

        {activeTab === 'PROFILE' && (
          <ProfileScreen
            currentUser={currentUser}
            savedEntity={savedEntity}
            onToggleOpen={handleToggleOpen}
            onSaveToRoom={handleSaveToRoom}
            onPhotoUpdated={handlePhotoUpdated}
            onOpenPrivacy={() => setActiveSubScreen('PRIVACY')}
            onOpenSafetyGuide={() => setShowSafetyModal(true)}
            onOpenBlockedUsers={() => setActiveSubScreen('BLOCKED_USERS')}
            onLogout={async () => {
              await signOut(auth);
              setNavScreen('AUTH');
              setAuthStep('WELCOME');
            }}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-linear-to-b from-white/95 to-[#FAFAF9]/95 backdrop-blur-md border-t border-[#E7E5E4] shadow-[0_-2px_10px_rgba(28,25,23,0.03),inset_0_1px_0_rgba(255,255,255,1)] z-40">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
          <button
            type="button"
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center py-1.5 px-3.5 rounded-xl transition cursor-pointer active:translate-y-[0.5px] ${
              activeTab === 'HOME'
                ? 'bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] text-[#3730A3] font-bold border border-[#C7D2FE]/70 shadow-[inset_0_1px_2px_rgba(55,48,163,0.08),0_1px_0_rgba(255,255,255,0.8)]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NEARBY')}
            className={`flex flex-col items-center py-1.5 px-3.5 rounded-xl transition cursor-pointer active:translate-y-[0.5px] ${
              activeTab === 'NEARBY'
                ? 'bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] text-[#3730A3] font-bold border border-[#C7D2FE]/70 shadow-[inset_0_1px_2px_rgba(55,48,163,0.08),0_1px_0_rgba(255,255,255,0.8)]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Nearby</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONNECTIONS')}
            className={`flex flex-col items-center py-1.5 px-3.5 rounded-xl relative transition cursor-pointer active:translate-y-[0.5px] ${
              activeTab === 'CONNECTIONS'
                ? 'bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] text-[#3730A3] font-bold border border-[#C7D2FE]/70 shadow-[inset_0_1px_2px_rgba(55,48,163,0.08),0_1px_0_rgba(255,255,255,0.8)]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Connections</span>
            {connections.length > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#3730A3] shadow-[0_0_4px_rgba(55,48,163,0.5)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`flex flex-col items-center py-1.5 px-3.5 rounded-xl transition cursor-pointer active:translate-y-[0.5px] ${
              activeTab === 'PROFILE'
                ? 'bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] text-[#3730A3] font-bold border border-[#C7D2FE]/70 shadow-[inset_0_1px_2px_rgba(55,48,163,0.08),0_1px_0_rgba(255,255,255,0.8)]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            <UserIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Profile</span>
          </button>
        </div>
      </div>

      {/* Global Modals & Overlays */}
      {reviewingIncomingWave && (
        <IncomingWaveModal
          wave={reviewingIncomingWave}
          senderUser={allProfilesMap[reviewingIncomingWave.fromUserId]}
          onAccept={() => handleAcceptIncomingWave(reviewingIncomingWave)}
          onMaybeLater={() =>
            handleDeclineWave(reviewingIncomingWave, 'MAYBE_LATER')
          }
          onDecline={() => handleDeclineWave(reviewingIncomingWave, 'DECLINED')}
          onDismiss={() => setReviewingIncomingWave(null)}
        />
      )}

      {sentModalTarget && (
        <SayviSentModal
          targetUser={sentModalTarget}
          onDismiss={() => setSentModalTarget(null)}
        />
      )}

      {celebrationPartner && (
        <MutualMatchModal
          myUser={currentUser}
          partner={celebrationPartner}
          onStartTalking={() => {
            const conn = connections.find(
              (c) => c.partnerUser.id === celebrationPartner.id
            );
            const p1 = currentUser.id < celebrationPartner.id ? currentUser.id : celebrationPartner.id;
            const p2 = currentUser.id < celebrationPartner.id ? celebrationPartner.id : currentUser.id;
            const connId = conn ? conn.id : `conn_${p1}_${p2}`;
            setActiveChatConnId(connId);
            setActiveSubScreen('CHAT');
            setCelebrationPartner(null);
          }}
          onDismiss={() => setCelebrationPartner(null)}
        />
      )}

      {blockModalTarget && (
        <BlockModal
          targetUser={blockModalTarget}
          onConfirm={() => handleConfirmBlock(blockModalTarget)}
          onDismiss={() => setBlockModalTarget(null)}
        />
      )}

      {reportModalTarget && (
        <ReportModal
          targetUser={reportModalTarget}
          onConfirm={handleConfirmReport}
          onDismiss={() => setReportModalTarget(null)}
        />
      )}

      {showSafetyModal && (
        <SafetyModal onDismiss={() => setShowSafetyModal(false)} />
      )}
    </div>
  );
}

export default App;
