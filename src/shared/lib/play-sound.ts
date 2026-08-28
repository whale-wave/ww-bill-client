import { AudioWeb } from './audio-web';
import { hapticFeedback } from './haptic-feedback';

export const audioWeb = new AudioWeb();

export const playSound = {
  click: () => {
    void audioWeb.play('1');
    hapticFeedback.impact();
  },
  ding: () => {
    void audioWeb.play('2');
    hapticFeedback.success();
  },
  turnPage: () => {
    void audioWeb.play('4');
    hapticFeedback.impact();
  },
};
