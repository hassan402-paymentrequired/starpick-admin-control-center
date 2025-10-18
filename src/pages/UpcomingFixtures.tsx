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
import { RotateCcw } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFixtures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/fixtures");
      setFixtures(res.data.data.fixtures);
    } catch (err) {
      setError("Failed to load fixtures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures();
    api.get("/admin/leagues/active-leagues").then((res) => {
      setLeagues(res.data.data?.leagues || res.data);
    });
  }, []);

  const handleRefetch = () => {
    setDialogOpen(true);
  };


  const handleDialogConfirm = async () => {
    setIsLoading(true);
    setDialogOpen(false);
    try {
     await api.post("/admin/fixtures/refetch", {
         league: selectedLeague
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select League, Season and Round</DialogTitle>
            <DialogDescription>
              Please select a league, season and round to fetch fixtures from
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
