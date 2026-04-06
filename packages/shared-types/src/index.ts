// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Family group types
export interface FamilyGroup {
  id: string;
  name: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  id: string;
  familyGroupId: string;
  userId: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

// Goal types
export interface Goal {
  id: string;
  familyGroupId: string;
  title: string;
  targetAmount: number;
  deadline: Date;
  category: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  goalId: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
