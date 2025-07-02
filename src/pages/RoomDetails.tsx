
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Trophy, Clock, Star, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PlayerSelection from "@/components/PlayerSelection"

interface RoomUser {
  id: string
  name: string
  avatar: string
  score: number
  rank: number
  joinedAt: string
  isOwner: boolean
}

interface Room {
  id: string
  name: string
  description: string
  participants: number
  maxParticipants: number
  status: "Active" | "Waiting" | "Completed"
  prize: string
  createdAt: string
  endDate: string
  owner: string
  category: string
  users: RoomUser[]
}

interface PlayerBet {
  playerId: string
  type: "main" | "sub"
}

interface UserBets {
  [userId: string]: PlayerBet[]
}

const RoomDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userBets, setUserBets] = useState<UserBets>({})
  const { toast } = useToast()

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockRoom: Room = {
      id: id || "1",
      name: "Premier League Weekly",
      description: "Weekly Premier League predictions and betting",
      participants: 24,
      maxParticipants: 50,
      status: "Active",
      prize: "€500",
      createdAt: "2024-01-15",
      endDate: "2024-01-22",
      owner: "John Doe",
      category: "Football",
      users: [
        { id: "1", name: "John Doe", avatar: "/placeholder.svg", score: 2850, rank: 1, joinedAt: "2024-01-15", isOwner: true },
        { id: "2", name: "Alice Smith", avatar: "/placeholder.svg", score: 2720, rank: 2, joinedAt: "2024-01-15", isOwner: false },
        { id: "3", name: "Bob Johnson", avatar: "/placeholder.svg", score: 2680, rank: 3, joinedAt: "2024-01-16", isOwner: false },
        { id: "4", name: "Carol Brown", avatar: "/placeholder.svg", score: 2650, rank: 4, joinedAt: "2024-01-16", isOwner: false },
        { id: "5", name: "David Wilson", avatar: "/placeholder.svg", score: 2590, rank: 5, joinedAt: "2024-01-17", isOwner: false },
        { id: "6", name: "Emma Davis", avatar: "/placeholder.svg", score: 2520, rank: 6, joinedAt: "2024-01-17", isOwner: false },
      ]
    }
    
    setTimeout(() => {
      setRoom(mockRoom)
      setIsLoading(false)
    }, 1000)
  }, [id])

  const handleKickUser = (userId: string) => {
    if (!room) return
    
    const user = room.users.find(u => u.id === userId)
    toast({
      title: "User Removed",
      description: `${user?.name} has been removed from the room.`,
    })
  }

  const handleBetUpdate = (userId: string, bets: PlayerBet[]) => {
    setUserBets(prev => ({
      ...prev,
      [userId]: bets
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Room Not Found</h2>
          <p className="text-muted-foreground mb-4">The room you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/rooms")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/rooms")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{room.name}</h1>
          <p className="text-muted-foreground">{room.description}</p>
        </div>
      </div>

      {/* Room Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{room.participants}</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{room.prize}</div>
                <div className="text-sm text-muted-foreground">Prize Pool</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <div className="text-lg font-bold text-foreground">{room.status}</div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <div>
                <div className="text-lg font-bold text-foreground">{room.category}</div>
                <div className="text-sm text-muted-foreground">Category</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Details */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Room Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Owner</label>
              <p className="text-foreground">{room.owner}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-foreground">{new Date(room.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <p className="text-foreground">{new Date(room.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Badge 
              variant={room.status === 'Active' ? 'default' : room.status === 'Waiting' ? 'secondary' : 'outline'}
              className={
                room.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                room.status === 'Waiting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }
            >
              {room.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Participants and Player Bets */}
      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">Participants Leaderboard</TabsTrigger>
          <TabsTrigger value="player-bets">Player Bets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants">
          <Card className="bg-card/50 backdrop-blur border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Participants Leaderboard</CardTitle>
              <CardDescription>Current standings and participant details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {room.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                          <span className="font-medium">#{user.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">{user.score.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isOwner ? (
                          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                            Owner
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Member</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!user.isOwner && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleKickUser(user.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="player-bets">
          <div className="space-y-6">
            {room.users.map((user) => (
              <PlayerSelection
                key={user.id}
                userId={user.id}
                userName={user.name}
                onBetUpdate={handleBetUpdate}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RoomDetails
