import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Trophy } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

interface League {
  id: number;
  name: string;
  country_id: number;
  logo?: string;
  external_id: number;
  status: number;
}

interface Season {
  id: number;
  name: string;
  external_id: string;
  year: string;
  is_current: number;
}

interface Team {
  id: number;
  name: string;
  logo?: string;
  external_id: string;
  status: number;
}

const LeagueDetail = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [league, setLeague] = useState<League | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (leagueId) {
      fetchLeagueDetails();
    }
  }, [leagueId]);

  const fetchLeagueDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch league details
      const leagueRes = await api.get(`/admin/leagues/${leagueId}`);
      setLeague(leagueRes.data.data || leagueRes.data);

      // Fetch current season
      const seasonRes = await api.get(`/admin/leagues/season/${leagueId}`);
      const seasonData = seasonRes.data.data?.seasons || seasonRes.data.seasons;
      if (Array.isArray(seasonData)) {
        const current =
          seasonData.find((s) => s.is_current === 1) || seasonData[0];
        setCurrentSeason(current);
      } else if (seasonData) {
        setCurrentSeason(seasonData);
      }

      // Fetch teams in the league
      const teamsRes = await api.get(`/admin/leagues/${leagueId}/teams`);
      setTeams(teamsRes.data.data?.teams || teamsRes.data.teams || []);
    } catch (err) {
      setError("Failed to load league details.");
      toast({
        title: "Error",
        description: "Failed to load league details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-8 bg-muted rounded animate-pulse w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/leagues">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            League Not Found
          </h1>
        </div>
        <div className="text-center text-muted-foreground py-12">
          {error || "The requested league could not be found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/leagues">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          {league.logo && (
            <img
              src={league.logo}
              alt={league.name}
              className="w-12 h-12 object-contain rounded-full border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {league.name}
            </h1>
            <p className="text-muted-foreground">League Details</p>
          </div>
        </div>
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Season
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSeason ? currentSeason.name : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSeason ? `Year: ${currentSeason.year}` : "No season data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              {teams.filter((t) => t.status === 1).length} active teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={league.status === 1 ? "default" : "secondary"}
              className={
                league.status === 1
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : ""
              }
            >
              {league.status === 1 ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Teams Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Teams in League
          </h2>
          <Link to={`/teams?league=${leagueId}`}>
            <Button variant="outline">View All Teams</Button>
          </Link>
        </div>

        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="bg-gradient-to-br from-card via-background to-card/80 border-none shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group relative overflow-hidden"
              >
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  {team.logo && (
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-8 h-8 object-contain rounded-full border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <CardTitle className="text-lg text-foreground">
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
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
                  </div>
                  <CardDescription>Team ID: {team.id}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            No teams found for this league.
          </div>
        )}
      </div>

      {/* Current Season Details */}
      {currentSeason && (
        <Card>
          <CardHeader>
            <CardTitle>Current Season Details</CardTitle>
            <CardDescription>
              Information about the current season
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Season Name:
                </span>
                <p className="text-foreground">{currentSeason.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Year:
                </span>
                <p className="text-foreground">{currentSeason.year}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  External ID:
                </span>
                <p className="text-foreground">{currentSeason.external_id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Status:
                </span>
                <Badge
                  variant={
                    currentSeason.is_current === 1 ? "default" : "secondary"
                  }
                >
                  {currentSeason.is_current === 1 ? "Current" : "Not Current"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeagueDetail;
