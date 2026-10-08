import { StyleSheet } from 'react-native';
import { palette } from '@/components/wellbeing/screen';

export const mentorStyles = StyleSheet.create({
  panel: { backgroundColor: '#FFF', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#DDE6E6', gap: 16 },
  banner: { backgroundColor: palette.ink, borderRadius: 24, padding: 24, gap: 12 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: palette.teal },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E5F1EE', alignItems: 'center', justifyContent: 'center' },
  notice: { backgroundColor: '#E3EEEB', borderRadius: 16, padding: 16, gap: 6 },
});
