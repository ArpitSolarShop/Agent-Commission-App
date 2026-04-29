import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultComponents } from '@/lib/companyDetails';

// GET - List all components (optionally filter by system_type)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const systemTypeId = searchParams.get('system_type_id');
        const systemTypeName = searchParams.get('system_type');

        const where: any = {};
        if (systemTypeId) {
            where.systemTypeId = systemTypeId;
        }

        const data = await prisma.component.findMany({
            where,
            include: {
                systemType: {
                    select: { name: true }
                }
            },
            orderBy: { sortOrder: 'asc' }
        });

        // If no data from DB but system type name provided, use defaults
        if ((!data || data.length === 0) && systemTypeName) {
            const defaults = defaultComponents[systemTypeName as keyof typeof defaultComponents];
            if (defaults) {
                return NextResponse.json({ success: true, data: defaults, fromDefaults: true });
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Fetch components error:', error);
        return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
    }
}

// POST - Create new component
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { system_type_id, name, description, default_quantity, default_make, sort_order, is_default } = body;

        if (!name) {
            return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
        }

        const data = await prisma.component.create({
            data: {
                systemTypeId: system_type_id,
                name,
                description: description || null,
                defaultQuantity: default_quantity || '1 NOS',
                defaultMake: default_make || 'Standard',
                sortOrder: sort_order ? parseInt(sort_order) : 0,
                isDefault: is_default ?? true,
            }
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Create component error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PUT - Update component
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, description, default_quantity, default_make, sort_order, is_default } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Component ID is required' }, { status: 400 });
        }

        const data = await prisma.component.update({
            where: { id },
            data: {
                name,
                description,
                defaultQuantity: default_quantity,
                defaultMake: default_make,
                sortOrder: sort_order ? parseInt(sort_order) : undefined,
                isDefault,
            }
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Update component error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE - Delete component
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'Component ID is required' }, { status: 400 });
        }

        await prisma.component.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete component error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
