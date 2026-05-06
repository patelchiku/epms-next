export type SessionUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  roleId: number;
  roleName: string;
  profilePic?: string | null;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
