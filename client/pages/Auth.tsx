import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bot, Brain, Eye, EyeOff, Sparkles, User, Zap, UserCheck, Shield, Check, } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Exception handling
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const usernameErrors = businessError && businessError.toLowerCase().includes("username") ? [businessError] : [];
  const emailErrors = businessError && businessError.toLowerCase().includes("email") ? [businessError] : [];
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginErrors = loginError && loginError.toLowerCase().includes("credentials")
    ? [loginError] : [];

// if later validation contains errors for email too, then they will have to be separated like business errors
  const passwordErrors = validationErrors.filter(err =>
    err.toLowerCase().includes("password"),
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Login success
        const token = data.token;
        const username = data.username;
        const role = data.role;
        console.log("Role: " + role + " username: " + username);

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("username", username);
          localStorage.setItem("isGuest", "false");
          localStorage.setItem("role", role);
          console.log(role);
          navigate("/menu");
        } else {
          alert("Login succeeded but no token returned.");
        }
      } else {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors);
          setBusinessError(null); // clear any previous business error

        } else if (data.businessErrorCode) {
          setBusinessError(data.businessError || data.error);
          setValidationErrors([]);
        } else {
          console.error("Registration failed:", data);
          setBusinessError("Registration failed. Please try again.");
          setValidationErrors([]);
        }
        // Login failed
        setLoginError(data.error || "Login failed.");
      }
    } catch (err) {
      console.error("Error:", err.errorCode);
      alert("Something went wrong. See console.");
    }
  finally
    {
      setIsLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get input values (using refs or controlled state)
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const email = (document.getElementById("registerEmail") as HTMLInputElement).value;
    const password = (document.getElementById("registerPassword") as HTMLInputElement).value;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
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
      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful!");
        const token = data.token;
        const username = data.username;
        const role = data.role;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("username", username);
          localStorage.setItem("isGuest", "false");
          localStorage.setItem("role", role);
          navigate("/menu");
        } else {
          alert("Registration succeeded but no token returned.");
        }
        setValidationErrors([]);
        setBusinessError(null);
      } else {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors);
          setBusinessError(null); // clear any previous business error

        } else if (data.businessErrorCode) {
          setBusinessError(data.businessError || data.error);
          setValidationErrors([]);
        } else {
          console.error("Registration failed:", data);
          setBusinessError("Registration failed. Please try again.");
          setValidationErrors([]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (!captchaVerified) return;
    localStorage.setItem("isGuest", "true");
    localStorage.setItem("role", "guest");
    navigate("/menu");
  };

  const handleCaptchaChange = async (token: string | null) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/captcha/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('CAPTCHA verification failed on server');
      }

      const data = await response.json();
      console.log('Backend CAPTCHA response:', data);

      if (data.success) {
        setCaptchaVerified(true);
      } else {
        // Show error to user
        setCaptchaVerified(false);
        alert('CAPTCHA verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying CAPTCHA:', error);
      setCaptchaVerified(false);
      alert('CAPTCHA verification error. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-6 left-6 z-20">
        <ThemeToggle />
      </div>

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

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo and branding */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
              <div className="relative">
                <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-ai-glow" />
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-human-glow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div
                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-ai-glow to-human-glow bg-clip-text text-transparent">
                CanAIGuess
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
                Test your skills against the latest AI image generation
              </p>
            </div>
          </div>

          {/* Login/Register Tabs */}
          <Card className="border-border/50 backdrop-blur-sm bg-card/80">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="login" className="space-x-2">
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="space-x-2">
                  <Bot className="w-4 h-4" />
                  <span>Join Game</span>
                </TabsTrigger>
                <TabsTrigger value="guest" className="space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Guest</span>
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
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="username"
                        placeholder="BestGuesser"
                        required
                        className="bg-background/50 h-11 text-base sm:text-sm"
                      />
                      {loginErrors && (
                        <div className="text-red-500 mb-2">{loginErrors}</div>
                      )}
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
                        {/* Password Validation Errors */}
                        {passwordErrors.length > 0 && (
                          <div className="text-red-500 mt-2">
                            <p>Wrong password.</p>
                          </div>
                        )}
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
                        {usernameErrors.length > 0 && (
                          <div className="text-red-500">
                            {usernameErrors.map((err, i) => (
                              <div key={i}>{err}</div>
                            ))}
                          </div>
                        )}
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
                      {emailErrors.length > 0 && (
                        <div className="text-red-500">
                          {emailErrors.map((err, i) => (
                            <div key={i}>{err}</div>
                          ))}
                        </div>
                      )}
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
                    {/* Password Validation Errors */}
                    {validationErrors.length > 0 && (
                      <div className="text-red-500 mt-2">
                        {validationErrors.map((err, i) => (
                          <div key={i}>{err}</div>
                        ))}
                      </div>
                    )}

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
              <TabsContent value="guest">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-xl">
                    Play as Guest
                  </CardTitle>
                  <CardDescription>
                    Start playing immediately without creating an account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 rounded-lg bg-muted/20 border border-border/50">
                      <Shield className="w-12 h-12 text-ai-glow mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Verify you're human</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete the CAPTCHA to continue as a guest
                      </p>
                      {!captchaVerified ? (
                        <div className="flex justify-center space-y-4">
                          <ReCAPTCHA
                            sitekey="6Lf3dosrAAAAAP4h0T0n00lyMU4X2haT1_wpp0F3"
                            onChange={handleCaptchaChange}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-human-glow/10 border border-human-glow/30 rounded-lg p-4">
                            <div className="flex items-center justify-center space-x-2 text-sm text-human-glow">
                              <Check className="w-4 h-4" />
                              <span>Verification successful!</span>
                            </div>
                          </div>
                          <Button
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                            className={cn(
                              "w-full bg-gradient-to-r from-human-glow to-cyber-green hover:from-human-glow/90 hover:to-cyber-green/90",
                              "shadow-lg shadow-human-glow/25 transition-all duration-300",
                            )}
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <UserCheck className="w-4 h-4" />
                                <span>Enter as Guest</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      <p>Guest mode limitations:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Progress won't be saved</li>
                        <li>• No leaderboard participation</li>
                        <li>• Fewer bragging rights</li>
                      </ul>
                    </div>
                  </div>
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
