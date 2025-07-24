import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Award, BarChart3, Brain, Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Leaderboard } from "@/types/Leaderboards";
import { fetchGlobalLeaderboard } from "@/services/leaderboardsService";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Leaderboards() {
  const navigate = useNavigate();
  const [globalLeaderboard, setGlobalLeaderboard] =
    useState<Leaderboard | null>(null);

  const [isScoreLoading, setIsScoreLoading] = useState(true);

  const [scoreLoaded, setScoreLoaded] = useState(false);

  const scorePromise = useRef<Promise<void> | null>(null);

  const loadScore = () => {
    if (!scorePromise.current) {
      scorePromise.current = generateGlobalLeaderboard().then((data) => {
        setGlobalLeaderboard(data);
        setIsScoreLoading(false);
        setScoreLoaded(true);
      });
    }
    return scorePromise.current;
  };

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
        totalGuesses: player.totalGuesses,
        totalGames: player.totalGames,
        accuracy: player.accuracy,
        rank: index + 1,
        isCurrentUser: player.username === localStorage.getItem("username"),
      })),
      lastUpdated: new Date().toISOString(),
    };
  };

  useEffect(() => {
    // Always start background loads right away:
    loadScore();
  }, []);

  // Load data on component mount
  useEffect(() => {
    // Actively await only the current tab’s promise:
    loadScore();
    console.log("Awaiting score");

  });


  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return (
      <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    );
  };

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
                Score Leaderboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Global rankings where eveyone hopes to find themselves
              </p>
            </div>
            {/* Global Leaderboard Tab */}
            {isScoreLoading ?
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
                  <span className="text-muted-foreground">
                    Loading score leaderboard...
                  </span>
                </div>
              </div>
              :
              <Card className="border-border/50 backdrop-blur-sm  max-w-[700px] mx-auto bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-human-glow" />
                    <span>Top 10 Global Players by Score</span>
                  </CardTitle>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">

                    <span>
                        Updated{" "}
                      {new Date(
                        globalLeaderboard.lastUpdated,
                      ).toLocaleTimeString()}
                      </span>
                  </div>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="w-20 pl-10 text-left">Position</TableHead>
                      <TableHead className="text-left pl-16">Username</TableHead>
                      <TableHead className="text-right pr-10">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
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
                          <div className="text-sm text-muted-foreground">
                           <span> {entry.totalGames} games played </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(entry.accuracy * 100).toFixed(1)}% accuracy
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>}
          </div>
        </div>
      </div>
    </div>
  );
}
