import { AudioWeb } from './audio-web';

export const audioWeb = new AudioWeb();

export const playSound = {
  click: () => void audioWeb.play('1'),
  ding: () => void audioWeb.play('2'),
  turnPage: () => void audioWeb.play('4'),
};
