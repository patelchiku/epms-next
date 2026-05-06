import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Roles
  await prisma.role.createMany({
    data: [
      { id: 1, name: "Admin", active: true },
      { id: 2, name: "Staff", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Roles");

  // Admin user
  const hashedPw = await bcrypt.hash("admin@123", 10);
  await prisma.user.upsert({
    where: { mobile: "9999999999" },
    update: {},
    create: {
      firstName: "Admin", lastName: "User",
      email: "admin@topspace.in", mobile: "9999999999",
      password: hashedPw, roleId: 1, isPresent: true,
    },
  });
  console.log("✓ Admin user (9999999999 / admin@123)");

  // Sources
  await prisma.source.createMany({
    data: [
      { id: 1, name: "MagicBricks", active: true },
      { id: 2, name: "Housing.com", active: true },
      { id: 3, name: "99Acres", active: true },
      { id: 4, name: "Walk-in", active: true },
      { id: 5, name: "Referral", active: true },
      { id: 6, name: "Social Media", active: true },
      { id: 7, name: "Google", active: true },
      { id: 8, name: "Cold Call", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Sources");

  // Enquiry Statuses
  await prisma.enquiryStatus.createMany({
    data: [
      { id: 1, name: "Active", active: true },
      { id: 2, name: "Closed", active: true },
      { id: 3, name: "Draft", active: true },
      { id: 4, name: "Not Interested", active: true },
      { id: 5, name: "Follow Up", active: true },
      { id: 6, name: "Site Visit Scheduled", active: true },
      { id: 7, name: "Deal Done", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Enquiry Statuses");

  // Property Statuses
  await prisma.propertyStatus.createMany({
    data: [
      { id: 1, name: "Available", active: true },
      { id: 2, name: "Rented", active: true },
      { id: 3, name: "Sold", active: true },
      { id: 4, name: "Under Negotiation", active: true },
      { id: 5, name: "Draft", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Property Statuses");

  // Property Types
  await prisma.propertyType.createMany({
    data: [
      { id: 1, name: "Flat / Apartment", active: true },
      { id: 2, name: "Independent House", active: true },
      { id: 3, name: "Office Space", active: true },
      { id: 4, name: "Shop / Showroom", active: true },
      { id: 5, name: "Plot / Land", active: true },
      { id: 6, name: "Warehouse / Godown", active: true },
      { id: 7, name: "Bungalow / Villa", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Property Types");

  // Segments
  await prisma.segment.createMany({
    data: [
      { id: 1, name: "Residential", active: true },
      { id: 2, name: "Commercial", active: true },
      { id: 3, name: "Industrial", active: true },
      { id: 4, name: "Agricultural", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Segments");

  // BHK / Office
  await prisma.bhkOffice.createMany({
    data: [
      { id: 1, name: "1 BHK", active: true },
      { id: 2, name: "2 BHK", active: true },
      { id: 3, name: "3 BHK", active: true },
      { id: 4, name: "4 BHK", active: true },
      { id: 5, name: "4+ BHK", active: true },
      { id: 6, name: "Studio", active: true },
      { id: 7, name: "1 Cabin", active: true },
      { id: 8, name: "2 Cabin", active: true },
      { id: 9, name: "Open Office", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ BHK / Office");

  // Budget
  await prisma.budget.createMany({
    data: [
      { id: 1, name: "Under ₹10,000", active: true },
      { id: 2, name: "₹10,000 – ₹20,000", active: true },
      { id: 3, name: "₹20,000 – ₹35,000", active: true },
      { id: 4, name: "₹35,000 – ₹50,000", active: true },
      { id: 5, name: "₹50,000 – ₹1 Lakh", active: true },
      { id: 6, name: "₹1 Lakh – ₹5 Lakh", active: true },
      { id: 7, name: "₹5 Lakh – ₹25 Lakh", active: true },
      { id: 8, name: "₹25 Lakh – ₹50 Lakh", active: true },
      { id: 9, name: "₹50 Lakh – ₹1 Crore", active: true },
      { id: 10, name: "Above ₹1 Crore", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Budget");

  // Areas
  await prisma.area.createMany({
    data: [
      { id: 1, name: "Andheri", active: true },
      { id: 2, name: "Bandra", active: true },
      { id: 3, name: "Borivali", active: true },
      { id: 4, name: "Dadar", active: true },
      { id: 5, name: "Goregaon", active: true },
      { id: 6, name: "Kandivali", active: true },
      { id: 7, name: "Malad", active: true },
      { id: 8, name: "Mira Road", active: true },
      { id: 9, name: "Powai", active: true },
      { id: 10, name: "Thane", active: true },
      { id: 11, name: "Vasai", active: true },
      { id: 12, name: "Virar", active: true },
      { id: 13, name: "Navi Mumbai", active: true },
      { id: 14, name: "Panvel", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Areas");

  // Buildings
  await prisma.building.createMany({
    data: [
      { id: 1, name: "Lotus Heights", active: true },
      { id: 2, name: "Sai Residency", active: true },
      { id: 3, name: "Greenpark Apartments", active: true },
      { id: 4, name: "Sunrise Tower", active: true },
      { id: 5, name: "Oberoi Splendor", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Buildings");

  // Activities
  await prisma.activity.createMany({
    data: [
      { id: 1, name: "Call", isParent: 1, active: true },
      { id: 2, name: "Meeting", isParent: 1, active: true },
      { id: 3, name: "Site Visit", isParent: 1, active: true },
      { id: 4, name: "Email", isParent: 1, active: true },
      { id: 5, name: "WhatsApp", isParent: 1, active: true },
      { id: 6, name: "Interested", isParent: null, active: true },
      { id: 7, name: "Not Interested", isParent: null, active: true },
      { id: 8, name: "Follow Up", isParent: null, active: true },
      { id: 9, name: "Deal Closed", isParent: null, active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Activities");

  // Furniture
  await prisma.furniture.createMany({
    data: [
      { id: 1, name: "Fully Furnished", active: true },
      { id: 2, name: "Semi Furnished", active: true },
      { id: 3, name: "Unfurnished", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Furniture");

  // Measurements
  await prisma.measurement.createMany({
    data: [
      { id: 1, name: "Sq Ft", active: true },
      { id: 2, name: "Sq Mt", active: true },
      { id: 3, name: "Sq Yd", active: true },
      { id: 4, name: "Acre", active: true },
      { id: 5, name: "Guntha", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Measurements");

  // Non-Use Reasons
  await prisma.nonUse.createMany({
    data: [
      { id: 1, name: "Budget Mismatch", active: true },
      { id: 2, name: "Location Not Suitable", active: true },
      { id: 3, name: "Property Already Taken", active: true },
      { id: 4, name: "Client Not Responding", active: true },
      { id: 5, name: "Requirement Changed", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Non-Use Reasons");

  // Draft Reasons
  await prisma.draftReason.createMany({
    data: [
      { id: 1, name: "Incomplete Information", active: true },
      { id: 2, name: "Pending Documents", active: true },
      { id: 3, name: "Under Verification", active: true },
      { id: 4, name: "On Hold by Client", active: true },
    ],
    skipDuplicates: true,
  });
  console.log("✓ Draft Reasons");

  console.log("\n✅ All master data seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
