export function isAmountVisible(config?: { isDisplayAmount?: boolean; isDisplayAmountSwitch?: boolean }): boolean {
  return !config?.isDisplayAmountSwitch || Boolean(config.isDisplayAmount);
}
