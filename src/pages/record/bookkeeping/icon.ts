import { i18n } from '@/shared/i18n';

interface iconType {
  id?: number;
  name: string;
  icon: string;
}

export function getMainList(): iconType[] {
  const list = [
    {
      name: i18n.t('record:category.food'),
      icon: 'canyin1',
    },
    {
      name: i18n.t('record:category.shopping'),
      icon: 'icon-',
    },
    {
      name: i18n.t('record:category.daily'),
      icon: 'riyongbaihuo',
    },
    {
      name: i18n.t('record:category.transportation'),
      icon: 'jiaotong',
    },
    {
      name: i18n.t('record:category.vegetables'),
      icon: 'shucai',
    },
    {
      name: i18n.t('record:category.fruit'),
      icon: 'shuiguo',
    },
    {
      name: i18n.t('record:category.snacks'),
      icon: 'lingshi',
    },
    {
      name: i18n.t('record:category.sports'),
      icon: 'yundong',
    },
    {
      name: i18n.t('record:category.entertainment'),
      icon: 'yule',
    },
    {
      name: i18n.t('record:category.communication'),
      icon: 'tongxun',
    },
    {
      name: i18n.t('record:category.clothing'),
      icon: 'fushi',
    },
    {
      name: i18n.t('record:category.beauty'),
      icon: 'shouye',
    },
    {
      name: i18n.t('record:category.housing'),
      icon: 'zhufang',
    },
    {
      name: i18n.t('record:category.home'),
      icon: 'jiajujiafang',
    },
    {
      name: i18n.t('record:category.children'),
      icon: 'shouye1',
    },
    {
      name: i18n.t('record:category.elders'),
      icon: 'grandfather',
    },
    {
      name: i18n.t('record:category.social'),
      icon: 'shejiao',
    },
    {
      name: i18n.t('record:category.travel'),
      icon: 'lvhang-',
    },
    {
      name: i18n.t('record:category.tobaccoAlcohol'),
      icon: 'yanjiu',
    },
    {
      name: i18n.t('record:category.digital'),
      icon: 'shujuxian',
    },
    {
      name: i18n.t('record:category.car'),
      icon: 'qiche',
    },
    {
      name: i18n.t('record:category.medical'),
      icon: 'yiliao',
    },
    {
      name: i18n.t('record:category.books'),
      icon: 'shuji',
    },
    {
      name: i18n.t('record:category.study'),
      icon: 'xuexiwangke',
    },
    {
      name: i18n.t('record:category.pets'),
      icon: 'xiedaichongwu',
    },
    {
      name: i18n.t('record:category.giftMoney'),
      icon: 'tuijianlijin',
    },
    {
      name: i18n.t('record:category.gifts'),
      icon: 'liwu',
    },
    {
      name: i18n.t('record:category.office'),
      icon: 'bangong',
    },
    {
      name: i18n.t('record:category.repair'),
      icon: 'weixiu',
    },
    {
      name: i18n.t('record:category.donation'),
      icon: 'aixinjuanzeng',
    },
    {
      name: i18n.t('record:category.lottery'),
      icon: 'caipiao',
    },
    {
      name: i18n.t('record:category.friendsFamily'),
      icon: 'a-24-30_fuzhi-04',
    },
    {
      name: i18n.t('record:category.delivery'),
      icon: 'kuaidiyuan',
    },
    {
      name: i18n.t('record:category.settings'),
      icon: 'shezhi',
    },
  ];

  for (let i = 0; i < list.length; i++) {
    list[i].id = i + 1;
  }

  return list;
}
