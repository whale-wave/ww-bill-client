export type AgentRecordType = 'add' | 'sub';
export type AgentMetric = 'expense' | 'income' | 'net';
export type AgentChartType = 'bar' | 'donut' | 'line' | 'metric';

export interface AgentCategory {
  icon: string;
  id: number;
  name: string;
  type: AgentRecordType;
}

export interface AgentRecordDraft {
  amount: string;
  categoryId: number;
  remark: string;
  tagIds?: string[];
  time: string;
  type: AgentRecordType;
}

export interface AgentRecordDraftCard {
  actionId: string;
  category: AgentCategory;
  kind: 'RECORD_DRAFT';
  record: AgentRecordDraft;
  status: 'CANCELLED' | 'EXPIRED' | 'PENDING';
  version: 1;
}

export interface AgentRecordResultCard {
  actionId: string;
  category: AgentCategory;
  kind: 'RECORD_RESULT';
  record: AgentRecordDraft & { id: number; version: number };
  status: 'CONFIRMED';
  version: 1;
}

export interface AgentChartPoint {
  amount: string;
  key: string;
  label: string;
}

export interface AgentStatisticCard {
  category?: AgentCategory;
  chartType: AgentChartType;
  endDate: string;
  kind: 'STATISTIC';
  metric: AgentMetric;
  points: AgentChartPoint[];
  recordCount: number;
  startDate: string;
  totalAmount: string;
  version: 1;
}

export type AgentCard = AgentRecordDraftCard | AgentRecordResultCard | AgentStatisticCard;

export interface AgentMessage {
  card?: AgentCard | null;
  content: string;
  conversationId: string;
  createdAt: string;
  id: string;
  role: 'ASSISTANT' | 'USER';
  status: 'COMPLETE' | 'FAILED' | 'STREAMING';
}

export interface AgentConversation {
  createdAt: string;
  id: string;
  lastMessageAt: string;
  ledgerId: string;
  title: string;
}

export interface AgentPage<T> {
  data: T[];
  nextCursor?: string;
}

export type AgentStreamEvent
  = | { event: 'message.started'; data: { assistantMessageId: string; userMessage: AgentMessage } }
    | { event: 'text.delta'; data: { delta: string } }
    | { event: 'card.ready'; data: { card: AgentCard } }
    | { event: 'message.completed'; data: { message: AgentMessage } }
    | { event: 'error'; data: { message: string } };

export interface AgentRecordEditorLocationState {
  agentRecordDraft: {
    actionId: string;
    category: AgentCategory;
    conversationId: string;
    record: AgentRecordDraft;
  };
}

export function createAgentRecordEditorState(
  card: AgentRecordDraftCard,
  conversationId: string,
): AgentRecordEditorLocationState {
  return {
    agentRecordDraft: {
      actionId: card.actionId,
      category: card.category,
      conversationId,
      record: card.record,
    },
  };
}

export function readAgentRecordEditorState(value: unknown): AgentRecordEditorLocationState | undefined {
  if (typeof value !== 'object' || value === null || !('agentRecordDraft' in value))
    return;
  const draft = value.agentRecordDraft;
  if (typeof draft !== 'object' || draft === null
    || !('actionId' in draft) || typeof draft.actionId !== 'string'
    || !('conversationId' in draft) || typeof draft.conversationId !== 'string'
    || !('record' in draft) || typeof draft.record !== 'object' || draft.record === null
    || !('category' in draft) || typeof draft.category !== 'object' || draft.category === null) {
    return;
  }
  return value as AgentRecordEditorLocationState;
}
