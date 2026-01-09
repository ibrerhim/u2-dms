import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/models/Document';
import Notification from '@/models/Notification';
import { uploadFile } from '@/lib/cloudinary';

function generateVersionId(): string {
    return `v-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// GET /api/documents - List all documents for authenticated user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as { id?: string }).id;
        const documents = await DocumentModel.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/documents - Upload new document
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const name = formData.get('name') as string | null;
        const versionName = formData.get('versionName') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        if (!name) {
            return NextResponse.json(
                { error: 'Document name is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const userId = (session.user as { id?: string }).id;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const uploadResult = await uploadFile(buffer, `u2-dms/${userId}`);

        const versionId = generateVersionId();
        const finalVersionName = versionName || name;

        // Create document with first version
        const document = await DocumentModel.create({
            name,
            userId,
            currentVersionName: finalVersionName,
            versions: [
                {
                    versionId,
                    versionName: finalVersionName,
                    cloudinaryId: uploadResult.public_id,
                    cloudinaryUrl: uploadResult.secure_url,
                    format: uploadResult.format,
                    size: uploadResult.bytes,
                    createdAt: new Date(),
                },
            ],
        });

        // Create notification
        await Notification.create({
            userId,
            message: `Successfully uploaded document "${name}"`,
            type: 'upload',
            documentId: document._id,
        });

        return NextResponse.json(
            {
                message: 'Document uploaded successfully',
                document,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
