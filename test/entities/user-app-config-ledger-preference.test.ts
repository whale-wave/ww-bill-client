import type { PatchUserAppConfigBody, UserAppConfig } from '@/entities/user-app-config/api';
import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { userKeys } from '@/entities/user';
import { patchLedgerQuickSwitchApi } from '@/entities/user-app-config/api';
import {
  cacheLedgerQuickSwitchResponse,
  patchLedgerQuickSwitchMutationFn,
} from '@/entities/user-app-config/hooks';

const { patch } = vi.hoisted(() => ({ patch: vi.fn() }));

vi.mock('@/shared/api', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/shared/api')>();
  return { ...original, request: { patch } };
});

describe('user app config ledger quick-switch preference', () => {
  beforeEach(() => patch.mockReset());

  it('keeps quick-switch fields off the legacy patch contract and exposes no active ledger', () => {
    expectTypeOf<PatchUserAppConfigBody>()
      .not
      .toHaveProperty('isLedgerQuickSwitchEnabled');
    expectTypeOf<PatchUserAppConfigBody>()
      .not
      .toHaveProperty('ledgerQuickSwitchVersion');
    expectTypeOf<UserAppConfig>().toHaveProperty('userId');
    expectTypeOf<UserAppConfig>().toHaveProperty('appearanceTemplate');
    expectTypeOf<UserAppConfig>().toHaveProperty('appearanceAccent');
    expectTypeOf<UserAppConfig>().not.toHaveProperty('user');
    expectTypeOf<UserAppConfig>().not.toHaveProperty('activeLedgerId');
  });

  it('uses the dedicated versioned patch endpoint', () => {
    const data = { enabled: true, version: 4 };

    patchLedgerQuickSwitchApi(data);

    expect(patch).toHaveBeenCalledWith('/user-app-config/ledger-quick-switch', data);
  });

  it('rejects a failed quick-switch business envelope', async () => {
    patch.mockResolvedValue({ data: null, message: '版本冲突', statusCode: 409 });

    await expect(patchLedgerQuickSwitchMutationFn({ enabled: true, version: 2 }))
      .rejects
      .toMatchObject({ message: '版本冲突', statusCode: 409 });
  });

  it('writes the returned value and version into the app config cache', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(userKeys.appConfig(), {
      data: {
        id: 'config-1',
        isDisplayAmount: true,
        isDisplayAmountSwitch: true,
        isLedgerQuickSwitchEnabled: false,
        isOpenSoundEffect: false,
        ledgerQuickSwitchVersion: 3,
      },
      message: '成功',
      statusCode: 200,
    });

    cacheLedgerQuickSwitchResponse(queryClient, {
      data: { enabled: true, version: 4 },
      message: '成功',
      statusCode: 200,
    });

    expect(queryClient.getQueryData(userKeys.appConfig())).toMatchObject({
      data: {
        isLedgerQuickSwitchEnabled: true,
        ledgerQuickSwitchVersion: 4,
      },
    });
  });
});
