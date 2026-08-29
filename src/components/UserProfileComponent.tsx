import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, Database, Trash2, Edit3, User, Video, VideoOff } from 'lucide-react';
import { UserProfile, UserProfileEntity } from '../types';

interface UserProfileComponentProps {
  user: UserProfile;
  savedEntity?: UserProfileEntity | null;
  onSaveToRoom: (displayName: string, bio: string, photoPath: string | null, age: number) => void;
  onPhotoUpdated?: (photoPath: string | null) => void;
  compactMode?: boolean;
}

export const UserProfileComponent: React.FC<UserProfileComponentProps> = ({
  user,
  savedEntity,
  onSaveToRoom,
  onPhotoUpdated,
}) => {
  const [displayName, setDisplayName] = useState(savedEntity?.displayName || user.firstName);
  const [bio, setBio] = useState(savedEntity?.bio || user.bio);
  const [currentPhotoPath, setCurrentPhotoPath] = useState<string | null>(savedEntity?.photoPath || user.photoPath || null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);
  
  // Camera Modal & Capture state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDisplayName(savedEntity?.displayName || user.firstName);
    setBio(savedEntity?.bio || user.bio);
    setCurrentPhotoPath(savedEntity?.photoPath || user.photoPath || null);
  }, [user.id, user.firstName, user.bio, user.photoPath, savedEntity]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSavedSuccess) {
      timer = setTimeout(() => setShowSavedSuccess(false), 3500);
    }
    return () => clearTimeout(timer);
  }, [showSavedSuccess]);

  // Start Camera Stream
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access not granted or unavailable. You can also upload a photo.');
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture Snapshot from Camera
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCurrentPhotoPath(dataUrl);
      if (onPhotoUpdated) onPhotoUpdated(dataUrl);
      onSaveToRoom(displayName, bio, dataUrl, user.age);
      setShowSavedSuccess(true);
    }
    stopCamera();
  };

  // Handle File Upload as fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentPhotoPath(result);
        if (onPhotoUpdated) onPhotoUpdated(result);
        onSaveToRoom(displayName, bio, result, user.age);
        setShowSavedSuccess(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    setTimeout(() => {
      onSaveToRoom(displayName, bio, currentPhotoPath, user.age);
      setIsSaving(false);
      setShowSavedSuccess(true);
    }, 400);
  };

  const handleRemovePhoto = () => {
    setCurrentPhotoPath(null);
    if (onPhotoUpdated) onPhotoUpdated(null);
    onSaveToRoom(displayName, bio, null, user.age);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F5F5F4] flex items-center justify-center text-[#1C1917]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1917] text-base">User Profile</h3>
            <p className="text-xs text-[#78716C]">Edit your profile and Room persistence</p>
          </div>
        </div>

        {/* Room SQLite badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#F5F5F4] border border-[#E7E5E4] text-[#1C1917] rounded-lg text-xs font-medium">
          <Database className="w-3.5 h-3.5 text-[#3730A3]" />
          <span>Room SQLite</span>
        </div>
      </div>

      {/* Main Avatar / Photo Container */}
      <div className="flex flex-col items-center py-5">
        <div className="relative group">
          <div
            onClick={startCamera}
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E7E5E4] shadow-2xs flex items-center justify-center cursor-pointer relative bg-[#F5F5F4] transition-transform active:scale-95"
            style={{ backgroundColor: currentPhotoPath ? '#F5F5F4' : user.avatarBgHex }}
          >
            {currentPhotoPath ? (
              <img
                src={currentPhotoPath}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl select-none">{user.avatarEmoji}</span>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">Change</span>
            </div>
          </div>

          {/* Camera Button overlay */}
          <button
            type="button"
            onClick={startCamera}
            title="Open Camera"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#3730A3] hover:bg-[#312E81] text-white flex items-center justify-center shadow-xs border-2 border-white cursor-pointer transition-transform active:scale-90"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Photo actions row */}
        <div className="flex items-center space-x-2 mt-3.5">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#3730A3] text-xs font-medium transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{currentPhotoPath ? 'Retake Photo' : 'Take Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#1C1917] text-xs font-medium transition cursor-pointer"
          >
            Upload
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {currentPhotoPath && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FAFAF9] hover:bg-rose-50 text-[#78716C] hover:text-rose-600 text-xs font-medium transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-[#1C1917] mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3.5 py-2.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3] transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-[#1C1917]">
              Short Bio
            </label>
            <span className="text-[11px] text-[#78716C]">{bio.length}/150</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => {
              if (e.target.value.length <= 150) setBio(e.target.value);
            }}
            placeholder="What are you up to? Coffee, study, or open to chat..."
            rows={3}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E7E5E4] rounded-xl text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none focus:ring-2 focus:ring-[#3730A3] transition resize-none"
          />
        </div>

        {/* Success feedback message */}
        {showSavedSuccess && (
          <div className="flex items-center space-x-2 p-3 bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] rounded-xl text-xs font-medium animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-[#0D9488] shrink-0" />
            <span>Profile and photo persisted to Room database</span>
          </div>
        )}

        {/* Database metadata banner */}
        <div className="p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-xs space-y-1">
          <div className="flex items-center justify-between text-[#78716C] font-medium">
            <span>Room Table: <code className="text-[#3730A3] font-mono">user_profile</code></span>
            <span className="text-[#A8A29E]">
              {savedEntity?.updatedAt
                ? `Last saved: ${new Date(savedEntity.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Synced'}
            </span>
          </div>
          <p className="text-[#78716C] text-[11px]">
            Photo: {currentPhotoPath ? '📸 Camera Snapshot Stored' : 'Default Avatar Emoji'}
          </p>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !displayName.trim()}
          className="w-full py-3 bg-[#3730A3] hover:bg-[#312E81] disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
        >
          {isSaving ? (
            <span>Saving to Room...</span>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              <span>Save Profile to Room</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-[0_4px_24px_rgba(0,0,0,0.12)] space-y-4 border border-[#E7E5E4]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-[#3730A3]" />
                <h4 className="font-semibold text-sm text-[#1C1917]">Take Profile Photo</h4>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-3">
                <p>{cameraError}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium cursor-pointer"
                  >
                    Upload File Instead
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Face Guide circle */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-full m-8 border-dashed" />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className="flex items-center space-x-2 px-5 py-2 bg-[#3730A3] hover:bg-[#312E81] text-white font-semibold text-xs rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.08)] cursor-pointer active:scale-95 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
