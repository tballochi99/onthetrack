import { NextResponse } from 'next/server';
import dbConnect from '@/db/config/dbConnect';
import License from '@/db/models/License';

export async function GET(request, { params }) {
    const { id } = params;
    try {
        await dbConnect();
        const license = await License.findById(id).select('_id name price fileType');
        if (!license) {
            return NextResponse.json({ error: 'License not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, license });
    } catch (error) {
        console.error('Error fetching license:', error);
        return NextResponse.json({ error: 'Error fetching license' }, { status: 500 });
    }
}