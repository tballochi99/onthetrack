import { NextResponse } from 'next/server';
import dbConnect from '@/db/config/dbConnect';
import License from '@/db/models/License';

export async function GET() {
    try {
        await dbConnect();

        const licenses = await License.find({}).select('_id name price');

        return NextResponse.json(licenses);
    } catch (error) {
        console.error('Error fetching licenses:', error);
        return NextResponse.json({ error: 'Error fetching licenses' }, { status: 500 });
    }
}