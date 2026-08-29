package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import coil.request.ImageRequest
import java.io.File
import com.example.model.ReportCategory
import com.example.model.SayviWave
import com.example.model.UserProfile
import com.example.ui.theme.SayviBorderLight
import com.example.ui.theme.SayviCardLight
import com.example.ui.theme.SayviClosedRed
import com.example.ui.theme.SayviClosedRedLight
import com.example.ui.theme.SayviIndigoDark
import com.example.ui.theme.SayviIndigoLight
import com.example.ui.theme.SayviIndigoPrimary
import com.example.ui.theme.SayviOpenGreen
import com.example.ui.theme.SayviOpenGreenLight
import com.example.ui.theme.SayviRoseAccent
import com.example.ui.theme.SayviTextMuted
import com.example.ui.theme.SayviTextPrimary
import com.example.ui.theme.SayviTextSecondary

@Composable
fun UserProfileAvatar(
  user: UserProfile,
  size: Dp = 48.dp,
  fontSize: TextUnit = 22.sp,
  modifier: Modifier = Modifier
) {
  val context = LocalContext.current
  val photoFile = user.photoPath?.let { File(it) }
  Box(
    modifier = modifier
      .size(size)
      .clip(CircleShape)
      .background(Color(user.avatarBgHex)),
    contentAlignment = Alignment.Center
  ) {
    if (photoFile != null && photoFile.exists()) {
      AsyncImage(
        model = ImageRequest.Builder(context)
          .data(photoFile)
          .crossfade(true)
          .build(),
        contentDescription = user.firstName,
        modifier = Modifier.fillMaxSize(),
        contentScale = ContentScale.Crop
      )
    } else {
      Text(text = user.avatarEmoji, fontSize = fontSize)
    }
  }
}

@Composable
fun SayviBrandLogo(
  modifier: Modifier = Modifier,
  showTagline: Boolean = true,
  large: Boolean = false
) {
  val infiniteTransition = rememberInfiniteTransition(label = "wave")
  val waveScale by infiniteTransition.animateFloat(
    initialValue = 1.0f,
    targetValue = 1.15f,
    animationSpec = infiniteRepeatable(
      animation = tween(1400, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "waveScale"
  )

  Column(
    modifier = modifier,
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.Center
    ) {
      Box(
        modifier = Modifier
          .size(if (large) 52.dp else 38.dp)
          .clip(CircleShape)
          .background(SayviIndigoLight),
        contentAlignment = Alignment.Center
      ) {
        Text(
          text = "👋",
          fontSize = if (large) 26.sp else 19.sp,
          modifier = Modifier.scale(waveScale)
        )
      }
      Spacer(modifier = Modifier.width(10.dp))
      Text(
        text = "SAYVI",
        fontSize = if (large) 32.sp else 24.sp,
        fontWeight = FontWeight.Black,
        letterSpacing = 1.2.sp,
        color = SayviIndigoDark
      )
    }

    if (showTagline) {
      Spacer(modifier = Modifier.height(4.dp))
      Text(
        text = "When saying hi is hard.",
        fontSize = if (large) 14.sp else 12.sp,
        fontWeight = FontWeight.Medium,
        color = SayviTextSecondary
      )
    }
  }
}

@Composable
fun OpenStatusToggleCard(
  isOpen: Boolean,
  onToggle: () -> Unit,
  modifier: Modifier = Modifier
) {
  val bgColor by animateColorAsState(
    targetValue = if (isOpen) SayviOpenGreenLight else SayviClosedRedLight,
    label = "statusBg"
  )
  val borderColor by animateColorAsState(
    targetValue = if (isOpen) SayviOpenGreen.copy(alpha = 0.4f) else SayviClosedRed.copy(alpha = 0.4f),
    label = "statusBorder"
  )

  Card(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(18.dp))
      .clickable { onToggle() },
    colors = CardDefaults.cardColors(containerColor = bgColor),
    border = androidx.compose.foundation.BorderStroke(1.dp, borderColor)
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 18.dp, vertical = 14.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.weight(1f)
      ) {
        Box(
          modifier = Modifier
            .size(36.dp)
            .clip(CircleShape)
            .background(if (isOpen) SayviOpenGreen else SayviClosedRed),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = if (isOpen) "🟢" else "🔴",
            fontSize = 14.sp
          )
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column {
          Text(
            text = if (isOpen) "🟢 I'm Open" else "🔴 I'm Not Open",
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = if (isOpen) Color(0xFF065F46) else Color(0xFF991B1B)
          )
          Text(
            text = if (isOpen) "Nearby open people can send you a discreet wave 👋" else "You are hidden. No waves will be received.",
            fontSize = 12.sp,
            color = if (isOpen) Color(0xFF047857) else Color(0xFFB91C1C),
            lineHeight = 16.sp
          )
        }
      }

      Spacer(modifier = Modifier.width(8.dp))

      Switch(
        checked = isOpen,
        onCheckedChange = { onToggle() },
        colors = SwitchDefaults.colors(
          checkedThumbColor = Color.White,
          checkedTrackColor = SayviOpenGreen,
          uncheckedThumbColor = Color.White,
          uncheckedTrackColor = SayviClosedRed
        )
      )
    }
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun IncomingWaveDialog(
  wave: SayviWave,
  senderUser: UserProfile?,
  onAccept: () -> Unit,
  onMaybeLater: () -> Unit,
  onDecline: () -> Unit,
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(24.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White),
      elevation = CardDefaults.cardElevation(8.dp)
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Discreet Header Icon
        Box(
          modifier = Modifier
            .size(68.dp)
            .clip(CircleShape)
            .background(SayviIndigoLight),
          contentAlignment = Alignment.Center
        ) {
          Text(text = "👋", fontSize = 32.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
          text = "Someone nearby wants to say hi.",
          fontSize = 20.sp,
          fontWeight = FontWeight.Bold,
          color = SayviTextPrimary,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = "They'd like to connect with you.",
          fontSize = 14.sp,
          color = SayviTextSecondary,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Privacy Protected Teaser Card
        Card(
          modifier = Modifier.fillMaxWidth(),
          colors = CardDefaults.cardColors(containerColor = SayviIndigoLight.copy(alpha = 0.5f)),
          shape = RoundedCornerShape(16.dp)
        ) {
          Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center
            ) {
              Box(
                modifier = Modifier
                  .size(32.dp)
                  .clip(CircleShape)
                  .background(Color(senderUser?.avatarBgHex ?: 0xFF6366F1)),
                contentAlignment = Alignment.Center
              ) {
                Text(text = senderUser?.avatarEmoji ?: "👤", fontSize = 16.sp)
              }
              Spacer(modifier = Modifier.width(8.dp))
              Text(
                text = "${senderUser?.firstName ?: "Someone"} • ${senderUser?.proximity?.label ?: "Nearby"}",
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                color = SayviIndigoDark
              )
            }

            if (senderUser != null && senderUser.interests.isNotEmpty()) {
              Spacer(modifier = Modifier.height(8.dp))
              FlowRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally),
                verticalArrangement = Arrangement.spacedBy(4.dp)
              ) {
                senderUser.interests.take(3).forEach { interest ->
                  Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color.White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
                  ) {
                    Text(
                      text = interest,
                      fontSize = 11.sp,
                      fontWeight = FontWeight.Medium,
                      color = SayviTextPrimary,
                      modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                  }
                }
              }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Row(
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(
                imageVector = Icons.Default.Lock,
                contentDescription = "Privacy Shield",
                tint = SayviTextMuted,
                modifier = Modifier.size(12.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Full profile reveals only when mutual",
                fontSize = 11.sp,
                color = SayviTextMuted
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(22.dp))

        // Action Buttons
        Button(
          onClick = onAccept,
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp),
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(14.dp)
        ) {
          Text(
            text = "Say Hi Back 👋",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          OutlinedButton(
            onClick = onMaybeLater,
            modifier = Modifier
              .weight(1f)
              .height(44.dp),
            shape = RoundedCornerShape(12.dp)
          ) {
            Text(text = "Maybe Later", fontSize = 13.sp, color = SayviTextSecondary)
          }

          OutlinedButton(
            onClick = onDecline,
            modifier = Modifier
              .weight(1f)
              .height(44.dp),
            shape = RoundedCornerShape(12.dp)
          ) {
            Text(text = "No Thanks", fontSize = 13.sp, color = SayviClosedRed)
          }
        }
      }
    }
  }
}

@Composable
fun SayviSentDialog(
  targetUser: UserProfile?,
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(24.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White),
      elevation = CardDefaults.cardElevation(8.dp)
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(26.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Box(
          modifier = Modifier
            .size(72.dp)
            .clip(CircleShape)
            .background(SayviIndigoLight),
          contentAlignment = Alignment.Center
        ) {
          Text(text = "👋", fontSize = 34.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
          text = "SAYVI sent",
          fontSize = 22.sp,
          fontWeight = FontWeight.Black,
          color = SayviTextPrimary
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
          text = "“Let's see if they say hi back.”",
          fontSize = 15.sp,
          fontWeight = FontWeight.Medium,
          color = SayviIndigoDark,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(10.dp))

        Text(
          text = "We sent a discreet notification to ${targetUser?.firstName ?: "them"}. If they are open to connecting too, you'll be able to chat!",
          fontSize = 13.sp,
          color = SayviTextSecondary,
          textAlign = TextAlign.Center,
          lineHeight = 18.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
          onClick = onDismiss,
          modifier = Modifier
            .fillMaxWidth()
            .height(48.dp),
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(14.dp)
        ) {
          Text(text = "Done", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }
    }
  }
}

@Composable
fun MutualMatchCelebrationDialog(
  myUser: UserProfile,
  partner: UserProfile,
  onStartTalking: () -> Unit,
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(24.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White),
      elevation = CardDefaults.cardElevation(10.dp)
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .padding(26.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Box(
          modifier = Modifier
            .size(70.dp)
            .clip(CircleShape)
            .background(SayviOpenGreenLight),
          contentAlignment = Alignment.Center
        ) {
          Text(text = "🎉", fontSize = 34.sp)
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
          text = "You both said hi!",
          fontSize = 22.sp,
          fontWeight = FontWeight.Black,
          color = SayviTextPrimary
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Connection avatars
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.Center
        ) {
          Box(
            modifier = Modifier
              .size(54.dp)
              .clip(CircleShape)
              .background(Color(myUser.avatarBgHex)),
            contentAlignment = Alignment.Center
          ) {
            Text(text = myUser.avatarEmoji, fontSize = 24.sp)
          }

          Spacer(modifier = Modifier.width(8.dp))

          Text(
            text = "↔",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = SayviIndigoPrimary
          )

          Spacer(modifier = Modifier.width(8.dp))

          Box(
            modifier = Modifier
              .size(54.dp)
              .clip(CircleShape)
              .background(Color(partner.avatarBgHex)),
            contentAlignment = Alignment.Center
          ) {
            Text(text = partner.avatarEmoji, fontSize = 24.sp)
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
          text = "${myUser.firstName} ↔ ${partner.firstName}",
          fontWeight = FontWeight.Bold,
          fontSize = 15.sp,
          color = SayviIndigoDark
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = "Looks like you're both open to meeting.",
          fontSize = 14.sp,
          color = SayviTextSecondary,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
          onClick = onStartTalking,
          modifier = Modifier
            .fillMaxWidth()
            .height(50.dp),
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(14.dp)
        ) {
          Text(
            text = "Start Talking 💬",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
          onClick = onDismiss,
          modifier = Modifier
            .fillMaxWidth()
            .height(44.dp),
          shape = RoundedCornerShape(12.dp)
        ) {
          Text(text = "Later", fontSize = 14.sp, color = SayviTextSecondary)
        }
      }
    }
  }
}

@Composable
fun BlockUserDialog(
  targetUser: UserProfile,
  onConfirmBlock: () -> Unit,
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(20.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
      Column(
        modifier = Modifier.padding(22.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        Box(
          modifier = Modifier
            .size(50.dp)
            .clip(CircleShape)
            .background(SayviClosedRedLight),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = null,
            tint = SayviClosedRed
          )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
          text = "Block ${targetUser.firstName}?",
          fontSize = 18.sp,
          fontWeight = FontWeight.Bold,
          color = SayviTextPrimary
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
          text = "They will no longer see you nearby or be able to send you waves or messages. This action is private and can be undone in Settings.",
          fontSize = 13.sp,
          color = SayviTextSecondary,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
          onClick = onConfirmBlock,
          colors = ButtonDefaults.buttonColors(containerColor = SayviClosedRed),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp)
        ) {
          Text(text = "Block User", color = Color.White, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
          onClick = onDismiss,
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
        ) {
          Text(text = "Cancel", color = SayviTextSecondary)
        }
      }
    }
  }
}

@Composable
fun ReportUserDialog(
  targetUser: UserProfile,
  onConfirmReport: (ReportCategory, String) -> Unit,
  onDismiss: () -> Unit
) {
  var selectedCategory by remember { mutableStateOf(ReportCategory.UNCOMFORTABLE) }
  var notes by remember { mutableStateOf("") }

  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(20.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
      Column(
        modifier = Modifier.padding(22.dp)
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .size(36.dp)
              .clip(CircleShape)
              .background(SayviClosedRedLight),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Warning,
              contentDescription = null,
              tint = SayviClosedRed,
              modifier = Modifier.size(20.dp)
            )
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "Report ${targetUser.firstName}",
              fontWeight = FontWeight.Bold,
              fontSize = 16.sp,
              color = SayviTextPrimary
            )
            Text(
              text = "Help keep SAYVI safe and welcoming",
              fontSize = 12.sp,
              color = SayviTextSecondary
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
          text = "Select a reason:",
          fontSize = 13.sp,
          fontWeight = FontWeight.SemiBold,
          color = SayviTextPrimary
        )

        Spacer(modifier = Modifier.height(8.dp))

        ReportCategory.entries.forEach { category ->
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { selectedCategory = category }
              .padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            RadioButton(
              selected = selectedCategory == category,
              onClick = { selectedCategory = category }
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = category.title,
              fontSize = 13.sp,
              color = SayviTextPrimary
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
          onClick = { onConfirmReport(selectedCategory, notes) },
          colors = ButtonDefaults.buttonColors(containerColor = SayviClosedRed),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(46.dp)
        ) {
          Text(text = "Submit Report & Block", color = Color.White, fontWeight = FontWeight.Bold)
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

@Composable
fun SafetyGuidelinesModal(
  onDismiss: () -> Unit
) {
  Dialog(onDismissRequest = onDismiss) {
    Card(
      modifier = Modifier
        .fillMaxWidth()
        .clip(RoundedCornerShape(20.dp)),
      colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
      Column(
        modifier = Modifier.padding(22.dp)
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier
              .size(40.dp)
              .clip(CircleShape)
              .background(SayviOpenGreenLight),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Security,
              contentDescription = null,
              tint = SayviOpenGreen,
              modifier = Modifier.size(22.dp)
            )
          }
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "SAYVI Safety Principles",
              fontWeight = FontWeight.Bold,
              fontSize = 17.sp,
              color = SayviTextPrimary
            )
            Text(
              text = "Designed for privacy & zero pressure",
              fontSize = 12.sp,
              color = SayviTextSecondary
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        val tips = listOf(
          "🛡️ No Exact GPS Tracking" to "We only show approximate tags ('Nearby', 'Very close'). Your coordinates are never exposed.",
          "🤝 Mutual Consent Required" to "No one can message you or see full contact info unless you both choose to say hi.",
          "☕ Meet in Public Places" to "If you decide to say hello in person, choose well-lit public spots like campus lounges or coffee shops.",
          "🔴 Total Visibility Control" to "Switch to 'I'm Not Open' anytime to become completely invisible to nearby users."
        )

        tips.forEach { (title, desc) ->
          Column(modifier = Modifier.padding(vertical = 6.dp)) {
            Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SayviTextPrimary)
            Text(text = desc, fontSize = 12.sp, color = SayviTextSecondary, lineHeight = 16.sp)
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
          onClick = onDismiss,
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
        ) {
          Text(text = "Understood", color = Color.White, fontWeight = FontWeight.SemiBold)
        }
      }
    }
  }
}

@Composable
fun PrototypeSimulatorBar(
  currentUserId: String,
  allUsers: List<UserProfile>,
  onSwitchUser: (String) -> Unit,
  onSimulateIncomingWave: (UserProfile) -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    modifier = modifier
      .fillMaxWidth()
      .padding(horizontal = 12.dp, vertical = 6.dp),
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(containerColor = SayviIndigoDark),
    elevation = CardDefaults.cardElevation(4.dp)
  ) {
    Column(
      modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(text = "🧪 PROTOTYPE MODE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA5B4FC))
          Spacer(modifier = Modifier.width(6.dp))
          Text(text = "• Switch user or simulate live waves", fontSize = 11.sp, color = Color(0xFFC7D2FE))
        }
      }

      Spacer(modifier = Modifier.height(6.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(text = "Active as:", fontSize = 11.sp, color = Color.White)

        allUsers.take(2).forEach { user ->
          val isSelected = user.id == currentUserId
          Surface(
            shape = RoundedCornerShape(8.dp),
            color = if (isSelected) Color.White else Color(0xFF3730A3),
            modifier = Modifier
              .clickable { onSwitchUser(user.id) }
          ) {
            Text(
              text = "${user.avatarEmoji} ${user.firstName}",
              fontSize = 11.sp,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
              color = if (isSelected) SayviIndigoDark else Color.White,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Trigger Incoming Wave simulation button
        val partnerUser = if (currentUserId == "user_alex") {
          allUsers.find { it.id == "user_jordan" } ?: allUsers.first()
        } else {
          allUsers.find { it.id == "user_alex" } ?: allUsers.first()
        }

        Surface(
          shape = RoundedCornerShape(8.dp),
          color = SayviRoseAccent,
          modifier = Modifier.clickable { onSimulateIncomingWave(partnerUser) }
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "👋 Wave to Me",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          }
        }
      }
    }
  }
}
