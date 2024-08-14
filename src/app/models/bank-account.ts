export interface BankAccount {
  id?: number;  // Make id optional
  accountHolder: string;
  iban: string;
  bic?: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}
