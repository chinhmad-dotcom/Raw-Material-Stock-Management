export interface SiloDashboardCard {
  siloId: number;
  siloCode: string;
  siloName: string;
  materialId: number;
  materialCode: string;
  materialName: string;
  currentStockTons: number;
  capacityTons: number;
  fillPercent: number;
  dayOnHand: number;
  ageInDays: number;
  maxStorageAgeDays: number;
  agePercent: number;
  isLowStockAlert: boolean;
  isCriticalAgeAlert: boolean;
  isNearExpiryAlert: boolean;
  batchNumber?: string;
}

export interface AdditiveDashboardCard {
  materialId: number;
  materialCode: string;
  materialName: string;
  currentStockTons: number;
  dayOnHand: number;
  ageInDays: number;
  maxStorageAgeDays: number;
  agePercent: number;
  isLowStockAlert: boolean;
  isCriticalAgeAlert: boolean;
  isNearExpiryAlert: boolean;
  warehouseLocation?: string;
}

export interface AlertCard {
  id: number;
  materialName: string;
  alertType: 'LowStock' | 'CriticalAge' | 'NearExpiry';
  severity: 'Info' | 'Warning' | 'Critical';
  message: string;
  currentValue?: number;
  thresholdValue?: number;
  alertDate: string;
  location?: string;
}

export interface DashboardSummary {
  totalActiveSilos: number;
  totalActiveAdditives: number;
  criticalAlertCount: number;
  materials?: any[];
  warningAlertCount: number;
  totalSiloStockTons: number;
  totalAdditiveStockTons: number;
  silos: SiloDashboardCard[];
  additives: AdditiveDashboardCard[];
  activeAlerts: AlertCard[];
  generatedAt: string;
}
