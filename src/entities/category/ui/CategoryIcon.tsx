import type { CategoryGlyphName } from '@ww-bill/bill-ui';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { CategoryIconType } from '../api';
import { categoryIconTextStyle, resolveCategoryIcon } from '@ww-bill/bill-ui';
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
  textIconEnabled?: boolean;
  textIconIndex?: number;
}

type CategoryGlyph = ComponentType<LucideProps>;

const glyphs: Record<CategoryGlyphName, CategoryGlyph> = {
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
};

// eslint-disable-next-line react-refresh/only-export-components
export { hasCategoryGlyph } from '@ww-bill/bill-ui';

export function CategoryIcon({
  categoryName,
  iconKey,
  iconType,
  textIconEnabled,
  textIconIndex = 0,
  size = 18,
  strokeWidth = 1.8,
  className,
  style,
  ...props
}: CategoryIconProps) {
  const [failedImage, setFailedImage] = useState<string>();
  const visual = resolveCategoryIcon({ iconKey, categoryName, iconType, textIconEnabled, textIconIndex, imageFailed: Boolean(iconKey && failedImage === iconKey) });
  const textIcon = visual.kind === 'text' ? visual.value : undefined;

  if (textIcon) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{ ...categoryIconTextStyle('text', size), ...style }}
      >
        {textIcon}
      </span>
    );
  }

  if (visual.kind === 'emoji') {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{ ...categoryIconTextStyle('emoji', size), ...style }}
      >
        {visual.value}
      </span>
    );
  }

  if (visual.kind === 'image') {
    return (
      <img
        aria-hidden="true"
        className={className}
        crossOrigin="anonymous"
        height={size}
        onError={() => setFailedImage(iconKey)}
        src={visual.value}
        style={{ aspectRatio: '1 / 1', borderRadius: '50%', height: '100%', objectFit: 'cover', width: '100%', ...style }}
        width={size}
      />
    );
  }

  const glyph = glyphs[visual.kind === 'glyph' ? visual.glyph : 'ReceiptText'];
  return createElement(glyph, {
    'aria-hidden': true,
    className,
    size,
    strokeWidth,
    style,
    ...props,
  });
}
