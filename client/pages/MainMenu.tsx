import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Brain,
  Sparkles,
  Play,
  Trophy,
  LogOut,
  Image,
  Images,
  Grid3X3,
  Zap,
  Target,
  BarChart3,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {NewGameResponseDTO} from "@/dto/NewGameResponseDTO";

export default function MainMenu() {
  // Default values for new game
  var [batchSize, setbatchSize] = useState("1");
  var [batchCount, setBatchCount] = useState("10");
  var [difficulty, setDifficulty] = useState("50");
  var [isLoading, setIsLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDialogOpen(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Here the logout logic (clear tokens, etc.) will be handled
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ai-glow/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-human-glow/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neural-purple/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Brain className="w-8 h-8 text-ai-glow" />
              <Sparkles className="w-4 h-4 text-human-glow absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
              CanAIGuess
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border/50 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Play Game Card */}
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 hover:shadow-xl hover:shadow-ai-glow/10 transition-all duration-300">
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
                            value={batchSize}
                            onValueChange={setbatchSize}
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
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
                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
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
                            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                              <RadioGroupItem value="4" id="group" />
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
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 hover:shadow-xl hover:shadow-human-glow/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <div className="p-2 rounded-lg bg-human-glow/10">
                      <Trophy className="w-6 h-6 text-human-glow" />
                    </div>
                    <span>Leaderboards & Stats</span>
                  </CardTitle>
                  <CardDescription>
                    View global rankings and your performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-human-glow/30 hover:bg-human-glow/10 hover:border-human-glow/50 text-base font-semibold"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Statistics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-ai-glow">127K</div>
                  <div className="text-sm text-muted-foreground">
                    Images Tested
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-human-glow">89%</div>
                  <div className="text-sm text-muted-foreground">
                    Global Avg
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-neural-purple">
                    42K
                  </div>
                  <div className="text-sm text-muted-foreground">Players</div>
                </CardContent>
              </Card>
              <Card className="border-border/50 backdrop-blur-sm bg-card/80 text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-electric-blue">
                    95%
                  </div>
                  <div className="text-sm text-muted-foreground">Your Best</div>
                </CardContent>
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
