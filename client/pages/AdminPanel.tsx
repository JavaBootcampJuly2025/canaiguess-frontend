import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction,
  AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Brain, ArrowLeft, Shield, Users, Search, Eye, Trash2, Crown, AlertTriangle, CheckCircle, Filter,
  Flag, Upload, X, RefreshCw, Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AdminUserDTO,
  AdminUserDetailsDTO,
} from "@/types/Admin";
import { toast } from "@/components/ui/use-toast";
import {promoteUserToAdmin} from "@/services/UserService";

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageLabels, setImageLabels] = useState<{ [key: string]: boolean }>({});
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        fetchReports();
        await fetchUsers();
        console.log(localStorage.getItem("token"));
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, searchQuery]);

  const fetchUsers = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    const token = localStorage.getItem("token");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched users:", data);

      // If your backend returns Page<UserDTO>, the content is in `content`
      setUsers(data.content);
      setTotalUsers(data.totalElements);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromote = async (username: string) => {
    
    const token = localStorage.getItem("token");
    try {
      await promoteUserToAdmin(token, username);
      toast({
        title: `${username} has been promoted to Admin.`,
      });
      // Optionally refresh the user list here!
    } catch (error) {
      toast({
        title: 'Failed to promote user.',
      });
      console.error(error);
    }
  };


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
      await fetch(`${API_BASE_URL}/api/reports/${reportId}/resolve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.reportId === reportId ? { ...r, resolved: true } : r
        )
      );
      console.log("Resolved!");
    } catch (error) {
      console.error("Error resolving report:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
    const token = localStorage.getItem("token");
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/image/${imageId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Remove reports for this image
        setReports((prev) => prev.filter((r) => r.imageId !== imageId));
        console.log("Image deleted successfully!");
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
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

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setImageLabels(prev => {
      const newLabels = { ...prev };
      delete newLabels[fileName];
      return newLabels;
    });
  };

  const toggleImageLabel = (fileName: string) => {
    setImageLabels(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  const handleFileSelection = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file =>
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length !== fileArray.length) {
      alert('Some files were rejected. Only images under 5MB are allowed.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Initialize labels for new files (default to false = real/human)
    const newLabels: { [key: string]: boolean } = {};
    validFiles.forEach(file => {
      newLabels[file.name] = false; // false = real/human, true = AI/fake
    });
    setImageLabels(prev => ({ ...prev, ...newLabels }));
  };

  const handleImageSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploadingImage(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FALLBACK;
      const token = localStorage.getItem("token");

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        // The label: true = AI/Fake, false = Real
        const isFake = imageLabels[file.name] === true;
        formData.append("fake", isFake.toString());

        const response = await fetch(`${API_BASE_URL}/api/image/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name} with status ${response.status}`);
        }
      }

      alert(`Successfully uploaded ${selectedFiles.length} image(s) to the game pool.`);
      setSelectedFiles([]);
      setImageLabels({});
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
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
      {/* Administrative background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
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
                              <TableCell>{user.score.toLocaleString()}</TableCell>
                              <TableCell>{user.accuracy * 100}%</TableCell>
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
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isUpdating}
                                        className="hover:bg-purple-500/10"
                                      >
                                        <Crown className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {user.role === 'admin' ? 'Remove Admin Rights' : 'Grant Admin Rights'}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {user.role === 'admin'
                                            ? `Are you sure you want to remove admin privileges from ${user.username}? They will lose access to the admin panel and administrative functions.`
                                            : `Are you sure you want to grant admin privileges to ${user.username}? They will gain access to the admin panel and all administrative functions.`
                                          }
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handlePromote(user.username)}
                                          className={user.role === 'admin' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-purple-600 hover:bg-purple-700'}
                                        >
                                          {user.role === 'admin' ? 'Remove Admin' : 'Grant Admin'}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:border-red-500/50"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete Image
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to permanently delete this image (ID: {report.imageId})? This action cannot be undone and will remove the image from the database.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteImage(report.imageId)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete Image
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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

                      {/* File Drop Zone */}
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 transition-colors",
                          isDragOver
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-border hover:border-blue-500/50"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
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
                                  handleFileSelection(e.target.files);
                                }
                              }}
                            />
                            <Button
                              onClick={() => document.getElementById('image-upload')?.click()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Select Images
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Selected Files */}
                      {selectedFiles.length > 0 && (
                        <Card className="border-border/50">
                          <CardHeader>
                            <CardTitle className="text-base">Selected Images ({selectedFiles.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {selectedFiles.map((file) => (
                                <div key={file.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                                      <Image className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{file.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant={imageLabels[file.name] ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => toggleImageLabel(file.name)}
                                        className={cn(
                                          !imageLabels[file.name] && "bg-blue-600 hover:bg-blue-700 text-white"
                                        )}
                                      >
                                        Real
                                      </Button>
                                      <Button
                                        variant={imageLabels[file.name] ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleImageLabel(file.name)}
                                        className={cn(
                                          imageLabels[file.name] && "bg-red-600 hover:bg-red-700 text-white"
                                        )}
                                      >
                                        AI/Fake
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(file.name)}
                                      className="text-red-600 hover:bg-red-500/10"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                              <div className="flex justify-end pt-4 border-t">
                                <Button
                                  onClick={handleImageSubmit}
                                  disabled={isUploadingImage || selectedFiles.length === 0}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isUploadingImage ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      <span>Uploading...</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <Upload className="w-4 h-4" />
                                      <span>Upload {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''}</span>
                                    </div>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Upload Guidelines */}
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
                              <span>Mark each image as "Real" (human-created) or "AI/Fake" (AI-generated)</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Ensure images are clear and high quality</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>Avoid images with watermarks or obvious signatures</span>
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
