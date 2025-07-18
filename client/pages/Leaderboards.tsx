import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Clock,
  Crown,
  Globe,
  Grid3X3,
  Image,
  Images,
  Medal,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Leaderboard, RecentGame, UserStats } from "@/types/Leaderboards";
import {generateFakeGames} from "@/services/mockImageData";
import {fetchGlobalLeaderboard} from "@/services/leaderboardsService";

export default function Leaderboards() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalLeaderboard, setGlobalLeaderboard] =
    useState<Leaderboard | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);

  // Mock data generation
  const generateMockStats = (): UserStats => ({
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

  const generateGlobalLeaderboard = async (): Promise<Leaderboard> => {
    const leaderboard = await fetchGlobalLeaderboard();
    console.log(leaderboard);
    return {
      type: "global",
      entries: leaderboard.map((player, index) => ({
        userId:
          player.username === "Neural Detective"
            ? "current-user"
            : `player-${index}`,
        username: player.username,
        score: player.score,
        rank: index + 1,
        isCurrentUser: player.username === localStorage.getItem("username"),
      })),
      totalPlayers: 15847,
      lastUpdated: new Date().toISOString(),
    };

  };

  const generateMockRecentGames = (): RecentGame[] => {
    const fakeGames = generateFakeGames();

    return fakeGames.map((fake, index) => {
      const { config, result, id } = fake;

      const totalImages = config.batchSize * config.batchCount;

      let gameMode: "single" | "pair" | "group";
      if (config.batchSize === 1) {
        gameMode = "single";
      } else if (config.batchSize === 2) {
        gameMode = "pair";
      } else {
        gameMode = "group";
      }

      const accuracy = Math.round(result.accuracy * 1000) / 10; // percentage, 1 decimal
      const score = Math.floor(accuracy * 10); // arbitrary score scaling

      return {
        id: `game-${id}`,
        gameMode,
        score,
        accuracy,
        totalImages,
        correctGuesses: result.correct,
        difficulty: config.difficulty,
      };
    });
  };

  // Load data on component mount
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUserStats = generateMockStats();
      const mockGlobalLeaderboard = await generateGlobalLeaderboard();
      const mockRecentGames = generateMockRecentGames();
      // console.log(mockRecentGames);
      setUserStats(mockUserStats);
      setGlobalLeaderboard(mockGlobalLeaderboard);
      setRecentGames(mockRecentGames);
      setIsLoading(false);
    };

    loadStats();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return (
      <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    );
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-400 bg-green-400/10";
      case "intermediate":
        return "text-blue-400 bg-blue-400/10";
      case "advanced":
        return "text-purple-400 bg-purple-400/10";
      case "expert":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-muted-foreground bg-muted/10";
    }
  };

  // const formatDuration = (seconds: number) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  // };

  if (isLoading || !userStats || !globalLeaderboard) {
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
              Loading neural analytics...
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
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neural-purple/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
              <div
                className="text-lg font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-ai-glow/30 text-ai-glow">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Badge>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Title */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Neural Analytics
              </h1>
              <p className="text-lg text-muted-foreground">
                Global rankings and personal performance insights
              </p>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="global" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger
                  value="global"
                  className="flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Global Leaderboard</span>
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Personal Stats</span>
                </TabsTrigger>
              </TabsList>

              {/* Global Leaderboard Tab */}
              <TabsContent value="global" className="space-y-6">
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-6 h-6 text-human-glow" />
                      <span>Top 10 Global Players</span>
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {globalLeaderboard.totalPlayers.toLocaleString()}{" "}
                          total players
                        </span>
                      </div>
                      <span>
                        Updated{" "}
                        {new Date(
                          globalLeaderboard.lastUpdated,
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {globalLeaderboard.entries.map((entry) => (
                        <div
                          key={entry.userId}
                          className={cn(
                            "flex items-center space-x-4 p-4 rounded-lg transition-all duration-300",
                            entry.isCurrentUser
                              ? "bg-ai-glow/10 border border-ai-glow/30 shadow-lg shadow-ai-glow/10"
                              : "bg-muted/20 hover:bg-muted/40",
                            entry.rank <= 3 && "ring-1 ring-human-glow/20",
                          )}
                        >
                          <div className="w-12 flex justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar
                            className={cn(
                              "w-12 h-12",
                              entry.rank <= 3 && "ring-2 ring-human-glow/50",
                            )}
                          >
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback>{entry.username[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={cn(
                                  "font-semibold text-lg",
                                  entry.rank === 1 && "text-yellow-400",
                                  entry.rank === 2 && "text-gray-400",
                                  entry.rank === 3 && "text-amber-600",
                                )}
                              >
                                {entry.username}
                              </span>
                              {entry.isCurrentUser && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-ai-glow/50 text-ai-glow"
                                >
                                  You
                                </Badge>
                              )}
                              {entry.rank <= 3 && (
                                <Badge className="text-xs bg-human-glow/20 text-human-glow border-human-glow/30">
                                  Top 3
                                </Badge>
                              )}
                            </div>
                            {/*<div className="text-sm text-muted-foreground">*/}
                            {/*  {entry.gamesPlayed} games played*/}
                            {/*</div>*/}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {entry.score.toLocaleString()}
                            </div>
                            {/*<div className="text-sm text-muted-foreground">*/}
                            {/*  {entry.accuracy.toFixed(1)}% accuracy*/}
                            {/*</div>*/}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Statistics Tab */}
              <TabsContent value="personal" className="space-y-6">
                {/* User Stats Overview */}
                <Card className="border-border/50 backdrop-blur-sm bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userStats.avatar} />
                        <AvatarFallback>ND</AvatarFallback>
                      </Avatar>
                      <span>{userStats.username}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-ai-glow">
                          #{userStats.globalRank}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Global Rank
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-human-glow">
                          {userStats.totalScore.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Score
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neural-purple">
                          {userStats.overallAccuracy.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Accuracy
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-electric-blue">
                          {userStats.totalGamesPlayed}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Games Played
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyber-green">
                          {userStats.currentStreak}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Current Streak
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {userStats.longestStreak}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Best Streak
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mode Performance and Recent Games */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/*/!* Game Mode Performance *!/*/}
                  {/*<Card className="border-border/50 backdrop-blur-sm bg-card/80">*/}
                  {/*  <CardHeader>*/}
                  {/*    <CardTitle className="flex items-center space-x-2">*/}
                  {/*      <Target className="w-5 h-5 text-ai-glow" />*/}
                  {/*      <span>Mode Performance</span>*/}
                  {/*    </CardTitle>*/}
                  {/*  </CardHeader>*/}
                  {/*  <CardContent className="space-y-4">*/}
                  {/*    <div className="flex items-center justify-between p-3 rounded-lg bg-ai-glow/10">*/}
                  {/*      <div className="flex items-center space-x-2">*/}
                  {/*        <Image className="w-4 h-4 text-ai-glow" />*/}
                  {/*        <span className="font-medium">Single Image</span>*/}
                  {/*      </div>*/}
                  {/*      <div className="text-right">*/}
                  {/*        <div className="font-bold text-ai-glow">*/}
                  {/*          {userStats.singleImageStats.accuracy.toFixed(1)}%*/}
                  {/*        </div>*/}
                  {/*        <div className="text-xs text-muted-foreground">*/}
                  {/*          {userStats.singleImageStats.gamesPlayed} games*/}
                  {/*        </div>*/}
                  {/*      </div>*/}
                  {/*    </div>*/}
                  {/*    <div className="flex items-center justify-between p-3 rounded-lg bg-human-glow/10">*/}
                  {/*      <div className="flex items-center space-x-2">*/}
                  {/*        <Images className="w-4 h-4 text-human-glow" />*/}
                  {/*        <span className="font-medium">Image Pair</span>*/}
                  {/*      </div>*/}
                  {/*      <div className="text-right">*/}
                  {/*        <div className="font-bold text-human-glow">*/}
                  {/*          {userStats.pairImageStats.accuracy.toFixed(1)}%*/}
                  {/*        </div>*/}
                  {/*        <div className="text-xs text-muted-foreground">*/}
                  {/*          {userStats.pairImageStats.gamesPlayed} games*/}
                  {/*        </div>*/}
                  {/*      </div>*/}
                  {/*    </div>*/}
                  {/*    <div className="flex items-center justify-between p-3 rounded-lg bg-neural-purple/10">*/}
                  {/*      <div className="flex items-center space-x-2">*/}
                  {/*        <Grid3X3 className="w-4 h-4 text-neural-purple" />*/}
                  {/*        <span className="font-medium">Image Group</span>*/}
                  {/*      </div>*/}
                  {/*      <div className="text-right">*/}
                  {/*        <div className="font-bold text-neural-purple">*/}
                  {/*          {userStats.groupImageStats.accuracy.toFixed(1)}%*/}
                  {/*        </div>*/}
                  {/*        <div className="text-xs text-muted-foreground">*/}
                  {/*          {userStats.groupImageStats.gamesPlayed} games*/}
                  {/*        </div>*/}
                  {/*      </div>*/}
                  {/*    </div>*/}
                  {/*  </CardContent>*/}
                  {/*</Card>*/}

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
                                  <Badge
                                    className={cn(
                                      "text-xs capitalize",
                                    )}
                                  >
                                    {game.difficulty * 100 + "%"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {game.correctGuesses}/{game.totalImages}{" "}
                                  images
                                  {/*• {formatDuration(game.duration)}*/}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{game.score}</div>
                              <div className="text-xs text-muted-foreground">
                                {game.accuracy.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
