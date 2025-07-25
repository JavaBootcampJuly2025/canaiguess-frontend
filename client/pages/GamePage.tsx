import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Brain,
  CheckCircle,
  ChevronDown,
  Eye,
  Flag,
  Lightbulb,
  Search,
  Send,
  Sparkles,
  Target,
  User,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { GameConfig, GameInstance, GamePageParams, Guess } from "@/types/Game";
import { fetchBatchImagesFromApi, fetchGameData, fetchImageHint, submitGuessesRequest } from "@/services/gameService";
import { ImageDTO } from "@/dto/ImageBatchResponseDTO";
import { HintResponseDTO } from "@/dto/HintResponseDTO";

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
    hintsUsed: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingHint, setIsRequestingHint] = useState<string | null>(null);

  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [selectedHint, setSelectedHint] = useState<HintResponseDTO | null>(null);

  // used to change the color of the image according to guess result
  const [guessFeedback, setGuessFeedback] = useState<Record<string, boolean | null>>({});
  const [selectedImageForHint, setSelectedImageForHint] = useState<ImageDTO | null>(null);
  const [focusedImage, setFocusedImage] = useState<ImageDTO | null>(null);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [imageBeingReported, setImageBeingReported] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [submittedReports, setSubmittedReports] = useState<Set<string>>(new Set());


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
      const token = localStorage.getItem("token");
      const response = await fetchGameData(gameId, token);
      setGameConfig(response);
      if (response.currentBatch == 0)
        response.currentBatch = 1;
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


  const handleImageGuess = (imageId: string, guess: Guess) => {
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

  const handleImageClick = (imageId: string) => {
    if (isSubmitted) {
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
        console.log("Guesses: " + guesses + " - batch: " + gameConfig.batchSize);
      }
      const result = await submitGuessesRequest(
        gameId,
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

  const requestHint = async (imageId: string) => {
    if (isRequestingHint) return;
    setIsRequestingHint(imageId);
    const existingHint = getHintForImage(imageId);
    if (existingHint) {
      console.log("hint exists already!");
      setSelectedHint(existingHint);
      return;
    }
    const token = localStorage.getItem("token");

    try {
      console.log("calling for help from the almighty...");

      const realHint = await fetchImageHint(token, imageId);
      console.log(realHint);

      // Mock AI hint response
      const newHint: HintResponseDTO = {
        imageId,
        fake: realHint.fake,
        signs: realHint.signs, // 2-4 signs
        // confidence: Math.floor(Math.random() * 30) + 70, // 70-99% confidence
      };
      setGameInstance((prev) => ({
        ...prev,
        hintsUsed: [...prev.hintsUsed, newHint],
      }));

      setSelectedHint(newHint);
    } catch (error) {
      console.error("Failed to fetch hint:", error);

      let message = "Failed to fetch hint. Please try again.";
      if (error instanceof Error) {
        const parsed = JSON.parse(error.message);
        if (parsed?.error) {
          message = parsed.error;
        } else if (parsed?.businessErrorDescription) {
          message = parsed.businessErrorDescription;
        }
      }

      toast({
        title: "Unable to get a hint",
        description: message,
      });
    } finally {
      setIsRequestingHint(null);
    }
  };

  const submitReport = async () => {
    if (!imageBeingReported || !reportReason.trim()) return;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    try {
      const imageId = imageBeingReported;
      setIsSubmittingReport(true);
      const response = await fetch(`${API_BASE_URL}/api/image/${imageId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your backend uses JWT auth, add:
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          imageBeingReported,
          title: reportReason,
          description: reportComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      console.log("Report submitted:", {
        reason: reportReason,
      });
      setSubmittedReports(prev => new Set(prev).add(imageBeingReported));
      // Reset form and close
      setShowReportForm(false);
      setReportReason("");
      // setReportComment("");

      toast({
        title: "Report submitted",
        description: "Thank you for your feedback.",
      });
    } catch (err) {
      toast({
        title: "Failed to submit",
        description: "Please try again later." + err,
        variant: "destructive",
      });
    } finally {
      setImageBeingReported("");
    }
  };

  // The hardcoded dropdown list of report reasons
  // const reportReasons = [
  //   "Incorrect analysis verdict",
  //   "Missing important detection indicators",
  //   "Analysis contradicts obvious visual evidence",
  //   "Analysis appears to be hallucinating",
  //   "Technical error or glitch",
  //   "Inappropriate or offensive content",
  //   "Other issue not listed above",
  // ];

  // The hardcoded dropdown list of report reasons
  const reportReasons = [
    "Inappropriate or offensive content",
    "Explicit or adult content",
    "Violence or disturbing imagery",
    "Hate symbols or hateful content",
    "Poor image quality",
    "Spam or irrelevant image",
    "Copyright infringement",
    "AI generated marked as Human made",
    "Human made marked as AI generated",
    "Other issue not listed above",
  ];


  const getImageGuess = (imageId: string): boolean | null => {
    return game.userGuesses.find((g) => g.imageId === imageId)?.guess ?? null;
  };

  const handleMagnifyImage = (image: ImageDTO) => {
    setFocusedImage(image);
  };

  const handleCloseMagnify = () => {
    setFocusedImage(null);
  };

  const getHintForImage = (imageId: string): HintResponseDTO | null => {
    return game.hintsUsed.find((hint) => hint.imageId === imageId) || null;
  };

  const hasUsedHint = (imageId: string): boolean => {
    return game.hintsUsed.some((hint) => hint.imageId === imageId);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/menu")}
              className="border-border/50"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Exit Game</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-ai-glow" />
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div
                className="text-base sm:text-lg font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Badge variant="outline" className="border-ai-glow/30 text-ai-glow text-xs sm:text-sm">
              {gameConfig.batchSize === 1 && "Single Image"}
              {gameConfig.batchSize === 2 && "Image Pair"}
              {gameConfig.batchSize >= 3 && "Image Group"}
            </Badge>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Round {gameConfig.currentBatch} of {gameConfig.batchCount}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 sm:px-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium">Game Progress</span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Instructions */}
            <Card className="mb-6 sm:mb-8 border-border/50 backdrop-blur-sm bg-white/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-human-glow" />
                  <h2 className="text-base sm:text-lg font-semibold">Your Mission</h2>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {gameConfig.batchSize === 1 &&
                    "Determine if this image was generated by AI or created by a human."}
                  {gameConfig.batchSize === 2 && (
                    <>
                      Look at both images and identify which one was <strong>generated by AI</strong>.
                    </>)}
                  {gameConfig.batchSize >= 3 && (
                    <>
                      Examine all images and select <strong>each one</strong> you think is <strong>AI-generated</strong>.
                    </>)}
                </p>
              </CardContent>
            </Card>

            {/* Images Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
                  <span className="text-sm sm:text-base text-muted-foreground">
                    Loading images...
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4 sm:gap-6 mb-6 sm:mb-8",
                  gameConfig.batchSize === 1 &&
                  "grid-cols-1 max-w-lg sm:max-w-2xl mx-auto",
                  gameConfig.batchSize === 2 &&
                  "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto",
                  gameConfig.batchSize >= 3 &&
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
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
                        "ring-4 ring-ai-glow",
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
                        <button title="View full-sized image"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMagnifyImage(image);
                                }}
                                className="absolute bottom-3 right-3 bg-background/70 p-2 rounded-full hover:bg-background/90"
                        >
                          <Search className="w-5 h-5 text-foreground" />
                        </button>
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant={hasUsedHint(image.id) ? "default" : "secondary"}
                            onClick={(event) => {
                              event.stopPropagation();
                              const existingHint = getHintForImage(image.id);
                              if (existingHint) {
                                setSelectedHint(existingHint);
                                setSelectedImageForHint(image);
                              } else {
                                setSelectedImageForHint(image);
                                requestHint(image.id);
                              }
                            }}
                            disabled={isRequestingHint === image.id}
                            className={cn(
                              "bg-background/80 backdrop-blur-sm hover:bg-background/90",
                              hasUsedHint(image.id) &&
                              "bg-ai-glow/20 text-ai-glow border-ai-glow/30 hover:bg-ai-glow/30",
                            )}
                          >
                            {isRequestingHint === image.id ? (
                              <div
                                className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <Lightbulb className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (!submittedReports.has(image.id)) {
                                setShowReportForm(true);
                                setImageBeingReported(image.id);
                              } else {
                                toast({
                                  title: "Already reported",
                                  description: "You've already submitted a report for this analysis.",
                                  variant: "destructive",
                                  className: "bg-destructive/80",
                                });
                              }
                            }}
                            className="w-8 h-8 px-2 text-xs border-red-500/30 rounded-full text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                          >
                            <Flag className="w-3 h-3" />

                          </Button>
                        </div>
                        <button title="View full-sized image"
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
                                "bg-ai-glow hover:bg-ai-glow/90 text-white",
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
                                "bg-human-glow hover:bg-human-glow/90 text-white",
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


            {/* Report Panel */}
            {showReportForm && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-sm sm:max-w-md xl:w-80 xl:max-h-full overflow-y-auto">
                  <Card className="border-red-500/20 backdrop-blur-sm bg-card/95 h-full">
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-2">
                          <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                          <h3 className="text-base sm:text-lg font-bold">Report Image</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Help us improve our service reporting issues with the images
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitReport();
                        }}
                        className="space-y-6"
                      >
                        {/* Report Reason */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Reason for Report</label>
                          <div className="relative">
                            <select
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="w-full p-3 bg-background border border-border/50 rounded-lg text-sm appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                              required
                            >
                              <option value="">Select a reason...</option>
                              {reportReasons.map((reason, index) => (
                                <option key={index} value={reason}>
                                  {reason}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          </div>
                        </div>

                         {/*Additional Comments */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold">Description</label>
                          <textarea
                            value={reportComment}
                            onChange={(e) => setReportComment(e.target.value)}
                            placeholder="Please provide more details about the issue (optional)..."
                            className="w-full p-3 bg-background border border-border/50 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                            rows={4}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          {reportComment.length}/500 characters
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowReportForm(false);
                              setReportReason("");
                              setReportComment("");
                            }}
                            className="flex-1"
                            disabled={isSubmittingReport}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            onClick={submitReport}
                            disabled={!reportReason.trim() || isSubmittingReport}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isSubmittingReport ? (
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Submitting...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Send className="w-4 h-4" />
                                <span>Submit Report</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </form>

                      {/* Report Info */}
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-yellow-600">
                            <div className="font-medium mb-1">Report Information</div>
                            <div className="text-yellow-600/80">
                              Reports help us improve and fix issues. Your feedback is anonymous and
                              valuable.
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>)}


            {/* Image Overlay with Hints */}
            {selectedImageForHint && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className={cn(
                  "max-w-7xl w-full max-h-[90vh] flex flex-col gap-6",
                  showReportForm ? "xl:flex-row" : "lg:flex-row",
                )}>
                  {/* Image Container */}
                  <div className="flex-1 flex flex-col">
                    <div
                      className="aspect-[4/3] lg:aspect-auto lg:flex-1 relative rounded-lg overflow-hidden bg-card border border-border/50">
                      <img
                        src={selectedImageForHint.url}
                        alt="Full-size image"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                          Full Size View
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedImageForHint(null);
                            setSelectedHint(null);
                          }}
                          className="bg-background/90 backdrop-blur-sm hover:bg-background"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Hints Panel */}
                  <div className={cn(
                    "w-full lg:max-h-full overflow-y-auto",
                    showReportForm ? "xl:w-96" : "lg:w-96",
                  )}>
                    <Card className="border-border/50 backdrop-blur-sm bg-card/95 h-full">
                      <CardContent className="p-6 space-y-6">
                        {isRequestingHint === selectedImageForHint.id ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div
                              className="w-8 h-8 border-2 border-ai-glow/30 border-t-ai-glow rounded-full animate-spin" />
                            <div className="text-center">
                              <h3 className="font-semibold text-lg">Analyzing Image...</h3>
                              <p className="text-sm text-muted-foreground">Our AI is examining the image for
                                authenticity markers</p>
                            </div>
                          </div>
                        ) : selectedHint && selectedHint.imageId === selectedImageForHint.id ? (
                          <>
                            {/* Header */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Brain className="w-6 h-6 text-ai-glow" />
                                <h2 className="text-xl font-bold">AI Analysis</h2>

                              </div>
                              <p className="text-sm text-muted-foreground">
                                Detailed analysis of authenticity markers and generation signs
                              </p>
                            </div>

                            {/* AI Verdict */}
                            <div
                              className={cn(
                                "p-4 rounded-lg border flex items-center space-x-3",
                                selectedHint.fake
                                  ? "bg-destructive/10 border-destructive/20"
                                  : "bg-human-glow/10 border-human-glow/20",
                              )}
                            >
                              {selectedHint.fake ? (
                                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                              ) : (
                                <CheckCircle className="w-6 h-6 text-human-glow flex-shrink-0" />
                              )}
                              <div>
                                <div className="font-semibold text-lg">
                                  {selectedHint.fake ? "AI Generated" : "Human Created"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {selectedHint.fake
                                    ? "This image shows signs of artificial generation"
                                    : "This image appears to be authentic"}
                                </div>
                              </div>
                            </div>

                            {/* Key Indicators */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg flex items-center space-x-2">
                                <Eye className="w-5 h-5" />
                                <span>Detection Signs</span>
                              </h3>
                              <div className="space-y-3">
                                {selectedHint.signs.map((sign, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                                  >
                                    <div className="w-2 h-2 rounded-full bg-ai-glow mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium leading-relaxed">
                                        {sign}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Educational Note */}
                            <div className="p-4 bg-neural-purple/10 border border-neural-purple/20 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <Brain className="w-4 h-4 text-neural-purple mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <div className="font-medium text-neural-purple mb-1">Learning Note</div>
                                  <div className="text-muted-foreground">
                                    This AI analysis helps you learn detection patterns. Compare these insights with
                                    your own observations to improve your skills.
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={() => {
                                  setSelectedImageForHint(null);
                                  setSelectedHint(null);
                                }}
                                className="flex-1 bg-gradient-to-r from-ai-glow to-electric-blue hover:from-ai-glow/90 hover:to-electric-blue/90"
                              >
                                Continue Game
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Lightbulb className="w-12 h-12 text-human-glow" />
                            <p>Sorry, we only help real users.</p>

                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

            )}

            {/* Submit Button */}
            {!isLoading && (
              <div className="flex justify-center">
                <Button
                  onClick={submitGuesses}
                  disabled={!canSubmit || isSubmitting}
                  className={cn(
                    "w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold",
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
