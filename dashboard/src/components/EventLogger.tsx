import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Database, Webhook, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'ingestion' | 'redis' | 'webhook';
  event: string;
  data: any;
}

export const EventLogger = () => {
  const { campaigns } = useStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      if (activeCampaigns.length === 0) return;

      const randomCampaign = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
      const events = ['Nudge_Impression', 'Nudge_Clicked', 'Checkout_Started', 'App_Opened'];
      const randomEvent = events[Math.floor(Math.random() * events.length)];

      const newLogs: LogEntry[] = [
        {
          id: `${Date.now()}-1`,
          timestamp: new Date(),
          type: 'ingestion',
          event: randomEvent,
          data: {
            event: randomEvent,
            user_id: `user_${Math.floor(Math.random() * 1000)}`,
            campaign_id: randomCampaign.id,
            properties: {
              timestamp: new Date().toISOString(),
              session_id: `session_${Math.random().toString(36).substr(2, 9)}`
            }
          }
        },
        {
          id: `${Date.now()}-2`,
          timestamp: new Date(Date.now() + 50),
          type: 'redis',
          event: 'Cache Update',
          data: {
            operation: 'SET',
            key: `campaign:${randomCampaign.id}:user_*`,
            ttl: 3600,
            status: 'success'
          }
        },
        {
          id: `${Date.now()}-3`,
          timestamp: new Date(Date.now() + 100),
          type: 'webhook',
          event: 'Webhook Delivery',
          data: {
            url: 'https://api.client.com/webhooks/nudge',
            method: 'POST',
            status: 200,
            latency: '43ms'
          }
        }
      ];

      // send a track to prototype server for the ingestion entry
      const ingestion = newLogs[0];
      api.track(ingestion.data.user_id, ingestion.data.event, ingestion.data.properties)
        .then((resp) => {
          // push server response as a log entry
          if (resp && resp.matched) {
            const serverLog: LogEntry = {
              id: `${Date.now()}-srv`,
              timestamp: new Date(),
              type: 'webhook',
              event: 'Server Match',
              data: resp,
            };
            setLogs(prev => [serverLog, ...newLogs, ...prev].slice(0, 50));
          } else {
            setLogs(prev => [...newLogs, ...prev].slice(0, 50));
          }
        })
        .catch(() => setLogs(prev => [...newLogs, ...prev].slice(0, 50)));
    }, 3000);

    return () => clearInterval(interval);
  }, [campaigns, isOpen]);

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 left-6 z-50 bg-gradient-primary hover:shadow-glow"
        onClick={() => setIsOpen(true)}
      >
        <Code2 className="mr-2 h-4 w-4" />
        Event Logger
      </Button>
    );
  }

  return (
    <div className="fixed inset-6 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col border-border shadow-glow">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Real-Time Event Logger</h3>
            <Badge variant="secondary" className="animate-pulse">
              Live
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="ingestion">Ingestion API</TabsTrigger>
            <TabsTrigger value="redis">Redis Cache</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-auto p-4 space-y-2">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Waiting for events...
              </div>
            ) : (
              logs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))
            )}
          </TabsContent>

          <TabsContent value="ingestion" className="flex-1 overflow-auto p-4 space-y-2">
            {logs.filter(l => l.type === 'ingestion').map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>

          <TabsContent value="redis" className="flex-1 overflow-auto p-4 space-y-2">
            {logs.filter(l => l.type === 'redis').map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>

          <TabsContent value="webhook" className="flex-1 overflow-auto p-4 space-y-2">
            {logs.filter(l => l.type === 'webhook').map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

const LogCard = ({ log }: { log: LogEntry }) => {
  const getIcon = () => {
    switch (log.type) {
      case 'ingestion': return <Webhook className="h-4 w-4" />;
      case 'redis': return <Database className="h-4 w-4" />;
      case 'webhook': return <Code2 className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (log.type) {
      case 'ingestion': return 'text-blue-500';
      case 'redis': return 'text-primary';
      case 'webhook': return 'text-accent';
    }
  };

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 animate-scale-in">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={getColor()}>{getIcon()}</div>
          <div>
            <p className="font-mono text-sm font-semibold">{log.event}</p>
            <p className="text-xs text-muted-foreground">
              {log.timestamp.toLocaleTimeString()}.{log.timestamp.getMilliseconds()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {log.type}
        </Badge>
      </div>
      <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
        {JSON.stringify(log.data, null, 2)}
      </pre>
    </div>
  );
};
