import pkg from '../../../package.json';
import config from './index';

export const APP_INFO = {
  appName: config.appName,
  version: pkg.version,
  githubProfileUrl: 'https://github.com/layouwen',
  githubReleasesUrl: 'https://github.com/whale-wave/ww-bill-client/releases',
  qqGroupNumber: '1108214948',
  qqGroupJoinUrl: 'https://qm.qq.com/cgi-bin/qm/qr?k=NDDFwRAY2urXTscrVrfuBI9M8CMahEzK&jump_from=webapi&authKey=PdNUzd2cFuoQxrA8iG3JtdavHwFOEG7a7Tk2eEVcvb8e+dJmdmM/Clq4AqKUIqc1',
} as const;

export const APP_SHARE_TEXT = `${APP_INFO.appName}，最新版和安装包请从官方发布页面获取：${APP_INFO.githubReleasesUrl}`;
