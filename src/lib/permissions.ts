export const PERMISSION_MODULES = [
  {
    key: "enquiry",
    label: "Enquiry",
    actions: [
      { key: "view",   label: "View" },
      { key: "create", label: "Add" },
      { key: "edit",   label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "property",
    label: "Property",
    actions: [
      { key: "view",   label: "View" },
      { key: "create", label: "Add" },
      { key: "edit",   label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "deals",
    label: "Property Deals",
    actions: [
      { key: "view",   label: "View" },
      { key: "create", label: "Add" },
      { key: "edit",   label: "Edit" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "master",
    label: "Master Data",
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Add/Edit" },
    ],
  },
  {
    key: "users",
    label: "Users",
    actions: [
      { key: "view",   label: "View" },
      { key: "manage", label: "Manage" },
    ],
  },
  {
    key: "approvals",
    label: "Approvals",
    actions: [
      { key: "view",   label: "View" },
      { key: "manage", label: "Approve/Reject" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    actions: [
      { key: "view", label: "View" },
      { key: "edit", label: "Edit" },
    ],
  },
] as const;

export function parsePermissions(json: string | null | undefined): string[] {
  if (!json) return [];
  try { return JSON.parse(json) as string[]; } catch { return []; }
}

/** Server-side: check if a session user has a given permission. Admin (roleId=1) always passes. */
export function canDo(session: any, perm: string): boolean {
  if (!session?.user) return false;
  const user = session.user as any;
  if (user.roleId === 1) return true;
  return ((user.permissions as string[]) ?? []).includes(perm);
}
