import React from 'react';

interface TooltipRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
}

export const TooltipRenderer: React.FC<TooltipRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config = {},
    onConfigChange
}) => {
    // Find the root container layer for the Tooltip
    const tooltipContainerLayer = layers.find(l => l.type === 'container' && l.name === 'Tooltip Container');

    const containerStyle = tooltipContainerLayer?.style || {};

    // Config defaults
    const position = config.position || 'bottom'; // top, bottom, left, right
    const backgroundColor = config.backgroundColor || '#1F2937';
    const borderRadius = config.borderRadius || 8;
    const padding = config.padding || 12;
    const arrowSize = config.arrowSize || 8;

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = layer.style || {};

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
                            color: style.color || 'white',
                            fontSize: style.fontSize || '14px'
                        }}
                    >
                        {layer.content?.text || 'Tooltip Text'}
                    </div>
                );

            // ... other components (simplified for brevity)
            case 'container':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            ...style,
                            ...selectionStyle,
                            display: 'flex',
                            flexDirection: style.direction || 'column',
                            gap: style.gap ? `${style.gap}px` : '4px'
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

    // Mock Anchor Element
    const Anchor = () => (
        <div style={{
            width: '100px',
            height: '40px',
            backgroundColor: '#E5E7EB',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7280',
            fontSize: '12px',
            border: '2px dashed #9CA3AF'
        }}>
            Target Element
        </div>
    );

    // Arrow Style Calculation
    const getArrowStyle = () => {
        const base = {
            position: 'absolute' as const,
            width: 0,
            height: 0,
            borderStyle: 'solid',
        };

        switch (position) {
            case 'top':
                return {
                    ...base,
                    bottom: `-${arrowSize}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
                    borderColor: `${backgroundColor} transparent transparent transparent`
                };
            case 'bottom':
                return {
                    ...base,
                    top: `-${arrowSize}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
                    borderColor: `transparent transparent ${backgroundColor} transparent`
                };
            case 'left':
                return {
                    ...base,
                    right: `-${arrowSize}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
                    borderColor: `transparent transparent transparent ${backgroundColor}`
                };
            case 'right':
                return {
                    ...base,
                    left: `-${arrowSize}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
                    borderColor: `transparent ${backgroundColor} transparent transparent`
                };
            default:
                return {};
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px'
        }}>
            {/* Render Anchor if tooltip is bottom/right, else render tooltip first */}
            {position === 'bottom' && <Anchor />}
            {position === 'right' && <Anchor />}

            <div
                style={{
                    backgroundColor: backgroundColor,
                    borderRadius: `${borderRadius}px`,
                    padding: `${padding}px`,
                    position: 'relative',
                    maxWidth: '250px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    ...containerStyle
                }}
                onClick={(e) => {
                    if (tooltipContainerLayer) {
                        e.stopPropagation();
                        onLayerSelect(tooltipContainerLayer.id);
                    }
                }}
            >
                <div style={getArrowStyle()} />

                {tooltipContainerLayer?.children?.map((childId: string) => {
                    const child = layers.find(l => l.id === childId);
                    return child ? renderLayer(child) : null;
                })}

                {!tooltipContainerLayer && (
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                        Tooltip Content
                    </div>
                )}
            </div>

            {position === 'top' && <Anchor />}
            {position === 'left' && <Anchor />}
        </div>
    );
};
