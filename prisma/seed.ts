import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── ROLES ─────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "Admin", active: true } }),
    prisma.role.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: "Manager", active: true } }),
    prisma.role.upsert({ where: { id: 3 }, update: {}, create: { id: 3, name: "Agent", active: true } }),
  ]);
  console.log("✅ Roles:", roles.length);

  // ── AREAS ─────────────────────────────────────────────────────
  const areaNames = ["Satellite", "Prahlad Nagar", "Bodakdev", "Vastrapur", "Navrangpura", "Maninagar", "Thaltej", "Bopal", "South Bopal", "Gota"];
  const areas: any[] = [];
  for (const name of areaNames) {
    const a = await prisma.area.upsert({ where: { id: areaNames.indexOf(name) + 1 }, update: {}, create: { name, active: true } });
    areas.push(a);
  }
  console.log("✅ Areas:", areas.length);

  // ── BUILDINGS ─────────────────────────────────────────────────
  const buildingNames = ["Avalon Heights", "Shivalik Satyamev", "Iscon Platinum", "Mondeal Heights", "Westgate Business Bay", "Titanium City Centre", "One 10 Residency", "Safal Profitaire", "Fortune Business Hub", "GIFT One Tower"];
  const buildings: any[] = [];
  for (let i = 0; i < buildingNames.length; i++) {
    const b = await prisma.building.upsert({ where: { id: i + 1 }, update: {}, create: { name: buildingNames[i], active: true } });
    buildings.push(b);
  }
  console.log("✅ Buildings:", buildings.length);

  // ── PROPERTY TYPES ────────────────────────────────────────────
  const ptNames = ["Residential", "Commercial", "Industrial", "Agricultural"];
  const propertyTypes: any[] = [];
  for (let i = 0; i < ptNames.length; i++) {
    const pt = await prisma.propertyType.upsert({ where: { id: i + 1 }, update: {}, create: { name: ptNames[i], active: true } });
    propertyTypes.push(pt);
  }
  console.log("✅ Property Types:", propertyTypes.length);

  // ── SEGMENTS ──────────────────────────────────────────────────
  const segmentNames = ["Flat", "Row House", "Bungalow", "Duplex", "Penthouse", "Office", "Shop", "Showroom", "Godown", "Plot"];
  const segments: any[] = [];
  for (let i = 0; i < segmentNames.length; i++) {
    const s = await prisma.segment.upsert({ where: { id: i + 1 }, update: {}, create: { name: segmentNames[i], active: true } });
    segments.push(s);
  }
  console.log("✅ Segments:", segments.length);

  // ── BHK / OFFICE ──────────────────────────────────────────────
  const bhkNames = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "1 Office", "2 Office", "Studio"];
  const bhkOffices: any[] = [];
  for (let i = 0; i < bhkNames.length; i++) {
    const b = await prisma.bhkOffice.upsert({ where: { id: i + 1 }, update: {}, create: { name: bhkNames[i], active: true } });
    bhkOffices.push(b);
  }
  console.log("✅ BHK/Office:", bhkOffices.length);

  // ── BUDGET ────────────────────────────────────────────────────
  const budgetNames = ["Up to 20 Lac", "20-40 Lac", "40-60 Lac", "60-80 Lac", "80 Lac - 1 Cr", "1-2 Cr", "2-5 Cr", "5 Cr+", "5k-10k/month", "10k-20k/month", "20k-30k/month", "30k-50k/month", "50k+/month"];
  for (let i = 0; i < budgetNames.length; i++) {
    await prisma.budget.upsert({ where: { id: i + 1 }, update: {}, create: { name: budgetNames[i], active: true } });
  }
  console.log("✅ Budgets:", budgetNames.length);

  // ── SOURCES ───────────────────────────────────────────────────
  const sourceNames = ["MagicBricks", "Housing.com", "99Acres", "JustDial", "Facebook", "Instagram", "Referral", "Walk-in", "Cold Call", "Existing Client"];
  const sources: any[] = [];
  for (let i = 0; i < sourceNames.length; i++) {
    const s = await prisma.source.upsert({ where: { id: i + 1 }, update: {}, create: { name: sourceNames[i], active: true } });
    sources.push(s);
  }
  console.log("✅ Sources:", sources.length);

  // ── ENQUIRY STATUSES ──────────────────────────────────────────
  const eStatusNames = ["Hot", "Warm", "Cold", "Site Visit Done", "Negotiation", "Deal Done", "Not Interested", "On Hold"];
  const enquiryStatuses: any[] = [];
  for (let i = 0; i < eStatusNames.length; i++) {
    const s = await prisma.enquiryStatus.upsert({ where: { id: i + 1 }, update: {}, create: { name: eStatusNames[i], active: true } });
    enquiryStatuses.push(s);
  }
  console.log("✅ Enquiry Statuses:", enquiryStatuses.length);

  // ── PROPERTY STATUSES ─────────────────────────────────────────
  const pStatusNames = ["Available", "Booked", "Sold", "Rented", "Under Renovation", "Blocked"];
  const propertyStatuses: any[] = [];
  for (let i = 0; i < pStatusNames.length; i++) {
    const s = await prisma.propertyStatus.upsert({ where: { id: i + 1 }, update: {}, create: { name: pStatusNames[i], active: true } });
    propertyStatuses.push(s);
  }
  console.log("✅ Property Statuses:", propertyStatuses.length);

  // ── ACTIVITIES ────────────────────────────────────────────────
  const activityNames = ["Call Made", "Site Visit Scheduled", "Site Visit Done", "Proposal Sent", "Negotiation", "Follow Up", "Email Sent", "WhatsApp Sent", "Meeting Done"];
  const activities: any[] = [];
  for (let i = 0; i < activityNames.length; i++) {
    const a = await prisma.activity.upsert({ where: { id: i + 1 }, update: {}, create: { name: activityNames[i], active: true } });
    activities.push(a);
  }
  console.log("✅ Activities:", activities.length);

  // ── FURNITURE ─────────────────────────────────────────────────
  const furnitureNames = ["Unfurnished", "Semi-Furnished", "Fully Furnished", "Fully Furnished with AC"];
  for (let i = 0; i < furnitureNames.length; i++) {
    await prisma.furniture.upsert({ where: { id: i + 1 }, update: {}, create: { name: furnitureNames[i], active: true } });
  }
  console.log("✅ Furniture:", furnitureNames.length);

  // ── MEASUREMENTS ──────────────────────────────────────────────
  const measurementNames = ["Sq Ft", "Sq Mt", "Sq Yd", "Acre", "Hectare"];
  for (let i = 0; i < measurementNames.length; i++) {
    await prisma.measurement.upsert({ where: { id: i + 1 }, update: {}, create: { name: measurementNames[i], active: true } });
  }
  console.log("✅ Measurements:", measurementNames.length);

  // ── NON-USE REASONS ───────────────────────────────────────────
  const nonUseNames = ["No Response", "Number Not Working", "Already Purchased", "Not Interested", "Budget Issue", "Shifted to Another City", "Duplicate Enquiry"];
  for (let i = 0; i < nonUseNames.length; i++) {
    await prisma.nonUse.upsert({ where: { id: i + 1 }, update: {}, create: { name: nonUseNames[i], active: true } });
  }
  console.log("✅ Non-Use Reasons:", nonUseNames.length);

  // ── DRAFT REASONS ─────────────────────────────────────────────
  const draftReasonNames = ["Incomplete Details", "Needs Verification", "Pending Documents", "On Hold by Client", "Under Review"];
  for (let i = 0; i < draftReasonNames.length; i++) {
    await prisma.draftReason.upsert({ where: { id: i + 1 }, update: {}, create: { name: draftReasonNames[i], active: true } });
  }
  console.log("✅ Draft Reasons:", draftReasonNames.length);

  // ── USERS ─────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const agentHash    = await bcrypt.hash("Agent@123", 10);

  const adminUser = await prisma.user.upsert({
    where: { mobile: "9999999999" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@topspace.in",
      mobile: "9999999999",
      password: passwordHash,
      roleId: 1,
      isPresent: true,
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { mobile: "9876543210" },
    update: {},
    create: {
      firstName: "Rahul",
      lastName: "Sharma",
      email: "rahul@topspace.in",
      mobile: "9876543210",
      password: agentHash,
      roleId: 3,
      isPresent: true,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { mobile: "9876543211" },
    update: {},
    create: {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya@topspace.in",
      mobile: "9876543211",
      password: agentHash,
      roleId: 2,
      isPresent: true,
    },
  });

  console.log("✅ Users:", [adminUser, agent1, agent2].length);

  // ── ENQUIRIES ─────────────────────────────────────────────────
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter  = new Date(today); dayAfter.setDate(today.getDate() + 2);
  const lastWeek  = new Date(today); lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today); lastMonth.setDate(today.getDate() - 30);

  const enquiriesData = [
    { clientName: "Amit Shah", mobileNos: JSON.stringify(["9900000001"]), email: "amit@gmail.com", forType: 2, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 3, budget: "60-80 Lac", sourceId: 1, statusId: 1, areaId: 1, nfd: today, userId: adminUser.id, remark: "Looking for 3BHK in Satellite urgently" },
    { clientName: "Neha Joshi", mobileNos: JSON.stringify(["9900000002"]), email: "neha@gmail.com", forType: 1, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 2, budget: "20k-30k/month", sourceId: 2, statusId: 2, areaId: 2, nfd: today, userId: agent1.id, remark: "Needs 2BHK furnished flat on rent" },
    { clientName: "Rajesh Kumar", mobileNos: JSON.stringify(["9900000003", "9900000004"]), email: "rajesh@gmail.com", forType: 2, propertyTypeId: 2, segmentId: 6, bhkOfficeId: 6, budget: "1-2 Cr", sourceId: 3, statusId: 3, areaId: 3, nfd: tomorrow, userId: agent1.id, remark: "Looking for office space in Bodakdev" },
    { clientName: "Sunita Mehta", mobileNos: JSON.stringify(["9900000005"]), email: "sunita@gmail.com", forType: 2, propertyTypeId: 1, segmentId: 3, bhkOfficeId: 4, budget: "2-5 Cr", sourceId: 7, statusId: 4, areaId: 4, nfd: tomorrow, userId: agent2.id, remark: "High end bungalow requirement" },
    { clientName: "Vikram Desai", mobileNos: JSON.stringify(["9900000006"]), forType: 1, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 1, budget: "5k-10k/month", sourceId: 8, statusId: 2, areaId: 5, nfd: dayAfter, userId: adminUser.id, remark: "1 BHK for bachelor student" },
    { clientName: "Kavita Singh", mobileNos: JSON.stringify(["9900000007"]), email: "kavita@gmail.com", forType: 2, propertyTypeId: 1, segmentId: 2, bhkOfficeId: 3, budget: "80 Lac - 1 Cr", sourceId: 6, statusId: 5, areaId: 6, nfd: dayAfter, userId: agent1.id, remark: "Row house near good school" },
    { clientName: "Deepak Parmar", mobileNos: JSON.stringify(["9900000008"]), forType: 2, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 2, budget: "40-60 Lac", sourceId: 5, statusId: 1, areaId: 7, nfd: today, userId: agent2.id, remark: "Ready to move flat" },
    { clientName: "Anita Rao", mobileNos: JSON.stringify(["9900000009"]), email: "anita@gmail.com", forType: 1, propertyTypeId: 2, segmentId: 7, bhkOfficeId: 6, budget: "10k-20k/month", sourceId: 4, statusId: 2, areaId: 8, nfd: lastWeek, userId: adminUser.id, remark: "Shop on rent near market" },
    { clientName: "Manish Gupta", mobileNos: JSON.stringify(["9900000010"]), forType: 2, propertyTypeId: 1, segmentId: 5, bhkOfficeId: 5, budget: "5 Cr+", sourceId: 9, statusId: 1, areaId: 9, nfd: yesterday, userId: agent1.id, remark: "Penthouse with city view" },
    { clientName: "Pooja Trivedi", mobileNos: JSON.stringify(["9900000011"]), email: "pooja@gmail.com", forType: 1, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 3, budget: "30k-50k/month", sourceId: 2, statusId: 3, areaId: 10, nfd: lastMonth, userId: agent2.id, remark: "3BHK fully furnished preferred" },
    { clientName: "Suresh Bhatt", mobileNos: JSON.stringify(["9900000012"]), forType: 2, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 2, budget: "20-40 Lac", sourceId: 10, statusId: 6, areaId: 1, nfd: lastWeek, userId: adminUser.id, remark: "Investment property", isDraft: true, draftReasonId: 1 },
    { clientName: "Ritu Agrawal", mobileNos: JSON.stringify(["9900000013"]), email: "ritu@gmail.com", forType: 2, propertyTypeId: 2, segmentId: 8, bhkOfficeId: 6, budget: "1-2 Cr", sourceId: 1, statusId: 7, areaId: 2, nfd: lastMonth, userId: agent1.id, remark: "Showroom requirement", isNonUse: true, nonUseId: 4 },
    { clientName: "Kiran Patel", mobileNos: JSON.stringify(["9900000014"]), forType: 1, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 2, budget: "10k-20k/month", sourceId: 3, statusId: 2, areaId: 3, nfd: today, userId: agent2.id, remark: "Near Prahlad Nagar preferred" },
    { clientName: "Mahesh Solanki", mobileNos: JSON.stringify(["9900000015"]), email: "mahesh@gmail.com", forType: 2, propertyTypeId: 1, segmentId: 4, bhkOfficeId: 4, budget: "1-2 Cr", sourceId: 7, statusId: 4, areaId: 4, nfd: yesterday, userId: adminUser.id, remark: "Duplex with basement" },
    { clientName: "Seema Shah", mobileNos: JSON.stringify(["9900000016"]), forType: 2, propertyTypeId: 3, segmentId: 9, bhkOfficeId: 6, budget: "2-5 Cr", sourceId: 8, statusId: 1, areaId: 5, nfd: tomorrow, userId: agent1.id, remark: "Warehouse near highway" },
  ];

  const enquiries: any[] = [];
  for (const data of enquiriesData) {
    const e = await prisma.enquiry.create({ data: data as any });
    enquiries.push(e);
  }
  console.log("✅ Enquiries:", enquiries.length);

  // ── ENQUIRY COMMENTS ──────────────────────────────────────────
  const commentsData = [
    { enquiryId: enquiries[0].id, userId: adminUser.id, activityId: 1, remark: "Called client, very interested in 3BHK flat. Will visit on Saturday.", nfd: tomorrow },
    { enquiryId: enquiries[0].id, userId: adminUser.id, activityId: 2, remark: "Site visit scheduled for Avalon Heights", nfd: today },
    { enquiryId: enquiries[1].id, userId: agent1.id, activityId: 1, remark: "Client wants furnished flat only. Sharing options via WhatsApp.", nfd: today },
    { enquiryId: enquiries[2].id, userId: agent1.id, activityId: 3, remark: "Site visit done at Westgate. Client liked Unit 402 but negotiating on price.", nfd: tomorrow },
    { enquiryId: enquiries[3].id, userId: agent2.id, activityId: 5, remark: "Negotiation ongoing. Client's max budget is 2.2 Cr.", nfd: dayAfter },
    { enquiryId: enquiries[4].id, userId: adminUser.id, activityId: 1, remark: "First call made. Student needs 1BHK near CEPT University area.", nfd: dayAfter },
    { enquiryId: enquiries[6].id, userId: agent2.id, activityId: 7, remark: "Sent property brochures via email. Awaiting response.", nfd: tomorrow },
    { enquiryId: enquiries[8].id, userId: agent1.id, activityId: 3, remark: "Site visit done. Client wants more options in Thaltej.", nfd: today },
  ];

  for (const c of commentsData) {
    await prisma.enquiryComment.create({ data: c as any });
  }
  console.log("✅ Enquiry Comments:", commentsData.length);

  // ── PROPERTIES ────────────────────────────────────────────────
  const propertiesData = [
    { userId: adminUser.id, forType: 1, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 3, buildingId: 1, areaId: 1, address: "B-304, Avalon Heights, Satellite", block: "B", flatNumber: "304", superBuiltUp: "1650", carpet: "1200", measurementId: 1, furnitureId: 3, parking: "1 Covered", keyStatus: "Owner", price: "35000", commission: "1 Month Rent", ownerName: "Prashant Bhatt", ownerMobile: "9800000001", sourceId: 7, statusId: 1, remark: "Premium 3BHK with club house access" },
    { userId: agent1.id, forType: 2, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 2, buildingId: 2, areaId: 2, address: "A-1201, Shivalik Satyamev, Prahlad Nagar", block: "A", flatNumber: "1201", superBuiltUp: "1200", carpet: "950", measurementId: 1, furnitureId: 2, parking: "1 Open", keyStatus: "Broker", price: "55 Lac", commission: "1%", ownerName: "Sunil Mehta", ownerMobile: "9800000002", sourceId: 1, statusId: 1, remark: "Good maintained flat, corner unit" },
    { userId: agent2.id, forType: 2, propertyTypeId: 2, segmentId: 6, bhkOfficeId: 6, buildingId: 5, areaId: 3, address: "Unit 405, Westgate Business Bay, Bodakdev", flatNumber: "405", superBuiltUp: "800", carpet: "650", measurementId: 1, furnitureId: 1, parking: "2 Covered", keyStatus: "Owner", price: "1.2 Cr", commission: "2%", ownerName: "Ritesh Kapoor", ownerMobile: "9800000003", sourceId: 3, statusId: 1, remark: "Prime commercial office space" },
    { userId: adminUser.id, forType: 1, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 2, buildingId: 3, areaId: 4, address: "F-502, Iscon Platinum, Vastrapur", block: "F", flatNumber: "502", superBuiltUp: "1100", carpet: "880", measurementId: 1, furnitureId: 3, parking: "1 Covered", keyStatus: "Vacant", price: "28000", commission: "1 Month", ownerName: "Hemali Desai", ownerMobile: "9800000004", sourceId: 8, statusId: 1, remark: "Fully furnished, immediately available" },
    { userId: agent1.id, forType: 2, propertyTypeId: 1, segmentId: 3, bhkOfficeId: 5, buildingId: 4, areaId: 5, address: "Plot 12, Navrangpura", flatNumber: "N/A", superBuiltUp: "4500", carpet: "3800", measurementId: 1, furnitureId: 4, parking: "4 Covered", keyStatus: "Owner", price: "3.5 Cr", commission: "1%", ownerName: "Dinesh Patel", ownerMobile: "9800000005", sourceId: 7, statusId: 1, remark: "Luxury bungalow with private pool" },
    { userId: agent2.id, forType: 1, propertyTypeId: 2, segmentId: 7, bhkOfficeId: 6, buildingId: 6, areaId: 6, address: "GF-12, Titanium City Centre, Maninagar", flatNumber: "GF-12", superBuiltUp: "600", carpet: "480", measurementId: 1, furnitureId: 1, parking: "None", keyStatus: "Owner", price: "45000", commission: "1 Month", ownerName: "Kalpesh Rana", ownerMobile: "9800000006", sourceId: 4, statusId: 1, remark: "Premium retail shop in mall" },
    { userId: adminUser.id, forType: 2, propertyTypeId: 1, segmentId: 1, bhkOfficeId: 1, buildingId: 7, areaId: 7, address: "C-201, One 10 Residency, Thaltej", block: "C", flatNumber: "201", superBuiltUp: "750", carpet: "600", measurementId: 1, furnitureId: 2, parking: "1 Open", keyStatus: "Broker", price: "32 Lac", commission: "0.5%", ownerName: "Suresh Modi", ownerMobile: "9800000007", sourceId: 2, statusId: 2, remark: "Good investment property, tenanted" },
    { userId: agent1.id, forType: 2, propertyTypeId: 2, segmentId: 6, bhkOfficeId: 6, buildingId: 8, areaId: 8, address: "Office 1208, Safal Profitaire, Bopal", flatNumber: "1208", superBuiltUp: "1200", carpet: "950", measurementId: 1, furnitureId: 2, parking: "2 Covered", keyStatus: "Owner", price: "75 Lac", commission: "1%", ownerName: "Paresh Joshi", ownerMobile: "9800000008", sourceId: 3, statusId: 1, remark: "Well fitted office in prime location" },
  ];

  const properties: any[] = [];
  for (const data of propertiesData) {
    const p = await prisma.property.create({ data: data as any });
    properties.push(p);
  }
  console.log("✅ Properties:", properties.length);

  // ── PROPERTY DEALS ────────────────────────────────────────────
  const dealsData = [
    {
      type: "Sale", forType: "Buy", employeeId: adminUser.id, dealDate: "2026-04-15",
      possessionDate: "2026-05-01", propertyName: "Avalon Heights, Satellite",
      flatOffice: "B-304", ownerName: "Prashant Bhatt", ownerNumber: "9800000001",
      propertySource: 7, buyerName: "Amit Shah", buyerNumber: "9900000001",
      buyerSource: 1, bhkOffice: "3 BHK", sqft: "1650", dealAmount: "78 Lac",
      brokerageOwner: "78000", brokerageClient: "78000", addedBy: adminUser.id,
      remark: "Smooth deal. Both parties agreed. Registration pending.",
    },
    {
      type: "Rent", forType: "Rent", employeeId: agent1.id, dealDate: "2026-04-20",
      possessionDate: "2026-05-01", propertyName: "Iscon Platinum, Vastrapur",
      flatOffice: "F-502", ownerName: "Hemali Desai", ownerNumber: "9800000004",
      propertySource: 8, buyerName: "Neha Joshi", buyerNumber: "9900000002",
      buyerSource: 2, bhkOffice: "2 BHK", sqft: "1100", dealAmount: "28000/month",
      brokerageOwner: "28000", brokerageClient: "28000", addedBy: adminUser.id,
      remark: "11 month agreement signed. Keys handed over.",
    },
    {
      type: "Sale", forType: "Buy", employeeId: agent2.id, dealDate: "2026-03-10",
      possessionDate: "2026-06-15", propertyName: "Westgate Business Bay, Bodakdev",
      flatOffice: "405", ownerName: "Ritesh Kapoor", ownerNumber: "9800000003",
      propertySource: 3, buyerName: "Rajesh Kumar", buyerNumber: "9900000003",
      buyerSource: 3, bhkOffice: "Office", sqft: "800", dealAmount: "1.2 Cr",
      brokerageOwner: "1,20,000", brokerageClient: "1,20,000", addedBy: adminUser.id,
      remark: "Commercial deal. GST applicable. Documentation in progress.",
    },
  ];

  const deals: any[] = [];
  for (const data of dealsData) {
    const d = await prisma.propertyDeal.create({ data: data as any });
    deals.push(d);
  }
  console.log("✅ Property Deals:", deals.length);

  // ── DEAL PAYMENTS ─────────────────────────────────────────────
  const paymentsData = [
    { dealId: deals[0].id, paymentType: "Cheque", amount: "78000", date: "2026-04-15", remark: "Token amount received", bankRemark: "HDFC Cheque #123456", userId: adminUser.id },
    { dealId: deals[1].id, paymentType: "UPI", amount: "28000", date: "2026-04-20", remark: "First month rent", bankRemark: "GPay transaction", userId: agent1.id },
    { dealId: deals[1].id, paymentType: "Cheque", amount: "28000", date: "2026-04-20", remark: "Security deposit (1 month)", bankRemark: "SBI Cheque #654321", userId: agent1.id },
    { dealId: deals[2].id, paymentType: "NEFT", amount: "2,40,000", date: "2026-03-10", remark: "Brokerage advance", bankRemark: "ICICI NEFT REF123", userId: agent2.id },
    { dealId: deals[2].id, paymentType: "NEFT", amount: "2,40,000", date: "2026-06-15", remark: "Brokerage balance on possession", bankRemark: "Pending", userId: agent2.id },
  ];

  for (const data of paymentsData) {
    await prisma.propertyDealPayment.create({ data: data as any });
  }
  console.log("✅ Deal Payments:", paymentsData.length);

  // ── PORTAL LEADS (Housing) ────────────────────────────────────
  const housingLeads = [
    { leadName: "Ramesh Trivedi", leadEmail: "ramesh@gmail.com", leadPhone: "9911111101", apartmentNames: "Avalon Heights", serviceType: "Buy", categoryType: "Residential", localityName: "Satellite", cityName: "Ahmedabad", leadDate: "2026-05-05", minPrice: "5000000", maxPrice: "8000000", isRemoved: false },
    { leadName: "Geeta Nair", leadEmail: "geeta@yahoo.com", leadPhone: "9911111102", apartmentNames: "Shivalik Satyamev", serviceType: "Rent", categoryType: "Residential", localityName: "Prahlad Nagar", cityName: "Ahmedabad", leadDate: "2026-05-06", minPrice: "20000", maxPrice: "35000", isRemoved: false },
    { leadName: "Ashok Verma", leadEmail: "ashok@gmail.com", leadPhone: "9911111103", apartmentNames: "Fortune Business Hub", serviceType: "Buy", categoryType: "Commercial", localityName: "Bopal", cityName: "Ahmedabad", leadDate: "2026-05-07", minPrice: "8000000", maxPrice: "15000000", isRemoved: false },
  ];
  for (const data of housingLeads) {
    await prisma.housingEnquiry.create({ data });
  }
  console.log("✅ Housing Leads:", housingLeads.length);

  // ── PORTAL LEADS (99Acres) ────────────────────────────────────
  const acresLeads = [
    { name: "Sanjay Patel", email: "sanjay@gmail.com", phone: "9922222201", user: "Top Space", description: "Looking for 3BHK flat in Bopal. Budget 60-80 lac.", isRemoved: false },
    { name: "Meena Shah", email: "meena@gmail.com", phone: "9922222202", user: "Top Space", description: "Need 2BHK on rent in Navrangpura near metro.", isRemoved: false },
    { name: "Prakash Jain", email: "prakash@gmail.com", phone: "9922222203", user: "Top Space", description: "Commercial office space requirement 1000 sqft in Bodakdev.", isRemoved: false },
  ];
  for (const data of acresLeads) {
    await prisma.acresEnquiry.create({ data });
  }
  console.log("✅ 99Acres Leads:", acresLeads.length);

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("   Admin  → mobile: 9999999999 | password: Admin@123");
  console.log("   Agent1 → mobile: 9876543210 | password: Agent@123");
  console.log("   Agent2 → mobile: 9876543211 | password: Agent@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
