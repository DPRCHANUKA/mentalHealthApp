import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Role = 'student' | 'mentor';

const ROLES: { id: Role; icon: string; title: string; description: string }[] = [
  {
    id: 'student',
    icon: '🎓',
    title: 'Student',
    description:
      'Access mental health support, self-help resources and counselling',
  },
  {
    id: 'mentor',
    icon: '👤',
    title: 'Mentor',
    description: 'Support students for counselling and make a difference',
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleNext = () => {
    if (!selectedRole) return;
    router.push({ pathname: '/privacy', params: { role: selectedRole } });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Role</Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                activeOpacity={0.8}
                onPress={() => setSelectedRole(role.id)}
              >
                <Text style={styles.icon}>{role.icon}</Text>

                <View style={styles.roleContent}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>

                {isSelected && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !selectedRole && styles.nextButtonDisabled]}
          activeOpacity={0.8}
          disabled={!selectedRole}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        {/* Privacy Link */}
        <TouchableOpacity style={styles.privacyLink}>
          <Text style={styles.privacyLinkText}>
            Learn more about our privacy
          </Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 56,
  },

  backArrow: {
    fontSize: 28,
    color: Colors.light.textSecondary,
    marginRight: 16,
  },

  title: {
    fontSize: 28,
    fontFamily: 'IrishGrover',
    color: Colors.light.primary,
  },

  cards: {
    gap: 24,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 130,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  roleCardSelected: {
    borderColor: Colors.light.accent,
    backgroundColor: Colors.light.accent + '1A', // ~10% tint
  },

  icon: {
    fontSize: 40,
    marginRight: 20,
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  roleDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },

  check: {
    marginLeft: 12,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.accent,
  },

  nextButton: {
    width: '100%',
    height: 56,
    marginTop: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonDisabled: {
    opacity: 0.4,
  },

  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.surface,
  },

  privacyLink: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  privacyLinkText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  arrow: {
    marginLeft: 6,
    fontSize: 16,
    color: Colors.light.accent,
  },
});