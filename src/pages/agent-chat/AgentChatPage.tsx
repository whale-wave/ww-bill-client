import type { AgentMessage, AgentRecordDraftCard, AgentStatisticCard } from '@/entities/agent';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { History, MessageCircleMore, Plus, SendHorizontal, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  agentKeys,
  createAgentRecordEditorState,
  streamAgentMessageApi,
  useAgentConversationsQuery,
  useAgentMessagesQuery,
  useCancelAgentActionMutation,
  useConfirmAgentActionMutation,
  useCreateAgentConversationMutation,
} from '@/entities/agent';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { AppBottomSheet, PageHeader, PageLoadingState } from '@/shared/ui';
import { AgentCardView } from './ui/AgentCardView';

interface PendingTurn {
  assistant: AgentMessage;
  user: AgentMessage;
}

function createTemporaryMessage(conversationId: string, role: AgentMessage['role'], content: string): AgentMessage {
  return {
    content,
    conversationId,
    createdAt: new Date().toISOString(),
    id: `temporary-${role.toLowerCase()}-${Date.now()}`,
    role,
    status: role === 'ASSISTANT' ? 'STREAMING' : 'COMPLETE',
  };
}

function AgentChatPage() {
  const { t } = useTranslation('agent');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationsQuery = useAgentConversationsQuery();
  const createConversation = useCreateAgentConversationMutation();
  const confirmAction = useConfirmAgentActionMutation();
  const cancelAction = useCancelAgentActionMutation();
  const requestedConversationId = searchParams.get('conversationId');
  const activeConversationId = useMemo(() => {
    if (requestedConversationId && conversationsQuery.data.some(item => item.id === requestedConversationId))
      return requestedConversationId;
    return conversationsQuery.data[0]?.id;
  }, [conversationsQuery.data, requestedConversationId]);
  const messagesQuery = useAgentMessagesQuery(activeConversationId);
  const [input, setInput] = useState('');
  const [pendingTurn, setPendingTurn] = useState<PendingTurn>();
  const [historyVisible, setHistoryVisible] = useState(false);
  const hasCreatedInitialConversationRef = useRef(false);
  const streamAbortControllerRef = useRef<AbortController>();
  const endRef = useRef<HTMLDivElement>(null);

  const selectConversation = useCallback((conversationId: string) => {
    setSearchParams({ conversationId }, { replace: true });
    setHistoryVisible(false);
  }, [setSearchParams]);

  const handleNewConversation = useCallback(async () => {
    try {
      const conversation = await createConversation.mutateAsync();
      selectConversation(conversation.id);
    }
    catch {
      Toast.show({ content: t('loadFailed'), icon: 'fail' });
    }
  }, [createConversation, selectConversation, t]);

  useEffect(() => {
    if (conversationsQuery.isLoading || conversationsQuery.isError || conversationsQuery.data.length > 0
      || createConversation.isLoading || hasCreatedInitialConversationRef.current) {
      return;
    }
    hasCreatedInitialConversationRef.current = true;
    void handleNewConversation();
  }, [conversationsQuery.data.length, conversationsQuery.isError, conversationsQuery.isLoading, createConversation.isLoading, handleNewConversation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: pendingTurn ? 'smooth' : 'auto', block: 'end' });
  }, [messagesQuery.data.length, pendingTurn]);

  useEffect(() => () => streamAbortControllerRef.current?.abort(), []);

  const handleSend = useCallback(async (suggestedContent?: string) => {
    const content = (suggestedContent ?? input).trim();
    if (!content || !activeConversationId || pendingTurn)
      return;
    setInput('');
    setPendingTurn({
      assistant: createTemporaryMessage(activeConversationId, 'ASSISTANT', ''),
      user: createTemporaryMessage(activeConversationId, 'USER', content),
    });
    const abortController = new AbortController();
    streamAbortControllerRef.current = abortController;
    try {
      await streamAgentMessageApi({
        content,
        conversationId: activeConversationId,
        onEvent: (event) => {
          if (event.event === 'message.started') {
            setPendingTurn(current => current
              ? { ...current, assistant: { ...current.assistant, id: event.data.assistantMessageId }, user: event.data.userMessage }
              : current);
          }
          if (event.event === 'text.delta') {
            setPendingTurn(current => current
              ? { ...current, assistant: { ...current.assistant, content: current.assistant.content + event.data.delta } }
              : current);
          }
          if (event.event === 'card.ready') {
            setPendingTurn(current => current
              ? { ...current, assistant: { ...current.assistant, card: event.data.card } }
              : current);
          }
          if (event.event === 'message.completed') {
            setPendingTurn(current => current ? { ...current, assistant: event.data.message } : current);
          }
          if (event.event === 'error')
            throw new Error(event.data.message);
        },
        signal: abortController.signal,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: agentKeys.messages(activeConversationId) }),
        queryClient.invalidateQueries({ queryKey: agentKeys.conversations() }),
      ]);
      setPendingTurn(undefined);
    }
    catch {
      setPendingTurn(undefined);
      setInput(content);
      Toast.show({ content: t('sendFailed'), icon: 'fail' });
    }
    finally {
      if (streamAbortControllerRef.current === abortController)
        streamAbortControllerRef.current = undefined;
    }
  }, [activeConversationId, input, pendingTurn, queryClient, t]);

  const handleConfirm = useCallback(async (card: AgentRecordDraftCard) => {
    try {
      await confirmAction.mutateAsync({ actionId: card.actionId });
      Toast.show({ content: t('confirmed'), icon: 'success' });
    }
    catch {
      Toast.show({ content: t('confirmFailed'), icon: 'fail' });
    }
  }, [confirmAction, t]);

  const handleCancel = useCallback(async (card: AgentRecordDraftCard) => {
    await cancelAction.mutateAsync(card.actionId).catch(() => Toast.show({ content: t('confirmFailed'), icon: 'fail' }));
  }, [cancelAction, t]);

  const handleViewRecords = useCallback((card: AgentStatisticCard) => {
    const endDate = dayjs(card.endDate).subtract(1, 'day').format('YYYY-MM-DD');
    const params = new URLSearchParams({
      endDate,
      startDate: dayjs(card.startDate).format('YYYY-MM-DD'),
    });
    if (card.metric !== 'net')
      params.set('type', card.metric === 'income' ? 'add' : 'sub');
    if (card.category)
      params.set('categoryIds', String(card.category.id));
    navigate(`${ROUTES_PATH.SEARCH_RECORD.getPath()}?${params}`);
  }, [navigate]);

  const visibleMessages = pendingTurn
    ? [...messagesQuery.data, pendingTurn.user, pendingTurn.assistant]
    : messagesQuery.data;
  const activeConversation = conversationsQuery.data.find(item => item.id === activeConversationId);

  return (
    <div className="page-new flex h-[100dvh] flex-col overflow-hidden bg-ww-bg">
      <PageHeader
        backLabel={t('back')}
        onBack={() => navigate(ROUTES_PATH.DETAIL.getPath())}
        right={(
          <div className="flex gap-2">
            <button aria-label={t('history')} className="flex h-11 w-11 items-center justify-center rounded-full border border-solid border-border-primary bg-ww-surface text-primary-deep shadow-ww-xs disabled:opacity-40" disabled={Boolean(pendingTurn)} onClick={() => setHistoryVisible(true)} type="button">
              <History size={18} />
            </button>
            <button aria-label={t('newConversation')} className="flex h-11 w-11 items-center justify-center rounded-full border border-solid border-border-primary bg-ww-surface text-primary-deep shadow-ww-xs disabled:opacity-40" disabled={createConversation.isLoading || Boolean(pendingTurn)} onClick={() => void handleNewConversation()} type="button">
              <Plus size={19} />
            </button>
          </div>
        )}
        title={activeConversation?.title === '新对话' ? t('title') : (activeConversation?.title ?? t('title'))}
      />

      <main className="min-h-0 flex-1 overflow-y-auto px-[var(--ww-page-gutter)] pb-5">
        {(conversationsQuery.isLoading || (!activeConversationId && createConversation.isLoading)) && <PageLoadingState label={t('sending')} />}
        {conversationsQuery.isError && <p className="py-20 text-center text-sm font-semibold text-feedback-danger">{t('loadFailed')}</p>}
        {activeConversationId && messagesQuery.isLoading && <PageLoadingState compact label={t('sending')} />}
        {!messagesQuery.isLoading && visibleMessages.length === 0 && (
          <div className="flex min-h-full flex-col items-center justify-center pb-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary text-white shadow-ww-lg"><Sparkles size={27} /></div>
            <h2 className="mb-0 mt-5 text-[21px] font-black tracking-[-0.03em] text-ww-ink">{t('welcomeTitle')}</h2>
            <p className="mt-2 max-w-[290px] text-[13px] font-semibold leading-6 text-ww-mid">{t('welcomeDescription')}</p>
            <div className="mt-6 grid w-full gap-2">
              {['exampleExpense', 'exampleSummary', 'exampleTrend'].map(key => (
                <button key={key} className="rounded-2xl border border-solid border-border-primary bg-ww-surface px-4 py-3 text-left text-[13px] font-bold text-ww-ink shadow-ww-xs" onClick={() => void handleSend(t(key))} type="button">
                  {t(key)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-4 pt-3">
          {messagesQuery.hasNextPage && (
            <button
              className="mx-auto flex min-h-11 items-center justify-center rounded-full border-0 bg-transparent px-4 text-[12px] font-bold text-primary-deep"
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => void messagesQuery.fetchNextPage()}
              type="button"
            >
              {t(messagesQuery.isFetchingNextPage ? 'loadingMore' : 'loadOlder')}
            </button>
          )}
          {visibleMessages.map(message => (
            <div className={message.role === 'USER' ? 'flex justify-end' : 'flex justify-start'} key={message.id}>
              <div className={message.role === 'USER' ? 'max-w-[82%]' : 'w-full max-w-[92%]'}>
                <div className={message.role === 'USER'
                  ? 'rounded-[20px] rounded-br-md bg-primary px-4 py-3 text-[14px] font-semibold leading-6 text-white shadow-ww'
                  : 'flex items-start gap-2'}
                >
                  {message.role === 'ASSISTANT' && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-deep"><MessageCircleMore size={17} /></span>}
                  <div className={message.role === 'ASSISTANT' ? 'min-w-0 flex-1 pt-1 text-[14px] font-semibold leading-6 text-ww-ink' : ''}>
                    {message.content || (message.status === 'STREAMING' ? t('sending') : '')}
                    {message.card && (
                      <AgentCardView
                        card={message.card}
                        isCancelling={cancelAction.isLoading
                          && 'actionId' in message.card
                          && cancelAction.variables === message.card.actionId}
                        isConfirming={confirmAction.isLoading
                          && 'actionId' in message.card
                          && confirmAction.variables?.actionId === message.card.actionId}
                        onCancelDraft={card => void handleCancel(card)}
                        onConfirmDraft={card => void handleConfirm(card)}
                        onEditDraft={card => activeConversationId && navigate(ROUTES_PATH.BOOKKEEPING.getPath(), { state: createAgentRecordEditorState(card, activeConversationId) })}
                        onEditRecord={id => navigate(`/editing/${id}`)}
                        onViewRecords={handleViewRecords}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </main>

      <form
        className="shrink-0 border-0 border-t border-solid border-border-primary bg-ww-surface/90 px-[var(--ww-page-gutter)] pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <div className="flex items-end gap-2 rounded-[22px] border border-solid border-border-primary bg-ww-surface-raised p-2 shadow-ww">
          <textarea aria-label={t('inputPlaceholder')} className="max-h-28 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[14px] font-semibold leading-6 text-ww-ink outline-none placeholder:text-ww-soft" disabled={!activeConversationId || Boolean(pendingTurn)} maxLength={500} onChange={event => setInput(event.target.value)} placeholder={t('inputPlaceholder')} rows={1} value={input} />
          <button aria-label={t('send')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-0 bg-primary text-white disabled:opacity-40" disabled={!input.trim() || !activeConversationId || Boolean(pendingTurn)} type="submit">
            <SendHorizontal size={18} />
          </button>
        </div>
      </form>

      <AppBottomSheet bodyClassName="max-h-[72vh] rounded-t-[24px]" onMaskClick={() => setHistoryVisible(false)} visible={historyVisible}>
        <div className="px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-[18px] font-black text-ww-ink">{t('history')}</h2>
            <button className="flex h-11 items-center gap-1 rounded-full border-0 bg-primary/10 px-3 text-[12px] font-extrabold text-primary-deep" onClick={() => void handleNewConversation()} type="button">
              <Plus size={15} />
              {t('newConversation')}
            </button>
          </div>
          {conversationsQuery.data.length === 0 && <p className="py-12 text-center text-sm font-semibold text-ww-mid">{t('emptyHistory')}</p>}
          <div className="space-y-2 overflow-y-auto">
            {conversationsQuery.data.map(conversation => (
              <button key={conversation.id} className={`w-full rounded-2xl border border-solid p-3 text-left ${conversation.id === activeConversationId ? 'border-primary bg-primary/10' : 'border-border-primary bg-ww-surface'}`} onClick={() => selectConversation(conversation.id)} type="button">
                <p className="m-0 truncate text-[13px] font-extrabold text-ww-ink">{conversation.title}</p>
                <p className="mb-0 mt-1 text-[11px] font-semibold text-ww-mid">{dayjs(conversation.lastMessageAt).format('MM月DD日 HH:mm')}</p>
              </button>
            ))}
            {conversationsQuery.hasNextPage && (
              <button
                className="flex min-h-11 w-full items-center justify-center rounded-2xl border-0 bg-transparent px-3 text-[12px] font-extrabold text-primary-deep"
                disabled={conversationsQuery.isFetchingNextPage}
                onClick={() => void conversationsQuery.fetchNextPage()}
                type="button"
              >
                {t(conversationsQuery.isFetchingNextPage ? 'loadingMore' : 'loadMore')}
              </button>
            )}
          </div>
        </div>
      </AppBottomSheet>
    </div>
  );
}

export default AgentChatPage;
