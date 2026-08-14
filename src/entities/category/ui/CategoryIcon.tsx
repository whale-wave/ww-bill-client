import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { CategoryIconType } from '../api';
import {
  Apple,
  Baby,
  BadgeDollarSign,
  Banknote,
  Bike,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Bus,
  Camera,
  Car,
  Cat,
  ChartNoAxesCombined,
  CircleDollarSign,
  CircleParking,
  Clapperboard,
  Coffee,
  Coins,
  ContactRound,
  Cookie,
  CookingPot,
  CreditCard,
  CupSoda,
  Dog,
  Dumbbell,
  EggFried,
  FileText,
  Fish,
  Flower2,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  Hamburger,
  HandCoins,
  HandHeart,
  Handshake,
  Headphones,
  Heart,
  HeartHandshake,
  HeartPulse,
  Hotel,
  House,
  IceCreamBowl,
  Landmark,
  Laptop,
  Lightbulb,
  MessageCircleHeart,
  Milk,
  Package,
  Palette,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Plane,
  ReceiptText,
  Repeat2,
  RotateCcw,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Soup,
  Sparkles,
  Stethoscope,
  TentTree,
  Ticket,
  TrainFront,
  TrendingUp,
  Trophy,
  Users,
  UsersRound,
  Utensils,
  Vegan,
  Volleyball,
  WalletCards,
  WalletMinimal,
  Wine,
  Wrench,
} from 'lucide-react';
import { createElement, useState } from 'react';

export interface CategoryIconProps extends Omit<LucideProps, 'onError' | 'ref'> {
  categoryName?: string;
  iconKey?: string;
  iconType?: CategoryIconType;
}

type CategoryGlyph = ComponentType<LucideProps>;

const glyphByIconKey: Record<string, CategoryGlyph> = {
  'alcohol': Wine,
  'art': Palette,
  'ball-sports': Volleyball,
  'banking': Landmark,
  'beauty': Sparkles,
  'bonus': Trophy,
  'book': BookOpen,
  'breakfast': EggFried,
  'business-social': Handshake,
  'card': CreditCard,
  'cars': Car,
  'cash': Banknote,
  'cash-gift': HandCoins,
  'cash-gift-income': BadgeDollarSign,
  'cat': Cat,
  'catering': Utensils,
  'charity': HandHeart,
  'children': Baby,
  'coffee': Coffee,
  'communication': Smartphone,
  'couple': Heart,
  'cycling': Bike,
  'daily': ShoppingBasket,
  'dairy': Milk,
  'dating': MessageCircleHeart,
  'dessert': IceCreamBowl,
  'digital': Laptop,
  'dividend': Coins,
  'dog': Dog,
  'donation': HeartHandshake,
  'elder': HeartPulse,
  'entertainment': Gamepad2,
  'express': Package,
  'family': UsersRound,
  'fast-food': Hamburger,
  'financial': ChartNoAxesCombined,
  'food': CookingPot,
  'fress': Shirt,
  'fruits': Apple,
  'fuel': Fuel,
  'furniture': Sofa,
  'garden': Flower2,
  'gift': Gift,
  'hotel': Hotel,
  'housing': House,
  'investment': PiggyBank,
  'meal': Soup,
  'medical': Stethoscope,
  'motion': Dumbbell,
  'movie': Clapperboard,
  'music': Headphones,
  'office': BriefcaseBusiness,
  'other-money': CircleDollarSign,
  'outdoor': TentTree,
  'parking': CircleParking,
  'part-time': Briefcase,
  'party': PartyPopper,
  'pet': PawPrint,
  'photography': Camera,
  'red-envelope': WalletMinimal,
  'receipt': ReceiptText,
  'refund': RotateCcw,
  'rent-income': Building2,
  'repair': Wrench,
  'salary': WalletCards,
  'seafood': Fish,
  'shopping': ShoppingBag,
  'snacks': Cookie,
  'social-contact': ContactRound,
  'socializing': Users,
  'study': GraduationCap,
  'subscription': Repeat2,
  'subway': TrainFront,
  'taxes': FileText,
  'tea': CupSoda,
  'ticket': Ticket,
  'traffic': Bus,
  'travel': Plane,
  'utilities': Lightbulb,
  'vegetables': Vegan,
};

// eslint-disable-next-line react-refresh/only-export-components
export function hasCategoryGlyph(iconKey: string) {
  return Boolean(glyphByIconKey[iconKey]);
}

const glyphByName: Array<[RegExp, CategoryGlyph]> = [
  [/咖啡|茶|饮品/, Coffee],
  [/[餐吃饭]|食品|meal|food|dining/i, Utensils],
  [/交通|公交|地铁|出行|transport|traffic|bus|metro/i, Bus],
  [/汽车|停车|加油/, Car],
  [/工资|薪酬|salary|payroll/i, WalletCards],
  [/理财|投资|收益|finance|investment/i, TrendingUp],
  [/购物|采购|shopping/i, ShoppingBag],
  [/住房|房租|住宿/, House],
  [/蔬菜/, Vegan],
  [/水果/, Apple],
  [/零食/, Cookie],
  [/医疗|看病/, Stethoscope],
  [/学习|培训/, GraduationCap],
  [/书/, BookOpen],
  [/旅行|差旅|travel|trip/i, Plane],
  [/宠物|pet/i, PawPrint],
  [/礼物|红包/, Gift],
  [/办公|工作/, BriefcaseBusiness],
  [/快递|物流/, Package],
  [/维修/, Wrench],
  [/通讯|话费/, Smartphone],
  [/运动|健身/, Dumbbell],
  [/娱乐|游戏/, Gamepad2],
  [/烟酒/, Wine],
  [/数码|设备/, Laptop],
  [/服饰|衣/, Shirt],
  [/美容/, Sparkles],
  [/孩子|儿童/, Baby],
  [/长辈|老人/, HeartPulse],
  [/社交|亲友/, Users],
  [/礼金|捐赠/, HandCoins],
  [/兼职|副业/, Briefcase],
  [/收入|其他|income|other/i, CircleDollarSign],
  [/coffee|tea|drink/i, Coffee],
];

function resolveGlyph(iconKey?: string, categoryName?: string): CategoryGlyph {
  const normalizedKey = iconKey?.trim().toLowerCase();
  if (normalizedKey && glyphByIconKey[normalizedKey])
    return glyphByIconKey[normalizedKey];

  const normalizedName = categoryName?.trim();
  if (normalizedName) {
    const match = glyphByName.find(([pattern]) => pattern.test(normalizedName));
    if (match)
      return match[1];
  }

  return ReceiptText;
}

export function CategoryIcon({
  categoryName,
  iconKey,
  iconType,
  size = 18,
  strokeWidth = 1.8,
  className,
  style,
  ...props
}: CategoryIconProps) {
  const [failedImage, setFailedImage] = useState<string>();
  const isImage = iconType === 'IMAGE'
    || (!iconType && /^https:\/\//i.test(iconKey ?? ''));
  const imageFailed = Boolean(iconKey && failedImage === iconKey);

  if (isImage && !imageFailed) {
    return (
      <img
        aria-hidden="true"
        className={className}
        crossOrigin="anonymous"
        height={size}
        onError={() => setFailedImage(iconKey)}
        src={iconKey}
        style={{ borderRadius: '24%', objectFit: 'cover', ...style }}
        width={size}
      />
    );
  }

  const glyph = isImage ? ReceiptText : resolveGlyph(iconKey, categoryName);
  return createElement(glyph, {
    'aria-hidden': true,
    className,
    size,
    strokeWidth,
    style,
    ...props,
  });
}
