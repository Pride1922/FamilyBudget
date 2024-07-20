export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  role: string;
  isActive: boolean;
  createdat: string;
  mfa_enabled: boolean;
  // Add other properties as per your User object
}

