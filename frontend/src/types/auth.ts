export type UserRole = "user" | "admin" | "lottery_staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

export interface LotteryPayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reference: string;
  screenshotUrl: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

export interface GeneratedLotteryNumber {
  id: string;
  drawId: string;
  numbers: number[];
  generatedAt: string;
}

export interface LotteryDrawResult {
  success: boolean;
  numbers: number[];
  drawId: string;
  message: string;
}
