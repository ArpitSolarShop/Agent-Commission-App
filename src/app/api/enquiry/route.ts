import { NextResponse } from "next/server";
import { sendKit19Enquiry } from "@/lib/kit19";
import { requireApiAuth, isAuthError } from '@/lib/api-auth';

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth(["ADMIN", "SALESPERSON"]);
    if (isAuthError(authResult)) return authResult;

    const body = await request.json();
    
    // Call the kit19 service we created
    await sendKit19Enquiry({
      name: body.name || body.PersonName,
      phone: body.phone || body.MobileNo,
      email: body.email || body.EmailID,
      address: body.address || body.ResidentialAddress,
      systemKw: body.systemKw || body.InitialRemarks,
      ...body
    });

    return NextResponse.json({ success: true, message: "Enquiry submitted successfully" });
  } catch (error: any) {
    console.error("Error in enquiry route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}
