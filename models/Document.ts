import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocumentVersion {
    versionId: string;
    versionName: string;
    versionLabel?: string;
    cloudinaryId: string;
    cloudinaryUrl: string;
    format: string;
    size: number;
    createdAt: Date;
}

export interface IDocument extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    userId: mongoose.Types.ObjectId;
    currentVersionName: string;
    versions: IDocumentVersion[];
    createdAt: Date;
    updatedAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>(
    {
        versionId: {
            type: String,
            required: true,
        },
        versionName: {
            type: String,
            default: 'v1',
        },
        versionLabel: {
            type: String,
            default: '',
        },
        cloudinaryId: {
            type: String,
            required: true,
        },
        cloudinaryUrl: {
            type: String,
            required: true,
        },
        format: {
            type: String,
            default: '',
        },
        size: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const DocumentSchema = new Schema<IDocument>(
    {
        name: {
            type: String,
            required: [true, 'Document name is required'],
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        currentVersionName: {
            type: String,
            default: 'Unnamed Version',
        },
        versions: {
            type: [DocumentVersionSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const DocumentModel: Model<IDocument> =
    mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
