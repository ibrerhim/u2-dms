import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/models/Document';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/documents/[id]/versions - Get all versions of a document
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const userId = (session.user as { id?: string }).id;
        const document = await DocumentModel.findOne({ _id: id, userId })
            .select('name versions currentVersionName')
            .lean();

        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Sort versions by createdAt descending (newest first)
        const sortedVersions = document.versions.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({
            documentName: document.name,
            currentVersionName: document.currentVersionName,
            versions: sortedVersions,
        });
    } catch (error) {
        console.error('Error fetching versions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
