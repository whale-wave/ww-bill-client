export type FeedbackCategory = 'bug' | 'suggestion';

export interface CreateFeedbackInput {
  appVersion?: string;
  category: FeedbackCategory;
  contact?: string;
  content: string;
  pageUrl?: string;
  attachments?: string[];
}

export interface CreateFeedbackResult {
  id: string;
}
