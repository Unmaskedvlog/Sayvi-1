package com.example.data

import com.example.model.ConnectionVibe
import com.example.model.Proximity
import com.example.model.UserProfile

object SampleData {
  val allAvailableInterests = listOf(
    "🎵 Music",
    "💻 Technology",
    "☕ Coffee",
    "🎮 Gaming",
    "🎨 Art",
    "📚 Books",
    "🎬 Movies",
    "🏃 Fitness",
    "💼 Business",
    "✈️ Travel",
    "🌿 Nature",
    "🍜 Foodie",
    "📸 Photography",
    "🛹 Skateboarding",
    "✍️ Writing",
    "🐾 Pets"
  )

  val userAlex = UserProfile(
    id = "user_alex",
    firstName = "Alex",
    age = 21,
    bio = "Music lover and tech enthusiast. Usually working on side projects with an iced coffee.",
    avatarEmoji = "🎧",
    avatarBgHex = 0xFF6366F1,
    interests = listOf("🎵 Music", "💻 Technology", "☕ Coffee", "🎮 Gaming"),
    isOpen = true,
    vibe = ConnectionVibe.FRIENDSHIP,
    proximity = Proximity.VERY_CLOSE,
    venueNote = "Campus Center / Quiet Study"
  )

  val userJordan = UserProfile(
    id = "user_jordan",
    firstName = "Jordan",
    age = 22,
    bio = "Design student & indie book reader. A bit shy at first, but happy to connect over a brew.",
    avatarEmoji = "🎨",
    avatarBgHex = 0xFFEC4899,
    interests = listOf("🎨 Art", "📚 Books", "☕ Coffee", "🎵 Music"),
    isOpen = true,
    vibe = ConnectionVibe.COFFEE_STUDY,
    proximity = Proximity.VERY_CLOSE,
    venueNote = "Art Annex / Courtyard"
  )

  val userMaya = UserProfile(
    id = "user_maya",
    firstName = "Maya",
    age = 20,
    bio = "Architecture undergrad sketching around campus. Open for friendly study breaks.",
    avatarEmoji = "📐",
    avatarBgHex = 0xFF10B981,
    interests = listOf("🎨 Art", "☕ Coffee", "✈️ Travel", "📸 Photography"),
    isOpen = true,
    vibe = ConnectionVibe.FRIENDSHIP,
    proximity = Proximity.NEARBY,
    venueNote = "Main Library Floor 2"
  )

  val userSam = UserProfile(
    id = "user_sam",
    firstName = "Sam",
    age = 23,
    bio = "Film buff and runner. Working on an indie short film script at the moment.",
    avatarEmoji = "🎬",
    avatarBgHex = 0xFFF59E0B,
    interests = listOf("🎬 Movies", "🏃 Fitness", "💻 Technology", "✍️ Writing"),
    isOpen = true,
    vibe = ConnectionVibe.CASUAL_CHAT,
    proximity = Proximity.NEARBY,
    venueNote = "Espresso Lounge"
  )

  val userElena = UserProfile(
    id = "user_elena",
    firstName = "Elena",
    age = 21,
    bio = "Psychology major & plant mom. Listening to indie playlists and reading.",
    avatarEmoji = "🌿",
    avatarBgHex = 0xFF8B5CF6,
    interests = listOf("🎵 Music", "🌿 Nature", "📚 Books", "🍜 Foodie"),
    isOpen = true,
    vibe = ConnectionVibe.FRIENDSHIP,
    proximity = Proximity.IN_THE_AREA,
    venueNote = "Botanical Garden Bench"
  )

  val userLeo = UserProfile(
    id = "user_leo",
    firstName = "Leo",
    age = 24,
    bio = "Building software startups and organizing weekend board games. Say hi if you're open to networking!",
    avatarEmoji = "🚀",
    avatarBgHex = 0xFF0EA5E9,
    interests = listOf("💼 Business", "💻 Technology", "🎮 Gaming", "☕ Coffee"),
    isOpen = true,
    vibe = ConnectionVibe.NETWORKING,
    proximity = Proximity.IN_THE_AREA,
    venueNote = "Innovation Hub"
  )

  val initialNearbyUsers = listOf(
    userJordan,
    userMaya,
    userSam,
    userElena,
    userLeo
  )
}
