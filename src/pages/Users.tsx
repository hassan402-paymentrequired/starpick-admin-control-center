
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Search } from "lucide-react"

const Users = () => {
  const users = [
    { id: 1, name: "John Smith", email: "john@example.com", status: "Active", joined: "2024-01-15", bets: 45 },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", status: "Active", joined: "2024-02-03", bets: 23 },
    { id: 3, name: "Mike Wilson", email: "mike@example.com", status: "Suspended", joined: "2024-01-28", bets: 67 },
    { id: 4, name: "Emma Davis", email: "emma@example.com", status: "Active", joined: "2024-03-10", bets: 12 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage registered users and their accounts</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-10 bg-background/50 border-border"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="bg-card/50 backdrop-blur border-border hover:bg-card/80 transition-all duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-gold-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-foreground">{user.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </CardDescription>
                </div>
                <Badge 
                  variant={user.status === 'Active' ? 'default' : 'destructive'}
                  className={user.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                >
                  {user.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Joined</span>
                <span className="flex items-center gap-1 text-foreground">
                  <Calendar className="w-3 h-3" />
                  {user.joined}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Bets</span>
                <span className="font-semibold text-primary">{user.bets}</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Users
