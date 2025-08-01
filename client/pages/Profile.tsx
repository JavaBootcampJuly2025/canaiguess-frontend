import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RecentGame } from "@/types/Leaderboards";
import { Brain, Sparkles, ArrowLeft, User, Lock, Shield, Settings,
  Camera, Eye, EyeOff, BarChart3, Trophy, Target, Link as LinkIcon, Clock,
  Grid3X3, Image, Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UserProfile,
  ChangePasswordRequest,
} from "@/types/Profile";
import { fetchGameData, fetchLastGames } from "@/services/gameService";
import { fetchUserStats } from "@/services/UserService";
import { UserDTO } from "@/dto/UserDTO";
import { UpdateUserRequestDTO } from "@/dto/UserUpdateRequestDTO";
import {
  AlertDialog, AlertDialogAction,
  AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserDTO | null>(null);

  const { username } = useParams<{ username: string }>();

  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [isPersonalLoading, setIsPersonalLoading] = useState(true);
  
  const [personalLoaded, setPersonalLoaded] = useState(false);
  const personalPromise = useRef<Promise<void> | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [email, setEmail] = useState("");


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
    const lastGames  = await fetchLastGames(token);

    // Fetch gameData and gameResult in parallel for each game
    const enrichedGamesPromises = lastGames.map(async (game) => {
      const gameData = await fetchGameData(game.id.toString(), token);

      let gameMode: "single" | "pair" | "group" = "group";
      if (gameData.batchSize === 1) gameMode = "single";
      else if (gameData.batchSize === 2) gameMode = "pair";

      const totalImages = gameData.batchSize * gameData.batchCount;

      return {
        id: game.id,
        score: game.score,
        gameMode,
        accuracy: gameData.accuracy,
        totalImages,
        correctGuesses: gameData.correct,
        difficulty: gameData.difficulty,
      };
    });

    // Wait for all promises to resolve
    const enrichedGames = await Promise.all(enrichedGamesPromises);

    // Remove the temporary gameId field
    return enrichedGames;
  };

  // Mock data generation
  const generateMockProfile = (): UserProfile => ({
    userId: "current-user",
    username: "Neural Detective",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=neural-detective`,
    isEmailVerified: true,
  });

  const getUserStats = async (): Promise<UserDTO> => {
    const token = localStorage.getItem("token");
    const userStats  = await fetchUserStats(token, username);
    return userStats;
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);

      const mockProfile = generateMockProfile();
      const userStats = await getUserStats();
      setProfile(mockProfile);
      setUserStats(userStats);

      setIsLoading(false);
    };

    loadProfile();
  }, [username]);

  useEffect(() => {
    // Always start background load right away:
    loadPersonal();
  }, []);

  const handleDeleteUser = async (username: string) => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${username}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      if (response.ok) {
        console.log("User deleted!");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        navigate("/");
      }
    } catch (err) {
      console.error("Deletion failed:", err.errorCode);
      alert("Something went wrong. See console.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      alert("Please check your passwords.");
      return;
    }

    setIsSaving(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/user/${username}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        }
      );

      if (!res.ok) throw new Error("Password update failed");

      alert("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateField = async (field: "email" | "password") => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    const token = localStorage.getItem("token");

    const body: UpdateUserRequestDTO = {};

    if (field === "email") {
      if (!email || email.trim() === "") {
        alert("Email cannot be empty.");
        return;
      }
      body.email = email;
    } else if (field === "password") {
      body.currentPassword = passwordForm.currentPassword;
      body.newPassword = passwordForm.newPassword;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${username}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Update failed");

      alert(`${field} updated successfully.`);
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${field}.`);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/menu")}
              className="border-border/50"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Menu</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-ai-glow" />
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-ai-glow/30 text-ai-glow">
            <User className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </Badge>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Profile Header */}
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="relative inline-block">
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Welcome to your profile, {username}!</h1>
              </div>
            </div>

            {/* Quick Stats Overview */}
            <Card className="border-border/50 backdrop-blur-sm bg-card/80">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <span className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-ai-glow" />
                    <span className="text-base sm:text-lg">Quick Stats</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/leaderboards")}
                    className="border-human-glow/30 hover:bg-human-glow/10 text-sm"
                  >
                    <Trophy className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">View Global Leaderboard</span>
                    <span className="sm:hidden">Leaderboard</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-ai-glow/10">
                    <div className="text-xl sm:text-2xl font-bold text-ai-glow">
                      {userStats.score}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Total Score
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-human-glow/10">
                    <div className="text-xl sm:text-2xl font-bold text-human-glow">
                      {userStats.totalGuesses.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Total Guesses
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-neural-purple/10">
                    <div className="text-xl sm:text-2xl font-bold text-neural-purple">
                      {(userStats.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-electric-blue/10">
                    <div className="text-xl sm:text-2xl font-bold text-electric-blue">
                      {userStats.totalGames}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Games Played
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Tabs */}
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account" className="text-sm sm:text-base">
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Account</span>
                  <span className="sm:hidden">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="lastGames" className="text-sm sm:text-base">
                  <Shield className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Last Games</span>
                  <span className="sm:hidden">Games</span>
                </TabsTrigger>
              </TabsList>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4 sm:space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm sm:text-base">Email Address</Label>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Input
                            id="email"
                            type="email"
                            onChange={(e) =>
                              setEmail(e.target.value)}
                            className="bg-background/50 text-sm sm:text-base"
                          />
                          <Button variant="outline"
                                  onClick={() => handleUpdateField("email")}
                                  className="text-sm sm:text-base">
                            Change
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold">
                          Change Password
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="text-sm sm:text-base">
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
                                className="bg-background/50 pr-10 text-sm sm:text-base"
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
                            <Label htmlFor="newPassword" className="text-sm sm:text-base">New Password</Label>
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
                                className="bg-background/50 pr-10 text-sm sm:text-base"
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
                            <Label htmlFor="confirmNewPassword" className="text-sm sm:text-base">
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
                              className="bg-background/50 text-sm sm:text-base"
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
                            className="w-full sm:w-auto text-sm sm:text-base bg-gradient-to-r from-human-glow to-cyber-green hover:from-human-glow/90 hover:to-cyber-green/90"
                          >
                            <Lock className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Update Password</span>
                            <span className="sm:hidden">Update</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Statistics Tab */}
              <TabsContent value="lastGames" className="space-y-4 sm:space-y-6">
                {/* User Stats Overview */}
                {isPersonalLoading  ?
                  <div className="flex items-center justify-center h-48 sm:h-64">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
                      <span className="text-sm sm:text-base text-muted-foreground">
                    Loading your statistics...
                  </span>
                    </div>
                  </div>
                  :
                  <div>

                    {/* Mode Performance and Recent Games */}
                    <div className="grid lg:grid-cols-1 gap-4 sm:gap-6">
                      {/* Recent Games History */}
                      <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                        <CardHeader className="p-4 sm:p-6">
                          <CardTitle className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-human-glow" />
                            <span className="text-base sm:text-lg">Recent Games</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                            {recentGames.map((game) => (
                              <div
                                key={game.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors space-y-2 sm:space-y-0"
                              >
                                <div className="flex items-center space-x-3 w-full sm:w-auto">
                                  <div className="flex-shrink-0">
                                    {getGameModeIcon(game.gameMode)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                  <span className="font-medium text-sm sm:text-base capitalize">
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
                                <div className="text-right w-full sm:w-auto">
                                  {game.score == null && (
                                    <Button
                                      size="sm"
                                      className="w-full sm:w-auto text-sm"
                                      onClick={() => navigate("/game/" + game.id)}
                                    >
                                      Continue
                                    </Button>
                                  )}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full sm:w-auto text-sm sm:text-base hover:bg-red-500/10 text-red-600"
                >
                  <Lock className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Delete Profile</span>
                  <span className="sm:hidden">Delete Account</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account, {username}? This action cannot be undone and will permanently remove your account and all associated data!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteUser(username)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete User
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
