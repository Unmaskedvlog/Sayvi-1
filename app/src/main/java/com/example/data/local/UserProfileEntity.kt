package com.example.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfileEntity(
  @PrimaryKey
  val id: String,
  
  @ColumnInfo(name = "display_name")
  val displayName: String,
  
  @ColumnInfo(name = "bio")
  val bio: String,
  
  @ColumnInfo(name = "photo_path")
  val photoPath: String? = null,
  
  @ColumnInfo(name = "avatar_emoji")
  val avatarEmoji: String = "🎧",
  
  @ColumnInfo(name = "avatar_bg_hex")
  val avatarBgHex: Long = 0xFF6366F1,
  
  @ColumnInfo(name = "age")
  val age: Int = 21,
  
  @ColumnInfo(name = "interests_csv")
  val interestsCsv: String = "☕ Coffee,🎵 Music",
  
  @ColumnInfo(name = "is_open")
  val isOpen: Boolean = true,
  
  @ColumnInfo(name = "updated_at")
  val updatedAt: Long = System.currentTimeMillis()
)
