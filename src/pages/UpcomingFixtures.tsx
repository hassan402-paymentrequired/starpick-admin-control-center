import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import api from "@/lib/axios";

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

const UpcomingFixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFixtures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/fixtures/");
      setFixtures(res.data.data.fixtures);
    } catch (err) {
      setError("Failed to load fixtures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures();
  }, []);

  const handleRefetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/admin/fixtures/refetch");
      await fetchFixtures();
    } catch (err) {
      setError("Failed to refetch fixtures.");
      setLoading(false);
    }
  };

  // Helper to format date
  const formatFixtureDate = (dateStr: string) => {
    const date = new Date(dateStr.replace(/-/g, "/")); // Safari compatibility
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">
          Upcoming Fixtures
        </h1>
        <button
          onClick={handleRefetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refetch Fixtures"}
        </button>
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
              <button
                className="mt-6 w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled
              >
                More Details (Coming Soon)
              </button>
            </CardContent>
          </Card>
        ))}
        {!loading && fixtures.length === 0 && !error && (
          <div className="col-span-full text-center text-muted-foreground py-12 text-lg">
            No fixtures found for this week.
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingFixtures;
