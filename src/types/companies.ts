export type AccountType = 'Enterprise' | 'SMB' | 'Trial';
export type SubscriptionStatus = 'Active' | 'Inactive' | 'Trial' | 'Suspended';
export type SetupStatus = 'Complete' | 'In Progress' | 'Pending';

export interface Company {
  id: number;
  logo?: string;
  companyName: string;
  companyCode: string;
  accountType: AccountType;
  primaryContact: string;
  primaryContactEmail: string;
  usersCount: number;
  subscriptionStatus: SubscriptionStatus;
  setupStatus: SetupStatus;
  isActive: boolean;
  createdAt: string;
}
