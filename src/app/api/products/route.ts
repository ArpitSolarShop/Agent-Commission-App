import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all products (optionally filter by system_type)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const systemTypeId = searchParams.get('system_type_id');
        const activeOnly = searchParams.get('active') !== 'false';

        const where: any = {};
        if (systemTypeId) {
            where.systemTypeId = systemTypeId;
        }
        if (activeOnly) {
            where.isActive = true;
        }

        const data = await prisma.product.findMany({
            where,
            include: {
                systemType: {
                    select: { name: true }
                }
            },
            orderBy: { capacityKw: 'asc' }
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Fetch products error:', error);
        return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { system_type_id, name, brand, capacity_kw, phase, base_price, gst_rate } = body;

        if (!name || !base_price) {
            return NextResponse.json({ success: false, message: 'Name and base_price are required' }, { status: 400 });
        }

        const data = await prisma.product.create({
            data: {
                systemTypeId: system_type_id,
                name,
                brand: brand || null,
                capacityKw: capacity_kw ? parseFloat(capacity_kw) : null,
                phase: phase ? parseInt(phase) : 1,
                basePrice: parseFloat(base_price),
                gstRate: gst_rate ? parseFloat(gst_rate) : 8.9,
                isActive: true,
            }
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Create product error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
