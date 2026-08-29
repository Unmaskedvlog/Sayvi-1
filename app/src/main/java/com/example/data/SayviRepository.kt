package com.example.data

import com.example.data.local.UserProfileDao
import com.example.data.local.UserProfileEntity
import com.example.model.ChatMessage
import com.example.model.Connection
import com.example.model.PrivacySettings
import com.example.model.ReportCategory
import com.example.model.SayviWave
import com.example.model.UserProfile
import com.example.model.WaveStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SayviAppState(
  val currentUser: UserProfile = SampleData.userAlex,
  val allUsers: List<UserProfile> = listOf(
    SampleData.userAlex,
    SampleData.userJordan,
    SampleData.userMaya,
    SampleData.userSam,
    SampleData.userElena,
    SampleData.userLeo
  ),
  val savedRoomEntity: UserProfileEntity? = null,
  val sentWaves: Map<String, SayviWave> = emptyMap(), // key: toUserId
  val incomingWaves: List<SayviWave> = emptyList(),
  val connections: List<Connection> = emptyList(),
  val messages: Map<String, List<ChatMessage>> = emptyMap(), // key: connectionId
  val blockedUserIds: Set<String> = emptySet(),
  val privacySettings: PrivacySettings = PrivacySettings(),
  val activeIncomingWaveModal: SayviWave? = null,
  val activeMutualMatchModal: UserProfile? = null,
  val lastSentTargetUser: UserProfile? = null,
  val showSentConfirmationModal: Boolean = false,
  val isSimulatedTyping: Boolean = false
)

class SayviRepository(
  private val userProfileDao: UserProfileDao? = null,
  private val coroutineScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
) {
  private val _state = MutableStateFlow(SayviAppState())
  val state: StateFlow<SayviAppState> = _state.asStateFlow()

  init {
    loadProfileFromRoom()
  }

  private fun loadProfileFromRoom() {
    if (userProfileDao == null) return
    coroutineScope.launch {
      try {
        val currentUserId = _state.value.currentUser.id
        val entity = userProfileDao.getUserProfile(currentUserId)
        if (entity != null) {
          applyEntityToCurrentUser(entity)
        } else {
          // Seed Room with the initial current user profile
          val initUser = _state.value.currentUser
          val newEntity = UserProfileEntity(
            id = initUser.id,
            displayName = initUser.firstName,
            bio = initUser.bio,
            photoPath = initUser.photoPath,
            avatarEmoji = initUser.avatarEmoji,
            avatarBgHex = initUser.avatarBgHex,
            age = initUser.age,
            interestsCsv = initUser.interests.joinToString(","),
            isOpen = initUser.isOpen
          )
          userProfileDao.insertOrUpdate(newEntity)
          _state.update { it.copy(savedRoomEntity = newEntity) }
        }
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }
  }

  private fun applyEntityToCurrentUser(entity: UserProfileEntity) {
    _state.update { current ->
      val updatedUser = current.currentUser.copy(
        firstName = entity.displayName,
        bio = entity.bio,
        photoPath = entity.photoPath,
        avatarEmoji = entity.avatarEmoji,
        avatarBgHex = entity.avatarBgHex,
        age = entity.age,
        interests = if (entity.interestsCsv.isNotBlank()) entity.interestsCsv.split(",") else current.currentUser.interests,
        isOpen = entity.isOpen
      )
      val updatedAll = current.allUsers.map { if (it.id == updatedUser.id) updatedUser else it }
      current.copy(
        currentUser = updatedUser,
        allUsers = updatedAll,
        savedRoomEntity = entity
      )
    }
  }

  fun saveProfileToRoom(
    displayName: String,
    bio: String,
    photoPath: String?,
    age: Int
  ) {
    val current = _state.value.currentUser
    val updatedUser = current.copy(
      firstName = displayName.trim().ifBlank { current.firstName },
      bio = bio.trim().ifBlank { current.bio },
      photoPath = photoPath,
      age = age
    )
    val entity = UserProfileEntity(
      id = updatedUser.id,
      displayName = updatedUser.firstName,
      bio = updatedUser.bio,
      photoPath = updatedUser.photoPath,
      avatarEmoji = updatedUser.avatarEmoji,
      avatarBgHex = updatedUser.avatarBgHex,
      age = updatedUser.age,
      interestsCsv = updatedUser.interests.joinToString(","),
      isOpen = updatedUser.isOpen,
      updatedAt = System.currentTimeMillis()
    )

    _state.update { state ->
      val updatedAll = state.allUsers.map { if (it.id == updatedUser.id) updatedUser else it }
      state.copy(
        currentUser = updatedUser,
        allUsers = updatedAll,
        savedRoomEntity = entity
      )
    }

    if (userProfileDao != null) {
      coroutineScope.launch {
        try {
          userProfileDao.insertOrUpdate(entity)
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
    }
  }

  fun updateProfilePhoto(photoPath: String?) {
    val current = _state.value.currentUser
    saveProfileToRoom(
      displayName = current.firstName,
      bio = current.bio,
      photoPath = photoPath,
      age = current.age
    )
  }

  fun toggleOpenStatus() {
    _state.update { current ->
      val updatedUser = current.currentUser.copy(isOpen = !current.currentUser.isOpen)
      val updatedAll = current.allUsers.map { if (it.id == updatedUser.id) updatedUser else it }
      current.copy(
        currentUser = updatedUser,
        allUsers = updatedAll
      )
    }

    // Persist open status to Room
    val user = _state.value.currentUser
    if (userProfileDao != null) {
      coroutineScope.launch {
        try {
          val entity = UserProfileEntity(
            id = user.id,
            displayName = user.firstName,
            bio = user.bio,
            photoPath = user.photoPath,
            avatarEmoji = user.avatarEmoji,
            avatarBgHex = user.avatarBgHex,
            age = user.age,
            interestsCsv = user.interests.joinToString(","),
            isOpen = user.isOpen,
            updatedAt = System.currentTimeMillis()
          )
          userProfileDao.insertOrUpdate(entity)
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
    }
  }

  fun updateCurrentUserProfile(
    name: String,
    age: Int,
    bio: String,
    avatarEmoji: String,
    interests: List<String>,
    photoPath: String? = null
  ) {
    val resolvedPhoto = photoPath ?: _state.value.currentUser.photoPath
    _state.update { current ->
      val updated = current.currentUser.copy(
        firstName = name,
        age = age,
        bio = bio,
        avatarEmoji = avatarEmoji,
        interests = interests,
        photoPath = resolvedPhoto
      )
      val updatedAll = current.allUsers.map { if (it.id == updated.id) updated else it }
      current.copy(
        currentUser = updated,
        allUsers = updatedAll
      )
    }

    if (userProfileDao != null) {
      val user = _state.value.currentUser
      coroutineScope.launch {
        try {
          val entity = UserProfileEntity(
            id = user.id,
            displayName = user.firstName,
            bio = user.bio,
            photoPath = user.photoPath,
            avatarEmoji = user.avatarEmoji,
            avatarBgHex = user.avatarBgHex,
            age = user.age,
            interestsCsv = user.interests.joinToString(","),
            isOpen = user.isOpen,
            updatedAt = System.currentTimeMillis()
          )
          userProfileDao.insertOrUpdate(entity)
          _state.update { it.copy(savedRoomEntity = entity) }
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
    }
  }

  fun switchActiveUser(userId: String) {
    _state.update { current ->
      val targetUser = current.allUsers.find { it.id == userId } ?: current.currentUser
      current.copy(
        currentUser = targetUser,
        activeIncomingWaveModal = null,
        activeMutualMatchModal = null,
        showSentConfirmationModal = false
      )
    }
    loadProfileFromRoom()
  }

  fun sendSayvi(targetUser: UserProfile) {
    _state.update { current ->
      if (current.currentUser.dailyWavesRemaining <= 0) return@update current
      val waveId = "wave_${current.currentUser.id}_${targetUser.id}_${System.currentTimeMillis()}"
      val newWave = SayviWave(
        id = waveId,
        fromUserId = current.currentUser.id,
        toUserId = targetUser.id,
        status = WaveStatus.PENDING
      )

      val updatedSent = current.sentWaves.toMutableMap()
      updatedSent[targetUser.id] = newWave

      // If target user is also logged in or we are testing prototype:
      // if targetUser is Jordan and current is Alex, Jordan gets an incoming wave!
      val updatedIncoming = current.incomingWaves.toMutableList()
      updatedIncoming.add(newWave)

      val updatedUser = current.currentUser.copy(
        dailyWavesRemaining = (current.currentUser.dailyWavesRemaining - 1).coerceAtLeast(0)
      )

      current.copy(
        currentUser = updatedUser,
        sentWaves = updatedSent,
        incomingWaves = updatedIncoming,
        lastSentTargetUser = targetUser,
        showSentConfirmationModal = true
      )
    }
  }

  fun dismissSentConfirmation() {
    _state.update { it.copy(showSentConfirmationModal = false) }
  }

  fun respondToWave(wave: SayviWave, accept: Boolean, maybeLater: Boolean = false) {
    _state.update { current ->
      val senderUser = current.allUsers.find { it.id == wave.fromUserId } ?: return@update current
      val newStatus = when {
        accept -> WaveStatus.ACCEPTED
        maybeLater -> WaveStatus.MAYBE_LATER
        else -> WaveStatus.DECLINED
      }

      val updatedIncoming = current.incomingWaves.filter { it.id != wave.id }

      if (accept) {
        val connectionId = "conn_${wave.fromUserId}_${wave.toUserId}"
        val existing = current.connections.find { it.id == connectionId }
        val newConnections = if (existing == null) {
          val newConn = Connection(
            id = connectionId,
            partnerUser = senderUser,
            lastMessage = "You both said hi! 👋"
          )
          // Add initial icebreaker welcome message
          val initMsg = ChatMessage(
            id = "msg_init_${System.currentTimeMillis()}",
            connectionId = connectionId,
            senderId = senderUser.id,
            text = "👋 Hey! Glad we're both open to connecting.",
            isMe = false
          )
          val updatedMsgs = current.messages.toMutableMap()
          updatedMsgs[connectionId] = listOf(initMsg)

          current.copy(
            incomingWaves = updatedIncoming,
            connections = listOf(newConn) + current.connections,
            messages = updatedMsgs,
            activeIncomingWaveModal = null,
            activeMutualMatchModal = senderUser
          )
        } else {
          current.copy(
            incomingWaves = updatedIncoming,
            activeIncomingWaveModal = null,
            activeMutualMatchModal = senderUser
          )
        }
        newConnections
      } else {
        current.copy(
          incomingWaves = updatedIncoming,
          activeIncomingWaveModal = null
        )
      }
    }
  }

  fun dismissMutualMatch() {
    _state.update { it.copy(activeMutualMatchModal = null) }
  }

  fun triggerSimulatedIncomingWaveFrom(sender: UserProfile) {
    _state.update { current ->
      val wave = SayviWave(
        id = "sim_wave_${sender.id}_${System.currentTimeMillis()}",
        fromUserId = sender.id,
        toUserId = current.currentUser.id,
        status = WaveStatus.PENDING
      )
      current.copy(
        incomingWaves = listOf(wave) + current.incomingWaves.filter { it.fromUserId != sender.id },
        activeIncomingWaveModal = wave
      )
    }
  }

  fun showIncomingWave(wave: SayviWave) {
    _state.update { it.copy(activeIncomingWaveModal = wave) }
  }

  fun dismissIncomingWaveModal() {
    _state.update { it.copy(activeIncomingWaveModal = null) }
  }

  fun sendMessage(connectionId: String, text: String) {
    if (text.isBlank()) return
    val user = _state.value.currentUser

    _state.update { current ->
      val msgList = current.messages[connectionId]?.toMutableList() ?: mutableListOf()
      val newMsg = ChatMessage(
        id = "msg_${System.currentTimeMillis()}",
        connectionId = connectionId,
        senderId = user.id,
        text = text.trim(),
        isMe = true
      )
      msgList.add(newMsg)

      val updatedMsgs = current.messages.toMutableMap()
      updatedMsgs[connectionId] = msgList

      val updatedConnections = current.connections.map { conn ->
        if (conn.id == connectionId) {
          conn.copy(
            lastMessage = text.trim(),
            lastMessageTime = "Just now"
          )
        } else conn
      }

      current.copy(
        messages = updatedMsgs,
        connections = updatedConnections
      )
    }
  }

  fun simulatePartnerReply(connectionId: String, partner: UserProfile, replyText: String) {
    _state.update { current ->
      val msgList = current.messages[connectionId]?.toMutableList() ?: mutableListOf()
      val newMsg = ChatMessage(
        id = "msg_reply_${System.currentTimeMillis()}",
        connectionId = connectionId,
        senderId = partner.id,
        text = replyText,
        isMe = false
      )
      msgList.add(newMsg)

      val updatedMsgs = current.messages.toMutableMap()
      updatedMsgs[connectionId] = msgList

      val updatedConnections = current.connections.map { conn ->
        if (conn.id == connectionId) {
          conn.copy(
            lastMessage = replyText,
            lastMessageTime = "Just now",
            unreadCount = conn.unreadCount + 1
          )
        } else conn
      }

      current.copy(
        messages = updatedMsgs,
        connections = updatedConnections,
        isSimulatedTyping = false
      )
    }
  }

  fun blockUser(targetUserId: String, reason: String) {
    _state.update { current ->
      val updatedBlocked = current.blockedUserIds + targetUserId
      val updatedConnections = current.connections.filter { it.partnerUser.id != targetUserId }
      val updatedIncoming = current.incomingWaves.filter { it.fromUserId != targetUserId }
      val updatedSent = current.sentWaves.filterKeys { it != targetUserId }

      current.copy(
        blockedUserIds = updatedBlocked,
        connections = updatedConnections,
        incomingWaves = updatedIncoming,
        sentWaves = updatedSent
      )
    }
  }

  fun unblockUser(targetUserId: String) {
    _state.update { current ->
      current.copy(blockedUserIds = current.blockedUserIds - targetUserId)
    }
  }

  fun reportUser(targetUserId: String, category: ReportCategory, notes: String) {
    // Automatically blocks reported user
    blockUser(targetUserId, "Reported: ${category.title}")
  }

  fun updatePrivacySettings(settings: PrivacySettings) {
    _state.update { it.copy(privacySettings = settings) }
  }

  fun createAccount(firstName: String, age: Int, bio: String, avatarEmoji: String, interests: List<String>) {
    val newId = "user_custom_${System.currentTimeMillis()}"
    val newUser = UserProfile(
      id = newId,
      firstName = firstName.ifBlank { "You" },
      age = if (age > 0) age else 21,
      bio = bio.ifBlank { "Open to making friendly connections nearby." },
      avatarEmoji = avatarEmoji,
      avatarBgHex = 0xFF6366F1,
      interests = if (interests.isNotEmpty()) interests else listOf("☕ Coffee", "🎵 Music"),
      isOpen = true
    )
    _state.update { current ->
      current.copy(
        currentUser = newUser,
        allUsers = listOf(newUser) + current.allUsers
      )
    }
  }
}
