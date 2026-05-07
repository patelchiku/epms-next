import { prisma } from "./prisma";

export async function logActivity(
  userId: number,
  action: "created" | "updated" | "deleted" | "approved" | "rejected",
  entity: "enquiry" | "property" | "deal" | "user" | "approval",
  entityId: number | null,
  title: string
) {
  try {
    await prisma.systemActivity.create({
      data: { userId, action, entity, entityId, title },
    });
    // Auto-cleanup: delete entries older than 30 days (run occasionally)
    if (Math.random() < 0.05) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      await prisma.systemActivity.deleteMany({ where: { createdAt: { lt: cutoff } } });
    }
  } catch {
    // Never fail the parent operation due to logging
  }
}
