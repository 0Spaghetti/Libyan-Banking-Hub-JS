export enum LiquidityStatus {
  AVAILABLE = 'AVAILABLE',
  CROWDED = 'CROWDED',
  EMPTY = 'EMPTY',
  UNKNOWN = 'UNKNOWN'
}

export interface Bank {
  id: string;
  name: string;
  logoUrl: string; // Using placeholder or generic icon
  city: string;
}

export interface Branch {
  id: string;
  bankId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isAtm: boolean;
  status: LiquidityStatus;
  lastUpdate: Date;
  crowdLevel: number; // 0-100
}

export interface Report {
  id: string;
  branchId: string;
  status: LiquidityStatus;
  timestamp: Date;
  userId: string;
}

export type ViewState = 'SPLASH' | 'AUTH' | 'HOME' | 'BANK_DETAILS' | 'MAP' | 'ADD_DATA';