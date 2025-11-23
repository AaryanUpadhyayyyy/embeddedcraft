import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
    userId: string;
    event: string;
    properties: Record<string, any>;
    timestamp: Date;
}

const EventSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    properties: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
}, {
    toJSON: {
        transform: (doc, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model<IEvent>('Event', EventSchema);
