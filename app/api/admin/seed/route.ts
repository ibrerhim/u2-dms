import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/admin/seed - Create admin user from environment variables
export async function POST(request: NextRequest) {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: 'Admin credentials not configured in environment' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

        if (existingAdmin) {
            return NextResponse.json({
                message: 'Admin user already exists',
                email: adminEmail,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        // Create admin user
        const adminUser = await User.create({
            fullName: 'System Admin',
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            phone: '+1234567890',
            role: 'admin',
        });

        return NextResponse.json({
            message: 'Admin user created successfully',
            email: adminUser.email,
            communityId: adminUser.communityId,
        });
    } catch (error) {
        console.error('Error seeding admin:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/admin/seed - Check if admin exists
export async function GET() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            return NextResponse.json({ exists: false, configured: false });
        }

        await dbConnect();

        const existingAdmin = await User.findOne({
            email: adminEmail.toLowerCase(),
            role: 'admin'
        });

        return NextResponse.json({
            exists: !!existingAdmin,
            configured: true,
            email: adminEmail
        });
    } catch (error) {
        console.error('Error checking admin:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
