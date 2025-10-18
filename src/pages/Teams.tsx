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
import { Search, Download, Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFetch } from "@/hooks/useFetch";
import api from "@/lib/axios";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export interface Team {
  id: string;
  name: string;
  logo: string;
  external_id?: string;
  status: number;
  league: string;
  country: string;
  code: string;
  created_at: string;
  updated_at: string;
  players_count: number;
}

export interface PaginatedResponse {
  current_page: number;
  data: unknown[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");

  // Fetch teams with pagination
  const fetchTeams = async (page = 1, search = "") => {
    setIsRefetching(true)
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/admin/teams?${params.toString()}`);
      const data = response.data;

      setPaginationData(data);
      setTeams(data.data);
      setCurrentPage(data.current_page);
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
    fetchTeams(1);
  }, []);

  useEffect(() => {
    api
        .get("/admin/leagues/active-leagues")
        .then((res) =>
            setLeagues(res.data.data?.leagues || res.data.leagues || [])
        );
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchTeams(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationData && page > paginationData.last_page)) return;
    fetchTeams(page, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const newStatus = team.status === 1 ? 0 : 1;
    try {
      await api.patch(`/admin/teams/${teamId}/status`, { status: newStatus });
      fetchTeams(currentPage, searchQuery);
      toast({
        title: newStatus === 1 ? "Team Activated" : "Team Deactivated",
        description: `${team.name} has been ${
            newStatus === 1 ? "activated" : "deactivated"
        } successfully.`,
      });
    } catch (error) {
      console.log(error, teamId);
      toast({
        title: "Error",
        description: `Failed to update status for ${team.name}.`,
        variant: "destructive",
      });
    }
  };

  const handleSyncTeams = () => {
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!selectedLeague) return;
    setIsLoading(true);
    setDialogOpen(false);
    try {
      await api.post(`/admin/teams/refetch`, { league_id: selectedLeague });
      toast({
        title: "Teams Synced",
        description: "Successfully synchronized teams from external API.",
      });
      fetchTeams(1, searchQuery);
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync teams from API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedLeague("");
    }
  };

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
              Teams Management
            </h1>
            <p className="text-muted-foreground">
              Manage football teams available to users
            </p>
          </div>

          <div className="flex gap-2">
            <Button
                onClick={handleSyncTeams}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RotateCcw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Sync from API
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search teams by name, league, or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Overlay */}
        {isRefetching && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading...</span>
              </div>
            </div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.length > 0 ? (
              teams.map((team) => (
                  <Card
                      key={team.id}
                      className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200"
                  >
                    <CardHeader className="text-center pb-2">
                      <div className="w-16 h-16 mx-auto mb-3 bg-background/50 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                            src={team.logo}
                            alt={team.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                        />
                      </div>
                      <CardTitle className="text-lg text-foreground">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div>{team.league}</div>
                        <div className="text-xs">{team.country}</div>
                        {team.external_id && (
                            <div className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                              ID: {team.external_id}
                            </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                              variant={team.status === 1 ? "default" : "secondary"}
                              className={
                                team.status === 1
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : ""
                              }
                          >
                            {team.status === 1 ? "Active" : "Inactive"}
                          </Badge>
                          <Link
                              to={`/teams/${team.external_id}/players`}
                              className="ml-2 text-primary underline text-xs"
                          >
                            View Players
                          </Link>
                        </div>
                        <Switch
                            checked={team.status === 1}
                            onCheckedChange={() => handleToggleActive(team.id)}
                            className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </CardContent>
                  </Card>
              ))
          ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No teams found</p>
              </div>
          )}
        </div>

        {/* Pagination */}
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
                <div className="text-sm text-muted-foreground">Total Teams</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {teams.filter((t) => t.status === 1).length}
                </div>
                <div className="text-sm text-muted-foreground">Active on Page</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {teams.filter((t) => t.status === 0).length}
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
              <DialogTitle>Select League and Season</DialogTitle>
              <DialogDescription>
                Please select a league and season to sync teams from the external
                API.
              </DialogDescription>
            </DialogHeader>
            <select
                className="w-full px-3 py-2 rounded border border-input bg-background text-foreground mb-4"
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
            >
              <option value="">Select League</option>
              {leagues.map((league, i) => (
                  <option key={i} value={league.external_id}>
                    {league.name}
                  </option>
              ))}
            </select>

            <DialogFooter>
              <Button
                  onClick={handleDialogConfirm}
                  disabled={!selectedLeague || isLoading}
              >
                {isLoading ? "Syncing..." : "Sync Teams"}
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

export default Teams;