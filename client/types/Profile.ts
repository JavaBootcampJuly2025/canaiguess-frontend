export interface UserProfile {
  userId: string;
  username: string;
  avatar?: string;

  // Account settings
  isEmailVerified: boolean;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}
