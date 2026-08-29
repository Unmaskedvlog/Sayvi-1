import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { SayviBrandLogo } from '../components/SayviComponents';
import { ALL_AVAILABLE_INTERESTS, USER_ALEX, USER_JORDAN } from '../data/sampleData';
import { Check, Loader2, AlertCircle, Sparkles, Shield, Coffee, Users } from 'lucide-react';

/* -------------------------------------------------------------
 * SPLASH SCREEN
 * ------------------------------------------------------------- */
interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="space-y-6">
        <SayviBrandLogo large showTagline />

        <div className="flex items-center justify-center space-x-2 pt-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3730A3] shadow-[0_1px_3px_rgba(55,48,163,0.3)] animate-pulse" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] shadow-[0_1px_3px_rgba(13,148,136,0.3)] animate-pulse delay-100" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#78716C] shadow-[0_1px_3px_rgba(120,113,108,0.3)] animate-pulse delay-200" />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * WELCOME SCREEN
 * ------------------------------------------------------------- */
interface WelcomeScreenProps {
  onGetStarted: () => void;
  onAlreadyHaveAccount: () => void;
  onQuickDemoLogin?: (userKey: 'alex' | 'jordan') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onAlreadyHaveAccount,
  onQuickDemoLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="pt-4 flex justify-center">
        <SayviBrandLogo showTagline={false} />
      </div>

      {/* Hero */}
      <div className="space-y-6 text-center my-auto py-4">
        <div className="w-20 h-20 rounded-full bg-linear-to-b from-white to-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-4xl mx-auto sayvi-card">
          👋
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1C1917] tracking-tight leading-snug">
            Meet people without the awkward first move.
          </h1>
          <p className="text-sm text-[#78716C] leading-relaxed max-w-xs mx-auto">
            SAYVI lets you discreetly let someone nearby know you'd like to connect.
          </p>
        </div>

        {/* Feature Highlights with Tactile Raised Cards */}
        <div className="space-y-2.5 text-left pt-2">
          <div className="p-3.5 sayvi-card rounded-2xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-[#1C1917]">Know who is open</h4>
              <p className="text-[11px] text-[#78716C]">
                Only connect with people who chose to be open to saying hi.
              </p>
            </div>
          </div>

          <div className="p-3.5 sayvi-card rounded-2xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
              <Shield className="w-4 h-4 text-[#3730A3]" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-[#1C1917]">Zero awkwardness & private</h4>
              <p className="text-[11px] text-[#78716C]">
                No exact GPS. Full profiles unlock only when both agree.
              </p>
            </div>
          </div>

          <div className="p-3.5 sayvi-card rounded-2xl flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
              <Coffee className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-[#1C1917]">Friends, study & networking</h4>
              <p className="text-[11px] text-[#78716C]">
                Perfect for campus, coffee spots, libraries, or events.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2.5 pt-4">
        {onQuickDemoLogin && (
          <div className="sayvi-recessed rounded-2xl p-3 text-center space-y-2">
            <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
              Quick Prototype Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onQuickDemoLogin('alex')}
                className="py-2 px-3 sayvi-btn-secondary text-xs font-semibold"
              >
                🎧 Login as Alex
              </button>
              <button
                type="button"
                onClick={() => onQuickDemoLogin('jordan')}
                className="py-2 px-3 sayvi-btn-secondary text-xs font-semibold"
              >
                🌿 Login as Jordan
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onGetStarted}
          className="w-full py-3.5 sayvi-btn-primary font-semibold text-sm cursor-pointer"
        >
          Get Started
        </button>

        <button
          type="button"
          onClick={onAlreadyHaveAccount}
          className="w-full py-3 sayvi-btn-secondary text-[#1C1917] font-semibold text-xs cursor-pointer"
        >
          I Already Have an Account
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * SIGN UP & LOGIN SCREEN (FIREBASE AUTH)
 * ------------------------------------------------------------- */
interface SignUpScreenProps {
  onSuccess: (uid: string, isNewUser: boolean) => void;
  onNavigateToLogin?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSuccess,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLoginMode) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCred.user.uid, false);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(userCred.user.uid, true);
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Email already registered. Try signing in instead.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password.');
      } else {
        setErrorMsg(error.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestOrSocialAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const cred = await signInAnonymously(auth);
      onSuccess(cred.user.uid, true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        <div className="pt-2 pb-4">
          <SayviBrandLogo showTagline={false} />
        </div>

        {/* Tactile Mode Toggle */}
        <div className="flex sayvi-recessed p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              !isLoginMode
                ? 'sayvi-btn-secondary text-[#1C1917]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              isLoginMode
                ? 'sayvi-btn-secondary text-[#1C1917]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Sign In
          </button>
        </div>

        <div className="space-y-1 mb-5">
          <h2 className="text-xl font-bold text-[#1C1917] tracking-tight">
            {isLoginMode ? 'Welcome back to SAYVI' : 'Create your SAYVI account'}
          </h2>
          <p className="text-xs text-[#78716C]">
            {isLoginMode
              ? 'Enter your credentials to access your waves and connections.'
              : 'Join a community of friendly, respectful people open to meeting.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Social logins */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={handleGuestOrSocialAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 sayvi-btn-secondary font-semibold text-[#1C1917] text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>🌐</span>
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            onClick={handleGuestOrSocialAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 sayvi-btn-secondary font-semibold text-[#1C1917] text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>🍎</span>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-[#E7E5E4]" />
          <span className="px-3 text-xs text-[#78716C] font-medium">
            or with email
          </span>
          <div className="flex-1 border-t border-[#E7E5E4]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              className="w-full px-3.5 py-2.5 sayvi-input rounded-xl text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 sayvi-input rounded-xl text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sayvi-btn-primary disabled:opacity-50 text-white font-semibold text-sm cursor-pointer flex items-center justify-center space-x-2 mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>

      <div className="pt-4">
        <p className="text-[11px] text-[#78716C] text-center leading-snug px-4">
          By signing in, you agree to SAYVI's Safe Community Guidelines. Exact GPS is never shared.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * CREATE PROFILE SCREEN
 * ------------------------------------------------------------- */
interface CreateProfileScreenProps {
  initialName?: string;
  onComplete: (
    name: string,
    age: number,
    bio: string,
    avatarEmoji: string,
    interests: string[]
  ) => void;
}

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({
  initialName = 'Alex',
  onComplete,
}) => {
  const [name, setName] = useState(initialName);
  const [ageStr, setAgeStr] = useState('21');
  const [bio, setBio] = useState(
    'Music lover and tech enthusiast. Always down for coffee and vinyl records.'
  );
  const [selectedAvatar, setSelectedAvatar] = useState('🎧');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    '🎵 Music',
    '💻 Technology',
    '☕ Coffee',
    '🎮 Gaming',
  ]);

  const avatars = ['🎧', '🎨', '🌿', '🚀', '☕', '📚', '🎬', '🎸', '🐱', '✨'];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFinish = () => {
    const parsedAge = parseInt(ageStr, 10) || 21;
    onComplete(name, parsedAge, bio, selectedAvatar, selectedInterests);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 max-w-md mx-auto flex flex-col justify-between">
      <div className="space-y-5">
        <div className="pt-2">
          <SayviBrandLogo showTagline={false} />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#1C1917] tracking-tight">
            Set up your SAYVI profile
          </h2>
          <p className="text-xs text-[#78716C]">
            Keep it simple. You're in total control of what you share.
          </p>
        </div>

        {/* Avatar Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#1C1917]">
            Choose your avatar
          </label>
          <div className="flex flex-wrap gap-2">
            {avatars.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition cursor-pointer ${
                  selectedAvatar === av
                    ? 'sayvi-btn-primary scale-105 ring-2 ring-[#3730A3] ring-offset-2'
                    : 'sayvi-btn-secondary'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Name & Age */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              First Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 sayvi-input rounded-xl text-[#1C1917] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1">
              Age
            </label>
            <input
              type="number"
              value={ageStr}
              onChange={(e) => setAgeStr(e.target.value)}
              className="w-full px-3.5 py-2.5 sayvi-input rounded-xl text-[#1C1917] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3]"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1917] mb-1">
            Short Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2.5 sayvi-input rounded-xl text-[#1C1917] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3] resize-none"
          />
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#1C1917]">
              Select interests
            </label>
            <span className="text-[11px] text-[#3730A3] font-bold">
              {selectedInterests.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1.5 sayvi-recessed rounded-xl">
            {ALL_AVAILABLE_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center space-x-1 ${
                    isSelected
                      ? 'sayvi-tag-active text-white'
                      : 'sayvi-tag text-[#1C1917]'
                  }`}
                >
                  <span>{interest}</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-3.5 sayvi-btn-primary text-white font-semibold text-sm cursor-pointer"
        >
          Complete Profile & Enter SAYVI
        </button>
      </div>
    </div>
  );
};

