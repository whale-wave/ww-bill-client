import { audioWeb } from '@/modules/playSound';
import { clearLocalStorage, getLocalStorageSize } from '@/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SystemState {
  canPlay: boolean;
  localStorageSize: number | string;
  hasAudioCache: boolean;
  visibleAmountSwitch: boolean;
  visibleAmount: boolean;
}

const canPlay = localStorage.getItem('canPlay') === 'true' || false;

const initialState: SystemState = {
  canPlay,
  localStorageSize: getLocalStorageSize(),
  hasAudioCache: audioWeb.hasCache(),
  visibleAmountSwitch:
    localStorage.getItem('visibleAmountSwitch') === 'true' || false,
  visibleAmount: localStorage.getItem('visibleAmount') === 'true' || false,
};

export const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    syncAudioWebData() {
      canPlay && audioWeb.open();
    },
    updateHasAudioCache(state) {
      state.hasAudioCache = audioWeb.hasCache();
    },
    openPlay(state) {
      state.canPlay = true;
      audioWeb.open();
      localStorage.setItem('canPlay', 'true');
      systemSlice.caseReducers.updateHasAudioCache(state);
    },
    closePlay(state) {
      state.canPlay = false;
      audioWeb.close();
      localStorage.setItem('canPlay', 'false');
      systemSlice.caseReducers.updateHasAudioCache(state);
    },
    setStorageSize(state) {
      state.localStorageSize = getLocalStorageSize();
    },
    clearStorage(state) {
      clearLocalStorage();
      systemSlice.caseReducers.setStorageSize(state);
      systemSlice.caseReducers.closePlay(state);
    },
    setVisibleAmountSwitch(state, action: PayloadAction<boolean>) {
      state.visibleAmountSwitch = action.payload;
      localStorage.setItem('visibleAmountSwitch', String(action.payload));
    },
    toggleVisibleAmountSwitch(state) {
      state.visibleAmountSwitch = !state.visibleAmountSwitch;
      localStorage.setItem(
        'visibleAmountSwitch',
        String(state.visibleAmountSwitch),
      );
    },
    setVisibleAmount(state, action: PayloadAction<boolean>) {
      state.visibleAmount = action.payload;
      localStorage.setItem('visibleAmount', String(action.payload));
    },
    toggleVisibleAmount(state) {
      state.visibleAmount = !state.visibleAmount;
      localStorage.setItem('visibleAmount', String(state.visibleAmount));
    },
  },
});

export const {
  openPlay,
  closePlay,
  clearStorage,
  syncAudioWebData,
  setStorageSize,
  setVisibleAmountSwitch,
  toggleVisibleAmountSwitch,
  setVisibleAmount,
  toggleVisibleAmount,
} = systemSlice.actions;

export default systemSlice.reducer;
