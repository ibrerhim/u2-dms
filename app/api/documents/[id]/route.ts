import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/models/Document';
import Notification from '@/models/Notification';
import { uploadFile, deleteFile } from '@/lib/cloudinary';

function generateVersionId(): string {
    return `v-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/documents/[id] - Get single document
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const userId = (session.user as { id?: string }).id;
        const document = await DocumentModel.findOne({ _id: id, userId }).lean();

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/documents/[id] - Update document (add new version)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const versionName = formData.get('versionName') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        await dbConnect();

        const userId = (session.user as { id?: string }).id;
        const document = await DocumentModel.findOne({ _id: id, userId });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload new version to Cloudinary
        const uploadResult = await uploadFile(buffer, `u2-dms/${userId}`);

        const versionId = generateVersionId();
        const versionNumber = document.versions.length + 1; // Auto-increment
        const versionLabel = versionName || `Version ${versionNumber}`; // User's name becomes label

        // Add new version
        document.versions.push({
            versionId,
            versionName: `v${versionNumber}`,
            versionLabel,
            cloudinaryId: uploadResult.public_id,
            cloudinaryUrl: uploadResult.secure_url,
            format: uploadResult.format,
            size: uploadResult.bytes,
            createdAt: new Date(),
        });

        document.currentVersionName = `v${versionNumber}`;
        await document.save();

        // Create notification
        await Notification.create({
            userId,
            message: `New version v${versionNumber} added to "${document.name}"`,
            type: 'version',
            documentId: document._id,
        });

        return NextResponse.json({
            message: 'Document updated successfully',
            document,
        });
    } catch (error) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const userId = (session.user as { id?: string }).id;
        const document = await DocumentModel.findOne({ _id: id, userId });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Delete all versions from Cloudinary
        for (const version of document.versions) {
            try {
                await deleteFile(version.cloudinaryId);
            } catch (e) {
                console.error('Error deleting from Cloudinary:', e);
            }
        }

        // Delete document from database
        await DocumentModel.deleteOne({ _id: id });

        // Create notification
        await Notification.create({
            userId,
            message: `Document "${document.name}" was deleted`,
            type: 'delete',
        });

        return NextResponse.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
