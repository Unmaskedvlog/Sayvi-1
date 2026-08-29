package com.example.ui.components

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Storage
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.local.UserProfileEntity
import com.example.model.UserProfile
import com.example.ui.theme.SayviBgLight
import com.example.ui.theme.SayviBorderLight
import com.example.ui.theme.SayviClosedRed
import com.example.ui.theme.SayviIndigoDark
import com.example.ui.theme.SayviIndigoLight
import com.example.ui.theme.SayviIndigoPrimary
import com.example.ui.theme.SayviOpenGreen
import com.example.ui.theme.SayviOpenGreenLight
import com.example.ui.theme.SayviTextMuted
import com.example.ui.theme.SayviTextPrimary
import com.example.ui.theme.SayviTextSecondary
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Reusable User Profile Component that enables setting display name, bio,
 * capturing/uploading a profile photo using the camera, and persisting to Room.
 */
@Composable
fun UserProfileComponent(
  user: UserProfile,
  savedEntity: UserProfileEntity? = null,
  onSaveToRoom: (displayName: String, bio: String, photoPath: String?, age: Int) -> Unit,
  onPhotoUpdated: (photoPath: String?) -> Unit = {},
  modifier: Modifier = Modifier,
  compactMode: Boolean = false
) {
  val context = LocalContext.current
  val coroutineScope = rememberCoroutineScope()

  var displayName by remember(user.id, user.firstName) {
    mutableStateOf(savedEntity?.displayName ?: user.firstName)
  }
  var bio by remember(user.id, user.bio) {
    mutableStateOf(savedEntity?.bio ?: user.bio)
  }
  var currentPhotoPath by remember(user.id, user.photoPath, savedEntity?.photoPath) {
    mutableStateOf(savedEntity?.photoPath ?: user.photoPath)
  }
  var temporaryBitmap by remember { mutableStateOf<Bitmap?>(null) }
  var isSaving by remember { mutableStateOf(false) }
  var showSavedSuccess by remember { mutableStateOf(false) }
  var cameraPermissionGranted by remember {
    mutableStateOf(
      ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.CAMERA
      ) == PackageManager.PERMISSION_GRANTED
    )
  }

  // Camera capture launcher (takes photo preview directly from camera hardware)
  val takePhotoLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.TakePicturePreview()
  ) { bitmap: Bitmap? ->
    if (bitmap != null) {
      temporaryBitmap = bitmap
      // Save bitmap immediately to private storage and update path
      val path = saveBitmapToInternalStorage(context, bitmap, "profile_${user.id}_${System.currentTimeMillis()}.jpg")
      currentPhotoPath = path
      onPhotoUpdated(path)
      // Automatically trigger Room update for seamless UX
      onSaveToRoom(displayName, bio, path, user.age)
      showSavedSuccess = true
    }
  }

  // Camera permission launcher
  val requestPermissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestPermission()
  ) { isGranted: Boolean ->
    cameraPermissionGranted = isGranted
    if (isGranted) {
      takePhotoLauncher.launch(null)
    }
  }

  // Launch camera helper
  val launchCamera = {
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
      takePhotoLauncher.launch(null)
    } else {
      requestPermissionLauncher.launch(Manifest.permission.CAMERA)
    }
  }

  LaunchedEffect(showSavedSuccess) {
    if (showSavedSuccess) {
      delay(3000)
      showSavedSuccess = false
    }
  }

  Card(
    modifier = modifier.fillMaxWidth(),
    shape = RoundedCornerShape(22.dp),
    colors = CardDefaults.cardColors(containerColor = Color.White),
    border = BorderStroke(1.dp, SayviBorderLight),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(20.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      // Header Section
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Person,
            contentDescription = null,
            tint = SayviIndigoPrimary,
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "User Profile",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = SayviTextPrimary
          )
        }

        // Room Database Sync Status Chip
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = SayviIndigoLight
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Storage,
              contentDescription = "Room DB",
              tint = SayviIndigoDark,
              modifier = Modifier.size(12.dp)
            )
            Text(
              text = "Room SQLite",
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = SayviIndigoDark
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Photo and Camera Capture Area
      Box(
        modifier = Modifier.size(110.dp),
        contentAlignment = Alignment.Center
      ) {
        // Main Avatar / Photo Container
        Box(
          modifier = Modifier
            .size(100.dp)
            .shadow(4.dp, CircleShape)
            .clip(CircleShape)
            .background(Color(user.avatarBgHex))
            .border(2.dp, SayviIndigoPrimary.copy(alpha = 0.4f), CircleShape)
            .clickable { launchCamera() },
          contentAlignment = Alignment.Center
        ) {
          val photoFile = currentPhotoPath?.let { File(it) }
          if (temporaryBitmap != null) {
            Image(
              bitmap = temporaryBitmap!!.asImageBitmap(),
              contentDescription = "Profile Photo",
              modifier = Modifier.fillMaxSize(),
              contentScale = ContentScale.Crop
            )
          } else if (photoFile != null && photoFile.exists()) {
            AsyncImage(
              model = ImageRequest.Builder(context)
                .data(photoFile)
                .crossfade(true)
                .build(),
              contentDescription = "Profile Photo",
              modifier = Modifier.fillMaxSize(),
              contentScale = ContentScale.Crop
            )
          } else {
            // Default avatar emoji
            Text(text = user.avatarEmoji, fontSize = 46.sp)
          }
        }

        // Camera Action Badge Button overlay
        Surface(
          shape = CircleShape,
          color = SayviIndigoPrimary,
          shadowElevation = 4.dp,
          modifier = Modifier
            .align(Alignment.BottomEnd)
            .size(34.dp)
            .clickable { launchCamera() }
        ) {
          Box(contentAlignment = Alignment.Center) {
            Icon(
              imageVector = Icons.Default.CameraAlt,
              contentDescription = "Take Photo with Camera",
              tint = Color.White,
              modifier = Modifier.size(18.dp)
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Photo actions row: Camera Shoot & Remove Photo
      Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Button(
          onClick = { launchCamera() },
          colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoLight),
          shape = RoundedCornerShape(10.dp),
          contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp, vertical = 6.dp)
        ) {
          Icon(
            imageVector = Icons.Default.CameraAlt,
            contentDescription = null,
            tint = SayviIndigoDark,
            modifier = Modifier.size(15.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = if (currentPhotoPath != null) "Retake Camera Photo" else "Take Camera Photo",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = SayviIndigoDark
          )
        }

        if (currentPhotoPath != null || temporaryBitmap != null) {
          OutlinedButton(
            onClick = {
              currentPhotoPath = null
              temporaryBitmap = null
              onPhotoUpdated(null)
              onSaveToRoom(displayName, bio, null, user.age)
            },
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, SayviClosedRed.copy(alpha = 0.4f)),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Delete,
              contentDescription = "Remove",
              tint = SayviClosedRed,
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = "Remove",
              fontSize = 11.sp,
              color = SayviClosedRed,
              fontWeight = FontWeight.Medium
            )
          }
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Display Name Input Field
      Column(modifier = Modifier.fillMaxWidth()) {
        Text(
          text = "Display Name",
          fontSize = 13.sp,
          fontWeight = FontWeight.SemiBold,
          color = SayviTextPrimary
        )
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
          value = displayName,
          onValueChange = { displayName = it },
          placeholder = { Text("Enter your name", fontSize = 14.sp) },
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(14.dp),
          colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = SayviBgLight,
            unfocusedContainerColor = SayviBgLight,
            focusedBorderColor = SayviIndigoPrimary,
            unfocusedBorderColor = SayviBorderLight
          ),
          singleLine = true
        )
      }

      Spacer(modifier = Modifier.height(14.dp))

      // Bio Input Field
      Column(modifier = Modifier.fillMaxWidth()) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Bio",
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = SayviTextPrimary
          )
          Text(
            text = "${bio.length}/150",
            fontSize = 11.sp,
            color = SayviTextMuted
          )
        }
        Spacer(modifier = Modifier.height(6.dp))
        OutlinedTextField(
          value = bio,
          onValueChange = { if (it.length <= 150) bio = it },
          placeholder = { Text("What are you up to? Coffee, study, or open to chat...", fontSize = 13.sp) },
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(14.dp),
          minLines = 3,
          maxLines = 4,
          colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = SayviBgLight,
            unfocusedContainerColor = SayviBgLight,
            focusedBorderColor = SayviIndigoPrimary,
            unfocusedBorderColor = SayviBorderLight
          )
        )
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Success Feedback Banner
      AnimatedVisibility(
        visible = showSavedSuccess,
        enter = fadeIn(),
        exit = fadeOut()
      ) {
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = SayviOpenGreenLight,
          border = BorderStroke(1.dp, SayviOpenGreen.copy(alpha = 0.3f)),
          modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(
              imageVector = Icons.Default.CheckCircle,
              contentDescription = null,
              tint = SayviOpenGreen,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "Profile updated and saved into Room Database!",
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              color = SayviOpenGreen
            )
          }
        }
      }

      // Room Database Metadata Details Card
      Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFF8FAFC),
        border = BorderStroke(1.dp, SayviBorderLight),
        modifier = Modifier.fillMaxWidth()
      ) {
        Column(modifier = Modifier.padding(12.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Room Table: user_profile",
              fontSize = 11.sp,
              fontWeight = FontWeight.SemiBold,
              color = SayviIndigoDark
            )
            val updateDate = savedEntity?.updatedAt?.let {
              SimpleDateFormat("MMM d, HH:mm", Locale.getDefault()).format(Date(it))
            } ?: "Synced"
            Text(
              text = "Last Saved: $updateDate",
              fontSize = 10.sp,
              color = SayviTextMuted
            )
          }
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = "Photo: ${if (currentPhotoPath != null) "Camera Capture Stored (Internal Files)" else "Default Avatar Emoji"}",
            fontSize = 11.sp,
            color = SayviTextSecondary
          )
        }
      }

      Spacer(modifier = Modifier.height(18.dp))

      // Save Button
      Button(
        onClick = {
          coroutineScope.launch {
            isSaving = true
            onSaveToRoom(displayName, bio, currentPhotoPath, user.age)
            delay(400)
            isSaving = false
            showSavedSuccess = true
          }
        },
        enabled = !isSaving && displayName.isNotBlank(),
        modifier = Modifier
          .fillMaxWidth()
          .height(48.dp),
        colors = ButtonDefaults.buttonColors(containerColor = SayviIndigoPrimary),
        shape = RoundedCornerShape(14.dp)
      ) {
        if (isSaving) {
          CircularProgressIndicator(
            modifier = Modifier.size(20.dp),
            color = Color.White,
            strokeWidth = 2.dp
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(text = "Saving to Room...", fontWeight = FontWeight.Bold, color = Color.White)
        } else {
          Icon(imageVector = Icons.Default.Edit, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text(text = "Save Profile to Room", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
        }
      }
    }
  }
}

/**
 * Saves a captured bitmap image to private internal storage.
 */
fun saveBitmapToInternalStorage(context: Context, bitmap: Bitmap, fileName: String): String {
  val file = File(context.filesDir, fileName)
  FileOutputStream(file).use { out ->
    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
  }
  return file.absolutePath
}
