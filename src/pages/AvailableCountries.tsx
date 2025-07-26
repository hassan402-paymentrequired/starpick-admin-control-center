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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Country {
  id: number;
  name: string;
  code?: string;
  flag?: string;
  status: number; // 1 = active, 0 = inactive
  alpha2?: string;
}

const AvailableCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/countries");

      setCountries(
        res.data.data?.countries || res.data.data || res.data.countries || []
      );
    } catch (err) {
      setError("Failed to load countries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchSofaScoreCategories = async () => {
    try {
      const response = await axios.get(
        "https://www.sofascore.com/api/v1/sport/football/categories",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
            Accept: "application/json",
            Referer: "https://www.sofascore.com/",
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );
      const categories = response.data.categories;

      toast({ title: "Success", description: "Fetched Sofascore categories!" });
      // Send categories to backend
      try {
        await api.post("/admin/sofa/countries", {
          countries: categories,
        });

        toast({
          title: "Backend Import Success",
          description: "Categories sent to the server successfully!",
        });
      } catch (backendError) {
        console.error(backendError);
        toast({
          title: "Backend Import Error",
          description: "Failed to import categories to backend",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch Sofascore data",
        variant: "destructive",
      });
    }
  };

  const handleRefetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchSofaScoreCategories();
      // await api.post("/admin/countries/refetch");
      await fetchCountries();
    } catch (err) {
      setError("Failed to refetch countries.");
      setLoading(false);
    }
  };

  const handleToggleStatus = async (countryId: number) => {
    const country = countries.find((c) => c.id === countryId);
    if (!country) return;
    const newStatus = country.status === 1 ? 0 : 1;
    try {
      await api.patch(`/admin/countries/${countryId}/status`, {
        status: newStatus,
      });
      toast({
        title: newStatus === 1 ? "Country Activated" : "Country Deactivated",
        description: `${country.name} has been ${
          newStatus === 1 ? "activated" : "deactivated"
        } successfully.`,
      });
      fetchCountries();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status for ${country.name}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">
          Available Countries
        </h1>
        <button
          onClick={handleRefetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refetch Countries"}
        </button>
      </div>
      <p className="text-muted-foreground mb-6">
        These are the countries currently available in the system.
      </p>
      {error && <div className="text-red-500 font-medium">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {countries.map((country) => (
          <Card
            key={country.id}
            className="bg-gradient-to-br from-card via-background to-card/80 border-none shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-200 group relative overflow-hidden"
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
              {country.flag && (
                <img
                  src={`https://img.sofascore.com/api/v1/country/${country.alpha2}/flag`}
                  alt={country.name}
                  className="w-8 h-8 object-contain rounded-full border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <CardTitle className="text-lg text-foreground">
                {country.name}
              </CardTitle>
              {country.code && (
                <span className="ml-2 text-xs bg-muted/50 px-2 py-1 rounded font-mono">
                  {country.code}
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={country.status === 1 ? "default" : "secondary"}
                    className={
                      country.status === 1
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : ""
                    }
                  >
                    {country.status === 1 ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Switch
                  checked={country.status === 1}
                  onCheckedChange={() => handleToggleStatus(country.id)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <CardDescription>Country ID: {country.id}</CardDescription>
            </CardContent>
          </Card>
        ))}
        {!loading && countries.length === 0 && !error && (
          <div className="col-span-full text-center text-muted-foreground py-12 text-lg">
            No countries found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableCountries;
