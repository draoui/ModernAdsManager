// Enhanced Ad Types for the All-in-One Ads Management Feature

export type AdType = 'banner' | 'video' | 'native' | 'interstitial' | 'rewarded';
export type AdPlatform = 'facebook' | 'google' | 'twitter' | 'tiktok' | 'instagram' | 'linkedin' | 'custom';
export type AdStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'rejected';
export type AdFrequency = 'once' | 'daily' | 'weekly' | 'monthly';
export type AdBidStrategy = 'manual' | 'auto' | 'target_cpa' | 'target_roas';
export type AdOptimizationGoal = 'clicks' | 'impressions' | 'conversions' | 'app_installs' | 'reach' | 'engagement';

export interface AdDimensions {
  width: number;
  height: number;
}

export interface AdCreative {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  callToAction?: string;
  dimensions?: AdDimensions;
  previewUrl?: string;
  assetUrls?: string[];
}

export interface AdTargeting {
  ageRange: [number, number];
  gender?: 'male' | 'female' | 'all';
  locations: AdLocation[];
  interests: string[];
  languages?: string[];
  devices?: string[];
  behaviors?: string[];
  customAudiences?: string[];
  excludedAudiences?: string[];
  keywords?: string[];
  placements?: string[];
}

export interface AdLocation {
  id: string;
  name: string;
  type: 'country' | 'region' | 'city' | 'postal';
  code?: string;
}

export interface AdSchedule {
  startDate: string;
  endDate?: string;
  frequency?: AdFrequency;
  dayParting?: DayPartingSchedule;
  timeZone?: string;
}

export interface DayPartingSchedule {
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
}

export interface TimeRange {
  start: string; // Format: "HH:MM"
  end: string; // Format: "HH:MM"
}

export interface AdBudget {
  amount: number;
  currency: string;
  type: 'daily' | 'lifetime';
  bidAmount?: number;
  bidStrategy?: AdBidStrategy;
}

export interface AdPerformanceMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpac?: number; // Cost per acquisition/conversion
  spend: number;
  reach?: number;
  frequency?: number;
  engagementRate?: number;
  viewability?: number;
  videoCompletionRate?: number;
  averageWatchTime?: number;
  roi?: number;
  roas?: number;
  conversionRate?: number;
  bounceRate?: number;
}

export interface AdPerformanceHistory {
  date: string;
  metrics: AdPerformanceMetrics;
}

export interface AdChangeHistory {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface Ad {
  id: string;
  name: string;
  description?: string;
  type: AdType;
  platform: AdPlatform;
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  creative: AdCreative;
  targeting: AdTargeting;
  schedule: AdSchedule;
  budget: AdBudget;
  metrics: AdPerformanceMetrics;
  performanceHistory?: AdPerformanceHistory[];
  changeHistory?: AdChangeHistory[];
  optimizationGoal?: AdOptimizationGoal;
  tags?: string[];
  notes?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isArchived?: boolean;
}

export interface AdFilter {
  search?: string;
  status?: AdStatus[];
  type?: AdType[];
  platform?: AdPlatform[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  tags?: string[];
  createdBy?: string[];
  minBudget?: number;
  maxBudget?: number;
  minPerformance?: {
    metric: keyof AdPerformanceMetrics;
    value: number;
  };
}

export interface AdSortOption {
  field: keyof Ad | `metrics.${keyof AdPerformanceMetrics}`;
  direction: 'asc' | 'desc';
}

export interface AdBatchOperation {
  ids: string[];
  operation: 'delete' | 'archive' | 'changeStatus' | 'addTags' | 'removeTags';
  data?: {
    status?: AdStatus;
    tags?: string[];
  };
}

export interface AdsState {
  ads: Ad[];
  filteredAds: Ad[];
  selectedAd: Ad | null;
  filter: AdFilter;
  sort: AdSortOption;
  isLoading: boolean;
  error: string | null;
  performanceData: {
    isLoading: boolean;
    data: AdPerformanceHistory[] | null;
    error: string | null;
  };
  batchOperation: {
    isLoading: boolean;
    success: boolean;
    error: string | null;
  };
}