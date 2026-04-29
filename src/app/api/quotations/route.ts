import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuoteNumber, gstConfig, calculateSavings, getSubsidyForCapacity } from '@/lib/companyDetails';
import { sendKit19Enquiry } from '@/lib/kit19';

// GET - List all quotations
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const data = await prisma.quotation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Fetch quotations error:', error);
        return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 500 });
    }
}

// POST - Create new quotation
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customer_name,
            customer_phone,
            customer_address,
            customer_email,
            system_type_id,
            system_type_name,
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
        } = body;

        if (!customer_name) {
            return NextResponse.json({ success: false, message: 'Customer name is required' }, { status: 400 });
        }

        // Generate quote number from customer initials
        const initials = customer_name
            .split(' ')
            .map((n: string) => n.charAt(0).toUpperCase())
            .join('');
        const quote_number = generateQuoteNumber(initials);

        // Calculate GST and totals
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

        // Resolve system_type_id if not provided but name is available
        let effectiveSystemTypeId = system_type_id;

        if (!effectiveSystemTypeId && system_type_name) {
            const typeData = await prisma.systemType.findUnique({
                where: { name: system_type_name },
                select: { id: true }
            });

            if (typeData) {
                effectiveSystemTypeId = typeData.id;
            }
        }

        const data = await prisma.quotation.create({
            data: {
                quoteNumber: quote_number,
                customerName: customer_name,
                customerPhone: customer_phone || null,
                customerAddress: customer_address || null,
                customerEmail: customer_email || null,
                systemTypeId: effectiveSystemTypeId || null,
                capacityKw: capacity_kw || null,
                phase: phase || 1,
                brand: brand || null,
                basePrice: baseAmount,
                gstRate: effectiveGstRate,
                gstAmount: gst_amount,
                totalAmount: total_amount,
                centralSubsidy: central_subsidy ?? getSubsidyForCapacity(capacity_kw || 3).central,
                stateSubsidy: state_subsidy ?? getSubsidyForCapacity(capacity_kw || 3).state,
                terms: terms || null,
                components: components || null,
                savingsData: savings as any,
                salesperson: salesperson || null,
                status: 'draft',
            }
        });

        // Send Enquiry to Kit19
        try {
            await sendKit19Enquiry({
                name: customer_name,
                phone: customer_phone || "",
                email: customer_email || "",
                address: customer_address || "",
                systemKw: capacity_kw || "",
            });
        } catch (e) {
            console.warn('Kit19 enquiry failed:', e);
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Create quotation error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
