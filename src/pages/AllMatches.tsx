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
import { Plus, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Player } from "./Players";
import { Team } from "./Teams";
import { useFetch } from "@/hooks/useFetch";
import { League } from "@/lib/types";
import { Link } from "react-router-dom";

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
  const { data, loading, error, refetch, abort } = useFetch("/admin/match");

  useEffect(() => {
    if (data) {
      setMatches(data?.data?.matches[0] || []);
    }
  }, [data]);

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error loading matches</div>;

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
                            <Badge variant="outline">{match.fixture.league.name}</Badge>
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
    </div>
  );
};

export default AllMatches;
