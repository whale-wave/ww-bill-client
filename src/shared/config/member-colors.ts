export const MEMBER_COLOR_KEYS = [
  'member-ocean',
  'member-rose',
  'member-wisteria',
  'member-mint',
  'member-amber',
  'member-tangerine',
  'member-indigo',
  'member-teal',
  'member-coral',
  'member-olive',
  'member-slate',
  'member-plum',
] as const;

export type MemberColorKey = (typeof MEMBER_COLOR_KEYS)[number];

export const MEMBER_COLOR_PALETTE: Record<MemberColorKey, {
  label: string;
  background: string;
  foreground: string;
}> = {
  'member-ocean': { label: '海蓝', background: '#DDF3FA', foreground: '#226E89' },
  'member-rose': { label: '玫瑰', background: '#FCE8EF', foreground: '#A94368' },
  'member-wisteria': { label: '紫藤', background: '#EEE9FC', foreground: '#6852A3' },
  'member-mint': { label: '薄荷', background: '#E2F4EC', foreground: '#2F7660' },
  'member-amber': { label: '琥珀', background: '#FFF1D2', foreground: '#8A5A00' },
  'member-tangerine': { label: '蜜橙', background: '#FDE8DC', foreground: '#9C4D25' },
  'member-indigo': { label: '靛蓝', background: '#E7EBFA', foreground: '#46579A' },
  'member-teal': { label: '青绿', background: '#DDF2F0', foreground: '#216E69' },
  'member-coral': { label: '珊瑚', background: '#FBE6E2', foreground: '#9B4840' },
  'member-olive': { label: '橄榄', background: '#EFF1D8', foreground: '#617021' },
  'member-slate': { label: '岩灰', background: '#E8EFF3', foreground: '#506775' },
  'member-plum': { label: '梅紫', background: '#F3E6F0', foreground: '#804878' },
};
