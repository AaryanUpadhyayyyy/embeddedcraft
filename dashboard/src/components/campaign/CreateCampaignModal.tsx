import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    MessageSquare,
    Layout,
    Square,
    MessageCircle,
    Maximize2,
    CreditCard,
    PlayCircle,
    Grid3x3,
    ChevronRight,
    Check
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';
import { useStore } from '@/store/useStore';

interface CreateCampaignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const nudgeTypes = [
    { id: 'modal', label: 'Modal', Icon: Maximize2, description: 'Centered overlay for important announcements' },
    { id: 'banner', label: 'Banner', Icon: Layout, description: 'Top or bottom bar for quick info' },
    { id: 'bottomsheet', label: 'Bottom Sheet', Icon: Square, description: 'Slide-up panel for mobile-friendly content' },
    { id: 'tooltip', label: 'Tooltip', Icon: MessageCircle, description: 'Contextual help attached to elements' },
    { id: 'pip', label: 'Picture in Picture', Icon: PlayCircle, description: 'Floating video player' },
    { id: 'scratchcard', label: 'Scratch Card', Icon: CreditCard, description: 'Gamified reveal experience' },
    { id: 'carousel', label: 'Story Carousel', Icon: PlayCircle, description: 'Full-screen tappable stories' },
    { id: 'inline', label: 'Inline Widget', Icon: Grid3x3, description: 'Embedded content within your layout' }
];

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ open, onOpenChange }) => {
    const navigate = useNavigate();
    const { addCampaign } = useStore();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: ''
    });

    const handleNext = () => {
        if (step === 1 && formData.name) {
            setStep(2);
        } else if (step === 2 && formData.type) {
            handleCreate();
        }
    };

    const handleCreate = () => {
        // Create campaign in store
        const newCampaign = {
            name: formData.name,
            status: 'draft' as const,
            trigger: 'manual',
            segment: 'All Users', // Default segment
            impressions: 0,
            clicks: 0,
            conversions: 0,
            conversion: '0%',
            config: {
                type: formData.type,
                text: 'New Campaign', // Default text
                backgroundColor: '#ffffff', // Default background
                textColor: '#000000' // Default text color
            },
            rules: []
        };

        addCampaign(newCampaign);
        onOpenChange(false);

        // Navigate to builder with the new campaign (mock ID for now, in real app would get ID from backend)
        // For now, we'll just navigate to builder
        navigate('/campaign-builder');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">Create New Campaign</DialogTitle>
                    <div className="flex items-center gap-2 mt-4">
                        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    </div>
                </DialogHeader>

                <div className="p-6 pt-2">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Summer Sale Announcement"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="What is this campaign about?"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            {nudgeTypes.map((type) => {
                                const Icon = type.Icon;
                                const isSelected = formData.type === type.id;
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, type: type.id })}
                                        className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all relative
                      ${isSelected
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                    `}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5">
                                                <Check size={12} />
                                            </div>
                                        )}
                                        <div className={`p-2 rounded-lg w-fit mb-3 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                            <Icon size={20} />
                                        </div>
                                        <h3 className="font-semibold text-sm mb-1">{type.label}</h3>
                                        <p className="text-xs text-gray-500 leading-tight">{type.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 bg-gray-50 border-t">
                    {step > 1 && (
                        <Button variant="outline" onClick={() => setStep(step - 1)} className="mr-auto">
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={handleNext}
                        disabled={step === 1 ? !formData.name : !formData.type}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {step === 1 ? 'Next: Choose Type' : 'Create Campaign'}
                        {step === 1 && <ChevronRight size={16} className="ml-2" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCampaignModal;
