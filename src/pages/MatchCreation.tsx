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
import NewMatchForm from "@/components/ui/new-match-form";

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
  league: League;
};

type LeagueMatch = {
  [key: string]: Match;
};

export type TeamSelect = {
  name: string ,
  id: number
}
export type LeagueSelect = {
  name: string ,
  id: number
}

const MatchCreation = () => {
  const [matches, setMatches] = useState<LeagueMatch[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamSelect[]>([]);
  const [leagues, setLeagues] = useState<LeagueSelect[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data, loading, error, refetch, abort } = useFetch("/admin/match");
  console.log(data);
  useEffect(() => {
    setLeagues(data?.data?.leagues);
    setTeams(data?.data?.team);
    setMatches(data?.data?.matches);
  }, [data]);
  // const leagues = Array.from(new Set(teams.map((t) => t.league)));
 
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Match Creation</h1>
          <p className="text-muted-foreground">
            Create matches and assign players to teams
          </p>
        </div>

        <NewMatchForm teams={teams} setIsDialogOpen={setIsDialogOpen} isDialogOpen={isDialogOpen} leagues={leagues}/>
      </div>


      {/* Matches List */}
      <div className="space-y-4">
        {matches?.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No matches created yet
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Match
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {matches &&
              Object.entries(matches).map(([match, mainmatch]) => (
                <div className="flex flex-col gap-2 w-full">
                  <h2
                    key={match}
                    className="text-xl font-semibold text-foreground"
                  >
                    Upcoming Matches for {match}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    {mainmatch?.map((game) => (
                      <Card
                        key={game.id}
                        className="bg-card/50 backdrop-blur border-border"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-foreground">
                              {game.player.name} vs {game.team?.name}
                            </CardTitle>
                            <Badge variant="outline">{game.league.name}</Badge>
                          </div>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(game.date).toLocaleDateString()} at{" "}
                                {game.time}
                              </span>
                            </div>
                            
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{game.player.team.name} - {game.player.position}</span>
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

export default MatchCreation;
