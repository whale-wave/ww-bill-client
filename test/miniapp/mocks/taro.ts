const Taro = {
  navigateTo: async () => undefined,
  stopPullDownRefresh: async () => undefined,
  switchTab: async () => undefined,
};

export function useDidShow(_callback: () => void) {}
export function usePullDownRefresh(_callback: () => void) {}
export function useReachBottom(_callback: () => void) {}

export default Taro;
