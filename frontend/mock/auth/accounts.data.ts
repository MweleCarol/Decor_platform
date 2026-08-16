import type { User } from "@/stores/auth.store";

export interface MockAccount {
  email: string;
  password: string;
  user: User;
}

// Dev-only preset credentials — not persisted, not secure, mock mode only.
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: "carolynedev@gmail.com",
    password: "caroldev@123",
    user: {
      id: "mock-user-customer",
      email: "carolynedev@gmail.com",
      fullName: "Carolyne Mwikali",
      role: "CUSTOMER",
    },
  },
  {
    email: "carolyneadmin@gmail.com",
    password: "caroladmin@123",
    user: {
      id: "mock-user-admin",
      email: "carolyneadmin@gmail.com",
      fullName: "Admin User",
      role: "ADMIN",
    },
  },
];