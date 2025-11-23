import React from 'react';
import { LayerStyle } from '@/store/useEditorStore';
import { AlignCenter, AlignLeft, AlignRight, AlignJustify, Move, Layers } from 'lucide-react';

interface PositionEditorProps {
    style: LayerStyle;
    onChange: (updates: Partial<LayerStyle>) => void;
    colors: any;
}

export const PositionEditor: React.FC<PositionEditorProps> = ({ style, onChange, colors }) => {
    const position = style.position || 'relative';

    const handleValueChange = (key: keyof LayerStyle, value: string) => {
        // Check if value is a number
        const numValue = Number(value);
        if (!isNaN(numValue) && value !== '') {
            onChange({ [key]: numValue });
        } else {
            onChange({ [key]: value });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Position Type */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                    Position
                </label>
                <div style={{ display: 'flex', gap: '1px', backgroundColor: colors.border.default, padding: '1px', borderRadius: '6px', overflow: 'hidden' }}>
                    {['relative', 'absolute', 'fixed', 'sticky'].map((pos) => (
                        <button
                            key={pos}
                            onClick={() => onChange({ position: pos as any })}
                            style={{
                                flex: 1,
                                padding: '6px 4px',
                                border: 'none',
                                backgroundColor: position === pos ? 'white' : colors.gray[50],
                                color: position === pos ? colors.primary[500] : colors.text.secondary,
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
            </div>

            {/* Coordinates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['top', 'right', 'bottom', 'left'].map((side) => (
                    <div key={side}>
                        <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px', textTransform: 'capitalize' }}>
                            {side}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={(style[side as keyof LayerStyle] as string | number) || ''}
                                onChange={(e) => handleValueChange(side as keyof LayerStyle, e.target.value)}
                                placeholder="auto"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    paddingRight: '24px',
                                    border: `1px solid ${colors.border.default}`,
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Z-Index */}
            <div>
                <label style={{ fontSize: '12px', color: colors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> Z-Index
                </label>
                <input
                    type="number"
                    value={style.zIndex || 0}
                    onChange={(e) => onChange({ zIndex: Number(e.target.value) })}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: `1px solid ${colors.border.default}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        outline: 'none'
                    }}
                />
            </div>
        </div>
    );
};
