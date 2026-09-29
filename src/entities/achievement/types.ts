export interface AchievementTitle { code: string; name: string }

export interface AchievementSummary {
  currentTitle: AchievementTitle | null;
  displayedBadgeCodes: string[];
  nextTitle: (AchievementTitle & { requiredRecordDays: number }) | null;
  pendingFeedbackCount: number;
  recordDays: number;
  remainingRecordDays: number;
  reviewMonths: number;
  unlockedBadgeCodes: string[];
}

export interface AchievementBadge {
  code: string;
  isDisplayed: boolean;
  isUnlocked: boolean;
  name: string;
  progress: number;
  requiredRecordDays?: number;
  requiredReviewMonths?: number;
  unlockedAt?: string;
}
