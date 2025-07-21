import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bot, Brain, Sparkles, Target, User, Zap, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { GameConfig, GameInstance, GamePageParams, Guess } from "@/types/Game";
import { fetchBatchImagesFromApi, submitGuessesRequest } from "@/services/gameService";
import { ImageBatchResponseDTO, ImageDTO } from "@/dto/ImageBatchResponseDTO";

export default function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams<GamePageParams>();
  // get the game instance or create default
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    batchSize: 0, //1 for single batchSize, 2 for pair, 4+ for group
    batchCount: 6,
    currentBatch: 0,
    difficulty: 0.5,
  });

  const [game, setGameInstance] = useState<GameInstance>({
    currentImages: [],
    userGuesses: [],
    result: null,
    currentBatch: gameConfig.currentBatch,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  // used to change the color of the image according to guess result
  const [guessFeedback, setGuessFeedback] = useState<Record<string, boolean | null>>({});

  const [focusedImage, setFocusedImage] = useState<ImageDTO | null>(null);

  const fetchBatchImages = async () => {
    if (!gameId) {
      console.error("Game ID is not defined.");
      return [];
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      return await fetchBatchImagesFromApi(gameId, token!);
    } catch (error) {
      console.error("Error fetching batch images:", error);
      return [];
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

  // Load initial batch
  useEffect(() => {
    if (
      game.currentImages.length === 0 &&
      gameConfig.batchSize !== 0
    ) {
      console.log("Passing initial batch size: " + gameConfig.batchSize);

      fetchBatchImages().then((images: ImageDTO[]) => {
        setGameInstance((prev) => ({
          ...prev,
          currentImages: images,
          userGuesses: [],
        }));
      }).catch((error) => {
        console.error("Failed to fetch images:", error);
      }); 
    }
  }, [gameConfig.currentBatch, gameConfig.batchSize]);


  const handleImageGuess = (imageId: number, guess: Guess) => {
    setGameInstance((prev) => {
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

  const handleImageClick = (imageId: number) => {
    if(isSubmitted) {
      console.log("You had your chance, don't click it now :D");
      return;
    }
    if (gameConfig.batchSize === 2) {
      // Pairs: selecting an image marks it as AI, the other is Human
      handleImageGuess(imageId, true);
    } else {
      // Group: toggle this image's guess between AI (true) and Human (false)
      setGameInstance((prev) => {
        const existingGuess = prev.userGuesses.find((g) => g.imageId === imageId);
        let newGuesses = [...prev.userGuesses];

        if (existingGuess) {
          // toggle
          const newGuess = !existingGuess.guess;
          const idx = newGuesses.findIndex((g) => g.imageId === imageId);
          newGuesses[idx] = { imageId, guess: newGuess };
        } else {
          newGuesses.push({ imageId, guess: true });
        }

        return { ...prev, userGuesses: newGuesses };
      });
    }
  };

  const canSubmit = useMemo(() => {
    if (gameConfig.batchSize === 2) {
      const aiGuesses = game.userGuesses.filter((g) => g.guess === true).length;
      return aiGuesses === 1;
    }

    if (gameConfig.batchSize >= 3) {
      // Always allow submit: you’ll normalize empty guesses on submit
      return game.currentImages.length > 0;
    }

    // Single image: must guess true or false
    if (gameConfig.batchSize === 1) {
      return game.userGuesses.length === 1;
    }
    return false;
  }, [game]);

  const submitGuesses = async () => {
    if (!canSubmit) return;

    const token = localStorage.getItem("token");
    setIsSubmitting(true);

    try {
      let guesses = game.userGuesses;
      if (gameConfig.batchSize >= 2) {
        // Fill in guesses for unselected images as `false`
        const allGuesses = game.currentImages.map(image => {
          const userGuess = guesses.find(g => g.imageId === image.id);
          return {
            imageId: image.id,
            guess: userGuess ? userGuess.guess : false,
          };
        });

        guesses = allGuesses;
      }
      const result = await submitGuessesRequest(
        Number(gameId),
        guesses.map(g => g.guess),
        token,
      );

      // Map server response to { imageId: correct/incorrect }
      const feedback: Record<string, boolean> = {};
      guesses.forEach((guess, i) => {
        feedback[guess.imageId] = result.correct[i];
      });
      setGuessFeedback(feedback);

      const batchCorrect = result.correct.filter(Boolean).length;

      setTotalCorrect((prev) => prev + batchCorrect);
      setTotalAttempted((prev) => prev + guesses.length);

      // Track progress
      const newTotalCorrect = totalCorrect + batchCorrect;
      const newTotalAttempted = totalAttempted + guesses.length;
      const accuracy = newTotalCorrect / newTotalAttempted;

      // Show different messages in toast depending on user success rate
      let feedbackMessage = "";
      if (accuracy >= 0.8) {
        feedbackMessage = "Awesome! You're spotting AI like a pro!";
      } else if (accuracy >= 0.5) {
        feedbackMessage = "Good job! Keep sharpening your AI detector.";
      } else {
        feedbackMessage = "Don't give up! You'll get better each round!";
      }

      toast({
        title: `Round ${gameConfig.currentBatch} done!`,
        description: (
          <>
            {feedbackMessage}
            <br />
            You have {newTotalCorrect} out of {newTotalAttempted} correct so far.
          </>
        ),
      });
      setIsSubmitted(true);
      // Wait for some time before moving on depending on batch size
      await new Promise((resolve) => setTimeout(resolve, (2000 * gameConfig.batchSize * 0.3) + 800));

      if (gameConfig.currentBatch >= gameConfig.batchCount) {
        navigate(`/game/${gameId}/results/`, { state: { result: game.result } });
      } else {
        const nextBatch = gameConfig.currentBatch + 1;
        const nextImages = await fetchBatchImages();

        // Reset feedback for next round
        setGuessFeedback({});

        setGameConfig((prev) => ({
          ...prev,
          currentBatch: nextBatch,
        }));

        setGameInstance((prev) => ({
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
      setIsSubmitted(false);
    }
  };


  const getImageGuess = (imageId: number): boolean | null => {
    return game.userGuesses.find((g) => g.imageId === imageId)?.guess ?? null;
  };

  const handleMagnifyImage = (image: ImageDTO) => {
    setFocusedImage(image);
  };

  const handleCloseMagnify = () => {
    setFocusedImage(null);
  };

  const progress = ((gameConfig.currentBatch - 1) / gameConfig.batchCount) * 100;

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
              {gameConfig.batchSize >= 3 && "Image Group"}
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
                  {gameConfig.batchSize >= 3 &&
                    "Examine all images and select each one you think is AI-generated."}
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
                  gameConfig.batchSize >= 3 &&
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {game.currentImages.map((image, index) => {
                  const userGuess = getImageGuess(image.id);
                  const feedback = guessFeedback[image.id];
                  let badgeClass = "backdrop-blur-sm";
                  let badgeContent = "Image " + Number(index + 1);

                  let isAI: boolean | undefined = undefined;

                  if (feedback !== undefined) {
                    if (userGuess === true) {
                      // User guessed AI → if guess was correct, it’s AI; if wrong, it’s Human.
                      isAI = feedback === true;
                    } else {
                      // User did NOT guess AI → guessed Human.
                      // If they were right, it’s Human. If they were wrong, it’s AI.
                      isAI = feedback === false;
                    }
                  }
                  if (feedback !== undefined) {
                    badgeContent = isAI ? "AI generated" : "Human made";
                    badgeContent += feedback ? "" : "!";
                    badgeClass = feedback
                      ? "bg-cyber-green/80"
                      : "bg-red-500/80";
                  }

                  return (
                    <Card
                      key={image.id}
                      // If it is a single image game, then it's not clickable and buttons are used
                      onClick={gameConfig.batchSize > 1 ? () => handleImageClick(image.id) : undefined}
                      className={cn(
                        "border-border/50 backdrop-blur-sm bg-card/80 overflow-hidden hover:shadow-xl transition-all duration-300",
                        gameConfig.batchSize > 1 && "cursor-pointer",
                        // Feedback styling overrides everything
                        guessFeedback[image.id] === true &&
                        "ring-4 ring-cyber-green shadow-[0_0_30px_10px] shadow-cyber-green/60",
                        guessFeedback[image.id] === false &&
                        "ring-4 ring-red-500 shadow-[0_0_30px_10px] shadow-red-500/60",
                        // Only show guess styling if there is NO feedback yet
                        guessFeedback[image.id] === undefined &&
                        getImageGuess(image.id) === true &&
                        "ring-4 ring-ai-glow"
                      )}
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
                            className={cn(badgeClass, "backdrop-blur-sm")}
                          >
                            {badgeContent}
                          </Badge>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMagnifyImage(image);
                          }}
                          className="absolute bottom-3 right-3 bg-background/70 p-2 rounded-full hover:bg-background/90"
                        >
                          <Search className="w-5 h-5 text-foreground" />
                        </button>
                      </div>
                      {gameConfig.batchSize === 1 ? (
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant={
                                getImageGuess(image.id) === true ? "default" : "outline"
                              }
                              onClick={() => handleImageGuess(image.id, true)}
                              className={cn(
                                getImageGuess(image.id) === true &&
                                "bg-ai-glow hover:bg-ai-glow/90 text-white"
                              )}
                            >
                              <Bot className="w-4 h-4 mr-2" />
                              AI Generated
                            </Button>
                            <Button
                              variant={
                                getImageGuess(image.id) === false ? "default" : "outline"
                              }
                              onClick={() => handleImageGuess(image.id, false)}
                              className={cn(
                                getImageGuess(image.id) === false &&
                                "bg-human-glow hover:bg-human-glow/90 text-white"
                              )}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Human Made
                            </Button>
                          </div>
                        </CardContent>
                      ) : null}
                    </Card>
                  );
                })}
              </div>)}

                {/* Submit Button */}
            {!isLoading && (
              <div className="flex justify-center">
                <Button
                  onClick={submitGuesses}
                  disabled={!canSubmit || isSubmitting}
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
      {focusedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleCloseMagnify}
        >
          <img
            src={focusedImage.url}
            alt="Focused"
            className="max-w-full max-h-full rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
