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
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Season {
  id: number;
  name: string;
  league_id: number;
  year: string;
}

interface League {
  id: number;
  name: string;
  external_id: number;
}

const ManageSeasons = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchSeasons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/seasons");
      setSeasons(res.data.data?.seasons || res.data.seasons || []);
    } catch (err) {
      setError("Failed to load seasons.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      const res = await api.get("/admin/leagues");
      setLeagues(res.data.data?.leagues || res.data.leagues || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load leagues.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSeasons();
    fetchLeagues();
  }, []);

  const handleRefetch = () => {
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!selectedLeague) return;
    setLoading(true);
    setDialogOpen(false);
    try {
      // Example: Replace with actual external API endpoint for seasons by league
      const response = await axios.get(
        `https://www.sofascore.com/api/v1/unique-tournament/${selectedLeague}/seasons`
      );
      
     
      toast({
        title: "Success",
        description: "Fetched seasons from external API!",
      });
      // Send seasons to backend
      try {
        await api.post("/admin/sofa/seasons", {
          league_id: selectedLeague,
          seasons: response.data,
        });
        toast({
          title: "Backend Import Success",
          description: "Seasons sent to the server successfully!",
        });
        fetchSeasons();
      } catch (backendError) {
        console.error(backendError);
        toast({
          title: "Backend Import Error",
          description: "Failed to import seasons to backend",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch seasons from external API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedLeague(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">Manage Seasons</h1>
        <button
          onClick={handleRefetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refetch Seasons"}
        </button>
      </div>
      <p className="text-muted-foreground mb-6">
        These are the seasons currently available in the system.
      </p>
      {error && <div className="text-red-500 font-medium">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {seasons.map((season) => (
          <Card
            key={season.id}
            className="bg-gradient-to-br from-card via-background to-card/80 border-none shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group relative overflow-hidden"
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
              <CardTitle className="text-lg text-foreground">
                {season.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Season Year: {season.year}</CardDescription>
              <CardDescription>League ID: {season.league_id}</CardDescription>
            </CardContent>
          </Card>
        ))}
        {!loading && seasons.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12 text-lg">
            No seasons found.
          </div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a League</DialogTitle>
            <DialogDescription>
              Please select a league to fetch and import seasons for.
            </DialogDescription>
          </DialogHeader>
          <select
            className="w-full px-3 py-2 rounded border border-input bg-background text-foreground mb-4"
            value={selectedLeague ?? ""}
            onChange={(e) => setSelectedLeague(Number(e.target.value))}
          >
            <option value="">Select League</option>
            {leagues.map((league) => (
              <option key={league.external_id} value={league.external_id}>
                {league.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              onClick={handleDialogConfirm}
              disabled={!selectedLeague || loading}
            >
              {loading ? "Fetching..." : "Fetch & Import"}
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

export default ManageSeasons;
