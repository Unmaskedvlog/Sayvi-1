import { UserProfile } from '../types';

export const ALL_AVAILABLE_INTERESTS: string[] = [
  '🎵 Music',
  '💻 Technology',
  '☕ Coffee',
  '🎮 Gaming',
  '🎨 Art',
  '📚 Books',
  '🎬 Movies',
  '🏃 Fitness',
  '💼 Business',
  '✈️ Travel',
  '🌿 Nature',
  '🍜 Foodie',
  '📸 Photography',
  '🛹 Skateboarding',
  '✍️ Writing',
  '🐾 Pets',
];

export const USER_ALEX: UserProfile = {
  id: 'user_alex',
  firstName: 'Alex',
  age: 21,
  bio: 'Music lover and tech enthusiast. Usually working on side projects with an iced coffee.',
  avatarEmoji: '🎧',
  avatarBgHex: '#6366F1',
  interests: ['🎵 Music', '💻 Technology', '☕ Coffee', '🎮 Gaming'],
  photoPath: null,
  isOpen: true,
  vibe: 'FRIENDSHIP',
  proximity: 'VERY_CLOSE',
  venueNote: 'Campus Center / Quiet Study',
  dailyWavesRemaining: 5,
};

export const USER_JORDAN: UserProfile = {
  id: 'user_jordan',
  firstName: 'Jordan',
  age: 22,
  bio: 'Design student & indie book reader. A bit shy at first, but happy to connect over a brew.',
  avatarEmoji: '🎨',
  avatarBgHex: '#EC4899',
  interests: ['🎨 Art', '📚 Books', '☕ Coffee', '🎵 Music'],
  photoPath: null,
  isOpen: true,
  vibe: 'COFFEE_STUDY',
  proximity: 'VERY_CLOSE',
  venueNote: 'Art Annex / Courtyard',
  dailyWavesRemaining: 5,
};

export const USER_MAYA: UserProfile = {
  id: 'user_maya',
  firstName: 'Maya',
  age: 20,
  bio: 'Architecture undergrad sketching around campus. Open for friendly study breaks.',
  avatarEmoji: '📐',
  avatarBgHex: '#10B981',
  interests: ['🎨 Art', '☕ Coffee', '✈️ Travel', '📸 Photography'],
  photoPath: null,
  isOpen: true,
  vibe: 'FRIENDSHIP',
  proximity: 'NEARBY',
  venueNote: 'Main Library Floor 2',
  dailyWavesRemaining: 5,
};

export const USER_SAM: UserProfile = {
  id: 'user_sam',
  firstName: 'Sam',
  age: 23,
  bio: 'Film buff and runner. Working on an indie short film script at the moment.',
  avatarEmoji: '🎬',
  avatarBgHex: '#F59E0B',
  interests: ['🎬 Movies', '🏃 Fitness', '💻 Technology', '✍️ Writing'],
  photoPath: null,
  isOpen: true,
  vibe: 'CASUAL_CHAT',
  proximity: 'NEARBY',
  venueNote: 'Espresso Lounge',
  dailyWavesRemaining: 5,
};

export const USER_ELENA: UserProfile = {
  id: 'user_elena',
  firstName: 'Elena',
  age: 21,
  bio: 'Psychology major & plant mom. Listening to indie playlists and reading.',
  avatarEmoji: '🌿',
  avatarBgHex: '#8B5CF6',
  interests: ['🎵 Music', '🌿 Nature', '📚 Books', '🍜 Foodie'],
  photoPath: null,
  isOpen: true,
  vibe: 'FRIENDSHIP',
  proximity: 'IN_THE_AREA',
  venueNote: 'Botanical Garden Bench',
  dailyWavesRemaining: 5,
};

export const USER_LEO: UserProfile = {
  id: 'user_leo',
  firstName: 'Leo',
  age: 24,
  bio: "Building software startups and organizing weekend board games. Say hi if you're open to networking!",
  avatarEmoji: '🚀',
  avatarBgHex: '#0EA5E9',
  interests: ['💼 Business', '💻 Technology', '🎮 Gaming', '☕ Coffee'],
  photoPath: null,
  isOpen: true,
  vibe: 'NETWORKING',
  proximity: 'IN_THE_AREA',
  venueNote: 'Innovation Hub',
  dailyWavesRemaining: 5,
};

export const INITIAL_ALL_USERS: UserProfile[] = [
  USER_ALEX,
  USER_JORDAN,
  USER_MAYA,
  USER_SAM,
  USER_ELENA,
  USER_LEO,
];
