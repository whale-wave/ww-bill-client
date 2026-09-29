import type { AchievementBadge, AchievementSummary } from './types';
import type { SuccessResponse } from '@/shared/api';
import { request } from '@/shared/api';

export function getAchievementSummaryApi() {
  return request.get<unknown, SuccessResponse<AchievementSummary>>('/achievement/summary', { silent: true });
}

export function getAchievementBadgesApi() {
  return request.get<unknown, SuccessResponse<AchievementBadge[]>>('/achievement/badges', { silent: true });
}

export function putAchievementDisplayApi(badgeCodes: string[]) {
  return request.put<unknown, SuccessResponse<{ displayedBadgeCodes: string[] }>>('/achievement/display', { badgeCodes });
}

export function postAchievementFeedbackClaimApi() {
  return request.post<unknown, SuccessResponse<{ rewards: Array<{ code: string; kind: string }> }>>('/achievement/feedback/claim');
}

export function postAchievementMonthReviewApi(data: { householdId?: string; ledgerId?: string; month: string }) {
  return request.post<unknown, SuccessResponse<unknown>>('/achievement/month-review', data);
}
