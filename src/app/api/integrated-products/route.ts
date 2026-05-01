import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { integratedProductSchema } from '@/lib/schemas/integratedProduct';
import { requireApiAuth, isAuthError } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // RBAC: Only ADMIN can create integrated products
    const authResult = await requireApiAuth(["ADMIN"]);
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    const parsed = integratedProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400 });
    }

    const data = await prisma.integratedProduct.create({
      data: {
        brand: parsed.data.brand,
        systemKw: parsed.data.system_kw,
        phase: parsed.data.phase,
        price: parsed.data.price,
        inverterCapacityKw: parsed.data.inverter_capacity_kw,
        moduleWatt: parsed.data.module_watt,
        moduleType: parsed.data.module_type,
        noOfModules: parsed.data.no_of_modules,
        acdbNos: parsed.data.acdb_nos,
        dcdbNos: parsed.data.dcdb_nos,
        earthingRodNos: parsed.data.earthing_rod_nos,
        earthingChemicalNos: parsed.data.earthing_chemical_nos,
        acWireBrand: parsed.data.ac_wire_brand,
        acWireLengthMtr: parsed.data.ac_wire_length_mtr,
        dcWireBrand: parsed.data.dc_wire_brand,
        dcWireLengthMtr: parsed.data.dc_wire_length_mtr,
        earthingWireBrand: parsed.data.earthing_wire_brand,
        earthingWireLengthMtr: parsed.data.earthing_wire_length_mtr,
        lightingArrestorQty: parsed.data.lighting_arrestor_qty,
      }
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Save integrated product error:', err);
    return NextResponse.json({ success: false, message: err?.message ?? 'Failed to save product' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // RBAC: Authenticated users (ADMIN + SALESPERSON) can view
    const authResult = await requireApiAuth(["ADMIN", "SALESPERSON"]);
    if (isAuthError(authResult)) return authResult;

    const data = await prisma.integratedProduct.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Fetch integrated products error:', err);
    return NextResponse.json({ success: false, message: err?.message ?? 'Failed to fetch products' }, { status: 500 });
  }
}
