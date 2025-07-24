import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BarChart3,
  Brain,
  Grid3X3,
  Image,
  Images,
  LogOut,
  Play,
  Shield,
  Sparkles,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createNewGame } from "@/services/gameService";
import { GlobalStatsDTO } from "@/dto/GlobalStatsDTO";

export default function MainMenu() {
  // Default values for new game
  var [batchSize, setBatchSize] = useState("3");
  var [batchCount, setBatchCount] = useState("10");
  var [difficulty, setDifficulty] = useState("50");
  var [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const isGuest = localStorage.getItem("isGuest") === "true";
  const [gameMode, setGameMode] = useState("1");

  const [stats, setStats] = useState<GlobalStatsDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDialogOpen(false);

    // Use custom batch size if group mode is selected, else fix
    const finalBatchSize = gameMode === "group" ? batchSize : gameMode;
    const token = localStorage.getItem("token");

    try {
      const data = await createNewGame(Number(batchCount), Number(finalBatchSize), Number(difficulty), token);

      if (data) {
        navigate("/game/" + data.gameId);
      } else {
        console.error("Game not created!");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always start background loads right away:
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
      const response = await fetch(`${API_BASE_URL}/api/global/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch global stats");
      }
      const data: GlobalStatsDTO = await response.json();
      console.log(data);
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
            <span className="text-lg text-muted-foreground">
              Preparing to fool you...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neural-purple/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Neural network pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="neural-grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="2" fill="currentColor" />
              <circle cx="0" cy="0" r="1" fill="currentColor" />
              <circle cx="100" cy="0" r="1" fill="currentColor" />
              <circle cx="0" cy="100" r="1" fill="currentColor" />
              <circle cx="100" cy="100" r="1" fill="currentColor" />
              <line
                x1="50"
                y1="50"
                x2="0"
                y2="0"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <line
                x1="50"
                y1="50"
                x2="100"
                y2="0"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <line
                x1="50"
                y1="50"
                x2="0"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <line
                x1="50"
                y1="50"
                x2="100"
                y2="100"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-ai-glow" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                <span className="hidden xs:inline">CanAIGuess</span>
                <span className="xs:hidden">CAG</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User info - hidden on small screens */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{username}</span>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="sm:hidden">
              <ThemeToggle />
            </div>

            {/* Admin button - responsive */}
            {localStorage.getItem("role") === "ADMIN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600"
              >
                <Shield className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Button>
            )}

            {/* Profile button - responsive */}
            {localStorage.getItem("isGuest") == "false" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/profile/${username}`)}
                className="border-border/50"
              >
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            )}

            {/* Logout button - responsive */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border/50 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-6xl space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Neural Arena
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Test your perception against the latest AI image generation. Can
                you distinguish between human creativity and artificial
                intelligence?
              </p>
            </div>

            {/* Main Action Cards */}
            <div
              className={`grid gap-6 max-w-4xl mx-auto ${
                isGuest ? "grid-cols-1" : "md:grid-cols-2"
              }`}
            >
              {/* Play Game Card */}
              <Card
                className="border-border/50 backdrop-blur-sm bg-card/80 hover:shadow-xl hover:shadow-ai-glow/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="p-2 rounded-lg bg-ai-glow/10">
                      <Play className="w-6 h-6 text-ai-glow" />
                    </div>
                    <span>Start Challenge</span>
                  </CardTitle>
                  <CardDescription>
                    Choose your difficulty and test your AI detection skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className={cn(
                          "w-full h-12 bg-gradient-to-r from-ai-glow to-electric-blue hover:from-ai-glow/90 hover:to-electric-blue/90",
                          "shadow-lg shadow-ai-glow/25 transition-all duration-300 text-base font-semibold",
                        )}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Enter Neural Arena
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-ai-glow" />
                          <span>Select Game Mode</span>
                        </DialogTitle>
                        <DialogDescription>
                          Choose your challenge type and number of rounds
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <Label className="text-base font-medium">
                            Game Mode
                          </Label>
                          <RadioGroup
                            value={gameMode}
                            onValueChange={setGameMode}
                          >
                            <div
                              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <RadioGroupItem value="1" id="single" />
                              <div className="flex items-center space-x-2 flex-1">
                                <Image className="w-5 h-5 text-ai-glow" />
                                <div>
                                  <Label
                                    htmlFor="1"
                                    className="cursor-pointer font-medium"
                                  >
                                    Single Image
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Guess if one image is AI-generated
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <RadioGroupItem value="2" id="pair" />
                              <div className="flex items-center space-x-2 flex-1">
                                <Images className="w-5 h-5 text-human-glow" />
                                <div>
                                  <Label
                                    htmlFor="2"
                                    className="cursor-pointer font-medium"
                                  >
                                    Image Pair
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Identify which of two images is AI-generated
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <RadioGroupItem value="group" id="group" />
                              <div className="flex items-center space-x-2 flex-1">
                                <Grid3X3 className="w-5 h-5 text-neural-purple" />
                                <div>
                                  <Label
                                    htmlFor="4"
                                    className="cursor-pointer font-medium"
                                  >
                                    Image Group
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    Select all AI-generated images from a group
                                  </p>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="rounds"
                            className="text-base font-medium"
                          >
                            Number of Rounds
                          </Label>
                          <Input
                            id="batchCount"
                            type="number"
                            min="1"
                            max="50"
                            value={batchCount}
                            onChange={(e) => setBatchCount(e.target.value)}
                            className="bg-background/50"
                          />
                        </div>
                        {gameMode === "group" && (
                          <div className="space-y-2">
                            <Label htmlFor="batchSize" className="text-base font-medium">
                              Images per Round
                            </Label>
                            <Input
                              id="batchSize"
                              type="number"
                              min="3"
                              max="9"
                              value={batchSize}
                              onChange={(e) => {
                                const value = e.target.value;

                                // Allow empty string while typing
                                if (value === "") {
                                  setBatchSize("");
                                  return;
                                }

                                const num = Number(value);

                                // If not a number, ignore (don’t update state)
                                if (isNaN(num)) {
                                  return;
                                }

                                // Allow values >= 3, clamp max to 9
                                if (num >= 3 && num <= 9) {
                                  setBatchSize(num.toString());
                                }
                                // If below 3 while typing, ignore to prevent showing it
                              }}
                              onBlur={() => {
                                // On blur, if empty or less than 3, reset to "3"
                                const num = Number(batchSize);
                                if (batchSize === "" || isNaN(num) || num < 3) {
                                  setBatchSize("3");
                                }
                              }}
                              className="bg-background/50"
                            />


                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="difficulty" className="text-base font-medium">
                            Difficulty (%)
                          </Label>
                          <input
                            id="difficulty"
                            type="range"
                            min="1"
                            max="100"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full accent-ai-glow"
                          />
                          <div className="text-sm text-muted-foreground">
                            Selected: {difficulty}%
                          </div>
                        </div>

                        <Button
                          onClick={handleStartGame}
                          className={cn(
                            "w-full h-11 bg-gradient-to-r from-human-glow to-cyber-green hover:from-human-glow/90 hover:to-cyber-green/90",
                            "shadow-lg shadow-human-glow/25 transition-all duration-300 font-semibold",
                          )}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Game
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>


              {/* Leaderboards Card */}
              {localStorage.getItem("isGuest") == "false" && (
                <Card
                  className="border-border/50 backdrop-blur-sm bg-card/80 hover:shadow-xl hover:shadow-human-glow/10 transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <div className="p-2 rounded-lg bg-human-glow/10">
                        <Trophy className="w-6 h-6 text-human-glow" />
                      </div>
                      <span>Global Leaderboard</span>
                    </CardTitle>
                    <CardDescription>
                      View global rankings by score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => navigate("/leaderboards")}
                      variant="outline"
                      className="w-full h-12 border-human-glow/30 hover:bg-human-glow/10 hover:border-human-glow/50 hover:text-human-glow text-base font-semibold"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      View Statistics
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-ai-glow">
                    {stats?.totalImages?.toLocaleString() ?? "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">Images In Game</div>
                </CardContent>
              </Card>

              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-human-glow">
                    {stats ? (stats.globalAccuracy * 100).toFixed(1) + "%" : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">Global Average Accuracy</div>
                </CardContent>
              </Card>

              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-neural-purple">
                    {stats?.totalUsers?.toLocaleString() ?? "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </CardContent>
              </Card>

              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-electric-blue">
                    {stats
                      ? stats.totalGamesPlayed
                      : "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Games Played</div>
                </CardContent>
              </Card>
            </div>

            {/* Hardest Image Section */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
                  🔥 Hardest Image to Guess
                </h3>
                <p className="text-lg text-muted-foreground">
                  Only <span className="font-bold text-destructive">
                    {stats ? (stats.hardestImageAccuracy * 100).toFixed(1) + "%" : "—"}
                  </span> of players guessed this one correctly!
                </p>
              </div>

              <Card
                className={cn(
                  "border-2 border-destructive/30 shadow-2xl shadow-destructive/20 backdrop-blur-sm bg-card/90 overflow-hidden",
                  "hover:shadow-3xl hover:shadow-destructive/30 hover:border-destructive/50 transition-all duration-500",
                  "hover:scale-[1.02] transform-gpu"
                )}
              >
                <div className="aspect-[16/10] relative group">
                  <img
                    src={stats
                      ? stats.hardestImageUrl
                      : ""}
                    alt="The hardest image to guess in the game"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay with difficulty indicator */}
                  <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Expert Level
                  </div>
                  {/* Bottom gradient overlay for better text visibility */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent h-20"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-medium opacity-90">Think you can do better?</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Ready to challenge the boundaries between human and artificial
                creativity?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
