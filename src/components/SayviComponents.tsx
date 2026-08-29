import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Sparkles,
  UserX,
  AlertTriangle,
  Send,
  X,
  Check,
  Radio,
  RadioTower,
} from 'lucide-react';
import { UserProfile, SayviWave, ReportCategory, REPORT_CATEGORIES, PROXIMITIES, CONNECTION_VIBES } from '../types';

/* -------------------------------------------------------------
 * SAYVI BRAND LOGO
 * ------------------------------------------------------------- */
interface SayviBrandLogoProps {
  showTagline?: boolean;
  large?: boolean;
}

export const SayviBrandLogo: React.FC<SayviBrandLogoProps> = ({
  showTagline = true,
  large = false,
}) => {
  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex items-center space-x-2.5">
        <div
          className={`${
            large ? 'w-12 h-12 text-2xl' : 'w-9 h-9 text-lg'
          } rounded-full bg-linear-to-b from-white to-[#F5F5F4] border border-[#E7E5E4] flex items-center justify-center shadow-[0_2px_4px_rgba(28,25,23,0.06),inset_0_1px_0_rgba(255,255,255,1)]`}
        >
          <span className="drop-shadow-xs">👋</span>
        </div>
        <span
          className={`${
            large ? 'text-2xl sm:text-3xl' : 'text-xl'
          } font-bold tracking-tight text-[#1C1917]`}
        >
          SAYVI
        </span>
      </div>
      {showTagline && (
        <span
          className={`${
            large ? 'text-sm' : 'text-xs'
          } text-[#78716C] font-normal mt-1`}
        >
          When saying hi is hard.
        </span>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * OPEN STATUS TOGGLE CARD (Tactile Physical Switch)
 * ------------------------------------------------------------- */
interface OpenStatusToggleCardProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const OpenStatusToggleCard: React.FC<OpenStatusToggleCardProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <div
      onClick={onToggle}
      className={`rounded-2xl p-4 border transition-all cursor-pointer select-none flex items-center justify-between sayvi-card ${
        isOpen
          ? 'bg-linear-to-b from-[#F0FDFA] to-white border-[#CCFBF1] hover:border-[#99F6E4]'
          : 'bg-linear-to-b from-white to-[#FAFAF9] border-[#E7E5E4] hover:bg-white'
      } active:translate-y-[0.5px]`}
    >
      <div className="flex items-center space-x-3.5">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border shadow-[0_1px_3px_rgba(28,25,23,0.1),inset_0_1px_0_rgba(255,255,255,0.4)] ${
            isOpen
              ? 'bg-linear-to-b from-[#14B8A6] to-[#0D9488] border-[#0F766E] text-white'
              : 'bg-linear-to-b from-[#E7E5E4] to-[#D6D3D1] border-[#D6D3D1] text-white'
          }`}
        >
          {isOpen ? '●' : '○'}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4
              className={`font-semibold text-sm sm:text-base ${
                isOpen ? 'text-[#0D9488]' : 'text-[#78716C]'
              }`}
            >
              {isOpen ? "I'm Open" : "I'm Not Open"}
            </h4>
            {isOpen && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] shadow-xs">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#78716C] mt-0.5 leading-snug">
            {isOpen
              ? 'Nearby open people can discover and wave to you 👋'
              : 'You are invisible. No waves will be received.'}
          </p>
        </div>
      </div>

      {/* Tactile Physical Switch mechanism */}
      <div
        className={`w-12 h-7 rounded-full p-0.5 transition-all duration-200 ease-out flex items-center shrink-0 ml-3 ${
          isOpen ? 'sayvi-switch-track-on justify-end' : 'sayvi-switch-track-off justify-start'
        }`}
      >
        <div className="w-5.5 h-5.5 rounded-full sayvi-switch-thumb transition-transform flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D6D3D1]/60" />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * INCOMING WAVE MODAL
 * ------------------------------------------------------------- */
interface IncomingWaveModalProps {
  wave: SayviWave;
  senderUser?: UserProfile;
  onAccept: () => void;
  onMaybeLater: () => void;
  onDecline: () => void;
  onDismiss: () => void;
}

export const IncomingWaveModal: React.FC<IncomingWaveModalProps> = ({
  senderUser,
  onAccept,
  onMaybeLater,
  onDecline,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_12px_32px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,1)] text-center space-y-5 border border-[#E7E5E4] animate-scaleUp">
        {/* Wave Icon */}
        <div className="w-14 h-14 rounded-full bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-2xl mx-auto shadow-[0_2px_6px_rgba(55,48,163,0.12),inset_0_1px_0_rgba(255,255,255,1)]">
          <span className="drop-shadow-xs">👋</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1C1917] tracking-tight">
            Someone nearby wants to say hi.
          </h3>
          <p className="text-xs text-[#78716C] mt-1">
            They'd like to connect with you discreetly.
          </p>
        </div>

        {/* Privacy Protected Teaser Card */}
        <div className="p-4 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl space-y-2.5 text-left shadow-[inset_0_1.5px_3px_rgba(28,25,23,0.05),inset_0_-1px_0_rgba(255,255,255,0.8)]">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base sayvi-avatar-raised"
              style={{ backgroundColor: senderUser?.avatarBgHex || '#3730A3' }}
            >
              {senderUser?.avatarEmoji || '👤'}
            </div>
            <div>
              <span className="text-sm font-semibold text-[#1C1917]">
                {senderUser?.firstName || 'Someone'}
              </span>
              <span className="text-xs text-[#78716C] ml-1.5 font-medium">
                • {senderUser ? PROXIMITIES[senderUser.proximity].label : 'Nearby'}
              </span>
            </div>
          </div>

          {senderUser && senderUser.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {senderUser.interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="sayvi-pill"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-1 text-[11px] text-[#78716C] pt-1">
            <Lock className="w-3 h-3 text-[#A8A29E]" />
            <span>Full profile reveals only when both say hi</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onAccept}
            className="w-full py-3 sayvi-btn-primary text-sm rounded-xl cursor-pointer"
          >
            Say Hi Back 👋
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onMaybeLater}
              className="py-2.5 sayvi-btn-secondary text-xs rounded-xl cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="py-2.5 bg-transparent hover:bg-[#F5F5F4] text-[#78716C] hover:text-[#1C1917] font-medium text-xs rounded-xl transition cursor-pointer"
            >
              No Thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * SAYVI SENT CONFIRMATION MODAL
 * ------------------------------------------------------------- */
interface SayviSentModalProps {
  targetUser: UserProfile | null;
  onDismiss: () => void;
}

export const SayviSentModal: React.FC<SayviSentModalProps> = ({
  targetUser,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_12px_32px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,1)] text-center space-y-4 border border-[#E7E5E4] animate-scaleUp">
        <div className="w-14 h-14 rounded-full bg-linear-to-b from-[#EEF2FF] to-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-2xl mx-auto shadow-[0_2px_6px_rgba(55,48,163,0.12),inset_0_1px_0_rgba(255,255,255,1)]">
          <span className="drop-shadow-xs">👋</span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1C1917] tracking-tight">SAYVI Sent</h3>
          <p className="text-[#3730A3] font-semibold text-sm mt-1">
            “Let's see if they say hi back.”
          </p>
        </div>

        <p className="text-xs text-[#78716C] leading-relaxed">
          We sent a discreet notification to{' '}
          <strong className="text-[#1C1917] font-semibold">{targetUser?.firstName || 'them'}</strong>.
          If they are open to connecting too, you'll be connected immediately!
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2.5 sayvi-btn-primary text-sm rounded-xl cursor-pointer mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * MUTUAL MATCH CELEBRATION MODAL
 * ------------------------------------------------------------- */
interface MutualMatchModalProps {
  myUser: UserProfile;
  partner: UserProfile;
  onStartTalking: () => void;
  onDismiss: () => void;
}

export const MutualMatchModal: React.FC<MutualMatchModalProps> = ({
  myUser,
  partner,
  onStartTalking,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_12px_36px_rgba(28,25,23,0.22),inset_0_1px_0_rgba(255,255,255,1)] text-center space-y-5 border border-[#E7E5E4] animate-scaleUp">
        <div className="w-14 h-14 rounded-full bg-linear-to-b from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] flex items-center justify-center text-2xl mx-auto shadow-[0_2px_6px_rgba(13,148,136,0.15),inset_0_1px_0_rgba(255,255,255,1)]">
          <span className="drop-shadow-xs">🎉</span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#1C1917] tracking-tight">You both said hi!</h3>
          <p className="text-xs text-[#78716C] mt-1">
            Looks like you're both open to meeting.
          </p>
        </div>

        {/* Dual Raised Avatars */}
        <div className="flex items-center justify-center space-x-3 py-2">
          <div
            className="w-13 h-13 rounded-full flex items-center justify-center text-xl sayvi-avatar-raised"
            style={{ backgroundColor: myUser.avatarBgHex }}
          >
            {myUser.avatarEmoji}
          </div>

          <span className="text-[#3730A3] font-bold text-lg">↔</span>

          <div
            className="w-13 h-13 rounded-full flex items-center justify-center text-xl sayvi-avatar-raised"
            style={{ backgroundColor: partner.avatarBgHex }}
          >
            {partner.avatarEmoji}
          </div>
        </div>

        <div className="font-semibold text-sm text-[#1C1917]">
          {myUser.firstName} ↔ {partner.firstName}
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onStartTalking}
            className="w-full py-3 sayvi-btn-primary text-sm rounded-xl cursor-pointer"
          >
            Start Talking 💬
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * BLOCK USER MODAL
 * ------------------------------------------------------------- */
interface BlockModalProps {
  targetUser: UserProfile;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  targetUser,
  onConfirm,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_12px_32px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,1)] text-center space-y-4 border border-[#E7E5E4]">
        <div className="w-12 h-12 rounded-full bg-linear-to-b from-rose-50 to-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-[0_2px_4px_rgba(225,29,72,0.12),inset_0_1px_0_rgba(255,255,255,1)]">
          <UserX className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1917] tracking-tight">
            Block {targetUser.firstName}?
          </h3>
          <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
            They will no longer see you nearby or be able to send you waves or
            messages. This action is private and can be unblocked anytime in settings.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 sayvi-btn-danger text-xs rounded-xl cursor-pointer"
          >
            Block User
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * REPORT USER MODAL
 * ------------------------------------------------------------- */
interface ReportModalProps {
  targetUser: UserProfile;
  onConfirm: (category: ReportCategory, notes: string) => void;
  onDismiss: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetUser,
  onConfirm,
  onDismiss,
}) => {
  const [category, setCategory] = useState<ReportCategory>('UNCOMFORTABLE');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_12px_32px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,1)] space-y-4 border border-[#E7E5E4]">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-full bg-linear-to-b from-rose-50 to-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Report {targetUser.firstName}
            </h3>
            <p className="text-xs text-[#78716C]">Help keep SAYVI safe</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-xs font-medium text-[#1C1917]">
            Select a reason:
          </label>
          <div className="space-y-1.5">
            {REPORT_CATEGORIES.map((item) => (
              <label
                key={item.id}
                className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  category === item.id
                    ? 'bg-rose-50 border-rose-200 text-rose-950 font-medium shadow-[inset_0_1px_2px_rgba(225,29,72,0.06)]'
                    : 'bg-[#FAFAF9] border-[#E7E5E4] text-[#1C1917] hover:bg-[#F5F5F4]'
                }`}
              >
                <input
                  type="radio"
                  name="reportCat"
                  checked={category === item.id}
                  onChange={() => setCategory(item.id)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>{item.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-3">
          <button
            type="button"
            onClick={() => onConfirm(category, notes)}
            className="w-full py-2.5 sayvi-btn-danger text-xs rounded-xl cursor-pointer"
          >
            Submit Report & Block
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * SAFETY GUIDELINES MODAL
 * ------------------------------------------------------------- */
interface SafetyModalProps {
  onDismiss: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ onDismiss }) => {
  const guidelines = [
    {
      icon: '🛡️',
      title: 'No Exact GPS Tracking',
      desc: "We only display approximate tags ('Nearby', 'Very close'). Your precise coordinates are never shared.",
    },
    {
      icon: '🤝',
      title: 'Mutual Consent Required',
      desc: 'No one can message you or see contact details unless you both actively choose to connect.',
    },
    {
      icon: '☕',
      title: 'Meet in Public Spots',
      desc: 'If you choose to say hello in person, choose well-lit campus spaces or cafe venues.',
    },
    {
      icon: '⚪',
      title: 'Total Visibility Control',
      desc: "Switch to 'I'm Not Open' anytime to become completely invisible to everyone.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-[0_12px_32px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,1)] space-y-4 border border-[#E7E5E4]">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-full bg-linear-to-b from-[#F0FDFA] to-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              SAYVI Safety Principles
            </h3>
            <p className="text-xs text-[#78716C]">
              Designed for privacy & zero pressure
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {guidelines.map((g, i) => (
            <div key={i} className="flex space-x-3 text-left p-2.5 rounded-xl bg-[#FAFAF9] border border-[#E7E5E4] shadow-[0_1px_2px_rgba(28,25,23,0.03),inset_0_1px_0_rgba(255,255,255,0.8)]">
              <span className="text-lg shrink-0">{g.icon}</span>
              <div>
                <h5 className="font-semibold text-xs text-[#1C1917]">{g.title}</h5>
                <p className="text-[11px] text-[#78716C] leading-relaxed mt-0.5">
                  {g.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-2.5 sayvi-btn-primary text-xs rounded-xl cursor-pointer mt-4"
        >
          Understood
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * PROTOTYPE SIMULATOR TOP BAR (Tactile Instrument Panel)
 * ------------------------------------------------------------- */
interface PrototypeSimulatorBarProps {
  currentUserId: string;
  allUsers: UserProfile[];
  pendingWavesCount: number;
  onSwitchUser: (userId: string) => void;
  onResetData: () => void;
  onOpenDiagnostics?: () => void;
}

export const PrototypeSimulatorBar: React.FC<PrototypeSimulatorBarProps> = ({
  currentUserId,
  allUsers,
  pendingWavesCount,
  onSwitchUser,
  onResetData,
  onOpenDiagnostics,
}) => {
  return (
    <div className="bg-linear-to-b from-[#F5F5F4] to-[#E7E5E4] text-[#78716C] px-3 py-1.5 border-b border-[#D6D3D1] shadow-[0_1px_2px_rgba(28,25,23,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="text-[9px] font-bold tracking-wider uppercase bg-[#1C1917] text-[#FAFAF9] px-1.5 py-0.5 rounded shadow-2xs">
            DEV
          </span>
          <div className="flex items-center space-x-1 text-xs">
            {allUsers.slice(0, 2).map((user) => {
              const isMe = user.id === currentUserId;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSwitchUser(user.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center space-x-1 ${
                    isMe
                      ? 'bg-white text-[#1C1917] border border-[#D6D3D1] shadow-[0_1px_3px_rgba(28,25,23,0.1),inset_0_1px_0_rgba(255,255,255,1)]'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/60'
                  } active:translate-y-[0.5px]`}
                  title={`Switch to ${user.firstName}`}
                >
                  <span>{user.avatarEmoji}</span>
                  <span>{user.firstName}</span>
                  {isMe && <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] ml-0.5 shadow-xs" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {pendingWavesCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold rounded-md animate-pulse shadow-2xs">
              👋 {pendingWavesCount}
            </span>
          )}
          {onOpenDiagnostics && (
            <button
              type="button"
              onClick={onOpenDiagnostics}
              title="Open BLE Proximity Engine Diagnostics"
              className="text-[10px] text-[#0D9488] hover:text-[#0F766E] px-2 py-0.5 bg-linear-to-b from-white to-[#F0FDFA] hover:bg-[#CCFBF1] rounded-lg border border-[#99F6E4] shadow-2xs transition cursor-pointer font-mono font-bold"
            >
              📡 BLE
            </button>
          )}
          <button
            type="button"
            onClick={onResetData}
            title="Reset to initial test state"
            className="text-[10px] text-[#78716C] hover:text-[#1C1917] px-2 py-0.5 bg-linear-to-b from-white to-[#F5F5F4] hover:bg-white rounded-lg border border-[#D6D3D1] shadow-2xs transition cursor-pointer font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
