import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import MatchCreation from "./pages/MatchCreation";
import Users from "./pages/Users";
import SyncLogs from "./pages/SyncLogs";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import TeamPlayers from "./pages/TeamPlayers";
import UpcomingFixtures from "./pages/UpcomingFixtures";
import NewMatchForm from "./components/ui/new-match-form";
import AllMatches from "./pages/AllMatches";
import MatchCreateScreen from "./pages/MatchCreation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/matches" element={<AllMatches />} />
            <Route path="/match-creation" element={<AllMatches />} />
            <Route path="/match-create" element={<MatchCreateScreen />} />
            <Route path="/users" element={<Users />} />
            <Route path="/sync-logs" element={<SyncLogs />} />
            <Route path="/fixtures" element={<UpcomingFixtures />} />
            <Route path="/teams/:teamId/players" element={<TeamPlayers />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
