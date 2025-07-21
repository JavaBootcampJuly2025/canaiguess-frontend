import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Sparkles,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Shield,
  Settings,
  Camera,
  Save,
  Edit,
  Eye,
  EyeOff,
  BarChart3,
  Trophy,
  Target,
  Calendar,
  Globe,
  Bell,
  Smartphone,
  Monitor,
  MapPin,
  Link as LinkIcon,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserProfile,
  ChangePasswordRequest,
  SecuritySettings,
} from "@/types/Profile";
import { UserStats } from "@/types/Stats";

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettings | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock data generation
  const generateMockProfile = (): UserProfile => ({
    userId: "current-user",
    username: "Neural Detective",
    email: "neural.detective@example.com",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=neural-detective`,
    firstName: "Alex",
    lastName: "Neural",
    bio: "AI enthusiast and neural network detective. Passionate about distinguishing between human creativity and artificial intelligence.",
    location: "San Francisco, CA",
    website: "https://neuraldetective.com",
    isEmailVerified: true,
    isPrivateProfile: false,
    allowFriendRequests: true,
    showOnlineStatus: true,
    emailNotifications: true,
    pushNotifications: false,
    gameResultNotifications: true,
    weeklyReports: true,
    createdAt: "2024-01-15T00:00:00Z",
    lastLoginAt: new Date().toISOString(),
    timezone: "America/Los_Angeles",
    language: "en",
  });

  const generateMockUserStats = (): UserStats => ({
    userId: "current-user",
    username: "Neural Detective",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=neural-detective`,
    totalScore: 8742,
    totalGamesPlayed: 156,
    totalImagesGuessed: 1248,
    totalCorrectGuesses: 1098,
    overallAccuracy: 88.0,
    bestAccuracy: 100.0,
    bestScore: 980,
    singleImageStats: {
      gamesPlayed: 67,
      totalImages: 670,
      correctGuesses: 602,
      accuracy: 89.9,
      bestAccuracy: 100.0,
      averageScore: 89.5,
      bestScore: 980,
    },
    pairImageStats: {
      gamesPlayed: 45,
      totalImages: 450,
      correctGuesses: 378,
      accuracy: 84.0,
      bestAccuracy: 95.0,
      averageScore: 84.2,
      bestScore: 950,
    },
    groupImageStats: {
      gamesPlayed: 44,
      totalImages: 308,
      correctGuesses: 268,
      accuracy: 87.0,
      bestAccuracy: 100.0,
      averageScore: 87.8,
      bestScore: 1000,
    },
    currentStreak: 12,
    longestStreak: 28,
    gamesThisWeek: 23,
    gamesThisMonth: 67,
    globalRank: 47,
    skillTier: "expert",
    lastPlayedAt: new Date().toISOString(),
    joinedAt: "2024-01-15T00:00:00Z",
  });

  const generateMockSecuritySettings = (): SecuritySettings => ({
    twoFactorEnabled: false,
    lastPasswordChange: "2024-02-01T00:00:00Z",
    activeSessions: [
      {
        id: "session-1",
        deviceName: "Chrome on MacBook Pro",
        location: "San Francisco, CA",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        id: "session-2",
        deviceName: "Safari on iPhone",
        location: "San Francisco, CA",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isCurrent: false,
      },
    ],
    trustedDevices: [
      {
        id: "device-1",
        deviceName: "MacBook Pro",
        addedAt: "2024-01-15T00:00:00Z",
        lastUsed: new Date().toISOString(),
      },
    ],
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockProfile = generateMockProfile();
      const mockUserStats = generateMockUserStats();
      const mockSecuritySettings = generateMockSecuritySettings();

      setProfile(mockProfile);
      setUserStats(mockUserStats);
      setSecuritySettings(mockSecuritySettings);
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsSaving(false);
  };

  const handleUpdatePreference = (key: keyof UserProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  };

  if (isLoading || !profile || !userStats) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
            <span className="text-lg text-muted-foreground">
              Loading profile...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neural-purple/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/menu")}
              className="border-border/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-6 h-6 text-ai-glow" />
                <Sparkles className="w-3 h-3 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-lg font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-ai-glow/30 text-ai-glow">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Badge>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 border-4 border-ai-glow/20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.username[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-ai-glow hover:bg-ai-glow/90"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                {profile.isEmailVerified && (
                  <Badge className="mt-2 bg-human-glow/20 text-human-glow border-human-glow/30">
                    <Check className="w-3 h-3 mr-1" />
                    Email Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats Overview */}
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-ai-glow" />
                    <span>Quick Stats</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/leaderboards?tab=personal")}
                    className="border-human-glow/30 hover:bg-human-glow/10"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    View Full Stats
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-ai-glow/10">
                    <div className="text-2xl font-bold text-ai-glow">
                      #{userStats.globalRank}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Global Rank
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-human-glow/10">
                    <div className="text-2xl font-bold text-human-glow">
                      {userStats.totalScore.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Score
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-neural-purple/10">
                    <div className="text-2xl font-bold text-neural-purple">
                      {userStats.overallAccuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-electric-blue/10">
                    <div className="text-2xl font-bold text-electric-blue">
                      {userStats.totalGamesPlayed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Games Played
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Settings Tabs */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">
                  <Edit className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="account">
                  <Settings className="w-4 h-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  <Bell className="w-4 h-4 mr-2" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) =>
                          setProfile({ ...profile, username: e.target.value })
                        }
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        className="bg-background/50 min-h-20"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-ai-glow to-electric-blue hover:from-ai-glow/90 hover:to-electric-blue/90"
                    >
                      {isSaving ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                            className="bg-background/50 flex-1"
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Mail className="w-4 h-4 mr-2" />
                                Change
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Email Address</DialogTitle>
                                <DialogDescription>
                                  Enter your new email address and current
                                  password.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="newEmail">New Email</Label>
                                  <Input
                                    id="newEmail"
                                    type="email"
                                    placeholder="new@example.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirmPassword">
                                    Current Password
                                  </Label>
                                  <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Enter current password"
                                  />
                                </div>
                                <Button className="w-full">Update Email</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                          Change Password
                        </h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">
                              Current Password
                            </Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    currentPassword: e.target.value,
                                  })
                                }
                                className="bg-background/50 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                              >
                                {showCurrentPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                  setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value,
                                  })
                                }
                                className="bg-background/50 pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                              >
                                {showNewPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmNewPassword">
                              Confirm New Password
                            </Label>
                            <Input
                              id="confirmNewPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) =>
                                setPasswordForm({
                                  ...passwordForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="bg-background/50"
                            />
                          </div>
                          <Button
                            onClick={handlePasswordChange}
                            disabled={
                              !passwordForm.currentPassword ||
                              !passwordForm.newPassword ||
                              passwordForm.newPassword !==
                              passwordForm.confirmPassword ||
                              isSaving
                            }
                            className="bg-gradient-to-r from-human-glow to-cyber-green hover:from-human-glow/90 hover:to-cyber-green/90"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Update Password
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings?.twoFactorEnabled || false}
                        onCheckedChange={(checked) =>
                          setSecuritySettings((prev) =>
                            prev
                              ? { ...prev, twoFactorEnabled: checked }
                              : null,
                          )
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold">Active Sessions</h3>
                      {securitySettings?.activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/20"
                        >
                          <div className="flex items-center space-x-3">
                            <Monitor className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium flex items-center space-x-2">
                                <span>{session.deviceName}</span>
                                {session.isCurrent && (
                                  <Badge variant="outline" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {session.location} • Last active:{" "}
                                {new Date(session.lastActive).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button variant="outline" size="sm">
                              <X className="w-4 h-4 mr-2" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle>Privacy & Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Privacy Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Private Profile</div>
                            <div className="text-sm text-muted-foreground">
                              Make your profile visible only to friends
                            </div>
                          </div>
                          <Switch
                            checked={profile.isPrivateProfile}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference(
                                "isPrivateProfile",
                                checked,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              Show Online Status
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Let others see when you're online
                            </div>
                          </div>
                          <Switch
                            checked={profile.showOnlineStatus}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference(
                                "showOnlineStatus",
                                checked,
                              )
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <h3 className="font-semibold">Notification Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              Email Notifications
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Receive updates via email
                            </div>
                          </div>
                          <Switch
                            checked={profile.emailNotifications}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference(
                                "emailNotifications",
                                checked,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              Game Result Notifications
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Get notified about game results and achievements
                            </div>
                          </div>
                          <Switch
                            checked={profile.gameResultNotifications}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference(
                                "gameResultNotifications",
                                checked,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Weekly Reports</div>
                            <div className="text-sm text-muted-foreground">
                              Receive weekly performance summaries
                            </div>
                          </div>
                          <Switch
                            checked={profile.weeklyReports}
                            onCheckedChange={(checked) =>
                              handleUpdatePreference("weeklyReports", checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
