
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Users, Clock, Settings, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {useFetch} from "@/hooks/useFetch.ts";
import {useEffect, useState} from "react";

const Rooms = () => {
  const navigate = useNavigate()
    const [peers, setPeers] = useState([]);
    const { data, loading, error, refetch, abort } = useFetch("/admin/peers/");

    useEffect(() => {
        console.log(data?.data)
        if (data) {
            setPeers(data?.data?.peers.data || []);
        }
    }, [data]);

    if (loading) return <div>Loading matches...</div>;
    if (error) return <div>Error loading matches</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Rooms Management</h1>
        <p className="text-muted-foreground">Manage betting peers and game sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample room cards */}
        {peers.map((peer) => (
          <Card key={peer.id} className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-foreground">{peer.name}</CardTitle>
              </div>
              <CardDescription>Room ID: {peer?.peer_id.padStart(6, '0')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{peer.users_count} participants</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  peer.status === 'open' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {peer.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prize Pool</span>
                <span className="font-semibold text-primary">₦{Number(peer.amount).toFixed(0)}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => navigate(`/peers/${peer.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button className="flex-1" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Rooms
