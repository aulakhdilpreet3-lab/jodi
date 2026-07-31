import { BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque'
import {
  HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import AuthScreen from './src/components/AuthScreen'
import { AuthProvider, useAuth } from './src/AuthContext'
import LoggedInApp from './src/LoggedInApp'
import { COLORS } from './src/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

function Root() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator color={COLORS.pink} />
      </View>
    )
  }
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.screenBg }}>
      <StatusBar style="dark" />
      {status === 'anon' ? <AuthScreen /> : <LoggedInApp />}
    </View>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_800ExtraBold, BricolageGrotesque_600SemiBold,
    HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold, HankenGrotesk_800ExtraBold,
  })

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => { void onLayout() }, [onLayout])

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
