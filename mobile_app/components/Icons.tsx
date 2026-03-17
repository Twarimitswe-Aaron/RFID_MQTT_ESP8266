import React from 'react';
import { Text, TextStyle } from 'react-native';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/** BillIO brand text — "Bill" in white, "IO" in indigo, both Orbitron */
export function BrandText({ size = 22 }: { size?: number }) {
  const base: TextStyle = {
    fontFamily: 'Orbitron_700Bold',
    fontSize: size,
    letterSpacing: 3,
    textShadowColor: 'rgba(99,102,241,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  };
  return (
    <Text>
      <Text style={[base, { color: '#ffffff' }]}>Bill</Text>
      <Text style={[base, { color: '#818cf8', textShadowColor: 'rgba(129,140,248,0.9)' }]}>IO</Text>
    </Text>
  );
}

// ── Navigation / Layout ──────────────────────────────────────────────────────

export const DashboardIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="3" width="7" height="7" />
    <Rect x="14" y="3" width="7" height="7" />
    <Rect x="3" y="14" width="7" height="7" />
    <Rect x="14" y="14" width="7" height="7" />
  </Svg>
);

export const TopUpIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const PaymentIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="1" y="4" width="22" height="16" />
    <Path d="M1 10h22" />
  </Svg>
);

export const ProductsIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <Path d="M3 6h18" />
    <Path d="M16 10a4 4 0 01-8 0" />
  </Svg>
);

export const TransactionsIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <Path d="M14 2v6h6" />
    <Path d="M16 13H8M16 17H8" />
  </Svg>
);

export const CardsIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="2" y="5" width="20" height="14" />
    <Path d="M2 10h20" />
  </Svg>
);

export const LogoutIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <Path d="M16 17l5-5-5-5" />
    <Path d="M21 12H9" />
  </Svg>
);

export const UserIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

export const MenuIcon = ({ size = 24, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="3" y1="12" x2="21" y2="12" />
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Line x1="3" y1="18" x2="21" y2="18" />
  </Svg>
);

export const CloseIcon = ({ size = 24, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const WalletIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <Path d="M16 3H8L4 7h16l-4-4z" />
    <Circle cx="17" cy="14" r="1" fill={color} />
  </Svg>
);

// ── Status / Feedback ────────────────────────────────────────────────────────

export const CheckIcon = ({ size = 18, color = '#22c55e' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const XIcon = ({ size = 18, color = '#ef4444' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const WarningIcon = ({ size = 18, color = '#f59e0b' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const InfoIcon = ({ size = 18, color = '#6366f1' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="12" />
    <Line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
);

// ── Actions / UI ─────────────────────────────────────────────────────────────

export const RfidIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M5 12.5a7 7 0 0114 0" />
    <Path d="M2 10a10 10 0 0120 0" />
    <Circle cx="12" cy="15" r="1" fill={color} />
    <Line x1="12" y1="16" x2="12" y2="20" />
  </Svg>
);

export const SearchIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const LockIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Rect x="3" y="11" width="18" height="11" />
    <Path d="M7 11V7a5 5 0 0110 0v4" />
  </Svg>
);

export const CartIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Path d="M16 10a4 4 0 01-8 0" />
  </Svg>
);

export const ArrowUpIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
    <Line x1="12" y1="19" x2="12" y2="5" />
    <Path d="M5 12l7-7 7 7" />
  </Svg>
);

export const PointerIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M9 3L9 15L12 12L14.5 17L16 16.5L13.5 11.5L17 11.5Z" />
  </Svg>
);

export const RefreshIcon = ({ size = 18, color = 'currentColor' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M23 4v6h-6" />
    <Path d="M1 20v-6h6" />
    <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </Svg>
);
