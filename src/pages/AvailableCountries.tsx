import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {ChevronLeft, ChevronRight, RotateCcw} from "lucide-react";
import api from "@/lib/axios";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {PaginatedResponse} from "@/pages/Teams.tsx";
import {Button} from "@/components/ui/button.tsx";

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
  const [paginationData, setPaginationData] = useState<PaginatedResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchCountries = async (page = 1, search = "") => {
    setIsRefetching(true)
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/admin/countries?${params.toString()}`);
      const data = response.data.data.countries;

      setPaginationData(data);
      setCountries(data.data);
      setCurrentPage(data.current_page);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams.",
        variant: "destructive",
      });
    } finally {
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchCountries(1);
  }, []);


  const handleRefetch = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.get("/admin/countries/refetch");
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

  const handlePageChange = (page: number) => {
    if (page < 1 || (paginationData && page > paginationData.last_page)) return;
    fetchCountries(page, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPaginationButtons = () => {
    if (!paginationData || paginationData.last_page <= 1) return null;

    const buttons = [];
    const currentPage = paginationData.current_page;
    const lastPage = paginationData.last_page;

    // Always show first page
    if (currentPage > 3) {
      buttons.push(
          <Button
              key={1}
              variant={1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(1)}
              className="min-w-[40px]"
          >
            1
          </Button>
      );

      if (currentPage > 4) {
        buttons.push(
            <span key="ellipsis-start" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }
    }

    // Show pages around current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(lastPage, currentPage + 2); i++) {
      buttons.push(
          <Button
              key={i}
              variant={i === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i)}
              className="min-w-[40px]"
          >
            {i}
          </Button>
      );
    }

    // Always show last page
    if (currentPage < lastPage - 2) {
      if (currentPage < lastPage - 3) {
        buttons.push(
            <span key="ellipsis-end" className="px-2 text-muted-foreground">
            ...
          </span>
        );
      }

      buttons.push(
          <Button
              key={lastPage}
              variant={lastPage === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(lastPage)}
              className="min-w-[40px]"
          >
            {lastPage}
          </Button>
      );
    }

    return buttons;
  };

  if (!paginationData) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading countries...</p>
          </div>
        </div>
    );
  }

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

      {isRefetching && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading...</span>
            </div>
          </div>
      )}

      {paginationData && paginationData.last_page > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginationData.from} to {paginationData.to} of {paginationData.total} teams
            </div>

            <div className="flex items-center gap-2">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.prev_page_url || isRefetching}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="hidden sm:flex items-center gap-1">
                {renderPaginationButtons()}
              </div>

              <div className="sm:hidden text-sm text-muted-foreground px-2">
                Page {currentPage} of {paginationData.last_page}
              </div>

              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.next_page_url || isRefetching}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
      )}
    </div>
  );
};

export default AvailableCountries;
