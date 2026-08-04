interface DevToolOptions {
  enabledFlag?: string;
  isDev: boolean;
}

export function isDevToolEnabled({
  enabledFlag,
  isDev,
}: DevToolOptions) {
  return isDev && enabledFlag === 'true';
}
