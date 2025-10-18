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
  player_match_id: string;
  date: string;
  time: string;
  is_completed: number;
  player_id: number;
  opponent_team_id: number;
  fixture_id: number;
  created_at: string;
  updated_at: string;
  player: Player;
  team: Team;
  fixture: {
    id: number;
    external_id: number;
    league_id: number;
    season: string;
    date: string;
    league?: League;
  };
  [key: string]: unknown;
};

type LeagueMatches = {
  [leagueName: string]: Match[];
};

type PaginationInfo = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  prev_page_url: string | null;
  next_page_url: string | null;
};

const AllMatches = () => {
  const [matches, setMatches] = useState<LeagueMatches>({});
  const [paginationData, setPaginationData] = useState<PaginationInfo | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchMatch = async (page = 1, search = "") => {
    setIsRefetching(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (search) {
        params.append("search", search);
      }

      const response = await api.get(`/admin/match?${params.toString()}`);
      const responseData = response?.data?.data;

      console.log("Full Response:", responseData);

      // Extract matches grouped by league name
      const matchesByLeague = responseData?.data || {};

      // Extract pagination info
      const pagination = responseData?.pagination || {};
      const paginationInfo: PaginationInfo = {
        current_page: pagination.current_page || page,
        last_page: pagination.last_page || 1,
        per_page: pagination.per_page || 5,
        total: pagination.total || 0,
        from: (page - 1) * (pagination.per_page || 5) + 1,
        to: Math.min(page * (pagination.per_page || 5), pagination.total || 0),
        prev_page_url: page > 1 ? `page=${page - 1}` : null,
        next_page_url: page < (pagination.last_page || 1) ? `page=${page + 1}` : null,
      };

      setMatches(matchesByLeague);
      setPaginationData(paginationInfo);
      setCurrentPage(paginationInfo.current_page);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch matches.",
        variant: "destructive",
      });
    } finally {
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchMatch(1);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    if (!paginationData || paginationData.last_page <= 1) return null;

    const buttons = [];
    const currentPageNum = paginationData.current_page;
    const lastPage = paginationData.last_page;

    // Always show first page
    if (currentPageNum > 3) {
      buttons.push(
          <Button
              key={1}
              variant={1 === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
              className="min-w-[40px]"
          >
            1
          </Button>
      );

      if (currentPageNum > 4) {
        buttons.push(
            <span key="ellipsis-start" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }
    }

    // Show pages around current page
    for (
        let i = Math.max(1, currentPageNum - 2);
        i <= Math.min(lastPage, currentPageNum + 2);
        i++
    ) {
      buttons.push(
          <Button
              key={i}
              variant={i === currentPageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i)}
              className="min-w-[40px]"
          >
            {i}
          </Button>
      );
    }

    // Always show last page
    if (currentPageNum < lastPage - 2) {
      if (currentPageNum < lastPage - 3) {
        buttons.push(
            <span key="ellipsis-end" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }

      buttons.push(
          <Button
              key={lastPage}
              variant={lastPage === currentPageNum ? "default" : "outline"}
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

  const allMatchesCount = Object.values(matches).reduce(
      (sum, leagueMatches) => sum + leagueMatches.length,
      0
  );

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
          {allMatchesCount === 0 ? (
              <Card className="bg-card/50 backdrop-blur border-border">
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No matches created yet</p>
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
                {Object.entries(matches).map(([leagueName, leagueMatches]) => (
                    <div key={leagueName} className="flex flex-col gap-2 w-full">
                      <h2 className="text-xl font-semibold text-foreground">
                        {leagueName}
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
                                    {match.player?.name} vs {match.team?.name}
                                  </CardTitle>
                                  <Badge variant="outline">
                                    {match.fixture?.league?.name || "N/A"}
                                  </Badge>
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
                              {match.player?.team?.name || "N/A"} -{" "}
                                      {match.player?.position || "N/A"}
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
                Showing {paginationData.from} to {paginationData.to} of{" "}
                {paginationData.total} matches
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