
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, Sword, AlertCircle } from "lucide-react"

interface Player {
  id: string
  name: string
  position: string
  team: string
  teamLogo: string
  rating: number
  opposingTeam: string
  opposingTeamLogo: string
  gameDate: string
  gameTime: string
}

interface PlayerBet {
  playerId: string
  type: "main" | "sub"
}

interface PlayerSelectionProps {
  userId: string
  userName: string
  onBetUpdate?: (userId: string, bets: PlayerBet[]) => void
}

const PlayerSelection = ({ userId, userName, onBetUpdate }: PlayerSelectionProps) => {
  const [playerBets, setPlayerBets] = useState<PlayerBet[]>([])

  // Mock players data with all 5 star ratings
  const availablePlayers: Player[] = [
    // 5-star players
    {
      id: "1",
      name: "Erling Haaland",
      position: "Forward",
      team: "Manchester City",
      teamLogo: "/placeholder.svg",
      rating: 5,
      opposingTeam: "Arsenal FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-20",
      gameTime: "16:30"
    },
    {
      id: "2",
      name: "Kevin De Bruyne",
      position: "Midfielder",
      team: "Manchester City",
      teamLogo: "/placeholder.svg",
      rating: 5,
      opposingTeam: "Arsenal FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-20",
      gameTime: "16:30"
    },
    {
      id: "3",
      name: "Kylian Mbappé",
      position: "Forward",
      team: "Real Madrid",
      teamLogo: "/placeholder.svg",
      rating: 5,
      opposingTeam: "Barcelona",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-20",
      gameTime: "20:00"
    },
    // 4-star players
    {
      id: "4",
      name: "Mohamed Salah",
      position: "Forward",
      team: "Liverpool FC",
      teamLogo: "/placeholder.svg",
      rating: 4,
      opposingTeam: "Chelsea FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "14:00"
    },
    {
      id: "5",
      name: "Bruno Fernandes",
      position: "Midfielder",
      team: "Manchester United",
      teamLogo: "/placeholder.svg",
      rating: 4,
      opposingTeam: "Tottenham",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "18:45"
    },
    {
      id: "6",
      name: "Virgil van Dijk",
      position: "Defender",
      team: "Liverpool FC",
      teamLogo: "/placeholder.svg",
      rating: 4,
      opposingTeam: "Chelsea FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "14:00"
    },
    // 3-star players
    {
      id: "7",
      name: "Declan Rice",
      position: "Midfielder",
      team: "Arsenal FC",
      teamLogo: "/placeholder.svg",
      rating: 3,
      opposingTeam: "Manchester City",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-20",
      gameTime: "16:30"
    },
    {
      id: "8",
      name: "Marcus Rashford",
      position: "Forward",
      team: "Manchester United",
      teamLogo: "/placeholder.svg",
      rating: 3,
      opposingTeam: "Tottenham",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "18:45"
    },
    {
      id: "9",
      name: "Raheem Sterling",
      position: "Forward",
      team: "Chelsea FC",
      teamLogo: "/placeholder.svg",
      rating: 3,
      opposingTeam: "Liverpool FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "14:00"
    },
    // 2-star players
    {
      id: "10",
      name: "James Maddison",
      position: "Midfielder",
      team: "Tottenham",
      teamLogo: "/placeholder.svg",
      rating: 2,
      opposingTeam: "Manchester United",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "18:45"
    },
    {
      id: "11",
      name: "Conor Gallagher",
      position: "Midfielder",
      team: "Chelsea FC",
      teamLogo: "/placeholder.svg",
      rating: 2,
      opposingTeam: "Liverpool FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "14:00"
    },
    {
      id: "12",
      name: "Gabriel Jesus",
      position: "Forward",
      team: "Arsenal FC",
      teamLogo: "/placeholder.svg",
      rating: 2,
      opposingTeam: "Manchester City",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-20",
      gameTime: "16:30"
    },
    // 1-star players
    {
      id: "13",
      name: "Mason Mount",
      position: "Midfielder",
      team: "Manchester United",
      teamLogo: "/placeholder.svg",
      rating: 1,
      opposingTeam: "Tottenham",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "18:45"
    },
    {
      id: "14",
      name: "Ben Chilwell",
      position: "Defender",
      team: "Chelsea FC",
      teamLogo: "/placeholder.svg",
      rating: 1,
      opposingTeam: "Liverpool FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "14:00"
    },
    {
      id: "15",
      name: "Aaron Ramsdale",
      position: "Goalkeeper",
      team: "Arsenal FC",
      teamLogo: "/placeholder.svg",
      rating: 1,
      opposingTeam: "Manchester City",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-20",
      gameTime: "16:30"
    }
  ]

  // Group players by star rating
  const playersByRating = availablePlayers.reduce((acc, player) => {
    if (!acc[player.rating]) {
      acc[player.rating] = []
    }
    acc[player.rating].push(player)
    return acc
  }, {} as Record<number, Player[]>)

  const handlePlayerBet = (playerId: string, type: "main" | "sub") => {
    const player = availablePlayers.find(p => p.id === playerId)
    if (!player) return

    const newBets = [...playerBets]
    const existingBetIndex = newBets.findIndex(bet => bet.playerId === playerId)
    
    // Count current selections for this star rating
    const currentRatingSelections = newBets.filter(bet => {
      const betPlayer = availablePlayers.find(p => p.id === bet.playerId)
      return betPlayer?.rating === player.rating
    }).length

    if (existingBetIndex >= 0) {
      if (newBets[existingBetIndex].type === type) {
        // Remove bet if clicking the same type
        newBets.splice(existingBetIndex, 1)
      } else {
        // Update bet type
        newBets[existingBetIndex].type = type
      }
    } else {
      // Check if we can add new bet (max 2 per star rating)
      if (currentRatingSelections >= 2) {
        return // Don't allow more than 2 selections per star rating
      }
      // Add new bet
      newBets.push({ playerId, type })
    }
    
    setPlayerBets(newBets)
    onBetUpdate?.(userId, newBets)
  }

  const getPlayerBet = (playerId: string) => {
    return playerBets.find(bet => bet.playerId === playerId)
  }

  const getSelectionCountForRating = (rating: number) => {
    return playerBets.filter(bet => {
      const player = availablePlayers.find(p => p.id === bet.playerId)
      return player?.rating === rating
    }).length
  }

  const canSelectPlayer = (playerId: string) => {
    const player = availablePlayers.find(p => p.id === playerId)
    if (!player) return false
    
    const existingBet = getPlayerBet(playerId)
    if (existingBet) return true // Can always modify existing selection
    
    return getSelectionCountForRating(player.rating) < 2
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {userName}'s Player Bets
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Select 2 players from each star rating (10 players total)
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {[5, 4, 3, 2, 1].map((rating) => {
          const players = playersByRating[rating] || []
          const selectionCount = getSelectionCountForRating(rating)
          
          return (
            <div key={rating} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{rating}-Star Players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={selectionCount === 2 ? "default" : selectionCount > 0 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {selectionCount}/2 selected
                  </Badge>
                  {selectionCount === 2 && (
                    <AlertCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => {
                  const playerBet = getPlayerBet(player.id)
                  const canSelect = canSelectPlayer(player.id)
                  
                  return (
                    <div 
                      key={player.id} 
                      className={`border rounded-lg p-4 space-y-3 ${
                        !canSelect && !playerBet ? 'opacity-50' : ''
                      } ${playerBet ? 'border-primary/50 bg-primary/5' : 'border-border'}`}
                    >
                      {/* Player Info */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">{player.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {player.position}
                          </Badge>
                        </div>
                      </div>

                      {/* Team vs Team */}
                      <div className="flex items-center justify-center gap-3 py-2 border border-border/50 rounded bg-muted/20">
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{player.team}</div>
                        </div>
                        <Sword className="w-4 h-4 text-muted-foreground" />
                        <div className="text-center">
                          <div className="text-sm font-medium text-foreground">{player.opposingTeam}</div>
                        </div>
                      </div>

                      {/* Game Info */}
                      <div className="text-xs text-muted-foreground text-center">
                        {new Date(player.gameDate).toLocaleDateString()} at {player.gameTime}
                      </div>

                      {/* Betting Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant={playerBet?.type === "main" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePlayerBet(player.id, "main")}
                          disabled={!canSelect && !playerBet}
                        >
                          Main
                        </Button>
                        <Button
                          variant={playerBet?.type === "sub" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePlayerBet(player.id, "sub")}
                          disabled={!canSelect && !playerBet}
                        >
                          Sub
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        
        {/* Overall Progress */}
        <div className="p-4 border border-border rounded-lg bg-muted/10">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-foreground">Selection Progress</h5>
            <Badge variant={playerBets.length === 10 ? "default" : "secondary"}>
              {playerBets.length}/10 players selected
            </Badge>
          </div>
          
          {/* Progress by star rating */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = getSelectionCountForRating(rating)
              return (
                <div key={rating} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[...Array(rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">{count}/2</div>
                </div>
              )
            })}
          </div>

          {/* Current selections summary */}
          {playerBets.length > 0 && (
            <div className="space-y-2">
              <h6 className="text-sm font-medium text-foreground">Selected Players:</h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {playerBets.map((bet) => {
                  const player = availablePlayers.find(p => p.id === bet.playerId)
                  return (
                    <div key={bet.playerId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(player?.rating || 0)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                          ))}
                        </div>
                        <span className="text-foreground">{player?.name}</span>
                      </div>
                      <Badge variant={bet.type === "main" ? "default" : "secondary"} className="text-xs">
                        {bet.type}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PlayerSelection
