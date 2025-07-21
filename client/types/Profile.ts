export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;

  // Account settings
  isEmailVerified: boolean;
  isPrivateProfile: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;

  // Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  gameResultNotifications: boolean;
  weeklyReports: boolean;

  // Account metadata
  createdAt: string;
  lastLoginAt: string;
  timezone?: string;
  language: string;
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

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: ActiveSession[];
  trustedDevices: TrustedDevice[];
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface TrustedDevice {
  id: string;
  deviceName: string;
  addedAt: string;
  lastUsed: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}
