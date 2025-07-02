
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Users, Clock, Settings } from "lucide-react"

const Rooms = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Rooms Management</h1>
        <p className="text-muted-foreground">Manage betting rooms and game sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample room cards */}
        {[
          { id: 1, name: "Premier League Weekly", participants: 24, status: "Active", prize: "€500" },
          { id: 2, name: "Champions League Special", participants: 156, status: "Active", prize: "€2000" },
          { id: 3, name: "La Liga Masters", participants: 89, status: "Waiting", prize: "€1200" },
        ].map((room) => (
          <Card key={room.id} className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                <CardTitle className="text-foreground">{room.name}</CardTitle>
              </div>
              <CardDescription>Room ID: {room.id.toString().padStart(6, '0')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{room.participants} participants</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  room.status === 'Active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {room.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prize Pool</span>
                <span className="font-semibold text-primary">{room.prize}</span>
              </div>
              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage Room
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Rooms
