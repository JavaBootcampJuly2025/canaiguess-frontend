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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Brain, Zap, Sparkles, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 👈 allows cookies/session
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Login success
        navigate("/menu");
      } else {
        // Login failed
        const message = await response.text();
        alert("Login failed: " + message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. See console.");
    } finally {
      setIsLoading(false);
    }
    // Simulate login
    // setTimeout(() => {
    //   setIsLoading(false);
    //   navigate("/menu");
    // }, 2000);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get input values (using refs or controlled state)
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const email = (document.getElementById("registerEmail") as HTMLInputElement).value;
    const password = (document.getElementById("registerPassword") as HTMLInputElement).value;
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        console.log("Registration successful!");
      } else {
        console.error("Registration failed:", await response.text());
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
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

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo and branding */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
              <div className="relative">
                <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-ai-glow" />
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                Test your skills against the latest AI image generation
              </p>
            </div>
          </div>

          {/* Login/Register Tabs */}
          <Card className="border-border/50 backdrop-blur-sm bg-card/80">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="space-x-2">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>Join Game</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl">
                    Sign in to your account
                  </CardTitle>
                  <CardDescription>
                    Continue your quest to outsmart AI image generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="neural.detective@example.com"
                        required
                        className="bg-background/50 h-11 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          className="bg-background/50 pr-10 h-11 text-base sm:text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="link" className="px-0 text-sm">
                        Forgot password?
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className={cn(
                        "w-full h-11 bg-gradient-to-r from-ai-glow to-electric-blue hover:from-ai-glow/90 hover:to-electric-blue/90",
                        "shadow-lg shadow-ai-glow/25 transition-all duration-300 text-base sm:text-sm font-semibold",
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="hidden sm:inline">
                            Authenticating...
                          </span>
                          <span className="sm:hidden">Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Enter Neural Arena
                          </span>
                          <span className="sm:hidden">Sign In</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="register">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl">Create your account</CardTitle>
                  <CardDescription>
                    Join the ultimate AI vs Human detection challenge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-sm font-medium"
                        >
                          Username
                        </Label>
                        <Input
                          id="username"
                          placeholder="NeuralDetective"
                          required
                          className="bg-background/50 h-11 text-base sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="registerEmail"
                        className="text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="neural.detective@example.com"
                        required
                        className="bg-background/50 h-11 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="registerPassword"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          required
                          className="bg-background/50 pr-10 h-11 text-base sm:text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className={cn(
                        "w-full h-11 bg-gradient-to-r from-human-glow to-cyber-green hover:from-human-glow/90 hover:to-cyber-green/90",
                        "shadow-lg shadow-human-glow/25 transition-all duration-300 text-base sm:text-sm font-semibold",
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="hidden sm:inline">
                            Creating Account...
                          </span>
                          <span className="sm:hidden">Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Begin Training
                          </span>
                          <span className="sm:hidden">Join Game</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Game stats preview */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-ai-glow">
                127K
              </div>
              <div className="text-xs text-muted-foreground">Images Tested</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-human-glow">
                89%
              </div>
              <div className="text-xs text-muted-foreground">Avg Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-bold text-neural-purple">
                42K
              </div>
              <div className="text-xs text-muted-foreground">
                Active Players
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground px-4">
            <p>Challenge your perception. Train your intuition.</p>
            <p className="mt-2">Can you tell what's real?</p>
          </div>
        </div>
      </div>
    </div>
  );
}
