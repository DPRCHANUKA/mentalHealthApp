import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { removeCounselor, useCounselors } from '@/data/counselor-store';

const TEAL = '#4FA69E';
const NAVY = '#1F2D45';

export default function AdminHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const counselors = useCounselors();

  const confirmRemove = (id: string, name: string) => {
    Alert.alert('Remove counselor', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCounselor(id) },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Log out of the admin account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => router.replace('/student/profile' as Href) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Welcome, Admin</Text>
          </View>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color="#B42318" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="people" size={26} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.statNumber}>{counselors.length}</Text>
            <Text style={styles.statLabel}>
              {counselors.length === 1 ? 'Counselor' : 'Counselors'} added
            </Text>
          </View>
        </View>

        {/* Add counselor */}
        <Pressable
          onPress={() => router.push('/student/add-counselor' as Href)}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Counselor</Text>
        </Pressable>

        {/* List */}
        <Text style={styles.sectionTitle}>Counselors</Text>

        {counselors.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No counselors yet. Tap “Add Counselor” to create one.</Text>
          </View>
        ) : (
          counselors.map((c) => {
            const name = `${c.firstName} ${c.lastName}`;
            const initials = `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase();
            return (
              <View key={c.id} style={styles.row}>
                {c.photoUri ? (
                  <Image source={{ uri: c.photoUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.initials}>{initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {c.specialties.join(', ')}
                  </Text>
                </View>
                <Pressable onPress={() => confirmRemove(c.id, name)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={22} color="#B42318" />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF1F4' },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  heading: { fontSize: 26, fontWeight: '700', color: NAVY },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E7D3D6',
    backgroundColor: '#FFF8F8',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: { color: '#B42318', fontWeight: '600', fontSize: 13 },

  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D9E2E7',
  },
  statIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#397974',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: NAVY },
  statLabel: { fontSize: 14, color: '#6B7280' },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 16,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: NAVY, marginTop: 28, marginBottom: 10 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D9E2E7',
  },
  avatar: { width: 50, height: 50, borderRadius: 14 },
  avatarFallback: { backgroundColor: '#D5F5E8', alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 17, fontWeight: '700', color: '#0D6A4D' },
  name: { fontSize: 16, fontWeight: '700', color: NAVY },
  meta: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  empty: { alignItems: 'center', gap: 8, paddingVertical: 36 },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  pressed: { opacity: 0.85 },
});