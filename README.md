


  // toast({
  //     title: "Missing Information",
  //     description: "Please fill in all required fields.",
  //     variant: "destructive",
  //   });



import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Trash2, Save, Calendar, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Player {
  id: string
  name: string
  position: string
  team: string
  rating: number
}

interface Team {
  id: string
  name: string
  logo: string
  league: string
}

interface Match {
  id: string
  homeTeam: Team | null
  awayTeam: Team | null
  date: string
  time: string
  venue: string
  league: string
  selectedPlayers: Player[]
}

const MatchCreation = () => {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLeague, setSelectedLeague] = useState("all")
  const [currentMatch, setCurrentMatch] = useState<Match>({
    id: "",
    homeTeam: null,
    awayTeam: null,
    date: "",
    time: "",
    venue: "",
    league: "",
    selectedPlayers: []
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Mock data
  useEffect(() => {
    const mockPlayers: Player[] = [
      { id: "1", name: "Erling Haaland", position: "Forward", team: "Manchester City", rating: 5 },
      { id: "2", name: "Kevin De Bruyne", position: "Midfielder", team: "Manchester City", rating: 5 },
      { id: "3", name: "Mohamed Salah", position: "Forward", team: "Liverpool FC", rating: 5 },
      { id: "4", name: "Virgil van Dijk", position: "Defender", team: "Liverpool FC", rating: 4 },
      { id: "5", name: "Bruno Fernandes", position: "Midfielder", team: "Manchester United", rating: 4 },
      { id: "6", name: "Marcus Rashford", position: "Forward", team: "Manchester United", rating: 4 },
    ]

    const mockTeams: Team[] = [
      { id: "1", name: "Manchester City", logo: "/placeholder.svg", league: "Premier League" },
      { id: "2", name: "Liverpool FC", logo: "/placeholder.svg", league: "Premier League" },
      { id: "3", name: "Manchester United", logo: "/placeholder.svg", league: "Premier League" },
      { id: "4", name: "Arsenal FC", logo: "/placeholder.svg", league: "Premier League" },
      { id: "5", name: "Real Madrid", logo: "/placeholder.svg", league: "La Liga" },
      { id: "6", name: "FC Barcelona", logo: "/placeholder.svg", league: "La Liga" },
    ]

    const mockMatches: Match[] = [
      {
        id: "1",
        homeTeam: mockTeams[0],
        awayTeam: mockTeams[1],
        date: "2024-01-20",
        time: "15:00",
        venue: "Etihad Stadium",
        league: "Premier League",
        selectedPlayers: [mockPlayers[0], mockPlayers[1], mockPlayers[2], mockPlayers[3]]
      }
    ]

    setPlayers(mockPlayers)
    setTeams(mockTeams)
    setMatches(mockMatches)
  }, [])

  const handleCreateMatch = () => {
    if (!currentMatch.homeTeam || !currentMatch.awayTeam || !currentMatch.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    const newMatch: Match = {
      ...currentMatch,
      id: Date.now().toString(),
    }

    setMatches(prev => [...prev, newMatch])
    setCurrentMatch({
      id: "",
      homeTeam: null,
      awayTeam: null,
      date: "",
      time: "",
      venue: "",
      league: "",
      selectedPlayers: []
    })
    setIsDialogOpen(false)

    toast({
      title: "Match Created",
      description: `${newMatch.homeTeam?.name} vs ${newMatch.awayTeam?.name} has been created successfully.`,
    })
  }

  const handleAddPlayer = (player: Player) => {
    if (currentMatch.selectedPlayers.find(p => p.id === player.id)) return

    setCurrentMatch(prev => ({
      ...prev,
      selectedPlayers: [...prev.selectedPlayers, player]
    }))
  }

  const handleRemovePlayer = (playerId: string) => {
    setCurrentMatch(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.filter(p => p.id !== playerId)
    }))
  }

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const leagues = Array.from(new Set(teams.map(t => t.league)))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Match Creation</h1>
          <p className="text-muted-foreground">Create matches and assign players to teams</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create New Match
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Match</DialogTitle>
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
                        const team = teams.find(t => t.id === value)
                        setCurrentMatch(prev => ({ ...prev, homeTeam: team || null }))
                      }}
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="awayTeam">Away Team</Label>
                    <Select 
                      value={currentMatch.awayTeam?.id || ""} 
                      onValueChange={(value) => {
                        const team = teams.find(t => t.id === value)
                        setCurrentMatch(prev => ({ ...prev, awayTeam: team || null }))
                      }}
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
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
                      onChange={(e) => setCurrentMatch(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={currentMatch.time}
                      onChange={(e) => setCurrentMatch(prev => ({ ...prev, time: e.target.value }))}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      placeholder="Stadium name"
                      value={currentMatch.venue}
                      onChange={(e) => setCurrentMatch(prev => ({ ...prev, venue: e.target.value }))}
                      className="bg-background/50 border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="league">League</Label>
                    <Select 
                      value={currentMatch.league} 
                      onValueChange={(value) => setCurrentMatch(prev => ({ ...prev, league: value }))}
                    >
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select league" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {leagues.map(league => (
                          <SelectItem key={league} value={league}>{league}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <h4 className="font-medium text-foreground mb-2">Available Players</h4>
                    <div className="space-y-2">
                      {filteredPlayers.map(player => (
                        <div 
                          key={player.id} 
                          className="flex items-center justify-between p-2 bg-background/30 rounded-lg border border-border"
                        >
                          <div>
                            <div className="font-medium text-foreground">{player.name}</div>
                            <div className="text-sm text-muted-foreground">{player.position} • {player.team}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddPlayer(player)}
                            disabled={currentMatch.selectedPlayers.some(p => p.id === player.id)}
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
                    <h4 className="font-medium text-foreground mb-2">Selected Players ({currentMatch.selectedPlayers.length})</h4>
                    <div className="space-y-2">
                      {currentMatch.selectedPlayers.map(player => (
                        <div 
                          key={player.id} 
                          className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/30"
                        >
                          <div>
                            <div className="font-medium text-foreground">{player.name}</div>
                            <div className="text-sm text-muted-foreground">{player.position} • {player.team}</div>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMatch} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Create Match
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Upcoming Matches</h2>
        
        {matches.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No matches created yet</p>
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
            {matches.map(match => (
              <Card key={match.id} className="bg-card/50 backdrop-blur border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">
                      {match.homeTeam?.name} vs {match.awayTeam?.name}
                    </CardTitle>
                    <Badge variant="outline">{match.league}</Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(match.date).toLocaleDateString()} at {match.time}</span>
                    </div>
                    {match.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{match.venue}</span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Selected Players ({match.selectedPlayers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {match.selectedPlayers.map(player => (
                        <Badge key={player.id} variant="secondary" className="text-xs">
                          {player.name}
                        </Badge>
                      ))}
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
  )
}

export default MatchCreation
