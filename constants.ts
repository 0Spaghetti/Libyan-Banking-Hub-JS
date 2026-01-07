import { Bank, Branch, LiquidityStatus } from './types';

export const BANKS: Bank[] = [
  {
    id: '1',
    name: 'مصرف الجمهورية',
    city: 'Tripoli',
    logoUrl: 'https://picsum.photos/seed/gumhouria/200'
  },
  {
    id: '2',
    name: 'مصرف الوحدة',
    city: 'Benghazi',
    logoUrl: 'https://picsum.photos/seed/wahda/200'
  },
  {
    id: '3',
    name: 'مصرف الصحارى',
    city: 'Tripoli',
    logoUrl: 'https://picsum.photos/seed/sahara/200'
  },
  {
    id: '4',
    name: 'المصرف التجاري الوطني',
    city: 'Misrata',
    logoUrl: 'https://picsum.photos/seed/ncb/200'
  },
  {
    id: '5',
    name: 'مصرف الأمان',
    city: 'Tripoli',
    logoUrl: 'https://picsum.photos/seed/aman/200'
  },
  {
    id: '6',
    name: 'مصرف شمال أفريقيا',
    city: 'Tripoli',
    logoUrl: 'https://picsum.photos/seed/nab/200'
  }
];

export const MOCK_BRANCHES: Branch[] = [
  // Jumhouria
  {
    id: 'b1',
    bankId: '1',
    name: 'فرع الميدان',
    address: 'ميدان الشهداء، طرابلس',
    lat: 32.8872,
    lng: 13.1913,
    isAtm: false,
    status: LiquidityStatus.AVAILABLE,
    lastUpdate: new Date(),
    crowdLevel: 30
  },
  {
    id: 'b2',
    bankId: '1',
    name: 'صراف آلي - شارع عمر المختار',
    address: 'شارع عمر المختار، طرابلس',
    lat: 32.8850,
    lng: 13.1850,
    isAtm: true,
    status: LiquidityStatus.CROWDED,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    crowdLevel: 85
  },
  // Wahda
  {
    id: 'b3',
    bankId: '2',
    name: 'فرع بنغازي الرئيسي',
    address: 'شارع جمال عبد الناصر، بنغازي',
    lat: 32.1194,
    lng: 20.0868,
    isAtm: false,
    status: LiquidityStatus.EMPTY,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    crowdLevel: 10
  },
  // Sahara
  {
    id: 'b4',
    bankId: '3',
    name: 'فرع حي الأندلس',
    address: 'حي الأندلس، طرابلس',
    lat: 32.8680,
    lng: 13.1200,
    isAtm: false,
    status: LiquidityStatus.AVAILABLE,
    lastUpdate: new Date(),
    crowdLevel: 45
  }
];

export const STATUS_COLORS = {
  [LiquidityStatus.AVAILABLE]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  [LiquidityStatus.CROWDED]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  [LiquidityStatus.EMPTY]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  [LiquidityStatus.UNKNOWN]: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
};

export const STATUS_LABELS = {
  [LiquidityStatus.AVAILABLE]: 'سيولة متوفرة',
  [LiquidityStatus.CROWDED]: 'مزدحم',
  [LiquidityStatus.EMPTY]: 'لا توجد سيولة',
  [LiquidityStatus.UNKNOWN]: 'غير معروف',
};