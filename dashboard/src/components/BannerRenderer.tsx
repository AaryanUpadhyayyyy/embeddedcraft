import React from 'react';
import { X } from 'lucide-react';

interface BannerRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
}

export const BannerRenderer: React.FC<BannerRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config = {},
    onConfigChange
}) => {
    // Find the root container layer for the Banner
    const bannerContainerLayer = layers.find(l => l.type === 'container' && l.name === 'Banner Container');

    const containerStyle = bannerContainerLayer?.style || {};

    // Config defaults
    const position = config.position || 'top'; // 'top' or 'bottom'
    const height = config.height || 60;
    const backgroundColor = config.backgroundColor || colors.primary[500];
    const showCloseButton = config.showCloseButton !== false;

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = layer.style || {};

        // Common selection style
        const selectionStyle = isSelected ? {
            outline: `2px solid ${colors.purple[500]}`,
            outlineOffset: '2px',
            zIndex: 10
        } : {};

        switch (layer.type) {
            case 'text':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        {layer.content?.text || 'Text'}
                    </div>
                );

            case 'button':
                return (
                    <button
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        {layer.content?.text || 'Button'}
                    </button>
                );

            case 'image':
                return (
                    <img
                        key={layer.id}
                        src={layer.content?.url || 'https://via.placeholder.com/150'}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            cursor: 'pointer',
                            display: 'block',
                            maxWidth: '100%'
                        }}
                    />
                );

            case 'container':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            display: 'flex',
                            flexDirection: style.direction || 'row', // Banners usually default to row
                            justifyContent: style.justifyContent || 'flex-start',
                            alignItems: style.alignItems || 'center',
                            gap: style.gap ? `${style.gap}px` : '0px',
                            cursor: 'pointer',
                            minHeight: '20px'
                        }}
                    >
                        {layer.children?.map((childId: string) => {
                            const child = layers.find(l => l.id === childId);
                            return child ? renderLayer(child) : null;
                        })}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [position]: 0, // top: 0 or bottom: 0
            backgroundColor: backgroundColor,
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 50,
            ...containerStyle
        }}
            onClick={(e) => {
                if (bannerContainerLayer) {
                    e.stopPropagation();
                    onLayerSelect(bannerContainerLayer.id);
                }
            }}
        >
            {/* Render children of the root banner container */}
            {bannerContainerLayer?.children?.map((childId: string) => {
                const child = layers.find(l => l.id === childId);
                return child ? renderLayer(child) : null;
            })}

            {/* Fallback */}
            {!bannerContainerLayer && (
                <div style={{ color: 'white', fontSize: '14px' }}>
                    Banner Container (Add layers here)
                </div>
            )}

            {showCloseButton && (
                <button
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.8)'
                    }}
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};
