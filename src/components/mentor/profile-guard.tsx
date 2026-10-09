import { router } from 'expo-router';
import { Alert } from 'react-native';

export function promptCompleteProfile() {
  Alert.alert(
    'Complete your profile',
    'Please fill in your profile details before creating a referral.',
    [
      { text: 'Cancel', style: 'cancel' }, // stays on the same screen
      { text: 'OK', onPress: () => router.push('/mentor/profile') },
    ],
    { cancelable: true }
  );
}