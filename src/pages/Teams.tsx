import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Download, Filter, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFetch } from "@/hooks/useFetch";

export interface Team {
  id: string;
  name: string;
  logo: string;
  external_id?: string;
  isActive?: boolean;
  league: string;
  country: string;
  code: string;
  created_at: string;
  updated_at: string;
  players_count: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[] | null>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[] | null>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { toast } = useToast();
  const { data, loading, error, refetch, abort } =
    useFetch<Team[]>("/admin/teams");

  useEffect(() => {
    if (data) {
      setTeams(data);
      setFilteredTeams(data);
    }
  }, [data]);
console.log(data)



  // Filter teams based on search query
  useEffect(() => {
    const filtered = teams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeams(filtered);
    setCurrentPage(1);
  }, [searchQuery, teams]);
  const handleToggleActive = (teamId: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, isActive: !team.isActive } : team
      )
    );

    const team = teams.find((t) => t.id === teamId);
    toast({
      title: team?.isActive ? "Team Deactivated" : "Team Activated",
      description: `${team?.name} has been ${
        team?.isActive ? "deactivated" : "activated"
      } successfully.`,
    });
  };

  const handleSyncTeams = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Teams Synced",
        description: "Successfully synchronized teams from external API.",
      });
    }, 2000);
  };

if(!data) return <div>loading</div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Teams Management
          </h1>
          <p className="text-muted-foreground">
            Manage football teams available to users
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSyncTeams}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RotateCcw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Sync from API
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teams by name, league, or country..."
                value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teams Gri wsd */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeams && filteredTeams?.map((team) => (
          <Card
            key={team.id}
            className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200"
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-3 bg-background/50 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardTitle className="text-lg text-foreground">
                {team.name}
              </CardTitle>
              <CardDescription className="space-y-1">
                <div>{team.league}</div>
                <div className="text-xs">{team.country}</div>
                {team.external_id && (
                  <div className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                    ID: {team.external_id}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={team.isActive ? "default" : "secondary"}
                    className={
                      team.isActive
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : ""
                    }
                  >
                    {team.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <Switch
                  checked={team.isActive}
                  onCheckedChange={() => handleToggleActive(team.id)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {/* {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )} */}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {teams.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Teams</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {teams.filter((t) => t.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Teams</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {teams.filter((t) => !t.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Inactive Teams
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Teams;
