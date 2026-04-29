export async function sendKit19Enquiry(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  systemKw?: string | number;
  [key: string]: any;
}) {
  const payload = {
    PersonName: data.name || "Test",
    CompanyName: "",
    MobileNo: data.phone || "",
    MobileNo1: "",
    MobileNo2: "",
    EmailID: data.email || "",
    EmailID1: "",
    EmailID2: "",
    City: "",
    State: "",
    Country: "India",
    CountryCode: "+91",
    CountryCode1: "",
    CountryCode2: "",
    PinCode: "",
    ResidentialAddress: data.address || "",
    OfficeAddress: "",
    SourceName: "website",
    MediumName: "Landing Page",
    CampaignName: "Form Name",
    InitialRemarks: data.systemKw ? `System Size: ${data.systemKw} KW` : "",
    Profession: "",
    Age: "",
    Location: data.address || "",
  };

  const url = process.env.KIT19_API_URL || "https://sipapi.kit19.com/Enquiry/Add";
  const authKey = process.env.KIT19_AUTH_KEY || "4e7bb26557334f91a21e56a4ea9c8752";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "kit19-Auth-Key": authKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Kit19 API error:", response.status, await response.text());
    } else {
      const result = await response.json();
      console.log("Kit19 Success:", result);
    }
  } catch (err) {
    console.error("Failed to send kit19 enquiry", err);
  }
}
