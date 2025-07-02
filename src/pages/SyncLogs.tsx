
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

const SyncLogs = () => {
  const logs = [
    { id: 1, operation: "Teams Sync", status: "Success", timestamp: "2024-01-20 14:30:25", records: 24, duration: "2.3s" },
    { id: 2, operation: "Players Sync", status: "Success", timestamp: "2024-01-20 14:28:15", records: 483, duration: "8.7s" },
    { id: 3, operation: "Teams Sync", status: "Failed", timestamp: "2024-01-20 12:15:42", records: 0, duration: "0.5s", error: "API timeout" },
    { id: 4, operation: "Players Sync", status: "Warning", timestamp: "2024-01-20 10:45:18", records: 456, duration: "12.1s", warning: "Some records skipped" },
    { id: 5, operation: "Teams Sync", status: "Success", timestamp: "2024-01-20 08:00:00", records: 24, duration: "1.8s" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'Warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success</Badge>
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'Warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Warning</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sync Logs</h1>
          <p className="text-muted-foreground">Monitor API synchronization activities and status</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Logs
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">3</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">1</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">507</div>
              <div className="text-sm text-muted-foreground">Records Synced</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Sync Operations</CardTitle>
          <CardDescription>Last 24 hours of synchronization activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium text-foreground">{log.operation}</div>
                    <div className="text-sm text-muted-foreground">{log.timestamp}</div>
                    {log.error && (
                      <div className="text-sm text-red-400 mt-1">Error: {log.error}</div>
                    )}
                    {log.warning && (
                      <div className="text-sm text-yellow-400 mt-1">Warning: {log.warning}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{log.records} records</div>
                    <div className="text-xs text-muted-foreground">{log.duration}</div>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SyncLogs
