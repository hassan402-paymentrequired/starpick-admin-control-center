import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { LeagueSelect, TeamSelect } from "@/pages/MatchCreation";
import { Player } from "@/pages/Players";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useFormRequest } from "@/hooks/useForm";
import { useToast } from "./use-toast";

type matchForm = {
  playingTeam: string;
  againstTeam: string;
  playerIds: string[];
  date: string;
  time: string;
  league: string;
};

const NewMatchForm = ({
  teams,
  leagues,
  setIsDialogOpen,
  isDialogOpen,
}: {
  teams: TeamSelect[];
  leagues: LeagueSelect[];
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDialogOpen: boolean;
}) => {
  const [players, setplayers] = useState<Player[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");
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
  const { post, errors, data, loading, setErrors, get } = useFormRequest();
  const {toast} = useToast();

  const selectedPlayerIds = watch("playerIds") || [];

  const handleAddPlayer = (player: Player) => {
    const selectedPlayers = getValues("playerIds") || [];
    if (selectedPlayers.includes(player.id)) return;
    const newPlayers = [...selectedPlayers, player.id];
    console.log(newPlayers);
    setValue("playerIds", newPlayers);
  };

  const handleRemovePlayer = (playerId: string) => {
    const selectedPlayers = getValues("playerIds") || [];
    const newPlayers = selectedPlayers.filter(
      (id) => id.toString() !== playerId.toString()
    );
    console.log(newPlayers);
    setValue("playerIds", newPlayers);
  };

  const filteredPlayers = players?.filter(
    (player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTeamPlayer = async (teamId: string) => {
    if (!teamId) return;
    const res = await get(`/admin/teams/${teamId}/players`);
    setplayers(res.data.players);
  };

  const handleCreateMatch = async () => {
     setErrors(null);
    const data = getValues();
    try {
      const res = await post(`/admin/match/${data.againstTeam}/${data.league}`, data);
      toast({
        title: "Match created",
        description: "Match has being created successfully",
        variant: "default",
      });
      reset()
      setIsDialogOpen(false);
    } catch (error) {
      setErrors(null);
      setErrors(error.response?.data?.error);
    }
  };
 console.log(errors)
  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        setIsDialogOpen(!isDialogOpen);
        reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Create New Match
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Create New Match
          </DialogTitle>
          <DialogDescription>
            Set up a new match between two teams and assign players
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Details */}
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        getTeamPlayer(value);
                      }}
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">League</Label>
                <Controller
                  name="league"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {leagues.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Player Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Select Players</h3>
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
                  {filteredPlayers?.map((player) => {
                    const isSelected = selectedPlayerIds.includes(
                      player.id.toString()
                    );

                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-background/30 rounded-lg border border-border"
                      >
                        <div>
                          <div className="font-medium text-foreground">
                            {player.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.position} • {player.team.name}
                          </div>
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
                            {player.position} • {player.team.name}
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateMatch}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Match
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMatchForm;
