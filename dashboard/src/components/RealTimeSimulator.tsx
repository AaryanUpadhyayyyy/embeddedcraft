import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Zap } from "lucide-react";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";

interface Event {
  id: string;
  type: 'track' | 'identify' | 'impression' | 'click';
  campaign?: string;
  timestamp: Date;
}

export const RealTimeSimulator = () => {
  const { campaigns } = useStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      if (activeCampaigns.length === 0) return;

      const randomCampaign = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
      const eventTypes: Event['type'][] = ['track', 'impression', 'click', 'identify'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const newEvent: Event = {
        id: Date.now().toString(),
        type: randomType,
        campaign: randomCampaign.name,
        timestamp: new Date(),
      };

      // send event to prototype server when possible to simulate ingestion
      (async () => {
        try {
          if (randomType === 'identify') {
            await api.identify(`user_${Math.floor(Math.random() * 1000)}`, { last_seen: Date.now() });
          } else {
            // send a generic track
            const resp = await api.track(`user_${Math.floor(Math.random() * 1000)}`, 'Simulated_Event', { campaign: randomCampaign.id });
            // if server returned matched campaigns, include note in event.campaign
            if (resp && resp.matched && resp.matched.length > 0) {
              newEvent.campaign = resp.matched.map((m: any) => m.name).join(', ');
            }
          }
        } catch (e) {
          // ignore
        } finally {
          setEvents(prev => [newEvent, ...prev].slice(0, 5));
        }
      })();
    }, 2000);

    return () => clearInterval(interval);
  }, [campaigns]);

  if (!isVisible || events.length === 0) return null;

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'track': return 'bg-blue-500/10 text-blue-500';
      case 'identify': return 'bg-purple-500/10 text-purple-500';
      case 'impression': return 'bg-primary/10 text-primary';
      case 'click': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <Card className="w-80 p-4 border-border/50 shadow-glow bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-semibold text-sm">Real-Time Events</span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Hide
          </button>
        </div>

        <div className="space-y-2">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/50 animate-scale-in"
            >
              <Zap className="h-3 w-3 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${getEventColor(event.type)}`}>
                    {event.type}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {event.campaign}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">
            Simulated events • Updates every 2s
          </p>
        </div>
      </Card>
    </div>
  );
};
