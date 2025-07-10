import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Plus } from "lucide-react";
import { Label } from "./label";
import { Input } from "./input";
import { Select } from "./select";
import { Switch } from "./switch";
import { Textarea } from "./textarea";
import { ScrollArea } from "./scroll-area";

const NewMatchForm = () => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    <Label htmlFor="homeTeam">Home Team</Label>
                    <Select
                      value={currentMatch.homeTeam?.id || ""}
                      onValueChange={(value) => {
                        const team = teams.find((t) => t.id === value);
                        setCurrentMatch((prev) => ({
                          ...prev,
                          homeTeam: team || null,
                        }));
                      }}
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">Away Team</Label>
                    <Select
                      value={currentMatch.awayTeam?.id || ""}
                      onValueChange={(value) => {
                        const team = teams.find((t) => t.id === value);
                        setCurrentMatch((prev) => ({
                          ...prev,
                          awayTeam: team || null,
                        }));
                      }}
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={currentMatch.date}
                      onChange={(e) =>
                        setCurrentMatch((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="bg-background/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={currentMatch.time}
                      onChange={(e) =>
                        setCurrentMatch((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                      className="bg-background/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      placeholder="Stadium name"
                      value={currentMatch.venue}
                      onChange={(e) =>
                        setCurrentMatch((prev) => ({
                          ...prev,
                          venue: e.target.value,
                        }))
                      }
                      className="bg-background/50 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="league">League</Label>
                    <Select
                      value={currentMatch.league}
                      onValueChange={(value) =>
                        setCurrentMatch((prev) => ({ ...prev, league: value }))
                      }
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select league" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {leagues.map((league) => (
                          <SelectItem key={league} value={league}>
                            {league}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Player Selection */}
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
                      {filteredPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-background/30 rounded-lg border border-border"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {player.position} • {player.team}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddPlayer(player)}
                            disabled={currentMatch.selectedPlayers.some(
                              (p) => p.id === player.id
                            )}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Players */}
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Selected Players ({currentMatch.selectedPlayers.length})
                    </h4>
                    <div className="space-y-2">
                      {currentMatch.selectedPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/30"
                        >
                          <div>
                            <div className="font-medium text-foreground">
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {player.position} • {player.team}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemovePlayer(player.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
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
  )
}

export default NewMatchForm