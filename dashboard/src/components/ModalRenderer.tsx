import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ModalRendererProps {
    layers: any[];
    selectedLayerId: string | null;
    onLayerSelect: (id: string) => void;
    colors: any;
    config?: any;
    onConfigChange?: (config: any) => void;
}

export const ModalRenderer: React.FC<ModalRendererProps> = ({
    layers,
    selectedLayerId,
    onLayerSelect,
    colors,
    config = {},
    onConfigChange
}) => {
    // Find the root container layer for the Modal
    const modalContainerLayer = layers.find(l => l.type === 'container' && l.name === 'Modal Container');

    // If no container exists, we might be in a fresh state or legacy state. 
    // In a real app, we'd initialize this structure if missing.

    const containerStyle = modalContainerLayer?.style || {};

    // Config defaults
    const width = config.width || 320;
    const borderRadius = config.borderRadius || 16;
    const padding = config.padding || 24;
    const backgroundColor = config.backgroundColor || '#FFFFFF';
    const showCloseButton = config.showCloseButton !== false;

    // Helper to process complex style objects
    const processLayerStyle = (style: any) => {
        if (!style) return {};
        const processed: any = { ...style };

        // Handle border radius object
        if (typeof style.borderRadius === 'object' && style.borderRadius !== null) {
            processed.borderTopLeftRadius = style.borderRadius.topLeft;
            processed.borderTopRightRadius = style.borderRadius.topRight;
            processed.borderBottomRightRadius = style.borderRadius.bottomRight;
            processed.borderBottomLeftRadius = style.borderRadius.bottomLeft;
            delete processed.borderRadius;
        }

        // Handle padding object
        if (typeof style.padding === 'object' && style.padding !== null) {
            processed.paddingTop = `${style.padding.top}px`;
            processed.paddingRight = `${style.padding.right}px`;
            processed.paddingBottom = `${style.padding.bottom}px`;
            processed.paddingLeft = `${style.padding.left}px`;
            delete processed.padding;
        } else if (typeof style.padding === 'number') {
            processed.padding = `${style.padding}px`;
        }

        // Handle margin object
        if (typeof style.margin === 'object' && style.margin !== null) {
            processed.marginTop = `${style.margin.top}px`;
            processed.marginRight = `${style.margin.right}px`;
            processed.marginBottom = `${style.margin.bottom}px`;
            processed.marginLeft = `${style.margin.left}px`;
            delete processed.margin;
        } else if (typeof style.margin === 'number') {
            processed.margin = `${style.margin}px`;
        }

        // Handle borderWidth object
        if (typeof style.borderWidth === 'object' && style.borderWidth !== null) {
            processed.borderTopWidth = `${style.borderWidth.top}px`;
            processed.borderRightWidth = `${style.borderWidth.right}px`;
            processed.borderBottomWidth = `${style.borderWidth.bottom}px`;
            processed.borderLeftWidth = `${style.borderWidth.left}px`;
            delete processed.borderWidth;
        } else if (typeof style.borderWidth === 'number') {
            processed.borderWidth = `${style.borderWidth}px`;
        }

        return processed;
    };

    const renderLayer = (layer: any) => {
        const isSelected = selectedLayerId === layer.id;
        const style = processLayerStyle(layer.style);

        // Common selection style
        const selectionStyle = isSelected ? {
            outline: `2px solid ${colors.purple[500]}`,
            outlineOffset: '2px',
            zIndex: (typeof style.zIndex === 'number' ? style.zIndex : 0) + 10
        } : {};

        switch (layer.type) {
            case 'text':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            position: 'relative',
                            cursor: 'pointer',
                            ...style,
                            ...selectionStyle
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
                            cursor: 'pointer',
                            border: 'none',
                            outline: 'none',
                            ...style,
                            ...selectionStyle
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
                            cursor: 'pointer',
                            display: 'block',
                            maxWidth: '100%',
                            ...style,
                            ...selectionStyle
                        }}
                    />
                );

            case 'badge':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            cursor: 'pointer',
                            display: 'inline-block',
                            backgroundColor: style.badgeBackgroundColor || '#E0E7FF',
                            color: style.badgeTextColor || '#4338CA',
                            padding: style.badgePadding ? `${style.badgePadding.vertical}px ${style.badgePadding.horizontal}px` : '4px 12px',
                            borderRadius: style.badgeBorderRadius || 12,
                            fontSize: '12px',
                            fontWeight: 'bold',
                            ...style,
                            ...selectionStyle
                        }}
                    >
                        {layer.content?.badgeText || 'Badge'}
                    </div>
                );

            case 'container':
                return (
                    <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
                        style={{
                            display: 'flex',
                            flexDirection: style.direction || 'column',
                            justifyContent: style.justifyContent || 'flex-start',
                            alignItems: style.alignItems || 'stretch',
                            gap: style.gap ? `${style.gap}px` : '0px',
                            cursor: 'pointer',
                            minHeight: '20px',
                            ...style,
                            ...selectionStyle
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
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
        }}>
            <div
                style={{
                    width: `${width}px`,
                    backgroundColor: backgroundColor,
                    borderRadius: `${borderRadius}px`,
                    padding: `${padding}px`,
                    position: 'relative',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    ...containerStyle
                }}
                onClick={(e) => {
                    // If clicking the modal background itself (not a layer), select the container
                    if (modalContainerLayer) {
                        e.stopPropagation();
                        onLayerSelect(modalContainerLayer.id);
                    }
                }}
            >
                {showCloseButton && (
                    <button
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9CA3AF'
                        }}
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Render children of the root modal container */}
                {modalContainerLayer?.children?.map((childId: string) => {
                    const child = layers.find(l => l.id === childId);
                    return child ? renderLayer(child) : null;
                })}

                {/* Fallback if no structure exists yet */}
                {!modalContainerLayer && (
                    <div style={{ textAlign: 'center', color: '#6B7280', padding: '20px' }}>
                        No layers yet. Add a container to start building.
                    </div>
                )}
            </div>
        </div>
    );
};
