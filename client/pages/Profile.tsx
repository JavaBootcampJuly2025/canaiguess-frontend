import { useState, useEffect, useRef } from "react";
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
import { RecentGame } from "@/types/Leaderboards";
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
  Eye,
  EyeOff,
  BarChart3,
  Trophy,
  Target,
  Link as LinkIcon,
  Check,
  Clock,
  Grid3X3,
  Image,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserProfile,
  ChangePasswordRequest,
  SecuritySettings,
} from "@/types/Profile";
import { UserStats } from "@/types/Stats";
import { fetchGameData, fetchLastGames } from "@/services/gameService";

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [isPersonalLoading, setIsPersonalLoading] = useState(true);
  
  const [personalLoaded, setPersonalLoaded] = useState(false);
  const personalPromise = useRef<Promise<void> | null>(null);

  const [currentTab, setCurrentTab] = useState("score");
  
  
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettings | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadPersonal = () => {
    personalPromise.current = retrieveRecentGames().then((games) => {
      setRecentGames(games);
      setIsPersonalLoading(false);
      setPersonalLoaded(true);
    });
    return personalPromise.current;
  };

  const retrieveRecentGames = async (): Promise<RecentGame[]> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");

    // Fetch last games list
    const lastGames  = await fetchLastGames(token); // returns [{ gameId, pointsEarned }, ...]

    // Fetch gameData and gameResult in parallel for each game
    const enrichedGamesPromises = lastGames.map(async (game) => {
      const gameData = await fetchGameData(game.id.toString(), token);

      let gameMode: "single" | "pair" | "group" = "group";
      if (gameData.batchSize === 1) gameMode = "single";
      else if (gameData.batchSize === 2) gameMode = "pair";

      const totalImages = gameData.batchSize * gameData.batchCount;

      return {
        id: `game-${game.id}`,
        score: game.score,
        gameMode,
        accuracy: gameData.accuracy,
        totalImages,
        correctGuesses: gameData.correct,
        difficulty: gameData.difficulty,
        gameId: game.id,  // keep numeric ID for sorting
      };
    });

    // Wait for all promises to resolve
    const enrichedGames = await Promise.all(enrichedGamesPromises);

    // Sort by numeric gameId descending (latest first)
    // enrichedGames.sort((a, b) => b.id - a.id);

    // Remove the temporary gameId field if you want
    return enrichedGames.map(({ gameId, ...rest }) => rest);
  };

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

  useEffect(() => {
    // Always start background load right away:
    loadPersonal();
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

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);

    if (tab === "personal" && !personalLoaded) {
      setIsPersonalLoading(true);
      loadPersonal(); // uses the single ref + sets flags
    }
  };

  const getGameModeIcon = (mode: string) => {
    switch (mode) {
      case "single":
        return <Image className="w-4 h-4 text-ai-glow" />;
      case "pair":
        return <Images className="w-4 h-4 text-human-glow" />;
      case "group":
        return <Grid3X3 className="w-4 h-4 text-neural-purple" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) {
      return "text-green-400 bg-green-400/10";
    } else if (difficulty < 60) {
      return "text-blue-400 bg-blue-400/10";
    } else if (difficulty < 80) {
      return "text-purple-400 bg-purple-400/10";
    } else {
      return "text-red-400 bg-red-400/10";
    }
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
                    View Global Leaderboard
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

            {/* Profile Tabs */}
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">
                  <Settings className="w-4 h-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="lastGames">
                  <Shield className="w-4 h-4 mr-2" />
                  Last Games
                </TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="username"
                            value={profile.username}
                            onChange={(e) =>
                              setProfile({ ...profile, username: e.target.value })
                            }
                            className="bg-background/50"
                          />
                              <Button variant="outline">
                                Change
                              </Button>
                        </div>
                      </div>
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


              {/* Personal Statistics Tab */}
              <TabsContent value="lastGames" className="space-y-6">
                {/* User Stats Overview */}
                {isPersonalLoading  ?
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
                      <span className="text-muted-foreground">
                    Loading your statistics...
                  </span>
                    </div>
                  </div>
                  :
                  <div>

                    {/* Mode Performance and Recent Games */}
                    <div className="grid lg:grid-cols-1 gap-6">
                      {/* Recent Games History */}
                      <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-human-glow" />
                            <span>Recent Games</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {recentGames.map((game) => (
                              <div
                                key={game.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {getGameModeIcon(game.gameMode)}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                  <span className="font-medium capitalize">
                                    {game.gameMode}
                                  </span>
                                      <Badge className={cn("text-xs capitalize", getDifficultyColor(game.difficulty))}>
                                        {game.difficulty + "%"}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {game.correctGuesses}/{game.totalImages}{" "}
                                      images
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">
                                    {game.score ?? "Not finished"}
                                  </div>
                                  {game.score != null && (
                                    <div className="text-xs text-muted-foreground">
                                      {game.accuracy.toFixed(1)}%
                                    </div>
                                  )}

                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
