import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hard-coded admin credentials (demo only)
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = 'Admin123';

const TEAL = '#4FA69E';
const NAVY = '#1F2D45';

export default function AdminLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password) {
      setError('Please enter your user name and password.');
      return;
    }

    const validUser = username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
    const validPassword = password === ADMIN_PASSWORD;

    if (validUser && validPassword) {
      setError('');
      router.replace('/admin/admin-home' as Href);
    } else {
      setError('Incorrect user name or password.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={26} color="#6B7280" />
        </Pressable>

        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.heading}>Admin Login</Text>
        <Text style={styles.subtitle}>Sign in to manage counselors.</Text>

        <Text style={styles.label}>User Name</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={20} color={TEAL} />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError('');
            }}
            placeholder="Enter user name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={TEAL} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError('');
            }}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleLogin}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B7280"
            />
          </Pressable>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#B42318" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
        >
          <Text style={styles.loginText}>Log In</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EAF1F4' },
  content: { paddingHorizontal: 24 },

  back: { alignSelf: 'flex-start', marginBottom: 16 },
  iconWrap: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: '#397974',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  heading: { fontSize: 28, fontWeight: '700', color: NAVY, textAlign: 'center', marginTop: 16 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 12 },

  label: { fontSize: 15, fontWeight: '600', color: NAVY, marginTop: 18, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9E2E7',
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: NAVY },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEECEC',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  errorText: { color: '#B42318', fontSize: 14, flex: 1 },

  loginButton: {
    alignItems: 'center',
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 28,
  },
  loginText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancel: { alignItems: 'center', paddingVertical: 16 },
  cancelText: { color: TEAL, fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});