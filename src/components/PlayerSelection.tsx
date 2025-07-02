
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, Sword } from "lucide-react"

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

  // Mock players data with opposing teams
  const availablePlayers: Player[] = [
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
      name: "Mohamed Salah",
      position: "Forward",
      team: "Liverpool FC",
      teamLogo: "/placeholder.svg",
      rating: 5,
      opposingTeam: "Chelsea FC",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "14:00"
    },
    {
      id: "4",
      name: "Bruno Fernandes",
      position: "Midfielder",
      team: "Manchester United",
      teamLogo: "/placeholder.svg",
      rating: 4,
      opposingTeam: "Tottenham",
      opposingTeamLogo: "/placeholder.svg",
      gameDate: "2024-01-21",
      gameTime: "18:45"
    }
  ]

  const handlePlayerBet = (playerId: string, type: "main" | "sub") => {
    const newBets = [...playerBets]
    const existingBetIndex = newBets.findIndex(bet => bet.playerId === playerId)
    
    if (existingBetIndex >= 0) {
      if (newBets[existingBetIndex].type === type) {
        // Remove bet if clicking the same type
        newBets.splice(existingBetIndex, 1)
      } else {
        // Update bet type
        newBets[existingBetIndex].type = type
      }
    } else {
      // Add new bet
      newBets.push({ playerId, type })
    }
    
    setPlayerBets(newBets)
    onBetUpdate?.(userId, newBets)
  }

  const getPlayerBet = (playerId: string) => {
    return playerBets.find(bet => bet.playerId === playerId)
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePlayers.map((player) => {
            const playerBet = getPlayerBet(player.id)
            return (
              <div key={player.id} className="border border-border rounded-lg p-4 space-y-3">
                {/* Player Info */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">{player.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {player.position}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {[...Array(player.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
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
                  >
                    Main
                  </Button>
                  <Button
                    variant={playerBet?.type === "sub" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePlayerBet(player.id, "sub")}
                  >
                    Sub
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Bet Summary */}
        {playerBets.length > 0 && (
          <div className="mt-4 p-3 border border-border rounded-lg bg-muted/10">
            <h5 className="font-medium text-foreground mb-2">Current Bets:</h5>
            <div className="space-y-1 text-sm">
              {playerBets.map((bet) => {
                const player = availablePlayers.find(p => p.id === bet.playerId)
                return (
                  <div key={bet.playerId} className="flex justify-between">
                    <span className="text-foreground">{player?.name}</span>
                    <Badge variant={bet.type === "main" ? "default" : "secondary"} className="text-xs">
                      {bet.type}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PlayerSelection
