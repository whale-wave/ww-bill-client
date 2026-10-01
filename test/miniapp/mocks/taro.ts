const Taro = {
  nextTick: (callback: () => void) => callback(),
  createSelectorQuery: () => {
    const query = {
      selectAll: (_selector: string) => query,
      boundingClientRect: () => query,
      exec: (callback: (results: unknown[]) => void) => callback([[], []]),
    };
    return query;
  },
  navigateTo: async () => undefined,
  stopPullDownRefresh: async () => undefined,
  switchTab: async () => undefined,
};

export function useReady(_callback: () => void) {}
export function useDidShow(_callback: () => void) {}
export function usePullDownRefresh(_callback: () => void) {}
export function useReachBottom(_callback: () => void) {}

export default Taro;
