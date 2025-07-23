import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Brain,
  Sparkles,
  ArrowLeft,
  Shield,
  Users,
  Search,
  Eye,
  Trash2,
  UserX,
  UserCheck,
  Crown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  MoreVertical,
  Calendar,
  Globe,
  Mail,
  Clock,
  BarChart3,
  Database,
  Flag,
  Upload,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminUserDTO,
  AdminUserListResponseDTO,
  AdminUserDetailsDTO,
  AdminDashboardStatsDTO,
} from "@/types/Admin";

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailsDTO | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock data generation for development
  const generateMockUsers = (): AdminUserDTO[] => {
    const roles: Array<'user' | 'admin'> = ['user', 'admin'];

    return Array.from({ length: 15 }, (_, i) => ({
      id: `user-${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
      isEmailVerified: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalGames: Math.floor(Math.random() * 200),
      totalScore: Math.floor(Math.random() * 10000),
      accuracy: Math.round((60 + Math.random() * 35) * 10) / 10,
      role: roles[Math.floor(Math.random() * roles.length)],
    }));
  };

  const generateMockReports = () => [
    {
      id: 1,
      imageId: "img-001",
      imageUrl: "https://picsum.photos/300/200?random=1",
      username: "user123",
      description: "This image contains inappropriate content",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: 2,
      imageId: "img-005",
      imageUrl: "https://picsum.photos/300/200?random=5",
      username: "player456",
      description: "Suspected AI generation artifacts are incorrect",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: 3,
      imageId: "img-012",
      imageUrl: "https://picsum.photos/300/200?random=12",
      username: "detector789",
      description: "Image appears to be misclassified",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
  ];

  const generateMockUserDetails = (user: AdminUserDTO): AdminUserDetailsDTO => ({
    ...user,
    firstName: `First${user.id.split('-')[1]}`,
    lastName: `Last${user.id.split('-')[1]}`,
    bio: `Bio for ${user.username}`,
    location: "San Francisco, CA",
    website: `https://${user.username}.com`,
    timezone: "America/Los_Angeles",
    language: "en",
    loginHistory: Array.from({ length: 5 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      ipAddress: `192.168.1.${100 + i}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "San Francisco, CA",
      success: Math.random() > 0.1,
    })),
    gameHistory: Array.from({ length: 10 }, (_, i) => ({
      gameId: `game-${i + 1}`,
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
      score: Math.floor(Math.random() * 1000),
      accuracy: Math.round((60 + Math.random() * 35) * 10) / 10,
      totalImages: 20,
      correctGuesses: Math.floor(12 + Math.random() * 8),
      difficulty: Math.floor(Math.random() * 4) + 1,
      finished: Math.random() > 0.2,
    })),
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        fetchReports();

        const mockUsers = generateMockUsers();

        setUsers(mockUsers);
        setTotalUsers(mockUsers.length);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, searchQuery]);



  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/unresolved`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("API response:", data);

      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    const token = localStorage.getItem("token");
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/resolve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, resolved: true } : r
        )
      );
      console.log("Resolved!");
    } catch (error) {
      console.error("Error resolving report:", error);
    } finally {
      setIsUpdating(false);
    }
  };



  const handleViewUser = (user: AdminUserDTO) => {
    // Navigate to the user's actual profile page
    navigate(`/profile/${user.username}`);
  };

  const handleToggleUserRole = async (userId: string, role: 'user' | 'admin') => {
    setIsUpdating(true);
    try {
      // In production: await adminAPI.updateUser(userId, { role });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role } : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${username}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        console.log("User deleted!");
      }
    } catch (err) {
      console.error("Deletion failed:", err.errorCode);
      alert("Something went wrong. See console.");
    } finally {
      setIsUpdating(false);
    }
  };

  // const handleResolveReport = async (reportId: number) => {
  //   setIsUpdating(true);
  //   try {
  //     // In production: await adminAPI.resolveReport(reportId);
  //     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  //
  //     setReports(prev => prev.map(report =>
  //       report.id === reportId ? { ...report, resolved: true } : report
  //     ));
  //   } catch (error) {
  //     console.error('Failed to resolve report:', error);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploadingImage(true);
    try {
      // In production: implement actual image upload
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload delay

      alert(`Successfully uploaded ${files.length} image(s) to the game pool.`);
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getRoleBadge = (role: 'user' | 'admin') => {
    return role === 'admin' ? (
      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
        <Crown className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline" className="border-muted-foreground/20">
        <Users className="w-3 h-3 mr-1" />
        User
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            <span className="text-lg text-muted-foreground">Loading admin panel...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Administrative background effects - more rigid/structured */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid pattern overlay for administrative feel */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="admin-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-grid)" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
          <div className="flex justify-between items-center p-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/menu")}
                className="border-border/50 hover:bg-destructive/10 hover:border-destructive/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Admin
              </Button>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Brain className="w-6 h-6 text-red-500" />
                  <Shield className="w-3 h-3 text-purple-500 absolute -top-1 -right-1" />
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                  CanAIGuess Admin
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Administrative Control Panel
              </h1>
              <p className="text-muted-foreground">
                Manage users, monitor system health, and oversee platform operations
              </p>
            </div>

            {/* Admin Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-xl bg-card/50 border border-border/50">
                <TabsTrigger value="users" className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-600">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-600">
                  <Flag className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="images" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Images
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span>User Management</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64 bg-background/50"
                          />
                        </div>
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Games</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Accuracy</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/10">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.username}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>{user.totalGames}</TableCell>
                              <TableCell>{user.totalScore.toLocaleString()}</TableCell>
                              <TableCell>{user.accuracy}%</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewUser(user)}
                                    className="hover:bg-blue-500/10"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                    disabled={isUpdating}
                                    className="hover:bg-purple-500/10"
                                  >
                                    <Crown className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-red-500/10 text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {user.username}? This action cannot be undone and will permanently remove their account and all associated data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(user.username)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete User
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Flag className="w-5 h-5 text-yellow-600" />
                        <span>Image Reports</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600/30">
                          {reports.filter(r => !r.resolved).length} Pending
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reports.length === 0 ? (
                        <div className="text-center py-8">
                          <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Reports</h3>
                          <p className="text-muted-foreground">All reports have been resolved.</p>
                        </div>
                      ) : (
                        reports.map((report) => (
                          <Card key={report.id} className={cn(
                            "border transition-all duration-200",
                            report.resolved
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-yellow-500/20 bg-yellow-500/5"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <img
                                  src={report.imageUrl}
                                  alt="Reported image"
                                  className="w-24 h-24 object-cover rounded-lg border border-border/50"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">Report #{report.reportId}</div>
                                      <div className="text-sm text-muted-foreground">
                                        Reported by <span className="font-medium">{report.username}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {report.resolved ? (
                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                          <CheckCircle className="w-3 h-3 mr-1" />
                                          Resolved
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                          <AlertTriangle className="w-3 h-3 mr-1" />
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Description:</span> {report.description}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Image ID: {report.imageId} • Reported {new Date(report.timestamp).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center space-x-2 pt-2">
                                    {!report.resolved && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleResolveReport(report.reportId)}
                                        disabled={isUpdating}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark Resolved
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(report.imageUrl, '_blank')}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Full Image
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images Tab */}
              <TabsContent value="images" className="space-y-6">
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span>Image Pool Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Upload New Images</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add new images to the game pool. Supported formats: JPG, PNG, WebP. Maximum file size: 5MB per image.
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-border rounded-lg p-8">
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <div className="space-y-2">
                            <h4 className="text-lg font-medium">Drop images here or click to browse</h4>
                            <p className="text-sm text-muted-foreground">
                              You can upload multiple images at once
                            </p>
                          </div>
                          <div className="mt-4">
                            <input
                              type="file"
                              id="image-upload"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleImageUpload(e.target.files);
                                }
                              }}
                            />
                            <Button
                              onClick={() => document.getElementById('image-upload')?.click()}
                              disabled={isUploadingImage}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isUploadingImage ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  <span>Uploading...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Select Images</span>
                                </div>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-border/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">AI Generated Images</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Upload images that are AI-generated for the detection challenge.
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Images will be automatically tagged as AI-generated</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-border/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Human Created Images</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Upload authentic human-created images for the detection challenge.
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Images will be automatically tagged as human-created</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-border/50">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4" />
                            <span>Upload Guidelines</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Ensure images are clear and high quality</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Avoid images with watermarks or obvious signatures</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Include diverse subjects and styles for better game balance</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span>Images will be automatically resized and optimized for the game</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>


    </div>
  );
}
