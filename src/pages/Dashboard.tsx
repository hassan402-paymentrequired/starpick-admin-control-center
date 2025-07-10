
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFetch } from "@/hooks/useFetch";
import { Users, UserRound, Home, Activity, TrendingUp, Star } from "lucide-react"

const Dashboard = () => {
  const stats = [
    {
      title: "Active Teams",
      value: "24",
      change: "+2 this week",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Active Players",
      value: "483",
      change: "+18 this week", 
      icon: UserRound,
      color: "text-green-500"
    },
    {
      title: "Active Rooms",
      value: "12",
      change: "+3 this week",
      icon: Home,
      color: "text-purple-500"
    },
    {
      title: "Registered Users",
      value: "1,247",
      change: "+47 this week",
      icon: Activity,
      color: "text-orange-500"
    }
  ]
const { data, loading, error, refetch, abort } = useFetch(
    "https://example.com/items/"
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with StarPick.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Team Updates</CardTitle>
            <CardDescription>Latest changes to team configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { team: "Manchester United", action: "Activated", time: "2 hours ago" },
                { team: "Liverpool FC", action: "Updated roster", time: "4 hours ago" },
                { team: "Chelsea FC", action: "Deactivated", time: "1 day ago" },
                { team: "Arsenal FC", action: "Activated", time: "2 days ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{activity.team}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Top Rated Players</CardTitle>
            <CardDescription>Players with highest star ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Erling Haaland", team: "Manchester City", rating: 5 },
                { name: "Mohamed Salah", team: "Liverpool FC", rating: 5 },
                { name: "Kevin De Bruyne", team: "Manchester City", rating: 5 },
                { name: "Harry Kane", team: "Bayern Munich", rating: 4 }
              ].map((player, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.team}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < player.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
