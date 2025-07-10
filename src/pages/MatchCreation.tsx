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
import {  Plus, Calendar, MapPin } from "lucide-react";
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
  team: Team,
  league: League
};

const MatchCreation = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [currentMatch, setCurrentMatch] = useState<Match>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data, loading, error, refetch, abort } =
    useFetch<Match[]>("/admin/match");
console.log(data);
  // Mock data
  useEffect(() => {
    // setPlayers(data.data.players);
    // setTeams(data.data.team);
    setMatches(data?.data?.matches);
  }, []);

    // toast({
    //     title: "Missing Information",
    //     description: "Please fill in all required fields.",
    //     variant: "destructive",
    //   });

  const handleCreateMatch = () => {
   
  };

  const handleAddPlayer = (player: Player) => {
    // if (currentMatch.selectedPlayers.find((p) => p.id === player.id)) return;
    // setCurrentMatch((prev) => ({
    //   ...prev,
    //   selectedPlayers: [...prev.selectedPlayers, player],
    // }));
  };

  const handleRemovePlayer = (playerId: string) => {
    // setCurrentMatch((prev) => ({
    //   ...prev,
    //   selectedPlayers: prev.selectedPlayers.filter((p) => p.id !== playerId),
    // }));
  };

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const leagues = Array.from(new Set(teams.map((t) => t.league)));

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

        {/* <NewMatchForm /> */}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Upcoming Matches
        </h2>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches?.map((match) => (
              <Card
                key={match.id}
                className="bg-card/50 backdrop-blur border-border"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">
                      {match.player.name} vs {match.team?.name}
                    </CardTitle>
                    <Badge variant="outline">{match.league.name}</Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(match.date).toLocaleDateString()} at{" "}
                        {match.time}
                      </span>
                    </div>
                    {/* {match.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{match.venue}</span>
                      </div>
                    )} */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Selected Players ({4})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {/* {match.selectedPlayers.map((player) => (
                        <Badge
                          key={player.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {player.name}
                        </Badge>
                      ))} */}
                    </div>
                  </div>

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
        )}
      </div>
    </div>
  );
};

export default MatchCreation;
