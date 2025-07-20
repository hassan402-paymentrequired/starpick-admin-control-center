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
import { Search, Star, Filter, Download, Eye, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFetch } from "@/hooks/useFetch";
import { Team } from "./Teams";
import { useFormRequest } from "@/hooks/useForm.ts";
import api from "@/lib/axios";

export interface Player {
  id: string;
  name: string;
  position: string;
  team: Team;
  teamLogo: string;
  player_rating: number;
  isActive: boolean;
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [itemsPerPage] = useState(12);
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [paginationLinks, setPaginationLinks] = useState([]);
  // const { data, loading, error, refetch, abort } = useFetch<Player[]>("/admin/players");
  const { patch, errors } = useFormRequest();
  const { data, loading, error, refetch, abort } = useFetch(
    `/admin/players?page=${currentPage}`
  );

  useEffect(() => {
    if (data) {
      const playerList = data?.data?.players?.data ?? [];
      setPlayers(playerList);
      setFilteredPlayers(playerList);
      setTotalPages(data?.data?.players?.last_page ?? 1);
      setTotalPlayers(data?.data?.players?.total ?? playerList.length);
      setPaginationLinks(data?.data?.players?.links ?? []);
    }
    console.log(data);
  }, [data, currentPage]);

  useEffect(() => {
    // Fetch teams for filter dropdown
    api.get("/admin/teams").then((res) => {
      setTeams(res.data);
    });
  }, []);

  // Reset page to 1 only when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTeam, selectedPosition, selectedRating]);

  // Filter players when players or filters change (but don't reset page)
  useEffect(() => {
    const filtered = players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition =
        selectedPosition === "all" || player.position === selectedPosition;
      const matchesTeam =
        selectedTeam === "all" || player.team.id === selectedTeam;
      const matchesRating =
        selectedRating === "all" ||
        player.player_rating === Number(selectedRating);
      return matchesSearch && matchesPosition && matchesTeam && matchesRating;
    });
    setFilteredPlayers(filtered);
  }, [players, searchQuery, selectedTeam, selectedPosition, selectedRating]);

  const handleToggleActive = (playerId: string) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId
          ? { ...player, isActive: !player.isActive }
          : player
      )
    );

    const player = players.find((p) => p.id === playerId);
    toast({
      title: player?.isActive ? "Player Removed" : "Player Added",
      description: `${player?.name} has been ${
        player?.isActive ? "removed from" : "added to"
      } the game.`,
    });
  };

  const handleRatingChange = async (playerId: string, newRating: number) => {
    console.log(playerId, newRating);
    await patch(`/admin/players/star/${playerId}/update`, {
      rating: newRating,
    });
    refetch();
    const player = players.find((p) => p.id === playerId);

    toast({
      title: "Rating Updated",
      description: `${player?.name}'s rating has been updated to ${newRating} stars.`,
    });
  };

  // console.log(error);

  const handleSyncPlayers = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Players Synced",
        description: "Successfully synchronized players from external API.",
      });
    }, 2000);
  };

  // Get unique teams and positions for filters
  const positions = Array.from(new Set(players?.map((p) => p.position)));

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

            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

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
                      {player?.team.name}
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
                            {player?.team.name}
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
                            {player.isActive ? "Active" : "Inactive"}
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
                    variant={player.isActive ? "default" : "secondary"}
                    className={
                      player.isActive
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : ""
                    }
                  >
                    {player.isActive ? "In Game" : "Not in Game"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {player.isActive ? "Remove" : "Add"}
                  </span>
                  <Switch
                    checked={player.isActive}
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
      {paginationLinks.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {paginationLinks.map((link, idx) => {
            // Always extract page number from URL if present
            let pageNum = null;
            if (link.url) {
              const match = link.url.match(/page=(\d+)/);
              if (match) pageNum = Number(match[1]);
            }
            return (
              <button
                key={idx}
                className={`px-3 py-1 border rounded disabled:opacity-50 ${
                  link.active ? "bg-primary text-white" : ""
                }`}
                disabled={!link.url || link.active}
                onClick={() => {
                  if (pageNum && pageNum !== currentPage)
                    setCurrentPage(pageNum);
                }}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {players.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {players.filter((p) => p.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Players
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {players.filter((p) => p.player_rating === 5).length}
              </div>
              <div className="text-sm text-muted-foreground">
                5-Star Players
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(
                  (players.reduce((acc, p) => acc + p.player_rating, 0) /
                    players.length) *
                    10
                ) / 10}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Players;
