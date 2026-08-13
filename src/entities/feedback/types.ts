export type FeedbackCategory = 'bug' | 'experience' | 'other' | 'suggestion';

export interface CreateFeedbackInput {
  appVersion?: string;
  category: FeedbackCategory;
  contact?: string;
  content: string;
  pageUrl?: string;
}

export interface CreateFeedbackResult {
  id: string;
}
