export interface MockCustomer {
  id: string;
  fullName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  emailVerified: boolean;
  aiGenerationsThisMonth: number;
  createdAt: string; // ISO date
}

// Registered customers who also appear as the `user` on seeded mock
// orders (mock/orders/orders.data.ts) — their order counts are derived
// dynamically in index.ts so the two datasets can't drift out of sync.
export const CUSTOMERS: MockCustomer[] = [
  { id: "cust-01", fullName: "Carolyne Mwikali", email: "customer@decor.test",  role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 2, createdAt: "2026-01-14" },
  { id: "cust-02", fullName: "Admin User",       email: "admin@decor.test",    role: "ADMIN",    emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2025-11-02" },
  { id: "cust-03", fullName: "Faith Njeri",      email: "faith.njeri@example.com",  role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 1, createdAt: "2026-02-20" },
  { id: "cust-04", fullName: "Diana Achieng",    email: "diana.a@example.com",      role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 3, createdAt: "2026-03-05" },
  { id: "cust-05", fullName: "Grace Wambui",     email: "grace.w@example.com",      role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2026-01-29" },
  { id: "cust-06", fullName: "Samuel Kiprop",    email: "samuel.k@example.com",     role: "CUSTOMER", emailVerified: false, aiGenerationsThisMonth: 0, createdAt: "2026-04-11" },
  { id: "cust-07", fullName: "Otieno Ochieng",   email: "otieno.o@example.com",     role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 1, createdAt: "2026-02-08" },
  { id: "cust-08", fullName: "Anne Mbeki",       email: "anne.mbeki@example.com",   role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 2, createdAt: "2025-12-18" },
  { id: "cust-09", fullName: "Sarah Mumbi",      email: "sarah.mumbi@example.com",  role: "CUSTOMER", emailVerified: false, aiGenerationsThisMonth: 0, createdAt: "2026-05-02" },
  { id: "cust-10", fullName: "Peter Mutua",      email: "peter.mutua@example.com",  role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2026-03-22" },
  { id: "cust-11", fullName: "Mercy Chebet",     email: "mercy.chebet@example.com", role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 3, createdAt: "2026-01-06" },
  { id: "cust-12", fullName: "James Karanja",    email: "james.k@example.com",      role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 1, createdAt: "2026-04-30" },
  { id: "cust-13", fullName: "Victor Njuguna",   email: "victor.n@example.com",     role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2025-10-25" },
  { id: "cust-14", fullName: "Esther Wairimu",   email: "esther.w@example.com",     role: "CUSTOMER", emailVerified: false, aiGenerationsThisMonth: 0, createdAt: "2026-02-14" },
  { id: "cust-15", fullName: "Collins Barasa",   email: "collins.b@example.com",    role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 2, createdAt: "2025-09-19" },
  { id: "cust-16", fullName: "Tom Kiplagat",     email: "tom.k@example.com",        role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2026-03-11" },
  { id: "cust-17", fullName: "Amina Wanjiru",    email: "amina.w@example.com",      role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 1, createdAt: "2026-04-02" },
  // Registered but haven't ordered yet — exercises the 0-orders / unverified states
  { id: "cust-18", fullName: "Lucy Njoroge",     email: "lucy.njoroge@example.com", role: "CUSTOMER", emailVerified: false, aiGenerationsThisMonth: 1, createdAt: "2026-06-10" },
  { id: "cust-19", fullName: "Brian Kamau",      email: "brian.kamau@example.com",  role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2026-06-22" },
  { id: "cust-20", fullName: "Winnie Adhiambo",  email: "winnie.a@example.com",     role: "CUSTOMER", emailVerified: false, aiGenerationsThisMonth: 2, createdAt: "2026-07-01" },
  { id: "cust-21", fullName: "Dennis Otieno",    email: "dennis.o@example.com",     role: "CUSTOMER", emailVerified: true,  aiGenerationsThisMonth: 0, createdAt: "2026-07-15" },
];