import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { RotateCcw, ExternalLink } from "lucide-react";
import api from "@/lib/axios";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

interface Country {
  id: number;
  name: string;
  code?: string;
  alpha2?: string;
}

interface League {
  id: number;
  name: string;
  country_id: number;
  logo?: string;
  external_id: number;
  status: number; // 1 = active, 0 = inactive
}

const ManageLeagues = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null); // for refetch
  const [countryFilter, setCountryFilter] = useState<string>(""); // for filtering
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCountry, setDialogCountry] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      const res = await api.get("/admin/countries");
      setCountries(
        res.data.data?.countries || res.data.data || res.data.countries || []
      );
    } catch (err) {
      setError("Failed to load countries.");
    }
  };

  const fetchLeaguesFromBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/leagues`);
      setLeagues(res.data.data?.leagues || []);
      console.log(res.data)
    } catch (err) {
      setLeagues([]);
      setError("Failed to load leagues from backend.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeagues = async (countryId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        `/admin/leagues/refetch/`,
          {country_id: countryId}
      );
      toast({
        title: "Success",
        description: "Fetched leagues from external API!",
      });
      fetchLeaguesFromBackend()
    } catch (error) {
      setLeagues([]);
      toast({
        title: "Error",
        description: "Failed to fetch leagues from external API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchLeaguesFromBackend();
  }, []);

  const handleRefetch = () => {
    setDialogOpen(true);
  };

  const handleDialogConfirm = async () => {
    if (!dialogCountry) return;
    setLoading(true);
    setDialogOpen(false);
    try {
      await fetchLeagues(dialogCountry);
      setDialogCountry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (leagueId: number) => {
    const league = leagues.find((l) => l.id === leagueId);
    if (!league) return;
    const newStatus = league.status === 1 ? 0 : 1;
    try {
      await api.patch(`/admin/leagues/${leagueId}/status`, {
        status: newStatus,
      });
      toast({
        title: newStatus === 1 ? "League Activated" : "League Deactivated",
        description: `${league.name} has been ${
          newStatus === 1 ? "activated" : "deactivated"
        } successfully.`,
      });
      fetchLeaguesFromBackend();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status for ${league.name}.`,
        variant: "destructive",
      });
    }
  };

  // Filtering logic
  const filteredLeagues = leagues.filter((league) => {
    const matchesCountry = countryFilter
      ? league.country_id === Number(countryFilter)
      : true;
    const matchesStatus =
      statusFilter === "all" ? true : league.status === Number(statusFilter);
    const matchesSearch = league.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCountry && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
        <h1 className="text-3xl font-bold text-foreground">Manage Leagues</h1>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search leagues..."
            className="px-3 py-2 rounded border border-input bg-background text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <select
            className="px-3 py-2 rounded border border-input bg-background text-foreground"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded border border-input bg-background text-foreground"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button
            onClick={handleRefetch}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refetch Leagues"}
          </button>
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Country</DialogTitle>
            <DialogDescription>
              Please select a country to fetch and import leagues for.
            </DialogDescription>
          </DialogHeader>
          <select
            className="w-full px-3 py-2 rounded border border-input bg-background text-foreground mb-4"
            value={dialogCountry ?? ""}
            onChange={(e) => setDialogCountry(e.target.value)}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              onClick={handleDialogConfirm}
              disabled={!dialogCountry || loading}
            >
              {loading ? "Fetching..." : "Fetch & Import"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-muted-foreground mb-6">
        Select a country and click "Refetch Leagues" to fetch and save leagues
        for that country.
      </p>
      {error && <div className="text-red-500 font-medium">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLeagues.map((league) => (
          <Card
            key={league.id}
            className="bg-gradient-to-br from-card via-background to-card/80 border-none shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group relative overflow-hidden"
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
              {league.logo && (
                <img
                  src={league.logo}
                  alt={league.name}
                  className="w-8 h-8 object-contain rounded-full border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <CardTitle className="text-lg text-foreground">
                {league.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
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
                <Switch
                  checked={league.status === 1}
                  onCheckedChange={() => handleToggleStatus(league.id)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <CardDescription>Season: {league.seasons[0].year}</CardDescription>
              <div className="mt-4">
                <Link to={`/leagues/${league.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && filteredLeagues.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12 text-lg">
            No leagues found for this country.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLeagues;
