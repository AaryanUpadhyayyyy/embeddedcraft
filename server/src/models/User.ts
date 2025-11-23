import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    traits: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    _id: { type: String, required: true }, // Use provided userId as _id
    traits: { type: Schema.Types.Mixed, default: {} },
}, {
    timestamps: true,
    _id: false, // Disable auto-generated ObjectId since we use custom string ID
    toJSON: {
        transform: (doc, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

export default mongoose.model<IUser>('User', UserSchema);
