import { Colors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function MentorHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mentor Home (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  text: {
    fontSize: 18,
    color: Colors.light.primary,
  },
});