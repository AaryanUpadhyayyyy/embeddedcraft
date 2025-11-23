import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    User,
    Activity,
    Tags,
    Clock,
    MapPin,
    Smartphone,
    Mail
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';

interface UserDetailPanelProps {
    userId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ userId, open, onOpenChange }) => {
    // Mock data - in real app would fetch based on userId
    const user = {
        id: userId,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://github.com/shadcn.png',
        location: 'San Francisco, CA',
        device: 'iPhone 13 Pro',
        lastSeen: '2 minutes ago',
        segments: ['Power Users', 'Early Adopters', 'High Value'],
        properties: {
            plan: 'Pro',
            ltv: '$1,250',
            sessions: 42,
            last_purchase: '2023-11-15'
        },
        events: [
            { name: 'Checkout Completed', time: '2 mins ago', type: 'conversion' },
            { name: 'Added to Cart', time: '5 mins ago', type: 'action' },
            { name: 'Viewed Product', time: '10 mins ago', type: 'view' },
            { name: 'Session Started', time: '15 mins ago', type: 'system' },
        ]
    };

    if (!userId) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 bg-gray-50">
                {/* Header Profile Section */}
                <div className="bg-white p-6 border-b">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Mail size={14} />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                {user.location}
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Online
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="activity" className="w-full h-[calc(100vh-140px)] flex flex-col">
                    <div className="bg-white px-6 border-b">
                        <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                            <TabsTrigger
                                value="activity"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-full px-4"
                            >
                                Activity
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-full px-4"
                            >
                                Profile
                            </TabsTrigger>
                            <TabsTrigger
                                value="segments"
                                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none h-full px-4"
                            >
                                Segments
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <TabsContent value="activity" className="mt-0 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity size={16} />
                                    Recent Activity
                                </h3>
                                <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                                    {user.events.map((event, i) => (
                                        <div key={i} className="relative">
                                            <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ${event.type === 'conversion' ? 'bg-green-500' :
                                                    event.type === 'view' ? 'bg-blue-500' : 'bg-gray-400'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{event.name}</p>
                                                <p className="text-xs text-gray-500">{event.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="profile" className="mt-0 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Device</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Smartphone size={14} className="text-gray-400" />
                                        {user.device}
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border shadow-sm">
                                    <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Clock size={14} className="text-gray-400" />
                                        {user.lastSeen}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">User Properties</h3>
                                <div className="bg-white rounded-lg border shadow-sm divide-y">
                                    {Object.entries(user.properties).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-3">
                                            <span className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                                            <span className="text-sm font-medium font-mono">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="segments" className="mt-0">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Tags size={16} />
                                    Active Segments
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.segments.map((segment) => (
                                        <Badge key={segment} variant="secondary" className="px-3 py-1 text-sm">
                                            {segment}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
};

export default UserDetailPanel;
