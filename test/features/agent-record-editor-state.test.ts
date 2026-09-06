import { describe, expect, it } from 'vitest';
import {
  createAgentRecordEditorState,
  readAgentRecordEditorState,
} from '@/entities/agent';

describe('agent record editor navigation state', () => {
  it('keeps the action and conversation identity with the editable draft', () => {
    const state = createAgentRecordEditorState({
      actionId: 'action-1',
      category: { icon: 'dining', id: 3, name: '餐饮', type: 'sub' },
      kind: 'RECORD_DRAFT',
      record: {
        amount: '25.00',
        categoryId: 3,
        remark: '午饭',
        time: '2026-09-06T12:00:00+08:00',
        type: 'sub',
      },
      status: 'PENDING',
      version: 1,
    }, 'conversation-1');

    expect(readAgentRecordEditorState(state)).toEqual(state);
    expect(state.agentRecordDraft.conversationId).toBe('conversation-1');
  });

  it('rejects partial route state instead of opening an unrelated draft', () => {
    expect(readAgentRecordEditorState({ agentRecordDraft: { actionId: 'action-1' } })).toBeUndefined();
  });
});
