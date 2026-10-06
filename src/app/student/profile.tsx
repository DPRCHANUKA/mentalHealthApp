import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StudentPlaceholder from '@/components/student-placeholder';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleAddCounselor = () => {
    router.push('/student/add-counselor');
  };

  return (
    <View style={styles.container}>
      <StudentPlaceholder title="Profile" showBack />

      {/* Button placed in the area under the title */}
      <View
        style={[styles.buttonWrapper, { top: insets.top + 90 }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleAddCounselor}
          accessibilityRole="button"
          accessibilityLabel="Add Counselor"
        >
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Add Counselor</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4FA69E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});