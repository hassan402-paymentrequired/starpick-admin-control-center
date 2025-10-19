import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Search, Star, Filter, Download, Eye, RotateCcw, ChevronLeft, ChevronRight} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useFetch } from "@/hooks/useFetch";
import {PaginatedResponse, Team} from "./Teams";
import { useFormRequest } from "@/hooks/useForm.ts";
import api from "@/lib/axios";

export interface Player {
  id: string;
  name: string;
  position: string;
  team: Team;
  teamLogo: string;
  player_rating: number;
  status: boolean;
  external_id: string;
  nationality: string;
  created_at: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncTeams, setSyncTeams] = useState<Team[]>([]);
  const [selectedSyncTeam, setSelectedSyncTeam] = useState("");
  const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
  const { patch, errors } = useFormRequest();
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchPlayers = async (page = 1, search = "") => {
    setIsRefetching(true)
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/admin/players?${params.toString()}`);
      const data = response.data.data?.players;
      // console.log(response)

      setPaginationData(data);
      setPlayers(data.data);
      setCurrentPage(data.current_page);

      api.get("/admin/teams/active-teams").then((res) => {
        setTeams(res.data);
        setSyncTeams(res.data);
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams.",
        variant: "destructive",
      });
    } finally {
      setIsRefetching(false);
    }
  };


  useEffect(() => {
    fetchPlayers(1)
  }, []);


  // Reset page to 1 only when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTeam, selectedPosition, selectedRating]);


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchPlayers(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Filter players when players or filters change (but don't reset page)
  useEffect(() => {
    const filtered = players.filter((player) => {
      const matchesPosition =
        selectedPosition === "all" || player.position === selectedPosition;
      const matchesTeam =
        selectedTeam === "all" || player?.team?.id === selectedTeam;
      const matchesRating =
        selectedRating === "all" ||
        player.player_rating === Number(selectedRating);
      return  matchesPosition && matchesTeam && matchesRating;
    });
    setFilteredPlayers(filtered);
  }, [players, selectedTeam, selectedPosition, selectedRating]);

  const handleToggleActive = async  (playerId: string) => {
    const player = players.find((t) => t.id === playerId);
    if (!player) return;
    const newStatus = player.status ? 0 : 1;

    try {
      await api.patch(`/admin/players/status/${playerId}/update`);
      await fetchPlayers(currentPage, searchQuery);
      toast({
        title: newStatus === 1 ? "Player Activated" : "Player Deactivated",
        description: `${player.name} has been ${
            newStatus === 1 ? "activated" : "deactivated"
        } successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status for ${player.name}.`,
        variant: "destructive",
      });
    }
  };

  const handleRatingChange = async (playerId: string, newRating: number) => {
    console.log(playerId, newRating);
    await patch(`/admin/players/star/${playerId}/update`, {
      rating: newRating,
    });
    fetchPlayers(1);
    const player = players.find((p) => p.id === playerId);

    toast({
      title: "Rating Updated",
      description: `${player?.name}'s rating has been updated to ${newRating} stars.`,
    });
  };

  const handleSyncPlayers = () => {
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!selectedSyncTeam) return;
    setIsLoading(true);
    setDialogOpen(false);
    try {
      // Fetch players from external API
      const response = await api.post(
        `/admin/players/refetch`,
          {league: selectedSyncTeam}
      );
      console.log(response.data);
      toast({
        title: "Players Synced",
        description: "Successfully synchronized players from external API.",
      });
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync players from API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedSyncTeam("");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationData && page > paginationData.last_page)) return;
    fetchPlayers(page, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const positions = Array.from(new Set(paginationData?.data?.map((p) => p.position)));

  const renderPaginationButtons = () => {
    if (!paginationData || paginationData.last_page <= 1) return null;

    const buttons = [];
    const currentPage = paginationData.current_page;
    const lastPage = paginationData.last_page;

    // Always show first page
    if (currentPage > 3) {
      buttons.push(
          <Button
              key={1}
              variant={1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
              className="min-w-[40px]"
          >
            1
          </Button>
      );

      if (currentPage > 4) {
        buttons.push(
            <span key="ellipsis-start" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }
    }

    // Show pages around current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(lastPage, currentPage + 2); i++) {
      buttons.push(
          <Button
              key={i}
              variant={i === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i)}
              className="min-w-[40px]"
          >
            {i}
          </Button>
      );
    }

    // Always show last page
    if (currentPage < lastPage - 2) {
      if (currentPage < lastPage - 3) {
        buttons.push(
            <span key="ellipsis-end" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }

      buttons.push(
          <Button
              key={lastPage}
              variant={lastPage === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(lastPage)}
              className="min-w-[40px]"
          >
            {lastPage}
          </Button>
      );
    }

    return buttons;
  };

  if (!paginationData) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading teams...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Players Management
          </h1>
          <p className="text-muted-foreground">
            Manage football players and their ratings
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSyncPlayers}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RotateCcw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Sync Players
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>



            <Select
              value={selectedPosition}
              onValueChange={setSelectedPosition}
            >
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Ratings</SelectItem>
                {[1, 2, 3, 4, 5].map((star) => (
                  <SelectItem key={star} value={String(star)}>
                    {star} Star{star > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


          </div>
        </CardContent>
      </Card>

      {isRefetching && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading...</span>
            </div>
          </div>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers?.map((player) => (
          <Card
            key={player.id}
            className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground mb-1">
                    {player.name}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {player.position}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {player?.team?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {player.nationality}
                    </div>
                  </CardDescription>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">
                        {player.name}
                      </DialogTitle>
                      <DialogDescription>
                        Detailed player information and statistics
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Position:
                          </span>
                          <p className="font-medium text-foreground">
                            {player.position}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Team:</span>
                          <p className="font-medium text-foreground">
                            {player?.team?.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Age:</span>
                          <p className="font-medium text-foreground">21</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Nationality:
                          </span>
                          <p className="font-medium text-foreground">
                            {player.nationality}
                          </p>
                        </div>

                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium text-foreground">
                            {player.status ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Star Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(player.id, star)}
                      className="star transition-all duration-200 hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= player.player_rating
                            ? "text-primary fill-primary"
                            : "text-muted-foreground hover:text-primary/50"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {player.player_rating}/5
                  </span>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={player.status ? "default" : "secondary"}
                    className={
                      player.status
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : ""
                    }
                  >
                    {player.status ? "Active" : "Deactivated"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">

                  <Switch
                    checked={player.status}
                    onCheckedChange={() => handleToggleActive(player.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {paginationData && paginationData.last_page > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginationData.from} to {paginationData.to} of {paginationData.total} teams
            </div>

            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.prev_page_url || isRefetching}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                {renderPaginationButtons()}
              </div>

              <div className="sm:hidden text-sm text-muted-foreground px-2">
                Page {currentPage} of {paginationData.last_page}
              </div>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.next_page_url || isRefetching}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {paginationData.total}
              </div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {players.filter((t) => t.status).length}
              </div>
              <div className="text-sm text-muted-foreground">Active on Page</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {players.filter((t) => t.status).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Inactive on Page
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Team</DialogTitle>
            <DialogDescription>
              Please select a team to sync players from the external API.
            </DialogDescription>
          </DialogHeader>
          <select
            className="w-full px-3 py-2 rounded border border-input bg-background text-foreground mb-4"
            value={selectedSyncTeam}
            onChange={(e) => setSelectedSyncTeam(e.target.value)}
          >
            <option value="">Select Team</option>
            {syncTeams.map((team) => (
              <option
                key={team.external_id}
                value={team.external_id}
              >
                {team.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              onClick={handleDialogConfirm}
              disabled={!selectedSyncTeam || isLoading}
            >
              {isLoading ? "Syncing..." : "Sync Players"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Players;
