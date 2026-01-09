import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/models/Document';
import Notification from '@/models/Notification';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/documents/[id]/revert - Revert to a specific version
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { versionId } = body;

        if (!versionId) {
            return NextResponse.json(
                { error: 'Version ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const userId = (session.user as { id?: string }).id;
        const document = await DocumentModel.findOne({ _id: id, userId });

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Find the version to revert to
        const targetVersion = document.versions.find(
            (v) => v.versionId === versionId
        );

        if (!targetVersion) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        // Update current version name
        document.currentVersionName = targetVersion.versionName;
        await document.save();

        // Create notification
        await Notification.create({
            userId,
            message: `Reverted "${document.name}" to version "${targetVersion.versionName}"`,
            type: 'revert',
            documentId: document._id,
        });

        return NextResponse.json({
            message: 'Document reverted successfully',
            currentVersion: targetVersion,
        });
    } catch (error) {
        console.error('Error reverting document:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
