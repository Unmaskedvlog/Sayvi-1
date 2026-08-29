package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.SampleData
import com.example.ui.components.SayviBrandLogo
import com.example.ui.theme.SayviBgLight
import com.example.ui.theme.SayviBorderLight
import com.example.ui.theme.SayviIndigoDark
import com.example.ui.theme.SayviIndigoLight
import com.example.ui.theme.SayviIndigoPrimary
import com.example.ui.theme.SayviOpenGreen
import com.example.ui.theme.SayviOpenGreenLight
import com.example.ui.theme.SayviRoseAccent
import com.example.ui.theme.SayviTextMuted
import com.example.ui.theme.SayviTextPrimary
import com.example.ui.theme.SayviTextSecondary
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
  onFinish: () -> Unit
) {
  var startAnimation by remember { mutableStateOf(false) }

  val alphaAnim by animateFloatAsState(
    targetValue = if (startAnimation) 1f else 0f,
    animationSpec = tween(durationMillis = 900, easing = FastOutSlowInEasing),
    label = "splashAlpha"
  )
  val scaleAnim by animateFloatAsState(
    targetValue = if (startAnimation) 1f else 0.85f,
    animationSpec = tween(durationMillis = 900, easing = FastOutSlowInEasing),
    label = "splashScale"
  )

  LaunchedEffect(Unit) {
    startAnimation = true
    delay(1800)
    onFinish()
  }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight),
    contentAlignment = Alignment.Center
  ) {
    Column(
      modifier = Modifier
        .scale(scaleAnim)
        .alpha(alphaAnim),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      SayviBrandLogo(large = true, showTagline = true)
      Spacer(modifier = Modifier.height(28.dp))
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(SayviIndigoPrimary))
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(SayviRoseAccent))
        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(SayviOpenGreen))
      }
    }
  }
}

@Composable
fun WelcomeScreen(
  onGetStarted: () -> Unit,
  onAlreadyHaveAccount: () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
      .padding(horizontal = 24.dp, vertical = 20.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    // Top Bar
    SayviBrandLogo(showTagline = false)

    // Center Hero
    Column(
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = Modifier.fillMaxWidth()
    ) {
      Box(
        modifier = Modifier
          .size(110.dp)
          .clip(CircleShape)
          .background(SayviIndigoLight),
        contentAlignment = Alignment.Center
      ) {
        Text(text = "👋", fontSize = 52.sp)
      }

      Spacer(modifier = Modifier.height(24.dp))

      Text(
        text = "Meet people without the awkward first move.",
        fontSize = 25.sp,
        fontWeight = FontWeight.Black,
        color = SayviTextPrimary,
        textAlign = TextAlign.Center,
        lineHeight = 32.sp
      )

      Spacer(modifier = Modifier.height(12.dp))

      Text(
        text = "SAYVI lets you discreetly let someone nearby know you'd like to connect.",
        fontSize = 15.sp,
        color = SayviTextSecondary,
        textAlign = TextAlign.Center,
        lineHeight = 22.sp
      )

      Spacer(modifier = Modifier.height(24.dp))

      // Value props
      Column(
        verticalArrangement = Arrangement.spacedBy(10.dp),
        modifier = Modifier.fillMaxWidth()
      ) {
        ValuePropRow(
          icon = "🟢",
          title = "Know who is open",
          desc = "Only connect with people who chose to be open to saying hi."
        )
        ValuePropRow(
          icon = "🛡️",
          title = "Zero awkwardness & private",
          desc = "No exact GPS tracking. Full profile unlocks only when both agree."
        )
        ValuePropRow(
          icon = "☕",
          title = "Friends, study buddies & networking",
          desc = "Perfect for campus, cafes, events, or exploring a new city."
        )
      }
    }

    // Bottom Action Buttons
    Column(
      modifier = Modifier.fillMaxWidth(),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      Button(
        onClick = onGetStarted,
        modifier = Modifier
          .fillMaxWidth()
          .height(54.dp),
        colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
        shape = RoundedCornerShape(16.dp)
      ) {
        Text(
          text = "Get Started",
          fontSize = 16.sp,
          fontWeight = FontWeight.Bold,
          color = Color.White
        )
      }

      OutlinedButton(
        onClick = onAlreadyHaveAccount,
        modifier = Modifier
          .fillMaxWidth()
          .height(50.dp),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight)
      ) {
        Text(
          text = "I Already Have an Account",
          fontSize = 15.sp,
          fontWeight = FontWeight.SemiBold,
          color = SayviTextPrimary
        )
      }
    }
  }
}

@Composable
private fun ValuePropRow(icon: String, title: String, desc: String) {
  Surface(
    shape = RoundedCornerShape(14.dp),
    color = Color.White,
    border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight),
    modifier = Modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(text = icon, fontSize = 20.sp)
      Spacer(modifier = Modifier.width(12.dp))
      Column {
        Text(text = title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = SayviTextPrimary)
        Text(text = desc, fontSize = 12.sp, color = SayviTextSecondary, lineHeight = 16.sp)
      }
    }
  }
}

@Composable
fun SignUpScreen(
  onSuccess: () -> Unit,
  onNavigateToLogin: () -> Unit
) {
  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
      .padding(horizontal = 24.dp, vertical = 20.dp),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column {
      SayviBrandLogo(showTagline = false)
      Spacer(modifier = Modifier.height(28.dp))

      Text(
        text = "Create your SAYVI account",
        fontSize = 24.sp,
        fontWeight = FontWeight.Black,
        color = SayviTextPrimary
      )
      Spacer(modifier = Modifier.height(6.dp))
      Text(
        text = "Join a community of friendly, respectful people open to meeting.",
        fontSize = 14.sp,
        color = SayviTextSecondary
      )

      Spacer(modifier = Modifier.height(24.dp))

      // Social fast login buttons
      OutlinedButton(
        onClick = onSuccess,
        modifier = Modifier
          .fillMaxWidth()
          .height(50.dp),
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight),
        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White)
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(text = "🌐", fontSize = 18.sp)
          Spacer(modifier = Modifier.width(10.dp))
          Text(text = "Continue with Google", fontWeight = FontWeight.SemiBold, color = SayviTextPrimary)
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      OutlinedButton(
        onClick = onSuccess,
        modifier = Modifier
          .fillMaxWidth()
          .height(50.dp),
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, SayviBorderLight),
        colors = ButtonDefaults.outlinedButtonColors(containerColor = Color.White)
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(text = "🍎", fontSize = 18.sp)
          Spacer(modifier = Modifier.width(10.dp))
          Text(text = "Continue with Apple", fontWeight = FontWeight.SemiBold, color = SayviTextPrimary)
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Box(modifier = Modifier.weight(1f).height(1.dp).background(SayviBorderLight))
        Text(
          text = "or with email",
          fontSize = 12.sp,
          color = SayviTextMuted,
          modifier = Modifier.padding(horizontal = 10.dp)
        )
        Box(modifier = Modifier.weight(1f).height(1.dp).background(SayviBorderLight))
      }

      Spacer(modifier = Modifier.height(16.dp))

      OutlinedTextField(
        value = email,
        onValueChange = { email = it },
        label = { Text("Email address") },
        placeholder = { Text("alex@university.edu") },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedContainerColor = Color.White,
          unfocusedContainerColor = Color.White,
          focusedBorderColor = SayviIndigoPrimary,
          unfocusedBorderColor = SayviBorderLight
        ),
        singleLine = true
      )

      Spacer(modifier = Modifier.height(12.dp))

      OutlinedTextField(
        value = password,
        onValueChange = { password = it },
        label = { Text("Password") },
        placeholder = { Text("At least 8 characters") },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedContainerColor = Color.White,
          unfocusedContainerColor = Color.White,
          focusedBorderColor = SayviIndigoPrimary,
          unfocusedBorderColor = SayviBorderLight
        ),
        singleLine = true
      )
    }

    Column(
      modifier = Modifier.fillMaxWidth(),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      Button(
        onClick = onSuccess,
        modifier = Modifier
          .fillMaxWidth()
          .height(52.dp),
        colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
        shape = RoundedCornerShape(14.dp)
      ) {
        Text(text = "Create Account", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
      }

      Text(
        text = "By signing up, you agree to our Safe Community Guidelines. Exact location is never shared.",
        fontSize = 11.sp,
        color = SayviTextMuted,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(horizontal = 12.dp)
      )
    }
  }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CreateProfileScreen(
  onComplete: (name: String, age: Int, bio: String, avatar: String, interests: List<String>) -> Unit
) {
  var name by remember { mutableStateOf("Alex") }
  var ageStr by remember { mutableStateOf("21") }
  var bio by remember { mutableStateOf("Music lover and tech enthusiast. Always down for coffee and vinyl records.") }
  var selectedAvatar by remember { mutableStateOf("🎧") }
  var selectedInterests by remember {
    mutableStateOf(listOf("🎵 Music", "💻 Technology", "☕ Coffee", "🎮 Gaming"))
  }

  val avatars = listOf("🎧", "🎨", "🌿", "🚀", "☕", "📚", "🎬", "🎸", "🐱", "✨")

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SayviBgLight)
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 24.dp, vertical = 20.dp),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column {
      SayviBrandLogo(showTagline = false)
      Spacer(modifier = Modifier.height(20.dp))

      Text(
        text = "Set up your SAYVI profile",
        fontSize = 24.sp,
        fontWeight = FontWeight.Black,
        color = SayviTextPrimary
      )
      Spacer(modifier = Modifier.height(4.dp))
      Text(
        text = "Keep it simple. You're in total control of what you share.",
        fontSize = 13.sp,
        color = SayviTextSecondary
      )

      Spacer(modifier = Modifier.height(20.dp))

      // Avatar Selector
      Text(text = "Choose your avatar", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = SayviTextPrimary)
      Spacer(modifier = Modifier.height(8.dp))
      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        avatars.forEach { avatar ->
          val isSelected = selectedAvatar == avatar
          Box(
            modifier = Modifier
              .size(46.dp)
              .clip(CircleShape)
              .background(if (isSelected) SayviIndigoLight else Color.White)
              .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) SayviIndigoPrimary else SayviBorderLight,
                shape = CircleShape
              )
              .clickable { selectedAvatar = avatar },
            contentAlignment = Alignment.Center
          ) {
            Text(text = avatar, fontSize = 22.sp)
          }
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Name & Age
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = name,
          onValueChange = { name = it },
          label = { Text("First Name") },
          modifier = Modifier.weight(2f),
          shape = RoundedCornerShape(14.dp),
          colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = Color.White,
            unfocusedContainerColor = Color.White,
            focusedBorderColor = SayviIndigoPrimary,
            unfocusedBorderColor = SayviBorderLight
          ),
          singleLine = true
        )

        OutlinedTextField(
          value = ageStr,
          onValueChange = { ageStr = it },
          label = { Text("Age") },
          modifier = Modifier.weight(1f),
          keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
          shape = RoundedCornerShape(14.dp),
          colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = Color.White,
            unfocusedContainerColor = Color.White,
            focusedBorderColor = SayviIndigoPrimary,
            unfocusedBorderColor = SayviBorderLight
          ),
          singleLine = true
        )
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Short Bio
      OutlinedTextField(
        value = bio,
        onValueChange = { bio = it },
        label = { Text("Short Bio") },
        placeholder = { Text("A sentence about what you enjoy or why you're open...") },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedContainerColor = Color.White,
          unfocusedContainerColor = Color.White,
          focusedBorderColor = SayviIndigoPrimary,
          unfocusedBorderColor = SayviBorderLight
        ),
        minLines = 2,
        maxLines = 3
      )

      Spacer(modifier = Modifier.height(18.dp))

      // Interests Selector
      Text(
        text = "Select your interests (${selectedInterests.size} selected)",
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        color = SayviTextPrimary
      )
      Spacer(modifier = Modifier.height(8.dp))

      FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        SampleData.allAvailableInterests.forEach { interest ->
          val isSelected = selectedInterests.contains(interest)
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (isSelected) SayviIndigoPrimary else Color.White,
            border = androidx.compose.foundation.BorderStroke(
              1.dp,
              if (isSelected) SayviIndigoPrimary else SayviBorderLight
            ),
            modifier = Modifier.clickable {
              selectedInterests = if (isSelected) {
                selectedInterests - interest
              } else {
                selectedInterests + interest
              }
            }
          ) {
            Row(
              modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = interest,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else SayviTextPrimary
              )
              if (isSelected) {
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                  imageVector = Icons.Default.Check,
                  contentDescription = null,
                  tint = Color.White,
                  modifier = Modifier.size(14.dp)
                )
              }
            }
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(24.dp))

    Button(
      onClick = {
        val parsedAge = ageStr.toIntOrNull() ?: 21
        onComplete(name, parsedAge, bio, selectedAvatar, selectedInterests)
      },
      modifier = Modifier
        .fillMaxWidth()
        .height(52.dp),
      colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
      shape = RoundedCornerShape(14.dp)
    ) {
      Text(text = "Complete Profile & Enter SAYVI", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
  }
}
