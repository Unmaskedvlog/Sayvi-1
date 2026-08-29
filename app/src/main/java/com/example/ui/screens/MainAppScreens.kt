package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.SayviAppState
import com.example.model.ChatMessage
import com.example.model.Connection
import com.example.model.ConnectionVibe
import com.example.model.PrivacySettings
import com.example.model.SayviWave
import com.example.model.UserProfile
import com.example.ui.components.OpenStatusToggleCard
import com.example.ui.components.SayviBrandLogo
import com.example.ui.components.UserProfileAvatar
import com.example.ui.components.UserProfileComponent
import com.example.ui.components.saveBitmapToInternalStorage
import com.example.ui.theme.SayviBgLight
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.ui.platform.LocalContext
import coil.compose.AsyncImage
import coil.request.ImageRequest
import java.io.File
import com.example.ui.theme.SayviBorderLight
import com.example.ui.theme.SayviClosedRed
import com.example.ui.theme.SayviIndigoDark
import com.example.ui.theme.SayviIndigoLight
import com.example.ui.theme.SayviIndigoPrimary
import com.example.ui.theme.SayviOpenGreen
import com.example.ui.theme.SayviOpenGreenLight
import com.example.ui.theme.SayviRoseAccent
import com.example.ui.theme.SayviTextMuted
import com.example.ui.theme.SayviTextPrimary
import com.example.ui.theme.SayviTextSecondary
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HomeScreen(
  state: SayviAppState,
  onToggleOpen: () -> Unit,
  onNavigateToNearby: () -> Unit,
  onNavigateToConnections: () -> Unit,
  onOpenIncomingWave: (SayviWave) -> Unit,
  onOpenSafetyGuide: () -> Unit
) {
  val currentUser = state.currentUser
  val nearbyOpenUsers = state.allUsers.filter {
    it.id != currentUser.id && it.isOpen && !state.blockedUserIds.contains(it.id)
  }
  val openCount = nearbyOpenUsers.size

  val infiniteTransition = rememberInfiniteTransition(label = "radarPulse")
  val pulseScale by infiniteTransition.animateFloat(
    initialValue = 0.95f,
    targetValue = 1.12f,
    animationSpec = infiniteRepeatable(
      animation = tween(2200, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulse"
  )

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 20.dp, vertical = 16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // Top Bar
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      SayviBrandLogo(showTagline = false)

      // Active user badge
      Surface(
        shape = RoundedCornerShape(20.dp),
        color = SayviIndigoLight,
        modifier = Modifier.padding(2.dp)
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(text = currentUser.avatarEmoji, fontSize = 15.sp)
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = currentUser.firstName,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = SayviIndigoDark
          )
        }
      }
    }

    // Friendly Greeting
    Column {
      Text(
        text = "Good afternoon 👋",
        fontSize = 26.sp,
        fontWeight = FontWeight.Black,
        color = SayviTextPrimary
      )
      Text(
        text = "Ready to connect without the awkward first move?",
        fontSize = 13.sp,
        color = SayviTextSecondary
      )
    }

    // Status Toggle Card
    OpenStatusToggleCard(
      isOpen = currentUser.isOpen,
      onToggle = onToggleOpen
    )

    // Incoming wave banner if any
    if (state.incomingWaves.isNotEmpty()) {
      val firstWave = state.incomingWaves.first()
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { onOpenIncomingWave(firstWave) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFDE68A))
      ) {
        Row(
          modifier = Modifier.padding(14.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color(0xFFF59E0B)),
              contentAlignment = Alignment.Center
            ) {
              Text(text = "👋", fontSize = 20.sp)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
              Text(
                text = "Someone nearby wants to say hi!",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = Color(0xFF92400E)
              )
              Text(
                text = "Tap to view teaser & say hi back",
                fontSize = 11.sp,
                color = Color(0xFFB45309)
              )
            }
          }
          Text(text = "Review →", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF92400E))
        }
      }
    }

    // Main Discovery Hero Card
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(22.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White),
      border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight),
      elevation = CardDefaults.cardElevation(2.dp)
    ) {
      Column(
        modifier = Modifier.padding(22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Radar Pulse Icon
        Box(
          modifier = Modifier
            .size(100.dp)
            .scale(pulseScale)
            .clip(CircleShape)
            .background(SayviIndigoLight),
          contentAlignment = Alignment.Center
        ) {
          Box(
            modifier = Modifier
              .size(72.dp)
              .clip(CircleShape)
              .background(SayviIndigoPrimary.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
          ) {
            Text(text = "👀", fontSize = 34.sp)
          }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
          text = "People nearby",
          fontSize = 20.sp,
          fontWeight = FontWeight.Bold,
          color = SayviTextPrimary
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = if (currentUser.isOpen) {
            "$openCount ${if (openCount == 1) "person" else "people"} nearby ${if (openCount == 1) "is" else "are"} open to connecting."
          } else {
            "Turn on 'I'm Open' above to discover and wave to people nearby."
          },
          fontSize = 14.sp,
          color = SayviTextSecondary,
          textAlign = TextAlign.Center,
          lineHeight = 20.sp
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
          onClick = onNavigateToNearby,
          enabled = currentUser.isOpen,
          modifier = Modifier
            .fillMaxWidth()
            .height(52.dp),
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(16.dp)
        ) {
          Text(
            text = "👋 SAYVI",
            fontSize = 17.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 0.8.sp,
            color = Color.White
          )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
          text = "Daily discreet waves remaining: ${currentUser.dailyWavesRemaining}/5",
          fontSize = 11.sp,
          color = SayviTextMuted
        )
      }
    }

    // Safety and Privacy note
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clickable { onOpenSafetyGuide() },
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(containerColor = SayviIndigoLight.copy(alpha = 0.5f)),
      border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
    ) {
      Row(
        modifier = Modifier.padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(
          imageVector = Icons.Default.Security,
          contentDescription = null,
          tint = SayviIndigoPrimary,
          modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
          Text(
            text = "Safe & Privacy-First",
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = SayviIndigoDark
          )
          Text(
            text = "No exact GPS • Mutual consent only • Tap for guidelines",
            fontSize = 11.sp,
            color = SayviTextSecondary
          )
        }
      }
    }
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun NearbyScreen(
  state: SayviAppState,
  onSendSayvi: (UserProfile) -> Unit,
  onOpenChat: (Connection) -> Unit,
  onBlockUser: (UserProfile) -> Unit,
  onReportUser: (UserProfile) -> Unit
) {
  var selectedVibeFilter by remember { mutableStateOf<ConnectionVibe?>(null) }

  val currentUser = state.currentUser
  val nearbyUsers = state.allUsers.filter {
    it.id != currentUser.id &&
      it.isOpen &&
      !state.blockedUserIds.contains(it.id) &&
      (selectedVibeFilter == null || it.vibe == selectedVibeFilter)
  }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
  ) {
    // Top Bar
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .background(Color.White)
        .padding(horizontal = 20.dp, vertical = 14.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Nearby People",
            fontSize = 22.sp,
            fontWeight = FontWeight.Black,
            color = SayviTextPrimary
          )
          Text(
            text = "Showing people open to saying hi in this area",
            fontSize = 12.sp,
            color = SayviTextSecondary
          )
        }

        Surface(
          shape = RoundedCornerShape(12.dp),
          color = SayviOpenGreenLight,
          border = androidx.compose.foundation.BorderStroke(1.dp, SayviOpenGreen.copy(alpha = 0.3f))
        ) {
          Text(
            text = "🟢 ${nearbyUsers.size} Open",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = SayviOpenGreen,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Vibe Filter Chips
      LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        item {
          FilterChip(
            label = "All Vibes",
            isSelected = selectedVibeFilter == null,
            onClick = { selectedVibeFilter = null }
          )
        }
        items(ConnectionVibe.entries.toTypedArray()) { vibe ->
          FilterChip(
            label = "${vibe.emoji} ${vibe.label}",
            isSelected = selectedVibeFilter == vibe,
            onClick = { selectedVibeFilter = vibe }
          )
        }
      }
    }

    if (!currentUser.isOpen) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(32.dp),
        contentAlignment = Alignment.Center
      ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          Text(text = "🔴", fontSize = 42.sp)
          Spacer(modifier = Modifier.height(12.dp))
          Text(
            text = "You are currently Not Open",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = SayviTextPrimary
          )
          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = "To discover nearby people and let them wave to you, turn on '🟢 I'm Open' on your Home or Profile screen.",
            fontSize = 13.sp,
            color = SayviTextSecondary,
            textAlign = TextAlign.Center
          )
        }
      }
    } else if (nearbyUsers.isEmpty()) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(32.dp),
        contentAlignment = Alignment.Center
      ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          Text(text = "📡", fontSize = 42.sp)
          Spacer(modifier = Modifier.height(12.dp))
          Text(
            text = "No one open matching this vibe",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = SayviTextPrimary
          )
          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = "Try switching the filter or check back in a few minutes.",
            fontSize = 13.sp,
            color = SayviTextSecondary,
            textAlign = TextAlign.Center
          )
        }
      }
    } else {
      LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        items(nearbyUsers, key = { it.id }) { user ->
          val sentWave = state.sentWaves[user.id]
          val existingConnection = state.connections.find { it.partnerUser.id == user.id }

          NearbyUserCard(
            user = user,
            sentWave = sentWave,
            existingConnection = existingConnection,
            onSendSayvi = { onSendSayvi(user) },
            onOpenChat = {
              if (existingConnection != null) onOpenChat(existingConnection)
            },
            onBlock = { onBlockUser(user) },
            onReport = { onReportUser(user) }
          )
        }
      }
    }
  }
}

@Composable
private fun FilterChip(
  label: String,
  isSelected: Boolean,
  onClick: () -> Unit
) {
  Surface(
    shape = RoundedCornerShape(12.dp),
    color = if (isSelected) SayviIndigoPrimary else Color(0xFFF1F5F9),
    border = androidx.compose.foundation.BorderStroke(
      1.dp,
      if (isSelected) SayviIndigoPrimary else SayviBorderLight
    ),
    modifier = Modifier.clickable { onClick() }
  ) {
    Text(
      text = label,
      fontSize = 12.sp,
      fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
      color = if (isSelected) Color.White else SayviTextPrimary,
      modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
    )
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun NearbyUserCard(
  user: UserProfile,
  sentWave: SayviWave?,
  existingConnection: Connection?,
  onSendSayvi: () -> Unit,
  onOpenChat: () -> Unit,
  onBlock: () -> Unit,
  onReport: () -> Unit
) {
  var showMenu by remember { mutableStateOf(false) }

  Card(
    modifier = Modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(20.dp)),
    colors = CardDefaults.cardColors(containerColor = Color.White),
    border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight),
    elevation = CardDefaults.cardElevation(2.dp)
  ) {
    Column(
      modifier = Modifier.padding(18.dp)
    ) {
      // Top header row: Avatar + Name + Proximity badge + Menu
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .size(54.dp)
              .clip(CircleShape)
              .background(Color(user.avatarBgHex)),
            contentAlignment = Alignment.Center
          ) {
            Text(text = user.avatarEmoji, fontSize = 26.sp)
          }

          Spacer(modifier = Modifier.width(12.dp))

          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = user.firstName,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = SayviTextPrimary
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "${user.age}",
                fontSize = 14.sp,
                color = SayviTextSecondary
              )
            }

            Spacer(modifier = Modifier.height(2.dp))

            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
              // Proximity badge (approximate only!)
              Surface(
                shape = RoundedCornerShape(6.dp),
                color = Color(user.proximity.badgeColorHex).copy(alpha = 0.12f)
              ) {
                Text(
                  text = "📍 ${user.proximity.label}",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.SemiBold,
                  color = Color(user.proximity.badgeColorHex),
                  modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
              }

              // Vibe badge
              Surface(
                shape = RoundedCornerShape(6.dp),
                color = SayviIndigoLight
              ) {
                Text(
                  text = "${user.vibe.emoji} ${user.vibe.label}",
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Medium,
                  color = SayviIndigoDark,
                  modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
              }
            }
          }
        }

        // More options dropdown
        Box {
          IconButton(onClick = { showMenu = true }, modifier = Modifier.size(28.dp)) {
            Icon(
              imageVector = Icons.Default.MoreVert,
              contentDescription = "Options",
              tint = SayviTextMuted
            )
          }

          DropdownMenu(
            expanded = showMenu,
            onDismissRequest = { showMenu = false }
          ) {
            DropdownMenuItem(
              text = { Text("Block ${user.firstName}", color = SayviClosedRed) },
              onClick = {
                showMenu = false
                onBlock()
              }
            )
            DropdownMenuItem(
              text = { Text("Report User", color = SayviClosedRed) },
              onClick = {
                showMenu = false
                onReport()
              }
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Short Bio
      Text(
        text = "“${user.bio}”",
        fontSize = 13.sp,
        color = SayviTextSecondary,
        lineHeight = 18.sp
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Interests
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        user.interests.forEach { interest ->
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = SayviBgLight,
            border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
          ) {
            Text(
              text = interest,
              fontSize = 11.sp,
              fontWeight = FontWeight.Medium,
              color = SayviTextPrimary,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Action Button
      if (existingConnection != null) {
        Button(
          onClick = onOpenChat,
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp),
          colors = ButtonDefaults.buttonColors(containerColor = SayviOpenGreen),
          shape = RoundedCornerShape(12.dp)
        ) {
          Text(
            text = "Connected 🎉 • Open Chat",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color.White
          )
        }
      } else if (sentWave != null) {
        OutlinedButton(
          onClick = {},
          enabled = false,
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp),
          shape = RoundedCornerShape(12.dp),
          border = androidx.compose.foundation.BorderStroke(1.dp, SayviIndigoPrimary.copy(alpha = 0.5f)),
          colors = ButtonDefaults.outlinedButtonColors(containerColor = SayviIndigoLight)
        ) {
          Text(
            text = "👋 Wave Sent • Waiting for response",
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            color = SayviIndigoDark
          )
        }
      } else {
        Button(
          onClick = onSendSayvi,
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp),
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(12.dp)
        ) {
          Text(
            text = "👋 SAYVI",
            fontWeight = FontWeight.Black,
            letterSpacing = 0.6.sp,
            fontSize = 15.sp,
            color = Color.White
          )
        }
      }
    }
  }
}

@Composable
fun ConnectionsScreen(
  state: SayviAppState,
  onOpenChat: (Connection) -> Unit,
  onNavigateToNearby: () -> Unit
) {
  val connections = state.connections

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
  ) {
    // Header
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .background(Color.White)
        .padding(horizontal = 20.dp, vertical = 14.dp)
    ) {
      Text(
        text = "Connections",
        fontSize = 22.sp,
        fontWeight = FontWeight.Black,
        color = SayviTextPrimary
      )
      Text(
        text = "People who both mutually chose to say hi 👋",
        fontSize = 12.sp,
        color = SayviTextSecondary
      )
    }

    if (connections.isEmpty()) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(32.dp),
        contentAlignment = Alignment.Center
      ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
          Box(
            modifier = Modifier
              .size(80.dp)
              .clip(CircleShape)
              .background(SayviIndigoLight),
            contentAlignment = Alignment.Center
          ) {
            Text(text = "🤝", fontSize = 40.sp)
          }

          Spacer(modifier = Modifier.height(16.dp))

          Text(
            text = "No connections yet",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = SayviTextPrimary
          )

          Spacer(modifier = Modifier.height(6.dp))

          Text(
            text = "Send a discreet SAYVI to people nearby. When they say hi back, they'll appear here and you can chat privately.",
            fontSize = 13.sp,
            color = SayviTextSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
          )

          Spacer(modifier = Modifier.height(20.dp))

          Button(
            onClick = onNavigateToNearby,
            colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
            shape = RoundedCornerShape(12.dp)
          ) {
            Text(text = "Explore Nearby People 👋", color = Color.White, fontWeight = FontWeight.Bold)
          }
        }
      }
    } else {
      LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        items(connections, key = { it.id }) { conn ->
          Card(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { onOpenChat(conn) },
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
          ) {
            Row(
              modifier = Modifier.padding(14.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(50.dp)
                  .clip(CircleShape)
                  .background(Color(conn.partnerUser.avatarBgHex)),
                contentAlignment = Alignment.Center
              ) {
                Text(text = conn.partnerUser.avatarEmoji, fontSize = 24.sp)
              }

              Spacer(modifier = Modifier.width(12.dp))

              Column(modifier = Modifier.weight(1f)) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                    text = "${conn.partnerUser.firstName}, ${conn.partnerUser.age}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = SayviTextPrimary
                  )
                  Text(
                    text = conn.lastMessageTime,
                    fontSize = 11.sp,
                    color = SayviTextMuted
                  )
                }

                Spacer(modifier = Modifier.height(3.dp))

                Text(
                  text = conn.lastMessage,
                  fontSize = 13.sp,
                  color = SayviTextSecondary,
                  maxLines = 1,
                  overflow = TextOverflow.Ellipsis
                )
              }

              if (conn.unreadCount > 0) {
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                  modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(SayviIndigoPrimary),
                  contentAlignment = Alignment.Center
                ) {
                  Text(
                    text = "${conn.unreadCount}",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }
          }
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
  connection: Connection,
  messages: List<ChatMessage>,
  onSendMessage: (String) -> Unit,
  onSimulateReply: (String) -> Unit,
  onBack: () -> Unit,
  onBlockUser: () -> Unit,
  onReportUser: () -> Unit,
  onShowSafetyTips: () -> Unit
) {
  var messageInput by remember { mutableStateOf("") }
  var showMenu by remember { mutableStateOf(false) }

  val partner = connection.partnerUser

  Scaffold(
    topBar = {
      TopAppBar(
        title = {
          Row(
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color(partner.avatarBgHex)),
              contentAlignment = Alignment.Center
            ) {
              Text(text = partner.avatarEmoji, fontSize = 20.sp)
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text(
                text = partner.firstName,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = SayviTextPrimary
              )
              Text(
                text = "Mutual connection • 🟢 Active nearby",
                fontSize = 11.sp,
                color = SayviOpenGreen
              )
            }
          }
        },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          IconButton(onClick = onShowSafetyTips) {
            Icon(imageVector = Icons.Default.Security, contentDescription = "Safety", tint = SayviIndigoPrimary)
          }
          IconButton(onClick = { showMenu = true }) {
            Icon(imageVector = Icons.Default.MoreVert, contentDescription = "Menu")
          }
          DropdownMenu(
            expanded = showMenu,
            onDismissRequest = { showMenu = false }
          ) {
            DropdownMenuItem(
              text = { Text("Safety Tips") },
              onClick = {
                showMenu = false
                onShowSafetyTips()
              }
            )
            DropdownMenuItem(
              text = { Text("Block ${partner.firstName}", color = SayviClosedRed) },
              onClick = {
                showMenu = false
                onBlockUser()
              }
            )
            DropdownMenuItem(
              text = { Text("Report User", color = SayviClosedRed) },
              onClick = {
                showMenu = false
                onReportUser()
              }
            )
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
      )
    },
    bottomBar = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(Color.White)
          .padding(horizontal = 12.dp, vertical = 8.dp)
      ) {
        // Icebreaker quick prompts
        LazyRow(
          horizontalArrangement = Arrangement.spacedBy(6.dp),
          modifier = Modifier.padding(bottom = 6.dp)
        ) {
          val icebreakers = listOf(
            "👋 Hey ${partner.firstName}!",
            "☕ What are you working on?",
            "🎵 Love that you're into music too",
            "✨ Are you nearby at the moment?"
          )
          items(icebreakers) { prompt ->
            Surface(
              shape = RoundedCornerShape(12.dp),
              color = SayviIndigoLight,
              modifier = Modifier.clickable {
                onSendMessage(prompt)
              }
            ) {
              Text(
                text = prompt,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = SayviIndigoDark,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
              )
            }
          }
        }

        // Message input row
        Row(
          modifier = Modifier.fillMaxWidth(),
          verticalAlignment = Alignment.CenterVertically
        ) {
          OutlinedTextField(
            value = messageInput,
            onValueChange = { messageInput = it },
            placeholder = { Text("Type a discreet message...", fontSize = 13.sp) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(20.dp),
            colors = OutlinedTextFieldDefaults.colors(
              focusedContainerColor = SayviBgLight,
              unfocusedContainerColor = SayviBgLight,
              focusedBorderColor = SayviIndigoPrimary,
              unfocusedBorderColor = SayviBorderLight
            ),
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
            keyboardActions = KeyboardActions(onSend = {
              if (messageInput.isNotBlank()) {
                val text = messageInput
                messageInput = ""
                onSendMessage(text)
              }
            })
          )

          Spacer(modifier = Modifier.width(8.dp))

          IconButton(
            onClick = {
              if (messageInput.isNotBlank()) {
                val text = messageInput
                messageInput = ""
                onSendMessage(text)
              }
            },
            modifier = Modifier
              .size(44.dp)
              .clip(CircleShape)
              .background(SayviIndigoPrimary)
          ) {
            Icon(
              imageVector = Icons.Default.Send,
              contentDescription = "Send",
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }
        }
      }
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .background(SayviBgLight)
        .padding(innerPadding)
    ) {
      // Mutual connection badge banner
      Surface(
        color = SayviIndigoLight.copy(alpha = 0.7f),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
          horizontalArrangement = Arrangement.Center,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = null,
            tint = SayviIndigoDark,
            modifier = Modifier.size(12.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Private End-to-End Chat • Mutual consent active",
            fontSize = 11.sp,
            color = SayviIndigoDark,
            fontWeight = FontWeight.Medium
          )
        }
      }

      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        // Shared Interests Header Card
        item {
          Card(
            modifier = Modifier
              .fillMaxWidth()
              .padding(vertical = 8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
          ) {
            Column(
              modifier = Modifier.padding(14.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = "🎉 You both said hi to each other!",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = SayviTextPrimary
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = "${partner.firstName}'s Interests: ${partner.interests.joinToString(" ")}",
                fontSize = 11.sp,
                color = SayviTextSecondary
              )
            }
          }
        }

        items(messages, key = { it.id }) { msg ->
          MessageBubble(msg = msg, partner = partner)
        }
      }
    }
  }
}

@Composable
fun MessageBubble(
  msg: ChatMessage,
  partner: UserProfile
) {
  val isMe = msg.isMe
  val timeFormat = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }
  val timeString = remember(msg.timestamp) { timeFormat.format(Date(msg.timestamp)) }

  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start
  ) {
    if (!isMe) {
      Box(
        modifier = Modifier
          .size(28.dp)
          .clip(CircleShape)
          .background(Color(partner.avatarBgHex)),
        contentAlignment = Alignment.Center
      ) {
        Text(text = partner.avatarEmoji, fontSize = 14.sp)
      }
      Spacer(modifier = Modifier.width(6.dp))
    }

    Column(
      horizontalAlignment = if (isMe) Alignment.End else Alignment.Start,
      modifier = Modifier.fillMaxWidth(0.75f)
    ) {
      Surface(
        shape = RoundedCornerShape(
          topStart = 16.dp,
          topEnd = 16.dp,
          bottomStart = if (isMe) 16.dp else 4.dp,
          bottomEnd = if (isMe) 4.dp else 16.dp
        ),
        color = if (isMe) SayviIndigoPrimary else Color.White,
        border = if (isMe) null else androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight),
        shadowElevation = 1.dp
      ) {
        Text(
          text = msg.text,
          fontSize = 14.sp,
          color = if (isMe) Color.White else SayviTextPrimary,
          modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
          lineHeight = 19.sp
        )
      }

      Spacer(modifier = Modifier.height(2.dp))

      Text(
        text = timeString,
        fontSize = 10.sp,
        color = SayviTextMuted
      )
    }
  }
}

@Composable
fun ProfileScreen(
  state: SayviAppState,
  onToggleOpen: () -> Unit,
  onEditProfile: () -> Unit,
  onSaveToRoom: (name: String, bio: String, photoPath: String?, age: Int) -> Unit = { _, _, _, _ -> },
  onPhotoUpdated: (String?) -> Unit = {},
  onOpenPrivacy: () -> Unit,
  onOpenSafetyGuide: () -> Unit,
  onOpenBlockedUsers: () -> Unit,
  onSwitchUser: (String) -> Unit,
  onLogout: () -> Unit
) {
  val user = state.currentUser

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 20.dp, vertical = 16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // Header
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = "My Profile",
        fontSize = 24.sp,
        fontWeight = FontWeight.Black,
        color = SayviTextPrimary
      )

      IconButton(onClick = onEditProfile) {
        Icon(
          imageVector = Icons.Default.Edit,
          contentDescription = "Edit Profile",
          tint = SayviIndigoPrimary
        )
      }
    }

    // User Profile Component with Camera & Room Database Storage
    UserProfileComponent(
      user = user,
      savedEntity = state.savedRoomEntity,
      onSaveToRoom = onSaveToRoom,
      onPhotoUpdated = onPhotoUpdated
    )

    // Status toggle in profile
    OpenStatusToggleCard(isOpen = user.isOpen, onToggle = onToggleOpen)

    // Settings Group
    Text(
      text = "Preferences & Safety",
      fontSize = 14.sp,
      fontWeight = FontWeight.Bold,
      color = SayviTextSecondary
    )

    Card(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(18.dp),
      colors = CardDefaults.cardColors(containerColor = Color.White),
      border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
    ) {
      Column {
        SettingRow(
          icon = "🛡️",
          title = "Privacy & Location Fuzzing",
          subtitle = "Control visibility and hide exact distance",
          onClick = onOpenPrivacy
        )
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(SayviBorderLight))
        SettingRow(
          icon = "🚫",
          title = "Blocked Users (${state.blockedUserIds.size})",
          subtitle = "Manage contacts you have muted or blocked",
          onClick = onOpenBlockedUsers
        )
        Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(SayviBorderLight))
        SettingRow(
          icon = "📖",
          title = "SAYVI Safety Principles",
          subtitle = "Meetup tips, guidelines, and zero-pressure rules",
          onClick = onOpenSafetyGuide
        )
      }
    }

    // Prototype Mode Account Switcher
    Text(
      text = "Prototype Mode: Switch Test Account",
      fontSize = 14.sp,
      fontWeight = FontWeight.Bold,
      color = SayviTextSecondary
    )

    Card(
      modifier = Modifier.fillMaxWidth(),
      shape = RoundedCornerShape(18.dp),
      colors = CardDefaults.cardColors(containerColor = SayviIndigoLight.copy(alpha = 0.4f)),
      border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
    ) {
      Column(modifier = Modifier.padding(14.dp)) {
        Text(
          text = "Test SAYVI interactions between accounts:",
          fontSize = 12.sp,
          color = SayviIndigoDark
        )
        Spacer(modifier = Modifier.height(10.dp))
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          val testUsers = state.allUsers.take(4)
          testUsers.forEach { tUser ->
            val isCurrent = tUser.id == user.id
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = if (isCurrent) SayviIndigoPrimary else Color.White,
              border = androidx.compose.foundation.BorderStroke(1.dp, if (isCurrent) SayviIndigoPrimary else SayviBorderLight),
              modifier = Modifier
                .weight(1f)
                .clickable { onSwitchUser(tUser.id) }
            ) {
              Column(
                modifier = Modifier.padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally
              ) {
                Text(text = tUser.avatarEmoji, fontSize = 20.sp)
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                  text = tUser.firstName,
                  fontSize = 11.sp,
                  fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Normal,
                  color = if (isCurrent) Color.White else SayviTextPrimary
                )
              }
            }
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(8.dp))

    // Logout
    OutlinedButton(
      onClick = onLogout,
      modifier = Modifier
        .fillMaxWidth()
        .height(48.dp),
      shape = RoundedCornerShape(14.dp),
      border = androidx.compose.foundation.BorderStroke(1.dp, SayviClosedRed.copy(alpha = 0.5f))
    ) {
      Text(text = "Log Out of SAYVI", color = SayviClosedRed, fontWeight = FontWeight.Bold)
    }
  }
}

@Composable
private fun SettingRow(
  icon: String,
  title: String,
  subtitle: String,
  onClick: () -> Unit
) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .clickable { onClick() }
      .padding(horizontal = 16.dp, vertical = 12.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier.weight(1f)
    ) {
      Text(text = icon, fontSize = 20.sp)
      Spacer(modifier = Modifier.width(12.dp))
      Column {
        Text(text = title, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = SayviTextPrimary)
        Text(text = subtitle, fontSize = 11.sp, color = SayviTextSecondary)
      }
    }
    Text(text = "›", fontSize = 20.sp, color = SayviTextMuted)
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrivacySettingsScreen(
  settings: PrivacySettings,
  onUpdateSettings: (PrivacySettings) -> Unit,
  onBack: () -> Unit
) {
  var approximateOnly by remember { mutableStateOf(settings.approximateDistanceOnly) }
  var inAppBannersOnly by remember { mutableStateOf(settings.inAppBannersOnly) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text("Privacy & Visibility", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
      )
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .background(SayviBgLight)
        .padding(innerPadding)
        .padding(18.dp),
      verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
      Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(text = "Approximate Proximity Only", fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Text(
                text = "Never show exact meters or GPS coordinates to anyone. Use 'Nearby' and 'Very close' only.",
                fontSize = 12.sp,
                color = SayviTextSecondary
              )
            }
            Switch(
              checked = approximateOnly,
              onCheckedChange = {
                approximateOnly = it
                onUpdateSettings(settings.copy(approximateDistanceOnly = it))
              }
            )
          }

          Spacer(modifier = Modifier.height(14.dp))
          Box(modifier = Modifier.fillMaxWidth().height(1.dp).background(SayviBorderLight))
          Spacer(modifier = Modifier.height(14.dp))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(text = "Discreet In-App Notifications", fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Text(
                text = "Show waves only inside the app with quiet banners rather than noisy loud popups.",
                fontSize = 12.sp,
                color = SayviTextSecondary
              )
            }
            Switch(
              checked = inAppBannersOnly,
              onCheckedChange = {
                inAppBannersOnly = it
                onUpdateSettings(settings.copy(inAppBannersOnly = it))
              }
            )
          }
        }
      }
    }
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BlockedUsersScreen(
  blockedIds: Set<String>,
  allUsers: List<UserProfile>,
  onUnblock: (String) -> Unit,
  onBack: () -> Unit
) {
  val blockedList = allUsers.filter { blockedIds.contains(it.id) }

  Scaffold(
    topBar = {
      TopAppBar(
        title = { Text("Blocked Users", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
          }
        },
        colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
      )
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .background(SayviBgLight)
        .padding(innerPadding)
        .padding(18.dp)
    ) {
      if (blockedList.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          Text(text = "No blocked users.", color = SayviTextSecondary, fontSize = 14.sp)
        }
      } else {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          items(blockedList) { bUser ->
            Card(
              modifier = Modifier.fillMaxWidth(),
              shape = RoundedCornerShape(14.dp),
              colors = CardDefaults.cardColors(containerColor = Color.White),
              border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
            ) {
              Row(
                modifier = Modifier.padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Text(text = bUser.avatarEmoji, fontSize = 22.sp)
                  Spacer(modifier = Modifier.width(10.dp))
                  Text(text = bUser.firstName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }

                Button(
                  onClick = { onUnblock(bUser.id) },
                  colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoLight),
                  shape = RoundedCornerShape(8.dp)
                ) {
                  Text(text = "Unblock", color = SayviIndigoDark, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
              }
            }
          }
        }
      }
    }
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EditProfileDialog(
  user: UserProfile,
  onSave: (name: String, age: Int, bio: String, avatar: String, interests: List<String>, photoPath: String?) -> Unit,
  onDismiss: () -> Unit
) {
  val context = LocalContext.current
  var name by remember { mutableStateOf(user.firstName) }
  var ageStr by remember { mutableStateOf("${user.age}") }
  var bio by remember { mutableStateOf(user.bio) }
  var selectedAvatar by remember { mutableStateOf(user.avatarEmoji) }
  var selectedInterests by remember { mutableStateOf(user.interests) }
  var currentPhotoPath by remember { mutableStateOf(user.photoPath) }

  // Camera capture launcher
  val takePhotoLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.TakePicturePreview()
  ) { bitmap: Bitmap? ->
    if (bitmap != null) {
      val path = saveBitmapToInternalStorage(context, bitmap, "profile_${user.id}_${System.currentTimeMillis()}.jpg")
      currentPhotoPath = path
    }
  }

  // Camera permission launcher
  val requestPermissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestPermission()
  ) { isGranted: Boolean ->
    if (isGranted) {
      takePhotoLauncher.launch(null)
    }
  }

  val launchCamera = {
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
      takePhotoLauncher.launch(null)
    } else {
      requestPermissionLauncher.launch(Manifest.permission.CAMERA)
    }
  }

  val avatars = listOf("🎧", "🎨", "🌿", "🚀", "☕", "📚", "🎬", "🎸", "🐱", "✨")

  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(22.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
      Column(
        modifier = Modifier
          .padding(20.dp)
          .verticalScroll(rememberScrollState())
      ) {
        Text(text = "Edit Profile & Photo", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = SayviTextPrimary)
        Spacer(modifier = Modifier.height(14.dp))

        // Camera photo capture row
        Row(
          modifier = Modifier.fillMaxWidth(),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .size(64.dp)
              .clip(CircleShape)
              .background(Color(user.avatarBgHex))
              .clickable { launchCamera() },
            contentAlignment = Alignment.Center
          ) {
            val photoFile = currentPhotoPath?.let { File(it) }
            if (photoFile != null && photoFile.exists()) {
              AsyncImage(
                model = ImageRequest.Builder(context).data(photoFile).crossfade(true).build(),
                contentDescription = "Profile Photo",
                modifier = Modifier.fillMaxSize(),
                contentScale = androidx.compose.ui.layout.ContentScale.Crop
              )
            } else {
              Text(text = selectedAvatar, fontSize = 28.sp)
            }
          }

          Spacer(modifier = Modifier.width(12.dp))

          Column {
            Button(
              onClick = { launchCamera() },
              colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoLight),
              shape = RoundedCornerShape(10.dp),
              contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
              Icon(Icons.Default.CameraAlt, contentDescription = null, tint = SayviIndigoDark, modifier = Modifier.size(15.dp))
              Spacer(modifier = Modifier.width(6.dp))
              Text("Take Camera Photo", fontSize = 12.sp, color = SayviIndigoDark, fontWeight = FontWeight.Bold)
            }

            if (currentPhotoPath != null) {
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = "Remove Photo",
                fontSize = 11.sp,
                color = SayviClosedRed,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { currentPhotoPath = null }
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Avatar selector
        Text(text = "Avatar Emoji", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SayviTextSecondary)
        Spacer(modifier = Modifier.height(6.dp))
        FlowRow(
          horizontalArrangement = Arrangement.spacedBy(6.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          avatars.forEach { av ->
            Box(
              modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(if (selectedAvatar == av) SayviIndigoLight else SayviBgLight)
                .border(
                  width = if (selectedAvatar == av) 2.dp else 1.dp,
                  color = if (selectedAvatar == av) SayviIndigoPrimary else SayviBorderLight,
                  shape = CircleShape
                )
                .clickable { selectedAvatar = av },
              contentAlignment = Alignment.Center
            ) {
              Text(text = av, fontSize = 18.sp)
            }
          }
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
          value = name,
          onValueChange = { name = it },
          label = { Text("Display Name") },
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(12.dp),
          singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
          value = ageStr,
          onValueChange = { ageStr = it },
          label = { Text("Age") },
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(12.dp),
          singleLine = true
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
          value = bio,
          onValueChange = { bio = it },
          label = { Text("Bio") },
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(12.dp),
          minLines = 2
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
          onClick = {
            val age = ageStr.toIntOrNull() ?: user.age
            onSave(name, age, bio, selectedAvatar, selectedInterests, currentPhotoPath)
          },
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp)
        ) {
          Text(text = "Save & Persist to Room", color = Color.White, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(6.dp))

        OutlinedButton(
          onClick = onDismiss,
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(42.dp)
        ) {
          Text(text = "Cancel", color = SayviTextSecondary)
        }
      }
    }
  }
}
