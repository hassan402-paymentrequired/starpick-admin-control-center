import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "./button";
import { Plus, Save, Search, SquareChartGanttIcon, Trash2 } from "lucide-react";
import { Label } from "./label";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  LeagueSelect,
  ExternalSeason,
  ExternalRound,
  ExternalFixture,
} from "@/pages/MatchCreation";
import { Player } from "@/pages/Players";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useFormRequest } from "@/hooks/useForm";
import { useToast } from "./use-toast";
import { Badge } from "./badge";

type matchForm = {
  playingTeam: string;
  againstTeam: string;
  playerIds: string[];
};

const NewMatchForm = ({
  fixtures,
  selectedLeague,
  selectedSeason,
  selectedRound,
  loading,
}: {
  leagues: LeagueSelect[];
  fixtures: ExternalFixture[];
  selectedLeague: string;
  selectedSeason: string;
  selectedRound: string;
  loading: boolean;
}) => {
  const [players, setplayers] = useState<Player[] | null>(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<Player[] | null>(null);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<Player[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFixture, setSelectedFixture] =
    useState<ExternalFixture | null>(null);
  const [noPlayersFound, setNoPlayersFound] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors: formError },
    control,
    getValues,
    setValue,
    reset,
    watch,
  } = useForm<matchForm>();
  const {
    post,
    errors,
    data,
    loading: formLoading,
    setErrors,
    get,
  } = useFormRequest();
  const { toast } = useToast();

  const selectedPlayerIds = watch("playerIds") || [];

  const handleAddPlayer = (player: Player) => {
    const selectedPlayers = getValues("playerIds") || [];
    if (selectedPlayers.includes(player.id)) return;
    const newPlayers = [...selectedPlayers, player.id];

    setValue("playerIds", newPlayers);
  };

  const handleRemovePlayer = (playerId: string) => {
    const selectedPlayers = getValues("playerIds") || [];
    const newPlayers = selectedPlayers.filter(
      (id) => id.toString() !== playerId.toString()
    );
    setValue("playerIds", newPlayers);
  };

    const filteredPlayers = players?.filter((player) => {
        // Filter by search query only - show all players from both teams
        return (
            player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.position.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

  const getBothTeamsPlayers = async (
    homeTeamId: string,
    awayTeamId: string
  ) => {
    if (!homeTeamId || !awayTeamId) return;

    // Fetch home team players
    const homeRes = await get(`/admin/teams/${homeTeamId}/playing-players`);
    console.log(homeRes)
    const homePlayersData =
      homeRes.data.data?.players?.data ||
      homeRes.data.data?.players ||
      homeRes.data.players ||
      [];
    setHomeTeamPlayers(homePlayersData);

    // Fetch away team players
    const awayRes = await get(`/admin/teams/${awayTeamId}/playing-players`);
    const awayPlayersData =
      awayRes.data.data?.players?.data ||
      awayRes.data.data?.players ||
      awayRes.data.players ||
      [];
    setAwayTeamPlayers(awayPlayersData);

    // console.log(homeRes, awayRes);

    // Combine both teams' players
    const allPlayers = [...homePlayersData, ...awayPlayersData];
    setplayers(allPlayers);

    // Check if either team has no players
    const homeTeamName = selectedFixture?.home_team_name || "Home Team";
    const awayTeamName = selectedFixture?.away_team_name || "Away Team";

    if (homePlayersData.length === 0 && awayPlayersData.length === 0) {
      toast({
        title: "No players found",
        description: `Neither ${homeTeamName} nor ${awayTeamName} have players registered in our system. Please register both teams and their players first before creating a match.`,
        variant: "destructive",
      });
    } else if (homePlayersData.length === 0) {
      toast({
        title: "Missing team players",
        description: `${homeTeamName} has no players registered in our system. Please register ${homeTeamName} and their players first before creating a match.`,
        variant: "destructive",
      });
    } else if (awayPlayersData.length === 0) {
      toast({
        title: "Missing team players",
        description: `${awayTeamName} has no players registered in our system. Please register ${awayTeamName} and their players first before creating a match.`,
        variant: "destructive",
      });
    }
  };

  const handleFixtureSelect = (fixtureId: string) => {
    const fixture = fixtures.find((f) => f.id.toString() === fixtureId);
    if (fixture) {
      setSelectedFixture(fixture);
      setValue("playingTeam", fixture.home_team_id.toString());
      setValue("againstTeam", fixture.away_team_id.toString());
      getBothTeamsPlayers(
        fixture.home_team_id.toString(),
        fixture.away_team_id.toString()
      );
    }
  };

  const handleCreateMatch = async () => {
    setErrors(null);
    const data = getValues();
    const selectedPlayers = getValues("playerIds") || [];

    // Create payload array: [{playerId: 23, againstTeam: 2, fixtureId: 1}, ...]
    const payload = selectedPlayers.map((playerId) => {
      // Check if player is from home team or away team
      const isHomeTeamPlayer = homeTeamPlayers?.some(
        (hp) => hp.id.toString() === playerId.toString()
      );

      // If player is from home team, they play against away team
      // If player is from away team, they play against home team
      const againstTeam = isHomeTeamPlayer
        ? selectedFixture?.away_team_id
        : selectedFixture?.home_team_id;

      return {
        playerId: parseInt(playerId),
        againstTeam: againstTeam,
        fixtureId: selectedFixture?.id,
      };
    });

    const real_payload = {
      matches: payload,
      fixture_id: selectedFixture?.external_id,
      fixture: selectedFixture
    };


    try {
      const res = await post(`/admin/match/create-from-fixture`, real_payload);
      console.log(res);
      toast({
        title: "Match created",
        description: "Match has being created successfully",
        variant: "default",
      });
      reset();
    } catch (error) {
      setErrors(null);
      console.log(error?.response)

      // Handle specific error response structure
      if (error.response?.data) {
        const errorData = error.response.data?.data;

        if (errorData.conflicting_players && errorData.message) {
          // Get conflicting player names
          const conflictingPlayerNames = errorData.conflicting_players
            .map((playerId: number) => {
              const player = players?.find((p) => p.id === playerId);
              return player?.name || `Player ID: ${playerId}`;
            })
            .join(", ");

          setErrors({
            message: `${errorData?.message} on ${errorData?.match_date}`,
          });

          toast({
            title: "Error creating match",
            description: `${errorData.message} on ${errorData.match_date}. Conflicting players: ${conflictingPlayerNames}`,
            variant: "destructive",
          });
        } else {
          setErrors(error.response);
          toast({
            title: "Error creating match",
            description:
              errorData.message || "An error occurred while creating the match",
            variant: "destructive",
          });
        }
      } else {
        setErrors(error.response?.data?.data);
        toast({
          title: "Error creating match",
          description: "An error occurred while creating the match",
          variant: "destructive",
        });
      }
    }
  };

  const formatFixtureDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
console.log(fixtures)
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Create New Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                <span>Loading fixtures...</span>
              </div>
            )}

            {/* Fixture Selection */}
            {/*{fixtures?.length > 0 && (*/}
              <div className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="fixture">Available Fixtures</Label>
                  <Select onValueChange={handleFixtureSelect}>
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue placeholder="Select a fixture" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {fixtures?.map((fixture) => (
                        <SelectItem
                          key={fixture.id}
                          value={fixture.id.toString()}
                        >
                          {fixture.home_team_name} vs {fixture.away_team_name} (
                          {formatFixtureDate(fixture.date)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            {/*// )}*/}

            {/* Match Details */}
            {selectedFixture && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Match Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeTeam">Playing</Label>
                    <Controller
                      name="playingTeam"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={true}
                        >
                          <SelectTrigger className="bg-background/50 border-border">
                            <SelectValue placeholder="Select home team" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {selectedFixture && (
                              <SelectItem
                                key={selectedFixture.home_team_id}
                                value={selectedFixture.home_team_id.toString()}
                              >
                                {selectedFixture.home_team_name}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">Against</Label>
                    <Controller
                      name="againstTeam"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={true}
                        >
                          <SelectTrigger className="bg-background/50 border-border">
                            <SelectValue placeholder="Select away team" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {selectedFixture && (
                              <SelectItem
                                key={selectedFixture.away_team_id}
                                value={selectedFixture.away_team_id.toString()}
                              >
                                {selectedFixture.away_team_name}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors && (
              <div className="space-y-4">
                <h3 className="font-semibold text-destructive">Error</h3>
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  {typeof errors === "object" && errors.message && (
                    <div className="text-destructive font-medium mb-2">
                      {errors.message}
                    </div>
                  )}
                  {typeof errors === "object" && errors?.conflicting_players && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Conflicting Players:</strong>{" "}
                      {errors?.conflicting_players}
                    </div>
                  )}
                  {typeof errors === "string" && (
                    <div className="text-destructive">{errors}</div>
                  )}
                </div>
              </div>
            )}

            {/* Player Selection */}
            {selectedFixture && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  Select Players
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-border"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {/* Available Players */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Available Players
                    </h4>
                    <div className="space-y-2">
                      {filteredPlayers &&
                        filteredPlayers.length === 0 &&
                        players &&
                        players.length === 0 && (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="text-yellow-800 font-medium mb-1">
                              No players found
                            </div>
                            <div className="text-sm text-yellow-700">
                              {homeTeamPlayers &&
                              homeTeamPlayers.length === 0 &&
                              awayTeamPlayers &&
                              awayTeamPlayers.length === 0
                                ? `Neither ${
                                    selectedFixture?.home_team_name ||
                                    "Home Team"
                                  } nor ${
                                    selectedFixture?.away_team_name ||
                                    "Away Team"
                                  } have players registered in our system. Please register both teams and their players first before creating a match.`
                                : homeTeamPlayers &&
                                  homeTeamPlayers.length === 0
                                ? `${
                                    selectedFixture?.home_team_name ||
                                    "Home Team"
                                  } has no players registered in our system. Please register this team and their players first before creating a match.`
                                : awayTeamPlayers &&
                                  awayTeamPlayers.length === 0
                                ? `${
                                    selectedFixture?.away_team_name ||
                                    "Away Team"
                                  } has no players registered in our system. Please register this team and their players first before creating a match.`
                                : "The selected teams have no players registered in our system. Please register the teams and their players first before creating a match."}
                            </div>
                          </div>
                        )}
                      {filteredPlayers?.map((player) => {
                        const isSelected = selectedPlayerIds.includes(
                          player.id.toString()
                        );
                        // Determine which team the player belongs to
                        const isHomeTeamPlayer = homeTeamPlayers?.some(
                          (hp) => hp.id === player.id
                        );
                        const teamName = isHomeTeamPlayer
                          ? selectedFixture?.home_team_name
                          : selectedFixture?.away_team_name;
                        const teamBadgeColor = isHomeTeamPlayer
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800";

                        return (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 bg-background/30 rounded-lg border border-border"
                          >
                            <div>
                              <div className="font-medium text-foreground">
                                {player.name} {player.player_rating}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {player.position}
                                {player.team?.name
                                  ? ` • ${player.team.name}`
                                  : ""}
                              </div>
                              <Badge className={`text-xs ${teamBadgeColor}`}>
                                {teamName}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddPlayer(player)}
                              disabled={isSelected} // ✅ disable button if already selected
                              className={`${
                                isSelected
                                  ? "opacity-50 cursor-not-allowed"
                                  : "bg-primary hover:bg-primary/90"
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Players */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Selected Players ({getValues("playerIds")?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {getValues("playerIds")?.map((playerId) => {
                        const player = players?.find(
                          (p) => p.id.toString() === playerId.toString()
                        );
                        if (!player) return null;

                        return (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/30"
                          >
                            <div>
                              <div className="font-medium text-foreground">
                                {player.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {player.position}
                                {player.team?.name
                                  ? ` • ${player.team.name}`
                                  : ""}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRemovePlayer(player.id.toString())
                              }
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCreateMatch}
                // disabled={formLoading || !selectedFixture}
                className="bg-primary hover:bg-primary/90"
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Match...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Match
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMatchForm;
