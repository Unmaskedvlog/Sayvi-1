package com.example.model

enum class Proximity(val label: String, val badgeColorHex: Long) {
  VERY_CLOSE("Very close", 0xFF10B981),
  NEARBY("Nearby", 0xFF6366F1),
  IN_THE_AREA("In the area", 0xFF8B5CF6)
}

enum class ConnectionVibe(val label: String, val emoji: String) {
  FRIENDSHIP("Make Friends", "🤝"),
  DATING("Dating", "✨"),
  NETWORKING("Networking", "💼"),
  COFFEE_STUDY("Coffee & Study", "☕"),
  CASUAL_CHAT("Casual Chat", "💬")
}

data class UserProfile(
  val id: String,
  val firstName: String,
  val age: Int,
  val bio: String,
  val avatarEmoji: String,
  val avatarBgHex: Long,
  val interests: List<String>,
  val photoPath: String? = null,
  val isOpen: Boolean = true,
  val vibe: ConnectionVibe = ConnectionVibe.FRIENDSHIP,
  val proximity: Proximity = Proximity.NEARBY,
  val venueNote: String = "Campus Library / Cafe Area",
  val dailyWavesRemaining: Int = 5
)

enum class WaveStatus {
  PENDING,
  ACCEPTED,
  DECLINED,
  MAYBE_LATER
}

data class SayviWave(
  val id: String,
  val fromUserId: String,
  val toUserId: String,
  val timestamp: Long = System.currentTimeMillis(),
  val status: WaveStatus = WaveStatus.PENDING,
  val note: String = "Someone nearby would like to say hi."
)

data class Connection(
  val id: String,
  val partnerUser: UserProfile,
  val connectedAt: Long = System.currentTimeMillis(),
  val lastMessage: String = "Say hello! You both were open to meeting.",
  val lastMessageTime: String = "Just now",
  val unreadCount: Int = 0
)

data class ChatMessage(
  val id: String,
  val connectionId: String,
  val senderId: String,
  val text: String,
  val timestamp: Long = System.currentTimeMillis(),
  val isMe: Boolean = true
)

enum class ReportCategory(val title: String) {
  SPAM_OR_BOT("Spam or Advertising"),
  HARASSMENT("Harassment or Inappropriate Behavior"),
  UNCOMFORTABLE("Made me feel uncomfortable"),
  IMPERSONATION("Fake account or Impersonation"),
  OTHER("Other Safety Concern")
}

data class PrivacySettings(
  val ghostMode: Boolean = false,
  val approximateDistanceOnly: Boolean = true,
  val allowWavesFrom: String = "Everyone Open Nearby",
  val inAppBannersOnly: Boolean = true,
  val pauseAllNotifications: Boolean = false
)
