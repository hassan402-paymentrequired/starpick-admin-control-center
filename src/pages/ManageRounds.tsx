import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RotateCcw, Calendar, Target } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

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

interface RoundsResponse {
  currentRound: {
    round: number;
  };
  rounds: Round[];
}

const ManageRounds = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedRounds, setFetchedRounds] = useState<RoundsResponse | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    // Fetch leagues for dialog
    api.get("/admin/leagues").then((res) => {
      setLeagues(res.data.data?.leagues || res.data);
    });
  }, []);

  const handleLeagueChange = async (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedSeason("");
    if (leagueId) {
      try {
        // Fetch seasons from external API
        const response = await api.get(
          `https://www.sofascore.com/api/v1/unique-tournament/${leagueId}/seasons`
        );
        const seasonsData = response.data.seasons || [];
        setSeasons(seasonsData);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch seasons for this league.",
          variant: "destructive",
        });
        setSeasons([]);
      }
    } else {
      setSeasons([]);
    }
  };

  const handleFetchRounds = () => {
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!selectedLeague || !selectedSeason) return;
    setIsLoading(true);
    setDialogOpen(false);
    try {
      // Fetch rounds from external API
      const response = await api.get(
        `https://www.sofascore.com/api/v1/unique-tournament/${selectedLeague}/season/${selectedSeason}/rounds`
      );
      const roundsData = response.data;
      console.log(roundsData);
    //   return;
      setFetchedRounds(roundsData);

      // Send rounds to backend
      await api.post("/admin/sofa/rounds", {
        league_id: selectedLeague,
        season_id: selectedSeason,
        rounds: roundsData,
        current: roundsData.currentRound.round,
      });

      toast({
        title: "Rounds Synced",
        description: "Successfully synchronized rounds from external API.",
      });
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync rounds from API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedLeague("");
      setSelectedSeason("");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Rounds</h1>
          <p className="text-muted-foreground">
            Fetch and manage league season rounds from external API
          </p>
        </div>

        <Button
          onClick={handleFetchRounds}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <RotateCcw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Fetch Rounds
        </Button>
      </div>

      {/* Rounds Display */}
      {fetchedRounds && (
        <div className="space-y-6">
          {/* Current Round */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Current Round
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className="text-lg px-4 py-2 bg-primary text-primary-foreground">
                  Round {fetchedRounds.currentRound.round}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* All Rounds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                All Rounds ({fetchedRounds.rounds.length})
              </CardTitle>
              <CardDescription>
                Complete list of rounds for this league season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {fetchedRounds.rounds.map((round) => (
                  <div
                    key={round.round}
                    className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                      round.round === fetchedRounds.currentRound.round
                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                        : "bg-card hover:bg-card/80 border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      Round {round.round}
                    </div>
                    {round.round === fetchedRounds.currentRound.round && (
                      <div className="text-xs mt-1 opacity-90">Current</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {fetchedRounds.rounds.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Rounds
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {fetchedRounds.currentRound.round}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Round
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {fetchedRounds.rounds.length -
                      fetchedRounds.currentRound.round}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining Rounds
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!fetchedRounds && !isLoading && (
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Rounds Fetched
            </h3>
            <p className="text-muted-foreground mb-4">
              Click "Fetch Rounds" to get rounds data from the external API.
            </p>
            <Button onClick={handleFetchRounds}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Fetch Rounds
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select League and Season</DialogTitle>
            <DialogDescription>
              Please select a league and season to fetch rounds from the
              external API.
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
                onChange={(e) => handleLeagueChange(e.target.value)}
              >
                <option value="">Select League</option>
                {leagues.map((league) => (
                  <option key={league.external_id} value={league.external_id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Season
              </label>
              <select
                className="w-full px-3 py-2 rounded border border-input bg-background text-foreground"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                disabled={!selectedLeague}
              >
                <option value="">Select Season</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleDialogConfirm}
              disabled={!selectedLeague || !selectedSeason || isLoading}
            >
              {isLoading ? "Fetching..." : "Fetch Rounds"}
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

export default ManageRounds;
