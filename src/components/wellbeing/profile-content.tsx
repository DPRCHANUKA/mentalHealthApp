import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Dialog, palette, ui } from './screen';

type Profile = { name: string; id: string; sex: string };
export function ProfileContent({ profile, role, onSave, onLogout }: {
  profile: Profile; role: 'Student' | 'Mentor'; onSave: (profile: Profile) => void; onLogout: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [logout, setLogout] = useState(false);
  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('').toUpperCase();
  const fields = [
    { key: 'name', label: 'Full name', icon: 'person-outline', placeholder: 'Your name' },
    { key: 'id', label: role + ' ID', icon: 'id-card-outline', placeholder: 'Add your ID (optional)' },
    { key: 'sex', label: 'Sex', icon: 'information-circle-outline', placeholder: 'Optional — leave blank if preferred' },
  ] as const;
  return <>
    {/* Admin login button */}
    <View style={styles.adminRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Admin Login"
        onPress={() => router.push('/admin/login' as Href)}
        style={({ pressed }) => [styles.adminButton, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
        <Text style={styles.adminButtonText}>Admin Login</Text>
      </Pressable>
    </View>

    <View style={styles.hero}>
      <LinearGradient colors={['#243447', '#397974']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <Text style={styles.eyebrow}>YOUR WELLBEING SPACE</Text>
        <Ionicons name="leaf-outline" size={28} color="#BFE5DF" />
      </LinearGradient>
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.initials}>{initials || '?'}</Text></View>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[ui.heading, { fontSize: 28 }]}>{profile.name}</Text>
          <View style={styles.badge}><View style={styles.dot} /><Text style={styles.badgeText}>{role}</Text></View>
        </View>
      </View>
      <Text style={[ui.body, { paddingHorizontal: 22, paddingBottom: 22, color: palette.muted }]}>
        {role === 'Student' ? 'A little space that is yours. Make yourself at home.' : 'Supporting others starts with a space for you.'}
      </Text>
    </View>

    <View style={styles.details}>
      <View style={[ui.row, { justifyContent: 'space-between' }]}>
        <View style={ui.grow}><Text style={[ui.title, { fontSize: 21 }]}>Personal details</Text><Text style={ui.small}>{editing ? 'Update your details below.' : 'How you appear in this app.'}</Text></View>
        {!editing && <Pressable accessibilityRole="button" accessibilityLabel="Edit Profile" onPress={() => { setDraft(profile); setEditing(true); setMessage(''); setError(''); }} style={styles.edit}>
          <Ionicons name="create-outline" size={18} color={palette.teal} /><Text style={{ color: palette.teal, fontWeight: '600' }}>Edit</Text>
        </Pressable>}
      </View>
      {fields.map((field, index) => <View key={field.key} style={[styles.field, index > 0 && styles.divider]}>
        <View style={styles.fieldIcon}><Ionicons name={field.icon} size={20} color={palette.teal} /></View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={styles.label}>{field.label}{field.key === 'sex' ? ' · optional' : ''}</Text>
          {editing ? <TextInput accessibilityLabel={field.label} value={draft[field.key]} maxLength={100}
            autoCapitalize={field.key === 'id' ? 'characters' : 'words'} autoCorrect={false}
            onChangeText={value => { setDraft({ ...draft, [field.key]: value }); if (field.key === 'name') setError(''); }}
            placeholder={field.placeholder} placeholderTextColor={palette.muted}
            style={[ui.input, { fontSize: 14 }, field.key === 'name' && !!error && { borderColor: palette.danger }]} />
            : <Text selectable style={[ui.body, !profile[field.key] && { color: palette.muted }]}>{profile[field.key] || 'Not added'}</Text>}
          {field.key === 'name' && !!error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
        </View>
      </View>)}
      {editing && <View style={{ gap: 10, marginTop: 8 }}>
        <Button label="Save changes" onPress={() => {
          if (!draft.name.trim()) { setError('Please enter your name.'); return; }
          onSave({ name: draft.name.trim(), id: draft.id.trim(), sex: draft.sex.trim() });
          setEditing(false); setMessage('Your profile has been updated for this session.');
        }} />
        <Button label="Cancel" tone="secondary" onPress={() => { setDraft(profile); setEditing(false); setError(''); }} />
      </View>}
    </View>
    {!!message && <View style={[ui.row, styles.notice]}><Ionicons name="checkmark-circle" size={20} color={palette.teal} /><Text accessibilityLiveRegion="polite" style={[ui.body, ui.grow]}>{message}</Text></View>}
    <View style={[ui.row, styles.notice]}>
      <Ionicons name="information-circle-outline" size={22} color={palette.muted} />
      <View style={ui.grow}><Text style={[ui.title, { fontSize: 16 }]}>About this profile</Text><Text style={ui.small}>Details stay in this app session. Reloading or logging out clears them.</Text></View>
    </View>
    <Pressable accessibilityRole="button" onPress={() => setLogout(true)} style={styles.logout}>
      <Ionicons name="log-out-outline" size={22} color={palette.danger} /><Text style={{ color: palette.danger, fontWeight: '600', fontSize: 15 }}>Log Out</Text>
    </Pressable>
    <Dialog title="Log out?" visible={logout} onClose={() => setLogout(false)}>
      <Text style={ui.body}>Your {role.toLowerCase()} profile{role === 'Mentor' ? ' and demo referrals' : ''} will be cleared from this session.</Text>
      <Button label="Log out and clear session" tone="danger" onPress={() => { setLogout(false); onLogout(); }} />
    </Dialog>
  </>;
}
const styles = StyleSheet.create({
  adminRow: { alignItems: 'flex-end' },
  adminButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#397974', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 18 },
  adminButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  hero: { backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: palette.border },
  banner: { minHeight: 102, padding: 22, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { color: '#D5E9E5', fontSize: 10, fontWeight: '700', letterSpacing: 2, paddingTop: 6 },
  identity: { flexDirection: 'row', gap: 16, alignItems: 'center', padding: 22, paddingTop: 14 },
  avatar: { marginTop: -38, width: 78, height: 78, borderRadius: 26, backgroundColor: '#DDEDE8', borderWidth: 5, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 27, fontWeight: '600', color: '#326C66' },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EDF5F2', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.teal },
  badgeText: { fontSize: 12, color: '#39716B', fontWeight: '600' },
  details: { borderRadius: 22, backgroundColor: '#FFF', borderWidth: 1, borderColor: palette.border, padding: 20, gap: 8 },
  edit: { flexDirection: 'row', gap: 5, alignItems: 'center', minHeight: 44, paddingHorizontal: 10 },
  field: { flexDirection: 'row', gap: 12, paddingVertical: 16, alignItems: 'center' },
  divider: { borderTopWidth: 1, borderTopColor: '#EEF1F2' },
  fieldIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EFF5F4', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, color: palette.muted },
  notice: { padding: 16, borderRadius: 16, backgroundColor: '#E3EEEB', alignItems: 'flex-start' },
  logout: { minHeight: 50, alignItems: 'center', justifyContent: 'center', gap: 10, flexDirection: 'row', borderRadius: 16, borderWidth: 1, borderColor: '#E7D3D6', backgroundColor: '#FFF8F8' },
});