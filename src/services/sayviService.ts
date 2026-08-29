import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from './firebase';
import {
  UserProfile,
  SayviWave,
  Connection,
  ChatMessage,
  ReportCategory,
  WaveStatus,
} from '../types';

export class SayviService {
  /**
   * 1. PROFILES
   */
  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    const userDocRef = doc(db, 'profiles', profile.id);
    const todayStr = new Date().toISOString().split('T')[0];

    await setDoc(
      userDocRef,
      {
        uid: profile.id,
        firstName: profile.firstName,
        age: profile.age,
        bio: profile.bio,
        interests: profile.interests,
        avatarEmoji: profile.avatarEmoji,
        avatarBgHex: profile.avatarBgHex,
        profilePhotoUrl: profile.photoPath || null,
        isOpen: profile.isOpen,
        dailyWavesRemaining: profile.dailyWavesRemaining ?? 5,
        lastWaveResetDate: todayStr,
        vibe: profile.vibe || 'FRIENDSHIP',
        proximity: profile.proximity || 'NEARBY',
        venueNote: profile.venueNote || '',
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  }

  public static async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'profiles', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      firstName: data.firstName || 'User',
      age: data.age || 21,
      bio: data.bio || '',
      interests: data.interests || [],
      avatarEmoji: data.avatarEmoji || '😊',
      avatarBgHex: data.avatarBgHex || '#4F46E5',
      photoPath: data.profilePhotoUrl || null,
      isOpen: data.isOpen ?? true,
      vibe: data.vibe || 'FRIENDSHIP',
      proximity: data.proximity || 'NEARBY',
      venueNote: data.venueNote || '',
      dailyWavesRemaining: data.dailyWavesRemaining ?? 5,
    };
  }

  public static subscribeToUserProfile(
    uid: string,
    onUpdate: (profile: UserProfile | null) => void,
    onError?: (err: Error) => void
  ): () => void {
    const docRef = doc(db, 'profiles', uid);
    return onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          onUpdate(null);
          return;
        }
        const data = snap.data();
        onUpdate({
          id: snap.id,
          firstName: data.firstName || 'User',
          age: data.age || 21,
          bio: data.bio || '',
          interests: data.interests || [],
          avatarEmoji: data.avatarEmoji || '😊',
          avatarBgHex: data.avatarBgHex || '#4F46E5',
          photoPath: data.profilePhotoUrl || null,
          isOpen: data.isOpen ?? true,
          vibe: data.vibe || 'FRIENDSHIP',
          proximity: data.proximity || 'NEARBY',
          venueNote: data.venueNote || '',
          dailyWavesRemaining: data.dailyWavesRemaining ?? 5,
        });
      },
      (error) => {
        console.warn('Profile subscription error:', error);
        onError?.(error);
      }
    );
  }

  public static subscribeToAllProfiles(
    onUpdate: (profiles: UserProfile[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = collection(db, 'profiles');
    return onSnapshot(
      q,
      (snapshot) => {
        const list: UserProfile[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            firstName: data.firstName || 'User',
            age: data.age || 21,
            bio: data.bio || '',
            interests: data.interests || [],
            avatarEmoji: data.avatarEmoji || '😊',
            avatarBgHex: data.avatarBgHex || '#4F46E5',
            photoPath: data.profilePhotoUrl || null,
            isOpen: data.isOpen ?? true,
            vibe: data.vibe || 'FRIENDSHIP',
            proximity: data.proximity || 'NEARBY',
            venueNote: data.venueNote || '',
            dailyWavesRemaining: data.dailyWavesRemaining ?? 5,
          };
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('Error listening to all profiles:', err);
        onError?.(err);
      }
    );
  }

  public static async toggleOpen(uid: string, isOpen: boolean): Promise<void> {
    const docRef = doc(db, 'profiles', uid);
    await updateDoc(docRef, {
      isOpen,
      updatedAt: Date.now(),
    });
  }

  /**
   * 2. SAYVI WAVES
   */
  public static async sendSayvi(
    sender: UserProfile,
    receiver: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (sender.dailyWavesRemaining <= 0) {
        return { success: false, error: 'Daily wave quota reached (5/5).' };
      }

      if (!receiver.isOpen) {
        return {
          success: false,
          error: `${receiver.firstName} is not open to receiving SAYVIs.`,
        };
      }

      const sayviId = `sayvi_${sender.id}_${receiver.id}_${Date.now()}`;
      const sayviDocRef = doc(db, 'sayvis', sayviId);

      // Write Wave to Firestore
      await setDoc(sayviDocRef, {
        id: sayviId,
        senderId: sender.id,
        receiverId: receiver.id,
        status: 'PENDING',
        note: 'Wants to say hi 👋',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Decrement sender daily wave quota in background
      const newRemaining = Math.max(0, sender.dailyWavesRemaining - 1);
      updateDoc(doc(db, 'profiles', sender.id), {
        dailyWavesRemaining: newRemaining,
        updatedAt: Date.now(),
      }).catch((e) => console.warn('Could not update wave quota in profile:', e));

      return { success: true };
    } catch (err: unknown) {
      console.error('Error sending SAYVI in Firestore:', err);
      return {
        success: false,
        error: (err as Error).message || 'Failed to write wave to database',
      };
    }
  }

  public static subscribeToIncomingWaves(
    uid: string,
    onUpdate: (waves: SayviWave[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'sayvis'),
      where('receiverId', '==', uid)
    );

    return onSnapshot(
      q,
      (snap) => {
        const waves: SayviWave[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            fromUserId: data.senderId,
            toUserId: data.receiverId,
            status: data.status as WaveStatus,
            note: data.note || 'Wants to say hi 👋',
            timestamp: data.createdAt || Date.now(),
          };
        });
        onUpdate(waves);
      },
      (err) => {
        console.warn('Incoming waves subscription error:', err);
        onError?.(err);
      }
    );
  }

  public static subscribeToSentWaves(
    uid: string,
    onUpdate: (waves: SayviWave[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'sayvis'),
      where('senderId', '==', uid)
    );

    return onSnapshot(
      q,
      (snap) => {
        const waves: SayviWave[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            fromUserId: data.senderId,
            toUserId: data.receiverId,
            status: data.status as WaveStatus,
            note: data.note || 'Wants to say hi 👋',
            timestamp: data.createdAt || Date.now(),
          };
        });
        onUpdate(waves);
      },
      (err) => {
        console.warn('Sent waves subscription error:', err);
        onError?.(err);
      }
    );
  }

  public static async respondToWave(
    wave: SayviWave,
    decision: 'ACCEPTED' | 'DECLINED' | 'MAYBE_LATER'
  ): Promise<void> {
    const waveRef = doc(db, 'sayvis', wave.id);
    await updateDoc(waveRef, {
      status: decision,
      updatedAt: Date.now(),
    });

    if (decision === 'ACCEPTED') {
      // Deterministic connection ID between the pair
      const p1 = wave.fromUserId < wave.toUserId ? wave.fromUserId : wave.toUserId;
      const p2 = wave.fromUserId < wave.toUserId ? wave.toUserId : wave.fromUserId;
      const connectionId = `conn_${p1}_${p2}`;

      const connDocRef = doc(db, 'connections', connectionId);
      await setDoc(
        connDocRef,
        {
          id: connectionId,
          user1Id: p1,
          user2Id: p2,
          participantIds: [p1, p2],
          status: 'ACCEPTED',
          lastMessage: 'You both said hi! 👋',
          lastMessageTime: 'Just now',
          createdAt: Date.now(),
        },
        { merge: true }
      );

      // Create initial greeting message
      const msgId = `msg_hello_${Date.now()}`;
      await setDoc(doc(db, 'messages', msgId), {
        id: msgId,
        connectionId,
        senderId: wave.fromUserId,
        receiverId: wave.toUserId,
        text: '👋 Hey! Glad we both said hi.',
        isRead: false,
        createdAt: Date.now(),
      });
    }
  }

  /**
   * 3. CONNECTIONS
   */
  public static subscribeToConnections(
    uid: string,
    allProfilesMap: Record<string, UserProfile>,
    onUpdate: (connections: Connection[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'connections'),
      where('participantIds', 'array-contains', uid)
    );

    return onSnapshot(
      q,
      (snap) => {
        const conns: Connection[] = [];
        snap.docs.forEach((d) => {
          const data = d.data();
          const pIds: string[] = data.participantIds || [data.user1Id, data.user2Id];
          const partnerId = pIds.find((id) => id !== uid);
          if (!partnerId) return;

          const partner = allProfilesMap[partnerId] || {
            id: partnerId,
            firstName: 'Partner',
            age: 22,
            bio: 'Sayvi member',
            interests: ['Social'],
            avatarEmoji: '✨',
            avatarBgHex: '#6366F1',
            isOpen: true,
            vibe: 'FRIENDSHIP',
            proximity: 'NEARBY',
            venueNote: '',
            dailyWavesRemaining: 5,
          };

          conns.push({
            id: d.id,
            partnerUser: partner,
            connectedAt: data.createdAt || Date.now(),
            lastMessage: data.lastMessage || 'You both said hi! 👋',
            lastMessageTime: data.lastMessageTime || 'Just now',
            unreadCount: 0,
          });
        });
        onUpdate(conns);
      },
      (err) => {
        console.warn('Connections subscription error:', err);
        onError?.(err);
      }
    );
  }

  /**
   * 4. MESSAGES & REALTIME CHAT
   */
  public static subscribeToMessages(
    connectionId: string,
    currentUserId: string,
    onUpdate: (messages: ChatMessage[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'messages'),
      where('connectionId', '==', connectionId)
    );

    return onSnapshot(
      q,
      (snap) => {
        const msgs: ChatMessage[] = snap.docs
          .map((d) => {
            const data = d.data();
            return {
              id: d.id,
              connectionId: data.connectionId,
              senderId: data.senderId,
              text: data.text || '',
              timestamp: data.createdAt || Date.now(),
              isMe: data.senderId === currentUserId,
              isRead: data.isRead ?? false,
            };
          })
          .sort((a, b) => a.timestamp - b.timestamp);
        onUpdate(msgs);
      },
      (err) => {
        console.warn('Chat messages subscription error:', err);
        onError?.(err);
      }
    );
  }

  public static async markMessagesAsRead(
    connectionId: string,
    readerId: string
  ): Promise<void> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('connectionId', '==', connectionId)
      );
      const snap = await getDocs(q);
      const updates: Promise<void>[] = [];
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.senderId !== readerId && !data.isRead) {
          updates.push(updateDoc(doc(db, 'messages', d.id), { isRead: true }));
        }
      });
      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (e) {
      console.warn('Error marking messages as read:', e);
    }
  }

  public static async sendMessage(
    connectionId: string,
    senderId: string,
    receiverId: string,
    text: string
  ): Promise<void> {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const msgDocRef = doc(db, 'messages', msgId);

    await setDoc(msgDocRef, {
      id: msgId,
      connectionId,
      senderId,
      receiverId,
      text,
      isRead: false,
      createdAt: Date.now(),
    });

    // Update last message preview on connection
    const connDocRef = doc(db, 'connections', connectionId);
    await updateDoc(connDocRef, {
      lastMessage: text,
      lastMessageTime: 'Just now',
    });
  }

  /**
   * 5. BLOCKING
   */
  public static async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const blockDocId = `${blockerId}_${blockedId}`;
    await setDoc(doc(db, 'blocks', blockDocId), {
      id: blockDocId,
      blockerId,
      blockedId,
      createdAt: Date.now(),
    });
  }

  public static async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const blockDocId = `${blockerId}_${blockedId}`;
    await deleteDoc(doc(db, 'blocks', blockDocId));
  }

  public static subscribeToBlockedUsers(
    uid: string,
    onUpdate: (blockedIds: string[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      collection(db, 'blocks'),
      where('blockerId', '==', uid)
    );

    return onSnapshot(
      q,
      (snap) => {
        const ids = snap.docs.map((d) => d.data().blockedId as string);
        onUpdate(ids);
      },
      (err) => {
        console.warn('Blocked users subscription error:', err);
        onError?.(err);
      }
    );
  }

  /**
   * 6. REPORTING
   */
  public static async reportUser(
    reporterId: string,
    reportedUserId: string,
    category: ReportCategory,
    notes?: string
  ): Promise<void> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, 'reports', reportId), {
      id: reportId,
      reporterId,
      reportedUserId,
      category,
      notes: notes || '',
      createdAt: Date.now(),
    });

    // Also auto-block reported user for user protection
    await this.blockUser(reporterId, reportedUserId);
  }

  /**
   * 7. STORAGE / PHOTO UPLOAD
   */
  public static async uploadProfilePhoto(uid: string, file: File): Promise<string> {
    const photoRef = ref(storage, `profile_photos/${uid}_${Date.now()}.jpg`);
    await uploadBytes(photoRef, file);
    return await getDownloadURL(photoRef);
  }
}
