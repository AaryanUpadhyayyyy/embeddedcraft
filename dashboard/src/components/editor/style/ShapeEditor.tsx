import React from 'react';
import { LayerStyle } from '@/store/useEditorStore';
import { Square, Circle, Triangle, Hexagon, Star } from 'lucide-react';

interface ShapeEditorProps {
    style: LayerStyle;
    onChange: (updates: Partial<LayerStyle>) => void;
    colors: any;
}

export const ShapeEditor: React.FC<ShapeEditorProps> = ({ style, onChange, colors }) => {
    const borderRadius = style.borderRadius;

    // Helper to get individual radius values
    const getRadius = (corner: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft') => {
        if (typeof borderRadius === 'object') {
            return borderRadius[corner];
        }
        return borderRadius || 0;
    };

    const handleRadiusChange = (corner: string, value: string) => {
        const numValue = Number(value);
        const finalValue = isNaN(numValue) ? value : numValue;

        if (typeof borderRadius === 'object') {
            onChange({ borderRadius: { ...borderRadius, [corner]: finalValue } });
        } else {
            // Convert single value to object if we're editing a specific corner
            onChange({
                borderRadius: {
                    topLeft: borderRadius || 0,
                    topRight: borderRadius || 0,
                    bottomRight: borderRadius || 0,
                    bottomLeft: borderRadius || 0,
                    [corner]: finalValue
                }
            });
        }
    };

    const shapes = [
        { label: 'None', value: '', icon: Square },
        { label: 'Circle', value: 'circle(50% at 50% 50%)', icon: Circle },
        { label: 'Ellipse', value: 'ellipse(50% 50% at 50% 50%)', icon: Circle }, // Approximate icon
        { label: 'Polygon', value: 'polygon(50% 0%, 0% 100%, 100% 100%)', icon: Triangle },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Border Radius */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                    Border Radius
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => (
                        <div key={corner}>
                            <input
                                type="text"
                                value={getRadius(corner as any) || 0}
                                onChange={(e) => handleRadiusChange(corner, e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: `1px solid ${colors.border.default}`,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    outline: 'none'
                                }}
                                title={corner}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Clip Path */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                    Clip Path Shape
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {shapes.map((shape) => (
                        <button
                            key={shape.label}
                            onClick={() => onChange({ clipPath: shape.value })}
                            title={shape.label}
                            style={{
                                padding: '8px',
                                border: `1px solid ${style.clipPath === shape.value ? colors.primary[500] : colors.border.default}`,
                                borderRadius: '6px',
                                backgroundColor: style.clipPath === shape.value ? colors.primary[50] : 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <shape.icon size={16} color={style.clipPath === shape.value ? colors.primary[500] : colors.text.secondary} />
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: '8px' }}>
                    <input
                        type="text"
                        value={style.clipPath || ''}
                        onChange={(e) => onChange({ clipPath: e.target.value })}
                        placeholder="Custom clip-path..."
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${colors.border.default}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
