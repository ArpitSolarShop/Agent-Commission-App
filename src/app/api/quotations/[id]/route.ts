import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gstConfig, calculateSavings } from '@/lib/companyDetails';

type RouteContext = { params: Promise<{ id: string }> };

// GET - Get single quotation
export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        
        const data = await prisma.quotation.findUnique({
            where: { id },
            include: {
                systemType: {
                    select: { name: true }
                }
            }
        });

        if (!data) {
            return NextResponse.json({ success: false, message: 'Quotation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Fetch quotation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PUT - Update quotation
export async function PUT(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const {
            customer_name,
            customer_phone,
            customer_address,
            customer_email,
            system_type_id,
            capacity_kw,
            phase,
            brand,
            base_price,
            gst_rate,
            central_subsidy,
            state_subsidy,
            terms,
            components,
            salesperson,
            status,
        } = body;

        // Recalculate GST and totals
        const effectiveGstRate = gst_rate || gstConfig.compositeRate;
        const baseAmount = base_price || 0;
        const gst_amount = +(baseAmount * (effectiveGstRate / 100)).toFixed(2);
        const total_amount = +(baseAmount + gst_amount).toFixed(2);

        // Calculate savings data
        const savings = calculateSavings(
            capacity_kw || 0,
            total_amount,
            central_subsidy,
            state_subsidy
        );

        const data = await prisma.quotation.update({
            where: { id },
            data: {
                customerName: customer_name,
                customerPhone: customer_phone || null,
                customerAddress: customer_address || null,
                customerEmail: customer_email || null,
                systemTypeId: system_type_id || null,
                capacityKw: capacity_kw || null,
                phase: phase || 1,
                brand: brand || null,
                basePrice: baseAmount,
                gstRate: effectiveGstRate,
                gstAmount: gst_amount,
                totalAmount: total_amount,
                centralSubsidy: central_subsidy || 0,
                stateSubsidy: state_subsidy || 0,
                terms: terms || null,
                components: components || null,
                savingsData: savings as any,
                salesperson: salesperson || null,
                status: status || 'draft',
            }
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Update quotation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// DELETE - Delete quotation
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        
        await prisma.quotation.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete quotation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
