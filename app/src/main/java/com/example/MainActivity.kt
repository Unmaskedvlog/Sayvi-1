package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SayviRepository
import com.example.data.local.SayviDatabase
import com.example.model.Connection
import com.example.model.ReportCategory
import com.example.model.UserProfile
import com.example.ui.components.BlockUserDialog
import com.example.ui.components.IncomingWaveDialog
import com.example.ui.components.MutualMatchCelebrationDialog
import com.example.ui.components.PrototypeSimulatorBar
import com.example.ui.components.ReportUserDialog
import com.example.ui.components.SafetyGuidelinesModal
import com.example.ui.components.SayviSentDialog
import com.example.ui.screens.BlockedUsersScreen
import com.example.ui.screens.ChatScreen
import com.example.ui.screens.ConnectionsScreen
import com.example.ui.screens.CreateProfileScreen
import com.example.ui.screens.EditProfileDialog
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.NearbyScreen
import com.example.ui.screens.PrivacySettingsScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.SignUpScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.screens.WelcomeScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.SayviBgLight
import com.example.ui.theme.SayviBorderLight
import com.example.ui.theme.SayviIndigoDark
import com.example.ui.theme.SayviIndigoLight
import com.example.ui.theme.SayviIndigoPrimary
import com.example.ui.theme.SayviRoseAccent
import com.example.ui.theme.SayviTextMuted
import com.example.ui.theme.SayviTextPrimary
import com.example.ui.theme.SayviTextSecondary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class AppNavScreen {
  SPLASH,
  WELCOME,
  SIGN_UP,
  CREATE_PROFILE,
  MAIN_APP
}

enum class BottomTab(val title: String) {
  HOME("Home"),
  NEARBY("Nearby"),
  CONNECTIONS("Connections"),
  PROFILE("Profile")
}

enum class SubScreen {
  NONE,
  CHAT,
  PRIVACY_SETTINGS,
  BLOCKED_USERS
}

class MainActivity : ComponentActivity() {
  private lateinit var repository: SayviRepository

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val database = SayviDatabase.getDatabase(applicationContext)
    repository = SayviRepository(database.userProfileDao())
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        SayviAppRoot(repository = repository)
      }
    }
  }
}

@Composable
fun SayviAppRoot(repository: SayviRepository) {
  val state by repository.state.collectAsState()
  val scope = rememberCoroutineScope()

  var currentNavScreen by remember { mutableStateOf(AppNavScreen.SPLASH) }
  var currentBottomTab by remember { mutableStateOf(BottomTab.HOME) }
  var currentSubScreen by remember { mutableStateOf(SubScreen.NONE) }
  var activeChatConnection by remember { mutableStateOf<Connection?>(null) }

  // Modal dialog states
  var userToBlock by remember { mutableStateOf<UserProfile?>(null) }
  var userToReport by remember { mutableStateOf<UserProfile?>(null) }
  var showSafetyModal by remember { mutableStateOf(false) }
  var showEditProfileDialog by remember { mutableStateOf(false) }

  when (currentNavScreen) {
    AppNavScreen.SPLASH -> {
      SplashScreen(
        onFinish = { currentNavScreen = AppNavScreen.WELCOME }
      )
    }

    AppNavScreen.WELCOME -> {
      WelcomeScreen(
        onGetStarted = { currentNavScreen = AppNavScreen.SIGN_UP },
        onAlreadyHaveAccount = { currentNavScreen = AppNavScreen.MAIN_APP }
      )
    }

    AppNavScreen.SIGN_UP -> {
      SignUpScreen(
        onSuccess = { currentNavScreen = AppNavScreen.CREATE_PROFILE },
        onNavigateToLogin = { currentNavScreen = AppNavScreen.MAIN_APP }
      )
    }

    AppNavScreen.CREATE_PROFILE -> {
      CreateProfileScreen(
        onComplete = { name, age, bio, avatar, interests ->
          repository.createAccount(name, age, bio, avatar, interests)
          currentNavScreen = AppNavScreen.MAIN_APP
        }
      )
    }

    AppNavScreen.MAIN_APP -> {
      if (currentSubScreen == SubScreen.CHAT && activeChatConnection != null) {
        val conn = activeChatConnection!!
        val msgs = state.messages[conn.id] ?: emptyList()
        ChatScreen(
          connection = conn,
          messages = msgs,
          onSendMessage = { text ->
            repository.sendMessage(conn.id, text)

            // Simulate partner realistic gentle reply after 1.2s for prototype demonstration
            scope.launch {
              delay(1200)
              val reply = when {
                text.contains("Hey", ignoreCase = true) -> "👋 Hey there! So cool to connect without the usual awkwardness."
                text.contains("coffee", ignoreCase = true) -> "☕ Yes! I was just getting an iced latte. Are you nearby?"
                text.contains("music", ignoreCase = true) -> "🎵 Absolutely, I love finding new indie artists and vinyl."
                else -> "Great to meet you! Happy we both sent a SAYVI 👋"
              }
              repository.simulatePartnerReply(conn.id, conn.partnerUser, reply)
            }
          },
          onSimulateReply = { replyText ->
            repository.simulatePartnerReply(conn.id, conn.partnerUser, replyText)
          },
          onBack = { currentSubScreen = SubScreen.NONE },
          onBlockUser = {
            userToBlock = conn.partnerUser
          },
          onReportUser = {
            userToReport = conn.partnerUser
          },
          onShowSafetyTips = { showSafetyModal = true }
        )
      } else if (currentSubScreen == SubScreen.PRIVACY_SETTINGS) {
        PrivacySettingsScreen(
          settings = state.privacySettings,
          onUpdateSettings = { repository.updatePrivacySettings(it) },
          onBack = { currentSubScreen = SubScreen.NONE }
        )
      } else if (currentSubScreen == SubScreen.BLOCKED_USERS) {
        BlockedUsersScreen(
          blockedIds = state.blockedUserIds,
          allUsers = state.allUsers,
          onUnblock = { repository.unblockUser(it) },
          onBack = { currentSubScreen = SubScreen.NONE }
        )
      } else {
        // Main Tab Scaffold
        Scaffold(
          topBar = {
            // Prototype Simulator bar visible on top for easy review and testing
            PrototypeSimulatorBar(
              currentUserId = state.currentUser.id,
              allUsers = state.allUsers,
              onSwitchUser = { repository.switchActiveUser(it) },
              onSimulateIncomingWave = { sender ->
                repository.triggerSimulatedIncomingWaveFrom(sender)
              }
            )
          },
          bottomBar = {
            NavigationBar(
              containerColor = Color.White,
              tonalElevation = 6.dp
            ) {
              // HOME TAB
              NavigationBarItem(
                selected = currentBottomTab == BottomTab.HOME,
                onClick = { currentBottomTab = BottomTab.HOME },
                icon = {
                  Icon(imageVector = Icons.Default.Home, contentDescription = "Home")
                },
                label = { Text("Home", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                colors = NavigationBarItemDefaults.colors(
                  selectedIconColor = SayviIndigoPrimary,
                  selectedTextColor = SayviIndigoPrimary,
                  indicatorColor = SayviIndigoLight
                )
              )

              // NEARBY TAB
              val nearbyCount = state.allUsers.count { it.id != state.currentUser.id && it.isOpen && !state.blockedUserIds.contains(it.id) }
              NavigationBarItem(
                selected = currentBottomTab == BottomTab.NEARBY,
                onClick = { currentBottomTab = BottomTab.NEARBY },
                icon = {
                  BadgedBox(badge = {
                    if (state.currentUser.isOpen && nearbyCount > 0) {
                      Badge(containerColor = SayviIndigoPrimary) {
                        Text("$nearbyCount", color = Color.White)
                      }
                    }
                  }) {
                    Icon(imageVector = Icons.Default.LocationOn, contentDescription = "Nearby")
                  }
                },
                label = { Text("Nearby", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                colors = NavigationBarItemDefaults.colors(
                  selectedIconColor = SayviIndigoPrimary,
                  selectedTextColor = SayviIndigoPrimary,
                  indicatorColor = SayviIndigoLight
                )
              )

              // CONNECTIONS TAB
              val connCount = state.connections.size
              val unreadCount = state.connections.sumOf { it.unreadCount }
              NavigationBarItem(
                selected = currentBottomTab == BottomTab.CONNECTIONS,
                onClick = { currentBottomTab = BottomTab.CONNECTIONS },
                icon = {
                  BadgedBox(badge = {
                    if (unreadCount > 0) {
                      Badge(containerColor = SayviRoseAccent) {
                        Text("$unreadCount", color = Color.White)
                      }
                    }
                  }) {
                    Icon(imageVector = Icons.Default.Chat, contentDescription = "Connections")
                  }
                },
                label = { Text("Connections", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                colors = NavigationBarItemDefaults.colors(
                  selectedIconColor = SayviIndigoPrimary,
                  selectedTextColor = SayviIndigoPrimary,
                  indicatorColor = SayviIndigoLight
                )
              )

              // PROFILE TAB
              NavigationBarItem(
                selected = currentBottomTab == BottomTab.PROFILE,
                onClick = { currentBottomTab = BottomTab.PROFILE },
                icon = {
                  Icon(imageVector = Icons.Default.Person, contentDescription = "Profile")
                },
                label = { Text("Profile", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                colors = NavigationBarItemDefaults.colors(
                  selectedIconColor = SayviIndigoPrimary,
                  selectedTextColor = SayviIndigoPrimary,
                  indicatorColor = SayviIndigoLight
                )
              )
            }
          }
        ) { innerPadding ->
          Box(
            modifier = Modifier
              .fillMaxSize()
              .padding(innerPadding)
          ) {
            when (currentBottomTab) {
              BottomTab.HOME -> {
                HomeScreen(
                  state = state,
                  onToggleOpen = { repository.toggleOpenStatus() },
                  onNavigateToNearby = { currentBottomTab = BottomTab.NEARBY },
                  onNavigateToConnections = { currentBottomTab = BottomTab.CONNECTIONS },
                  onOpenIncomingWave = { wave ->
                    repository.showIncomingWave(wave)
                  },
                  onOpenSafetyGuide = { showSafetyModal = true }
                )
              }

              BottomTab.NEARBY -> {
                NearbyScreen(
                  state = state,
                  onSendSayvi = { targetUser ->
                    repository.sendSayvi(targetUser)
                  },
                  onOpenChat = { conn ->
                    activeChatConnection = conn
                    currentSubScreen = SubScreen.CHAT
                  },
                  onBlockUser = { userToBlock = it },
                  onReportUser = { userToReport = it }
                )
              }

              BottomTab.CONNECTIONS -> {
                ConnectionsScreen(
                  state = state,
                  onOpenChat = { conn ->
                    activeChatConnection = conn
                    currentSubScreen = SubScreen.CHAT
                  },
                  onNavigateToNearby = { currentBottomTab = BottomTab.NEARBY }
                )
              }

              BottomTab.PROFILE -> {
                ProfileScreen(
                  state = state,
                  onToggleOpen = { repository.toggleOpenStatus() },
                  onEditProfile = { showEditProfileDialog = true },
                  onSaveToRoom = { name, bio, photoPath, age ->
                    repository.saveProfileToRoom(name, bio, photoPath, age)
                  },
                  onPhotoUpdated = { photoPath ->
                    repository.updateProfilePhoto(photoPath)
                  },
                  onOpenPrivacy = { currentSubScreen = SubScreen.PRIVACY_SETTINGS },
                  onOpenSafetyGuide = { showSafetyModal = true },
                  onOpenBlockedUsers = { currentSubScreen = SubScreen.BLOCKED_USERS },
                  onSwitchUser = { repository.switchActiveUser(it) },
                  onLogout = { currentNavScreen = AppNavScreen.WELCOME }
                )
              }
            }
          }
        }
      }
    }
  }

  // --- GLOBAL MODALS & DIALOGS ---

  // 1. Incoming Wave Modal: "Someone nearby wants to say hi."
  if (state.activeIncomingWaveModal != null) {
    val wave = state.activeIncomingWaveModal!!
    val sender = state.allUsers.find { it.id == wave.fromUserId }
    IncomingWaveDialog(
      wave = wave,
      senderUser = sender,
      onAccept = { repository.respondToWave(wave, accept = true) },
      onMaybeLater = { repository.respondToWave(wave, accept = false, maybeLater = true) },
      onDecline = { repository.respondToWave(wave, accept = false) },
      onDismiss = { repository.dismissIncomingWaveModal() }
    )
  }

  // 2. Sent Wave Confirmation Dialog
  if (state.showSentConfirmationModal) {
    SayviSentDialog(
      targetUser = state.lastSentTargetUser,
      onDismiss = { repository.dismissSentConfirmation() }
    )
  }

  // 3. Mutual Connection Match Celebration Dialog
  if (state.activeMutualMatchModal != null) {
    val partner = state.activeMutualMatchModal!!
    MutualMatchCelebrationDialog(
      myUser = state.currentUser,
      partner = partner,
      onStartTalking = {
        val conn = state.connections.find { it.partnerUser.id == partner.id }
        repository.dismissMutualMatch()
        if (conn != null) {
          activeChatConnection = conn
          currentSubScreen = SubScreen.CHAT
        }
      },
      onDismiss = { repository.dismissMutualMatch() }
    )
  }

  // 4. Block User Confirmation Dialog
  if (userToBlock != null) {
    val target = userToBlock!!
    BlockUserDialog(
      targetUser = target,
      onConfirmBlock = {
        repository.blockUser(target.id, "User Blocked")
        userToBlock = null
        if (currentSubScreen == SubScreen.CHAT && activeChatConnection?.partnerUser?.id == target.id) {
          currentSubScreen = SubScreen.NONE
        }
      },
      onDismiss = { userToBlock = null }
    )
  }

  // 5. Report User Dialog
  if (userToReport != null) {
    val target = userToReport!!
    ReportUserDialog(
      targetUser = target,
      onConfirmReport = { category, notes ->
        repository.reportUser(target.id, category, notes)
        userToReport = null
        if (currentSubScreen == SubScreen.CHAT && activeChatConnection?.partnerUser?.id == target.id) {
          currentSubScreen = SubScreen.NONE
        }
      },
      onDismiss = { userToReport = null }
    )
  }

  // 6. Safety Guidelines Modal
  if (showSafetyModal) {
    SafetyGuidelinesModal(
      onDismiss = { showSafetyModal = false }
    )
  }

  // 7. Edit Profile Dialog
  if (showEditProfileDialog) {
    EditProfileDialog(
      user = state.currentUser,
      onSave = { name, age, bio, avatar, interests, photoPath ->
        repository.updateCurrentUserProfile(name, age, bio, avatar, interests, photoPath)
        showEditProfileDialog = false
      },
      onDismiss = { showEditProfileDialog = false }
    )
  }
}
