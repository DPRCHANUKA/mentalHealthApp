import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text } from 'react-native';

type Props = {
  onDelete: () => Promise<boolean>;
};

export function DeleteProfileButton({ onDelete }: Props) {
  const [busy, setBusy] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'Delete your profile?',
      'This permanently deletes your profile data from this phone and from our servers. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const ok = await onDelete();
            setBusy(false);

            if (ok) {
              router.replace('/role-selection');
            } else {
              Alert.alert(
                "Couldn't delete your data",
                'Please check your internet connection and try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Delete profile"
      disabled={busy}
      onPress={confirmDelete}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.light.emergency,
        backgroundColor: 'rgba(201,75,85,0.08)',
        opacity: busy ? 0.6 : pressed ? 0.7 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={Colors.light.emergency} />
      ) : (
        <>
          <Ionicons name="trash-outline" size={18} color={Colors.light.emergency} />
          <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.light.emergency }}>
            Delete profile
          </Text>
        </>
      )}
    </Pressable>
  );
}