export interface UserProfile {
  userId: string;
  username: string;
  avatar?: string;
  location?: string;
  website?: string;

  // Account settings
  isEmailVerified: boolean;
}

export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  isPrivateProfile?: boolean;
  allowFriendRequests?: boolean;
  showOnlineStatus?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  gameResultNotifications?: boolean;
  weeklyReports?: boolean;
  timezone?: string;
  language?: string;
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
