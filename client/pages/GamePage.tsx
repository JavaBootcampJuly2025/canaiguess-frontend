import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bot, Brain, RotateCcw, Sparkles, Target, Trophy, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { NewGameResponseDTO } from "@/dto/NewGameResponseDTO";

type GamePageParams = {
  gameId: string;
};

type Guess = true | false;

interface GuessEntry {
  imageId: string;
  guess: Guess;
}

interface GuessEntry {
  imageId: string;
  guess: Guess;
}

type GameResult = {
  score: number;
  correctGuesses: number;
  falseGuesses: number;
  accuracy: number;
};
type ImageData = {
  id: string;
  url: string;
  isAI: boolean;
};

type GameConfig = {
  batchSize: number;
  batchCount: number;
  currentBatch: number;
  difficulty: number;
};

interface GameInstance {
  currentImages: ImageData[];
  userGuesses: GuessEntry[];
  result: GameResult | null;
  currentBatch?: number;
}

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams<GamePageParams>();
  // get the game instance or create default
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    batchSize: 0, //1 for single batchSize, 2 for pair, 4-6 for group
    batchCount: 6,
    currentBatch: 0,
    difficulty: 0.5,
  });

  const [gameResult, setGameResult] = useState<GameResult>({
    correctGuesses: 0,
    score: 0,
    falseGuesses: 0,
    accuracy: 0,
  });

  const [game, setGame] = useState<GameInstance>({
    currentImages: [],
    userGuesses: [],
    result: null,
    currentBatch: gameConfig.currentBatch,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const fetchBatchImages = async (): Promise<ImageData[]> => {
    if (!gameId) {
      console.error("Game ID is not defined.");
      return [];
    }

    setIsLoading(true);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/game/${gameId}/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch batch images:", await response.text());
        return [];
      }

      const text = await response.text();
      console.log("Raw API response:", text);

      const data = JSON.parse(text);

      if (!Array.isArray(data.images)) {
        throw new Error("API response does not contain 'images' array.");
      }

      return data.images.map((url, index) => ({
        id: url,
        url,
      }));
    } catch (error) {
      console.error("Error fetching batch images:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };



  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    let batchSize = gameConfig.batchSize;

    let batchCount = gameConfig.batchCount;
    let difficulty = gameConfig.difficulty;
    console.log("Starting game:", { batchSize, batchCount, difficulty });
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchCount,
          batchSize,
          difficulty,
        }),
      });

      if (response.ok) {
        console.log("New game created!");
        // parse the response to get the DTO
        const data: NewGameResponseDTO = await response.json();
        // Navigate to the new game with id
        navigate("/game/" + data.gameId);
      } else {
        console.error("Game not created:", await response.text());
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
    window.location.reload();
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

  // Load initial batch
  useEffect(() => {
    if (game.currentImages.length === 0 &&
      gameConfig.batchSize != 0) {
      console.log("Passing initial batch size: " + gameConfig.batchSize);
      fetchBatchImages().then((images) => {
        setGame((prev) => ({
          ...prev,
          currentImages: images,
          userGuesses: [],
        }));
      });
    }
  }, [gameConfig.currentBatch, gameConfig.batchSize]);

  const handleImageGuess = (imageId: string, guess: Guess) => {
    setGame((prev) => {
      const existingGuessIndex = prev.userGuesses.findIndex(
        (g) => g.imageId === imageId,
      );

      let newGuesses = [...prev.userGuesses];

      if (existingGuessIndex >= 0) {
        newGuesses[existingGuessIndex] = { imageId, guess };
      } else {
        newGuesses.push({ imageId, guess });
      }

      // for pair, enforce only one AI guess
      if (gameConfig.batchSize === 2 && guess === true) {
        newGuesses = newGuesses.map((g) =>
          g.imageId !== imageId ? { ...g, guess: false } : g,
        );
      }

      console.log(newGuesses);
      return { ...prev, userGuesses: newGuesses };
    });
  };

  const canSubmit = () => {
    const requiredGuesses = game.currentImages.length;
    const madeGuesses = game.userGuesses.filter(
      (g) => g.guess !== null && g.guess !== undefined,
    ).length;

    if (gameConfig.batchSize === 2) {
      // For pairs, exactly one should be marked as AI
      const aiGuesses = game.userGuesses.filter(
        (g) => g.guess === true,
      ).length;
      return aiGuesses === 1 && madeGuesses === 2;
    }

    return madeGuesses === requiredGuesses;
  };

  const submitGuesses = async () => {
    if (!canSubmit()) return;

    setIsSubmitting(true);

    const guesses = game.userGuesses;
    const correctChoices = game.currentImages;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/guess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
          body: JSON.stringify({
            images: correctChoices.map((img) => img.id),
            guesses: guesses.map((g) => g.guess),
          }),

      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result: { results: boolean[] } = await response.json();
      const batchCorrect = result.correct.filter(Boolean).length;

      setGameResult((prev) => {
        const totalCorrect = prev.correctGuesses + batchCorrect;
        const totalFalse = prev.falseGuesses + (guesses.length - batchCorrect);
        const accuracy = (totalCorrect / (totalCorrect + totalFalse)) * 100;
        return {
          correctGuesses: totalCorrect,
          falseGuesses: totalFalse,
          accuracy,
          score: Math.floor(accuracy * 10),
        };
      });

      toast({
        title: `Batch ${gameConfig.currentBatch} submitted!`,
        description: `You got ${batchCorrect} out of ${guesses.length} correct.`,
      });

      if (gameConfig.currentBatch >= gameConfig.batchCount) {
        setGame((prev) => ({
          ...prev,
          result: {
            ...gameResult,
            correctGuesses: gameResult.correctGuesses + batchCorrect,
          },
        }));
      } else {
        const nextBatch = gameConfig.currentBatch + 1;
        const nextImages = await fetchBatchImages();

        setGameConfig((prev) => ({
          ...prev,
          currentBatch: nextBatch,
        }));

        setGame((prev) => ({
          ...prev,
          currentBatch: nextBatch,
          currentImages: nextImages,
          userGuesses: [],
        }));
      }
    } catch (error) {
      console.error("Error submitting guesses:", error);
      toast({
        title: "Error submitting guesses",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };




  const getImageGuess = (imageId: string): Guess | undefined => {
    return game.userGuesses.find((g) => g.imageId === imageId)?.guess;
  };

  const progress = ((gameConfig.currentBatch - 1) / gameConfig.batchCount) * 100;

  if (game.result) {
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
                    {game.result.correctGuesses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Correct Guesses
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-human-glow/10 border border-human-glow/20">
                  <div className="text-2xl font-bold text-human-glow">
                    {((game.result.correctGuesses / (gameConfig.batchSize * gameConfig.batchCount)).toFixed(1)) * 100}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-neural-purple/10 border border-neural-purple/20">
                <div className="text-3xl font-bold text-neural-purple mb-2">
                  {game.result.score}
                </div>
                <div className="text-lg font-medium">Final Score</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Out of {gameConfig.batchSize * gameConfig.batchCount} total images
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              Exit Game
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

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-ai-glow/30 text-ai-glow">
              {gameConfig.batchSize === 1 && "Single Image"}
              {gameConfig.batchSize === 2 && "Image Pair"}
              {gameConfig.batchSize >= 4 && "Image Group"}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Round {gameConfig.currentBatch} of {gameConfig.batchCount}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Game Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Instructions */}
            <Card className="mb-8 border-border/50 backdrop-blur-sm bg-card/80">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-human-glow" />
                  <h2 className="text-lg font-semibold">Your Mission</h2>
                </div>
                <p className="text-muted-foreground">
                  {gameConfig.batchSize === 1 &&
                    "Determine if this image was generated by AI or created by a human."}
                  {gameConfig.batchSize === 2 &&
                    "Look at both images and identify which one was generated by AI."}
                  {gameConfig.batchSize >= 4 &&
                    "Examine all images and mark each one as either AI-generated or human-created."}
                </p>
              </CardContent>
            </Card>

            {/* Images Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
                  <span className="text-muted-foreground">
                    Loading images...
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-6 mb-8",
                  gameConfig.batchSize === 1 &&
                  "grid-cols-1 max-w-2xl mx-auto",
                  gameConfig.batchSize === 2 &&
                  "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto",
                  gameConfig.batchSize >= 4 &&
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {game.currentImages.map((image, index) => (
                  <Card
                    key={image.id}
                    className="border-border/50 backdrop-blur-sm bg-card/80 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          Image {index + 1}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            getImageGuess(image.id) === true
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handleImageGuess(image.id, true)}
                          className={cn(
                            getImageGuess(image.id) === true &&
                            "bg-ai-glow hover:bg-ai-glow/90 text-white",
                          )}
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          AI Generated
                        </Button>
                        <Button
                          variant={
                            getImageGuess(image.id) === false
                              ? "default"
                              : "outline"
                          }
                          onClick={() => handleImageGuess(image.id, false)}
                          className={cn(
                            getImageGuess(image.id) === false &&
                            "bg-human-glow hover:bg-human-glow/90 text-white",
                          )}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Human Made
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Submit Button */}
            {!isLoading && (
              <div className="flex justify-center">
                <Button
                  onClick={submitGuesses}
                  disabled={!canSubmit() || isSubmitting}
                  className={cn(
                    "px-8 py-3 text-lg font-semibold",
                    "bg-gradient-to-r from-human-glow to-cyber-green hover:from-human-glow/90 hover:to-cyber-green/90",
                    "shadow-lg shadow-human-glow/25 transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>
                        {gameConfig.currentBatch >= gameConfig.batchCount
                          ? "Finish Game"
                          : "Next Round"}
                      </span>
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
