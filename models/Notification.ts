import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    message: string;
    type: 'upload' | 'version' | 'revert' | 'delete';
    documentId?: mongoose.Types.ObjectId;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
        },
        type: {
            type: String,
            enum: ['upload', 'version', 'revert', 'delete'],
            required: true,
        },
        documentId: {
            type: Schema.Types.ObjectId,
            ref: 'Document',
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
