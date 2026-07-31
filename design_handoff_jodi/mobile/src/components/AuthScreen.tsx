import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../AuthContext'
import { COLORS, FONTS } from '../theme'

function maxBirthdate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

export default function AuthScreen() {
  const { signup, login, error, clearError } = useAuth()
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    try {
      if (mode === 'login') await login(email.trim(), password)
      else await signup({ name: name.trim(), email: email.trim(), password, birthdate })
    } catch {
      // error surfaced via context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <View style={styles.dotPink} />
          <View style={[styles.dotAmber, { marginLeft: -7 }]} />
        </View>
        <Text style={styles.heading}>{mode === 'login' ? 'welcome back' : 'join jodi'}</Text>
        <Text style={styles.sub}>{mode === 'login' ? 'no endless scroll. just five, every day.' : 'desi dating · five a day · you have to be 18+'}</Text>

        <View style={styles.form}>
          {mode === 'signup' && (
            <View>
              <Text style={styles.label}>name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="what should we call you?" placeholderTextColor="#B7AA92" />
            </View>
          )}
          <View>
            <Text style={styles.label}>email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#B7AA92" autoCapitalize="none" keyboardType="email-address" />
          </View>
          <View>
            <Text style={styles.label}>password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="at least 8 characters" placeholderTextColor="#B7AA92" secureTextEntry />
          </View>
          {mode === 'signup' && (
            <View>
              <Text style={styles.label}>birthdate</Text>
              <TextInput
                style={styles.input}
                value={birthdate}
                onChangeText={setBirthdate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#B7AA92"
              />
              <Text style={styles.hint}>you must be 18+ to use jodi (max {maxBirthdate()})</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
          )}

          <Pressable onPress={() => void submit()} disabled={submitting} style={[styles.submit, submitting && { opacity: 0.7 }]}>
            <Text style={styles.submitText}>{submitting ? 'one sec…' : mode === 'login' ? 'log in' : 'create account'}</Text>
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>{mode === 'login' ? 'new here? ' : 'already have an account? '}</Text>
          <Pressable onPress={() => { clearError(); setMode(mode === 'login' ? 'signup' : 'login') }}>
            <Text style={styles.toggleLink}>{mode === 'login' ? 'create an account' : 'log in'}</Text>
          </Pressable>
        </View>

        {mode === 'login' && (
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>
              demo accounts: <Text style={styles.bold}>aisha@demo.jodi</Text> … <Text style={styles.bold}>sana@demo.jodi</Text>, password <Text style={styles.bold}>password123</Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.screenBg, paddingHorizontal: 28 },
  logoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dotPink: { width: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.pink },
  dotAmber: { width: 17, height: 17, borderRadius: 9, backgroundColor: COLORS.amber, opacity: 0.9 },
  heading: { fontFamily: FONTS.display, fontSize: 26, color: COLORS.ink, textAlign: 'center', marginTop: 8, letterSpacing: -1 },
  sub: { fontSize: 12.5, color: COLORS.inkFaint, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  form: { gap: 14 },
  label: { fontSize: 11, color: COLORS.inkFaint, letterSpacing: 0.6, textTransform: 'uppercase', fontFamily: FONTS.bodyBold, marginBottom: 5 },
  input: { padding: 13, borderRadius: 14, borderWidth: 2, borderColor: COLORS.ink, backgroundColor: COLORS.card, fontSize: 14.5, color: COLORS.ink, fontFamily: FONTS.body },
  hint: { fontSize: 10.5, color: COLORS.inkFaint, marginTop: 4 },
  errorBox: { backgroundColor: '#fdeef3', borderWidth: 2, borderColor: COLORS.pink, borderRadius: 14, padding: 13 },
  errorText: { fontSize: 12.5, color: COLORS.pinkDark, fontFamily: FONTS.body },
  submit: { marginTop: 4, padding: 15, borderRadius: 26, backgroundColor: COLORS.pink, borderWidth: 2, borderColor: COLORS.ink, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontFamily: FONTS.bodyHeavy },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' },
  toggleText: { fontSize: 12.5, color: COLORS.inkFaint },
  toggleLink: { fontSize: 12.5, color: COLORS.pink, fontFamily: FONTS.bodyBold },
  demoBox: { marginTop: 20, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(32,24,18,.24)', borderStyle: 'dashed' },
  demoText: { fontSize: 11.5, color: COLORS.inkFaint, lineHeight: 17 },
  bold: { fontFamily: FONTS.bodyBold, color: COLORS.ink },
})
