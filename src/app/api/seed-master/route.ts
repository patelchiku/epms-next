import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.role.createMany({ data: [{ id: 1, name: "Admin", active: true }, { id: 2, name: "Staff", active: true }], skipDuplicates: true });
    const hp = await bcrypt.hash("admin@123", 10);
    await prisma.user.upsert({ where: { mobile: "9999999999" }, update: {}, create: { firstName: "Admin", lastName: "User", email: "admin@topspace.in", mobile: "9999999999", password: hp, roleId: 1, isPresent: true } });
    await prisma.source.createMany({ data: [{ id: 1, name: "MagicBricks" }, { id: 2, name: "Housing.com" }, { id: 3, name: "99Acres" }, { id: 4, name: "Walk-in" }, { id: 5, name: "Referral" }, { id: 6, name: "Social Media" }, { id: 7, name: "Google" }, { id: 8, name: "Cold Call" }], skipDuplicates: true });
    await prisma.enquiryStatus.createMany({ data: [{ id: 1, name: "Active" }, { id: 2, name: "Closed" }, { id: 3, name: "Draft" }, { id: 4, name: "Not Interested" }, { id: 5, name: "Follow Up" }, { id: 6, name: "Site Visit Scheduled" }, { id: 7, name: "Deal Done" }], skipDuplicates: true });
    await prisma.propertyStatus.createMany({ data: [{ id: 1, name: "Available" }, { id: 2, name: "Rented" }, { id: 3, name: "Sold" }, { id: 4, name: "Under Negotiation" }, { id: 5, name: "Draft" }], skipDuplicates: true });
    await prisma.propertyType.createMany({ data: [{ id: 1, name: "Flat / Apartment" }, { id: 2, name: "Independent House" }, { id: 3, name: "Office Space" }, { id: 4, name: "Shop / Showroom" }, { id: 5, name: "Plot / Land" }, { id: 6, name: "Warehouse / Godown" }, { id: 7, name: "Bungalow / Villa" }], skipDuplicates: true });
    await prisma.segment.createMany({ data: [{ id: 1, name: "Residential" }, { id: 2, name: "Commercial" }, { id: 3, name: "Industrial" }, { id: 4, name: "Agricultural" }], skipDuplicates: true });
    await prisma.bhkOffice.createMany({ data: [{ id: 1, name: "1 BHK" }, { id: 2, name: "2 BHK" }, { id: 3, name: "3 BHK" }, { id: 4, name: "4 BHK" }, { id: 5, name: "4+ BHK" }, { id: 6, name: "Studio" }, { id: 7, name: "1 Cabin" }, { id: 8, name: "2 Cabin" }, { id: 9, name: "Open Office" }], skipDuplicates: true });
    await prisma.budget.createMany({ data: [{ id: 1, name: "Under ₹10,000" }, { id: 2, name: "₹10,000 – ₹20,000" }, { id: 3, name: "₹20,000 – ₹35,000" }, { id: 4, name: "₹35,000 – ₹50,000" }, { id: 5, name: "₹50,000 – ₹1 Lakh" }, { id: 6, name: "₹1 Lakh – ₹5 Lakh" }, { id: 7, name: "₹5 Lakh – ₹25 Lakh" }, { id: 8, name: "₹25 Lakh – ₹50 Lakh" }, { id: 9, name: "₹50 Lakh – ₹1 Crore" }, { id: 10, name: "Above ₹1 Crore" }], skipDuplicates: true });
    await prisma.area.createMany({ data: [{ id: 1, name: "Andheri" }, { id: 2, name: "Bandra" }, { id: 3, name: "Borivali" }, { id: 4, name: "Dadar" }, { id: 5, name: "Goregaon" }, { id: 6, name: "Kandivali" }, { id: 7, name: "Malad" }, { id: 8, name: "Mira Road" }, { id: 9, name: "Powai" }, { id: 10, name: "Thane" }, { id: 11, name: "Vasai" }, { id: 12, name: "Virar" }, { id: 13, name: "Navi Mumbai" }, { id: 14, name: "Panvel" }], skipDuplicates: true });
    await prisma.building.createMany({ data: [{ id: 1, name: "Lotus Heights" }, { id: 2, name: "Sai Residency" }, { id: 3, name: "Greenpark Apartments" }, { id: 4, name: "Sunrise Tower" }, { id: 5, name: "Oberoi Splendor" }], skipDuplicates: true });
    await prisma.activity.createMany({ data: [{ id: 1, name: "Call", isParent: 1 }, { id: 2, name: "Meeting", isParent: 1 }, { id: 3, name: "Site Visit", isParent: 1 }, { id: 4, name: "Email", isParent: 1 }, { id: 5, name: "WhatsApp", isParent: 1 }, { id: 6, name: "Interested" }, { id: 7, name: "Not Interested" }, { id: 8, name: "Follow Up" }, { id: 9, name: "Deal Closed" }], skipDuplicates: true });
    await prisma.furniture.createMany({ data: [{ id: 1, name: "Fully Furnished" }, { id: 2, name: "Semi Furnished" }, { id: 3, name: "Unfurnished" }], skipDuplicates: true });
    await prisma.measurement.createMany({ data: [{ id: 1, name: "Sq Ft" }, { id: 2, name: "Sq Mt" }, { id: 3, name: "Sq Yd" }, { id: 4, name: "Acre" }, { id: 5, name: "Guntha" }], skipDuplicates: true });
    await prisma.nonUse.createMany({ data: [{ id: 1, name: "Budget Mismatch" }, { id: 2, name: "Location Not Suitable" }, { id: 3, name: "Property Already Taken" }, { id: 4, name: "Client Not Responding" }, { id: 5, name: "Requirement Changed" }], skipDuplicates: true });
    await prisma.draftReason.createMany({ data: [{ id: 1, name: "Incomplete Information" }, { id: 2, name: "Pending Documents" }, { id: 3, name: "Under Verification" }, { id: 4, name: "On Hold by Client" }], skipDuplicates: true });
    return NextResponse.json({ ok: true, message: "All master data seeded" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
