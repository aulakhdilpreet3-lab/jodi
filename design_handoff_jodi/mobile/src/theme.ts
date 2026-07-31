export const COLORS = {
  bg: '#EFE3CC',
  screenBg: '#FBF3E4',
  chatBg: '#F6ECD9',
  card: '#FFFDF7',
  ink: '#201812',
  inkFaint: '#8A7C68',
  inkMuted: '#A69A85',
  pink: '#E5326E',
  pinkDark: '#8E1247',
  amber: '#F5A524',
  teal: '#16A6A0',
  green: '#6EE7A8',
  rosePass: '#FF8FA3',
  reportRed: '#E5326E',
}

export const GRADIENTS: Record<string, [string, string]> = {
  pom: ['#E5326E', '#8E1247'],
  amber: ['#F5A524', '#C2571A'],
  green: ['#16A6A0', '#0B5A56'],
  plum: ['#7B3FA0', '#3E1A63'],
  indigo: ['#3B4CC0', '#1B2478'],
  teal: ['#0E9B8E', '#064F49'],
  rose: ['#F26C8A', '#A32B4F'],
}

// The server returns a CSS `linear-gradient(150deg,#A,#B)` string. Parse the
// two hex stops out of it so React Native's LinearGradient (which takes a
// colors array, not a CSS string) can render the same gradient.
export function parseGradient(css: string): [string, string] {
  const matches = css.match(/#[0-9a-fA-F]{3,8}/g)
  if (matches && matches.length >= 2) return [matches[0], matches[1]]
  return GRADIENTS.pom
}

export const FONTS = {
  display: 'BricolageGrotesque_800ExtraBold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemi: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
  bodyHeavy: 'HankenGrotesk_800ExtraBold',
}
