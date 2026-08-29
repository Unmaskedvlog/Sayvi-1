package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme =
  darkColorScheme(
    primary = SayviIndigoPrimary,
    onPrimary = Color.White,
    primaryContainer = SayviIndigoDark,
    onPrimaryContainer = Color.White,
    secondary = SayviRoseAccent,
    onSecondary = Color.White,
    tertiary = SayviOpenGreen,
    background = SayviBgDark,
    surface = SayviCardDark,
    onBackground = SayviTextPrimaryDark,
    onSurface = SayviTextPrimaryDark,
    outline = SayviBorderDark,
    surfaceVariant = Color(0xFF1E293B),
    onSurfaceVariant = SayviTextSecondaryDark,
  )

private val LightColorScheme =
  lightColorScheme(
    primary = SayviIndigoPrimary,
    onPrimary = Color.White,
    primaryContainer = SayviIndigoLight,
    onPrimaryContainer = SayviIndigoDark,
    secondary = SayviCoralAccent,
    onSecondary = Color.White,
    tertiary = SayviOpenGreen,
    background = SayviBgLight,
    surface = SayviCardLight,
    onBackground = SayviTextPrimary,
    onSurface = SayviTextPrimary,
    outline = SayviBorderLight,
    surfaceVariant = Color(0xFFF1F5F9),
    onSurfaceVariant = SayviTextSecondary,
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content
  )
}
