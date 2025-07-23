import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Brain, RotateCcw, Sparkles, Trophy,  } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, } from "react";
import { createNewGame } from "@/services/gameService";
import { GamePageParams, GameConfig, GameResult } from "@/types/Game";
import { fetchGameResults } from "@/services/gameService";

export default function GameOver({ }) {
  const navigate = useNavigate();
  var [result, setResult] = useState<GameResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { gameId } = useParams<GamePageParams>();
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    batchSize: 0, //1 for single batchSize, 2 for pair, 4-6 for group
    batchCount: 6,
    currentBatch: 0,
    difficulty: 0.5,
  });
  
  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");

    try {
      const data = await createNewGame(
        gameConfig.batchCount,
        gameConfig.batchSize,
        gameConfig.difficulty,
        token
      );

      console.log("New game created!", data);

      navigate("/game/" + data.gameId);
      window.location.reload();
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/game/${gameId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGameConfig(data);
        if (data.currentBatch == 0)
          data.currentBatch = 1;
      } else {
        console.error("Game not found");
      }
    };
    fetchGame();
  }, [gameId]);

  useEffect(() => {
    const fetchResults = async () => {
      console.log("Fetching game results for:", gameId);
      const token = localStorage.getItem("token");
      try {
        const data = await fetchGameResults(gameId!, token!);
        setResult(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchResults();
    console.log("Result: " + result);
  }, [gameId]);

  if (!result) return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects matching login page */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-8 max-w-md">
          {/* Logo matching login page */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="relative">
              <Brain className="w-12 h-12 text-ai-glow" />
              <Sparkles className="w-6 h-6 text-human-glow absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
              CanAIGuess
            </div>
          </div>

          {/* 404 Content */}
          <div className="space-y-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-neural-purple to-electric-blue bg-clip-text text-transparent">
              Asking AI how you did...
            </div>
            <h1 className="text-2xl font-bold"></h1>
          </div>

          {/* Fun stats */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Success detected with 98.3% confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-border/50 backdrop-blur-sm bg-card/80">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="relative">
                <Brain className="w-12 h-12 text-ai-glow" />
                <Sparkles className="w-6 h-6 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div
                className="text-2xl font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Trophy className="w-16 h-16 text-human-glow" />
              </div>
              <h1 className="text-3xl font-bold">Game Complete!</h1>
              <p className="text-muted-foreground">
                You've completed your neural detection challenge
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-ai-glow/10 border border-ai-glow/20">
                <div className="text-2xl font-bold text-ai-glow">
                  {result ? result.correct : "Loading..."}
                </div>
                <div className="text-sm text-muted-foreground">
                  Correct Guesses
                </div>
              </div>
              <div className="p-4 rounded-lg bg-human-glow/10 border border-human-glow/20">
                <div className="text-2xl font-bold text-human-glow">
                  {result ? (result.accuracy)
                    .toFixed(1) + "%" : "Loading..."}
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-neural-purple/10 border border-neural-purple/20">
              <div className="text-3xl font-bold text-neural-purple mb-2">
                {result.score}
              </div>
              <div className="text-lg font-medium">Final Score</div>
              <div className="text-sm text-muted-foreground mt-1">
                You went through {gameConfig.batchSize * gameConfig.batchCount} total images
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/menu")}
                className="flex-1 bg-gradient-to-r from-ai-glow to-electric-blue hover:from-ai-glow/90 hover:to-electric-blue/90"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
              <Button
                onClick={handleStartGame}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}