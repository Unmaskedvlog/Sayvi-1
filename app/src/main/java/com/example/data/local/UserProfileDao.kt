package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface UserProfileDao {
  @Query("SELECT * FROM user_profile WHERE id = :userId LIMIT 1")
  fun getUserProfileFlow(userId: String): Flow<UserProfileEntity?>

  @Query("SELECT * FROM user_profile LIMIT 1")
  fun getAnyProfileFlow(): Flow<UserProfileEntity?>

  @Query("SELECT * FROM user_profile WHERE id = :userId LIMIT 1")
  suspend fun getUserProfile(userId: String): UserProfileEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertOrUpdate(profile: UserProfileEntity)

  @Query("UPDATE user_profile SET photo_path = :photoPath, updated_at = :updatedAt WHERE id = :userId")
  suspend fun updatePhoto(userId: String, photoPath: String?, updatedAt: Long = System.currentTimeMillis())

  @Query("UPDATE user_profile SET display_name = :displayName, bio = :bio, updated_at = :updatedAt WHERE id = :userId")
  suspend fun updateNameAndBio(userId: String, displayName: String, bio: String, updatedAt: Long = System.currentTimeMillis())

  @Query("DELETE FROM user_profile WHERE id = :userId")
  suspend fun deleteProfile(userId: String)
}
