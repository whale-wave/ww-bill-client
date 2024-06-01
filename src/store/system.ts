import { create } from 'zustand';
import { clearLocalStorage, getLocalStorageSize } from '@/utils';
import { audioWeb } from '@/modules/playSound';

type State = {
  canPlay: boolean;
  localStorageSize: number | string;
  hasAudioCache: boolean;
  visibleAmountSwitch: boolean;
  visibleAmount: boolean;
};

type Actions = {
  syncAudioWebData: () => void;
  updateHasAudioCache: () => void;
  openPlay: () => void;
  closePlay: () => void;
  setStorageSize: () => void;
  clearStorage: () => void;
  setVisibleAmountSwitch: (d: boolean) => void;
  toggleVisibleAmountSwitch: () => void;
  setVisibleAmount: (d: boolean) => void;
  toggleVisibleAmount: () => void;
};

const canPlay = localStorage.getItem('canPlay') === 'true' || false;

const initialState: State = {
  canPlay,
  localStorageSize: getLocalStorageSize(),
  hasAudioCache: audioWeb.hasCache(),
  visibleAmountSwitch:
    localStorage.getItem('visibleAmountSwitch') === 'true' || false,
  visibleAmount: localStorage.getItem('visibleAmount') === 'true' || false,
};

export const useSystemStore = create<State & Actions>((set, get) => ({
  ...initialState,
  syncAudioWebData() {
    canPlay && audioWeb.open();
  },
  updateHasAudioCache() {
    set({ hasAudioCache: audioWeb.hasCache() });
  },
  openPlay() {
    set({ canPlay: true });
    audioWeb.open();
    localStorage.setItem('canPlay', 'true');
    get().updateHasAudioCache();
  },
  closePlay() {
    set({ canPlay: false });
    audioWeb.close();
    localStorage.setItem('canPlay', 'false');
    get().updateHasAudioCache();
  },
  setStorageSize() {
    set({ localStorageSize: getLocalStorageSize() });
  },
  clearStorage() {
    clearLocalStorage();
    get().setStorageSize();
    get().closePlay();
  },
  setVisibleAmountSwitch(data) {
    set({ visibleAmountSwitch: data });
    localStorage.setItem('visibleAmountSwitch', String(data));
  },
  toggleVisibleAmountSwitch() {
    set((s) => ({ visibleAmountSwitch: !s.visibleAmountSwitch }));
    localStorage.setItem(
      'visibleAmountSwitch',
      String(get().visibleAmountSwitch),
    );
  },
  setVisibleAmount(data: boolean) {
    set({ visibleAmount: data });
    localStorage.setItem('visibleAmount', String(data));
  },
  toggleVisibleAmount() {
    set((s) => ({ visibleAmount: !s.visibleAmount }));
    localStorage.setItem('visibleAmount', String(get().visibleAmount));
  },
}));
