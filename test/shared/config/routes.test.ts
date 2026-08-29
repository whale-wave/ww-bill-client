import { describe, expect, it } from 'vitest';
import { ROUTES_PATH } from '@/shared/config/routes';

describe('ledger route builders', () => {
  it('builds global ledger workflow routes', () => {
    expect(ROUTES_PATH.DETAIL.getPath()).toBe('/detail');
    expect(ROUTES_PATH.BOOKKEEPING.getPath()).toBe('/bookkeeping');
    expect(ROUTES_PATH.SHORTCUT_BOOKKEEPING_CONFIRM.getPath()).toBe('/bookkeeping/import');
    expect(ROUTES_PATH.SETTINGS_SHORTCUT_BOOKKEEPING.getPath()).toBe('/settings/shortcut-bookkeeping');
    expect(ROUTES_PATH.DISCOVERY.getPath()).toBe('/discovery');
    expect(ROUTES_PATH.FEEDBACK.getPath()).toBe('/feedback');
    expect(ROUTES_PATH.LEDGERS.getPath()).toBe('/ledgers');
    expect(ROUTES_PATH.LEDGER_TEMPLATES.getPath()).toBe('/ledgers/templates');
    expect(ROUTES_PATH.LEDGER_CREATE.getPath()).toBe('/ledgers/create');
    expect(ROUTES_PATH.LEDGER_JOIN.getPath()).toBe('/ledgers/join');
    expect(ROUTES_PATH.LEDGER_APPLICATIONS.getPath()).toBe('/ledgers/applications');
    expect(ROUTES_PATH.LEDGER_PREFERENCES.getPath()).toBe('/ledgers/preferences');
    expect(ROUTES_PATH.LEDGER_INVITE.getPath('A/B C')).toBe('/ledger-invites/A%2FB%20C');
  });

  it('builds ledger-scoped workflow routes', () => {
    const ledgerId = 'ledger/a b';

    expect(ROUTES_PATH.LEDGER_DETAIL.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b');
    expect(ROUTES_PATH.LEDGER_RECORDS.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/records');
    expect(ROUTES_PATH.LEDGER_RECORD_CREATE.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/records/new');
    expect(ROUTES_PATH.LEDGER_RECORD_SEARCH.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/records/search');
    expect(ROUTES_PATH.LEDGER_CALENDAR.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/calendar');
    expect(ROUTES_PATH.LEDGER_BILL.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/bill');
    expect(ROUTES_PATH.LEDGER_BUDGET.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/budget');
    expect(ROUTES_PATH.LEDGER_CHARTS.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/charts');
    expect(ROUTES_PATH.LEDGER_EXPORT.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/export');
    expect(ROUTES_PATH.LEDGER_MEMBERS.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/members');
    expect(ROUTES_PATH.LEDGER_MEMBER_DETAIL.getPath(ledgerId, 'member/a b')).toBe(
      '/ledgers/ledger%2Fa%20b/members/member%2Fa%20b',
    );
    expect(ROUTES_PATH.LEDGER_INVITES.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/invites');
    expect(ROUTES_PATH.LEDGER_JOIN_REQUESTS.getPath(ledgerId)).toBe(
      '/ledgers/ledger%2Fa%20b/join-requests',
    );
    expect(ROUTES_PATH.LEDGER_JOIN_REQUEST_DETAIL.getPath(ledgerId, 'request/a b')).toBe(
      '/ledgers/ledger%2Fa%20b/join-requests/request%2Fa%20b',
    );
    expect(ROUTES_PATH.LEDGER_SETTINGS.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/settings');
    expect(ROUTES_PATH.LEDGER_CATEGORIES.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/settings/categories');
    expect(ROUTES_PATH.LEDGER_TAGS.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/settings/tags');
    expect(ROUTES_PATH.LEDGER_RECOVERY.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/recovery');
    expect(ROUTES_PATH.LEDGER_TRANSFER.getPath(ledgerId)).toBe('/ledgers/ledger%2Fa%20b/transfer');
  });

  it('isolates record detail and edit routes by both ids', () => {
    expect(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath('ledger/a', 'record/b')).toBe(
      '/ledgers/ledger%2Fa/records/record%2Fb',
    );
    expect(ROUTES_PATH.LEDGER_RECORD_EDIT.getPath('ledger/a', 'record/b')).toBe(
      '/ledgers/ledger%2Fa/records/record%2Fb/edit',
    );
    expect(ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath('ledger/a', 'record/b')).not.toBe(
      ROUTES_PATH.LEDGER_RECORD_DETAIL.getPath('ledger/c', 'record/b'),
    );
  });
});

describe('household route builders', () => {
  it('builds global status, creation and invitation routes', () => {
    expect(ROUTES_PATH.HOUSEHOLD.getPath()).toBe('/household');
    expect(ROUTES_PATH.HOUSEHOLD_CREATE.getPath()).toBe('/household/create');
    expect(ROUTES_PATH.HOUSEHOLD_JOIN.getPath()).toBe('/household/join');
    expect(ROUTES_PATH.HOUSEHOLD_INVITATION_PREVIEW.getPath('A/B C')).toBe(
      '/household-invitations/A%2FB%20C',
    );
  });

  it('keeps every household resource scoped by the URL id', () => {
    const householdId = 'household/a b';

    expect(ROUTES_PATH.HOUSEHOLD_HOME.getPath(householdId)).toBe('/households/household%2Fa%20b');
    expect(ROUTES_PATH.HOUSEHOLD_INVITATION.getPath(householdId)).toBe('/households/household%2Fa%20b/invitation');
    expect(ROUTES_PATH.HOUSEHOLD_RECORDS.getPath(householdId)).toBe('/households/household%2Fa%20b/records');
    expect(ROUTES_PATH.HOUSEHOLD_RECORD_SEARCH.getPath(householdId)).toBe('/households/household%2Fa%20b/records/search');
    expect(ROUTES_PATH.HOUSEHOLD_RECORD_POLICY.getPath(householdId, 7)).toBe('/households/household%2Fa%20b/records/7/policy');
    expect(ROUTES_PATH.HOUSEHOLD_CALENDAR.getPath(householdId)).toBe('/households/household%2Fa%20b/calendar');
    expect(ROUTES_PATH.HOUSEHOLD_BUDGETS.getPath(householdId)).toBe('/households/household%2Fa%20b/budgets');
    expect(ROUTES_PATH.HOUSEHOLD_CHARTS.getPath(householdId)).toBe('/households/household%2Fa%20b/charts');
    expect(ROUTES_PATH.HOUSEHOLD_SETTINGS.getPath(householdId)).toBe('/households/household%2Fa%20b/settings');
    expect(ROUTES_PATH.HOUSEHOLD_MEMBERS.getPath(householdId)).toBe('/households/household%2Fa%20b/members');
  });
});
