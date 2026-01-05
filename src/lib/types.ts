export interface SavingsRecord {
  value: number;
  saved: boolean;
  date: string;
  day: number;
}

export interface Goal {
  id: number;
  name: string;
  amount: number;
  color: string;
}