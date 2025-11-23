import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
    name: string;
    status: 'active' | 'paused' | 'draft';
    type: string;
    trigger?: string;
    rules: any[];
    config: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const CampaignSchema: Schema = new Schema({
    name: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'paused', 'draft'],
        default: 'draft'
    },
    type: { type: String, default: 'modal' },
    trigger: { type: String },
    rules: { type: [Schema.Types.Mixed], default: [] },
    config: { type: Schema.Types.Mixed, default: {} },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
