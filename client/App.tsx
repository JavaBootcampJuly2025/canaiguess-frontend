import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {PrivateRoute, GuestOrUserRoute, PublicRoute} from "@/components/RouteGuards";
import Auth from "./pages/Auth";
import MainMenu from "./pages/MainMenu";
import GamePage from "./pages/GamePage";
import NotFound from "./pages/404";
import GameOver from "./pages/GameOver";
import Leaderboards from "./pages/Leaderboards";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Only unauthorized users (no token) can access login page */}
          <Route path="/" element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } />

          {/* Guests & logged-in users */}
          <Route path="/menu" element={
            <GuestOrUserRoute>
              <MainMenu />
            </GuestOrUserRoute>
          } />
          <Route path="/game/:gameId" element={
            <GuestOrUserRoute>
              <GamePage />
            </GuestOrUserRoute>
          } />
          <Route path="/game/:gameId/results/" element={
            <GuestOrUserRoute>
              <GameOver />
            </GuestOrUserRoute>
          } />

          {/* Logged-in users only */}
          <Route path="/leaderboards" element={
            <PrivateRoute>
              <Leaderboards />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
