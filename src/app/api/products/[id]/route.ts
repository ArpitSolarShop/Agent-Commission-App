import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth, isAuthError } from '@/lib/api-auth';

type RouteContext = { params: Promise<{ id: string }> };

// GET - Get single product
export async function GET(request: Request, context: RouteContext) {
    try {
        const authResult = await requireApiAuth();
        if (isAuthError(authResult)) return authResult;

        const { id } = await context.params;

        const data = await prisma.product.findUnique({
            where: { id },
            include: { systemType: true }
        });

        if (!data) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Fetch product error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(request: Request, context: RouteContext) {
    try {
        const authResult = await requireApiAuth(["ADMIN"]);
        if (isAuthError(authResult)) return authResult;

        const { id } = await context.params;
        const body = await request.json();
        const { system_type_id, name, brand, capacity_kw, phase, base_price, gst_rate, is_active } = body;

        const data = await prisma.product.update({
            where: { id },
            data: {
                systemTypeId: system_type_id,
                name,
                brand,
                capacityKw: capacity_kw ? parseFloat(capacity_kw) : null,
                phase: phase ? parseInt(phase) : undefined,
                basePrice: base_price ? parseFloat(base_price) : undefined,
                gstRate: gst_rate ? parseFloat(gst_rate) : undefined,
                isActive: is_active,
            }
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Update product error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const authResult = await requireApiAuth(["ADMIN"]);
        if (isAuthError(authResult)) return authResult;

        const { id } = await context.params;

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete product error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
