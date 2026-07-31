import Svg, { Circle, Path, Rect } from 'react-native-svg'

type IconProps = { size?: number; color?: string; filled?: string }

export function VerifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Circle cx={7} cy={7} r={7} fill="#16A6A0" />
      <Path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function PinIcon({ size = 10, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 11 13">
      <Path d="M5.5 1C3 1 1 3 1 5.4 1 8.5 5.5 12 5.5 12S10 8.5 10 5.4C10 3 8 1 5.5 1z" stroke={color} strokeOpacity={0.8} strokeWidth={1.2} fill="none" />
      <Circle cx={5.5} cy={5.3} r={1.5} fill={color} />
    </Svg>
  )
}

export function PlayIcon({ size = 8, color = '#E5326E' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.22} viewBox="0 0 9 11">
      <Path d="M0 0l9 5.5L0 11z" fill={color} />
    </Svg>
  )
}

export function PauseIcon({ size = 8, color = '#E5326E' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.22} viewBox="0 0 9 11">
      <Rect x={0} y={0} width={3.2} height={11} fill={color} />
      <Rect x={5.8} y={0} width={3.2} height={11} fill={color} />
    </Svg>
  )
}

export function UndoIcon({ size = 17, color = '#201812' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9h10a5 5 0 010 10h-3" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7.5 5L4 9l3.5 4" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function PassIcon({ size = 20, color = '#201812' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Path d="M4 4l14 14M18 4L4 18" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  )
}

export function RoseIcon({ size = 21, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" fill={color} />
    </Svg>
  )
}

export function HeartIcon({ size = 27, color = '#fff', outline = false }: IconProps & { outline?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z"
        fill={outline ? 'none' : color}
        stroke={outline ? color : undefined}
        strokeWidth={outline ? 2 : undefined}
      />
    </Svg>
  )
}

export function BackChevron({ size = 11, color = '#201812' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.6} viewBox="0 0 11 18" fill="none">
      <Path d="M9 1L2 9l7 8" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function FilterIcon({ size = 17, color = '#201812' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M2.5 5h13M5 9h8M7 13h4" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  )
}

export function TodayNavIcon({ size = 23, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21s-8-5.3-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.7-8 11-8 11z" stroke={color} strokeWidth={1.9} fill={filled ?? 'none'} />
    </Svg>
  )
}

export function CrushesNavIcon({ size = 23, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.5 6.5L21 9l-5 4.2L17.5 20 12 16.3 6.5 20 8 13.2 3 9l6.5-.5L12 2z" stroke={color} strokeWidth={1.9} fill={filled ?? 'none'} strokeLinejoin="round" />
    </Svg>
  )
}

export function ChatsNavIcon({ size = 23, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.5 8.5 0 01-12.4 7.5L3 20.5l1.5-4.9A8.5 8.5 0 1121 11.5z" stroke={color} strokeWidth={1.9} fill={filled ?? 'none'} strokeLinejoin="round" />
    </Svg>
  )
}

export function MeNavIcon({ size = 23, color, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.9} fill={filled ?? 'none'} />
      <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={1.9} fill="none" />
    </Svg>
  )
}

export function LogoutIcon({ size = 16, color = '#201812' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export function PlusIcon({ size = 17, color = '#201812' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4v16M4 12h16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
}

export function ShieldIcon({ size = 18, color = '#8A7C68' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l8 3v6c0 4.4-3.2 8.2-8 9-4.8-.8-8-4.6-8-9V6l8-3z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  )
}

export function SendIcon({ size = 17, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 12l18-8-8 18-2-7-8-3z" fill={color} />
    </Svg>
  )
}

export function MicIcon({ size = 8, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 9 11">
      <Path d="M0 0l9 5.5L0 11z" fill={color} />
    </Svg>
  )
}
