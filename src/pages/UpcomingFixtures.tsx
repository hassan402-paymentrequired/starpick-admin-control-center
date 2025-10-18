import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {ChevronLeft, ChevronRight, RotateCcw} from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import {Input} from "@/components/ui/input.tsx";
import {PaginatedResponse} from "@/pages/Teams.tsx";

interface Fixture {
  id: number;
  external_id: number;
  league_id: number;
  season: string;
  date: string;
  timestamp: number;
  venue_id: number;
  venue_name: string;
  venue_city: string;
  home_team_id: number;
  home_team_name: string;
  home_team_logo: string;
  away_team_id: number;
  away_team_name: string;
  away_team_logo: string;
  status: string;
  goals_home: number;
  goals_away: number;
  score_halftime_home: number;
  score_halftime_away: number;
  score_fulltime_home: number;
  score_fulltime_away: number;
}

interface League {
  id: number;
  name: string;
  external_id: string;
}

interface Season {
  id: number;
  name: string;
  year: string;
  editor: boolean;
}

interface Round {
  round: number;
}

const UpcomingFixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);
  const { toast } = useToast();

  const fetchFixtures = async (page = 1, search = "") => {
    setIsRefetching(true)
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/admin/fixtures?${params.toString()}`);
      const data = response.data.data.fixtures;

      setPaginationData(data);
      setFixtures(data.data);
      setCurrentPage(data.current_page);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fixtures.",
        variant: "destructive",
      });
    } finally {
      setIsRefetching(false);
    }
  };


  useEffect(() => {
    fetchFixtures();
    api.get("/admin/leagues/active-leagues").then((res) => {
      setLeagues(res.data.data?.leagues || res.data);
    });
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchFixtures(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleRefetch = () => {
    setDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationData && page > paginationData.last_page)) return;
    fetchFixtures(page, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleDialogConfirm = async () => {
    setIsLoading(true);
    setDialogOpen(false);
    try {
     await api.post("/admin/fixtures/refetch", {
         league: selectedLeague,
       from: selectedFrom,
       to: selectedTo,
     })
      await  fetchFixtures();
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync fixtures from API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedLeague("");

    }
  };

  // Helper to format date
  const formatFixtureDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return "Invalid Date";
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
            <p className="mt-4 text-muted-foreground">Loading fixtures...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">
          Upcoming Fixtures
        </h1>
        <Button
          onClick={handleRefetch}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refetch Fixtures"}
        </Button>
      </div>
      <p className="text-muted-foreground mb-6">
        These are the matches scheduled for the upcoming week.
      </p>
      {error && <div className="text-red-500 font-medium">{error}</div>}

      {/* Loading Overlay */}
      {isRefetching && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading...</span>
            </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fixtures.map((fixture) => (
          <Card
            key={fixture.id}
            className="bg-gradient-to-br from-card via-background to-card/80 border-none shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group relative overflow-hidden"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                  {formatFixtureDate(fixture.date)}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {fixture.venue_name}, {fixture.venue_city}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6 mb-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 min-w-[90px]">
                  <div className="w-14 h-14 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-md">
                    <img
                      src={fixture.home_team_logo}
                      alt={fixture.home_team_name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground text-center truncate max-w-[80px]">
                    {fixture.home_team_name}
                  </span>
                </div>
                {/* VS */}
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-primary group-hover:scale-125 transition-transform duration-200">
                    VS
                  </span>
                  <span className="block w-1 h-8 bg-gradient-to-b from-primary/30 to-transparent rounded-full mt-1" />
                </div>
                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 min-w-[90px]">
                  <div className="w-14 h-14 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-md">
                    <img
                      src={fixture.away_team_logo}
                      alt={fixture.away_team_name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground text-center truncate max-w-[80px]">
                    {fixture.away_team_name}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Venue:</span>
                <span className="text-xs font-medium text-foreground">
                  {fixture.venue_name}, {fixture.venue_city}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="text-xs font-medium text-foreground">
                  {fixture.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Score:</span>
                <span className="text-xs font-medium text-foreground">
                  {fixture.goals_home} - {fixture.goals_away}
                </span>
              </div>
              <Button className="mt-6 w-full" disabled>
                More Details (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        ))}
        {!loading && fixtures.length === 0 && !error && (
          <div className="col-span-full text-center text-muted-foreground py-12 text-lg">
            No fixtures found for this week.
          </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select League, Season and Round</DialogTitle>
            <DialogDescription>
              Please select a league and the date to fetch fixtures from
              the external API.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                League
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
              >
                <option value="">Select League</option>
                {leagues.map((league) => (
                  <option key={league.external_id} value={league.external_id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  From
                </label>
                <Input value={selectedFrom} onChange={(e) => setSelectedFrom(e.target.value)} type="date" className="w-full px-3 py-2 rounded border border-input bg-background text-foreground" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  to
                </label>
                <Input value={selectedTo} onChange={(e) => setSelectedTo(e.target.value)} type="date" className="w-full px-3 py-2 rounded border border-input bg-background text-foreground" />
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button
              onClick={handleDialogConfirm}
              disabled={
                !selectedLeague ||
                isLoading
              }
            >
              {isLoading ? "Syncing..." : "Sync Fixtures"}
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

export default UpcomingFixtures;
