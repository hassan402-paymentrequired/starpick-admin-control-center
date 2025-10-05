import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {Plus, Calendar, MapPin, ChevronLeft, ChevronRight} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Player } from "./Players";
import {PaginatedResponse, Team} from "./Teams";
import { useFetch } from "@/hooks/useFetch";
import { League } from "@/lib/types";
import { Link } from "react-router-dom";
import api from "@/lib/axios.ts";

type Match = {
  id: number;
  uuid: string;
  date: string;
  time: string;
  is_completed: number;
  player_id: number;
  team_id: number;
  league_id: number;
  created_at: string;
  updated_at: string;
  player: Player;
  team: Team;
  [key]: unknown;
};

type LeagueMatch = {
  [key: string]: Match;
};

const AllMatches = () => {
  const [matches, setMatches] = useState<LeagueMatch[]>([]);
  const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchMatch = async (page = 1, search = "") => {
    setIsRefetching(true)
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/admin/match?${params.toString()}`);
      const data = response?.data?.data;
      console.log(response)

      setPaginationData(data);
      setMatches(data.matches[0]);
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
   fetchMatch(1)
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchMatch(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationData && page > paginationData.last_page)) return;
    fetchMatch(page, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <p className="mt-4 text-muted-foreground">Loading matches...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Matches</h1>
          <p className="text-muted-foreground">
            View and manage all created matches
          </p>
        </div>

        <Link to="/match-create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create New Match
          </Button>
        </Link>
      </div>

      {/* Loading Overlay */}
      {isRefetching && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading...</span>
            </div>
          </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {!matches || Object.keys(matches).length === 0 ? (
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No matches created yet
              </p>
              <Link to="/match-create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Match
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {matches &&
              Object.entries(matches).map(([leagueName, leagueMatches]) => (
                <div key={leagueName} className="flex flex-col gap-2 w-full">
                  <h2 className="text-xl font-semibold text-foreground">
                    Matches for {leagueName}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {leagueMatches?.map((match) => (
                      <Card
                        key={match.id}
                        className="bg-card/50 backdrop-blur border-border"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-foreground">
                              {match.player.name} vs {match.team?.name}
                            </CardTitle>
                            <Badge variant="outline">{match?.fixture?.league?.name}</Badge>
                          </div>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(match.date).toLocaleDateString()} at{" "}
                                {match.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {match.player.team.name} -{" "}
                                {match.player.position}
                              </span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Edit Match
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </>
        )}
      </div>

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
    </div>
  );
};

export default AllMatches;
