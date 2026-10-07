import { router, type Href } from 'expo-router';
import { Image, type ImageSource } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { type PropsWithChildren, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StudentBottomNav from '@/components/student-bottom-nav';
import { Colors } from '@/constants/theme';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';

export const palette = { ...Colors.light, ink: '#202A44', muted: '#66747C', teal: '#4F9D98', pink: '#F4E5E7', lavender: '#E8E7F3', border: '#D5DFE1', danger: '#A94C57' };

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/student/student-home');
}

export function Asset({ source, width = 20, height = width, label }: { source: ImageSource; width?: number; height?: number; label?: string }) {
  return <Image source={source} contentFit="contain" style={{ width, height, flexShrink: 0 }} accessible={!!label} accessibilityLabel={label} />;
}

export function Screen({ title, subtitle, children, back = false, footer = true, background, contentStyle, action }: PropsWithChildren<{
  title?: string; subtitle?: string; back?: boolean; footer?: boolean; background?: string; contentStyle?: StyleProp<ViewStyle>; action?: ReactNode;
}>) {
  const insets = useSafeAreaInsets();
  return <View style={[ui.screen, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <StatusBar style="dark" />
    {title && <View style={ui.header}>
      {back && <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={ui.iconButton}>
        <Asset source={assets.articleButtonGoBackSvgWireframeBackArrow} />
      </Pressable>}
      <View style={ui.grow}><Text accessibilityRole="header" style={ui.heading}>{title}</Text>{subtitle && <Text style={ui.subtitle}>{subtitle}</Text>}</View>
      {action}
    </View>}
    <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={[ui.content, contentStyle, !footer && { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
    {footer && <StudentBottomNav />}
  </View>;
}

export function Button({ label, onPress, tone = 'primary', icon, disabled = false, style }: {
  label: string; onPress: () => void; tone?: 'primary' | 'secondary' | 'danger'; icon?: ReactNode; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [ui.button, tone === 'secondary' ? ui.secondary : tone === 'danger' ? ui.danger : ui.primary, style, (pressed || disabled) && { opacity: 0.65 }]}>
    {icon}<Text style={[ui.buttonText, tone === 'secondary' && { color: palette.ink }]}>{label}</Text>
  </Pressable>;
}

export function Chips<T extends string>({ values, value, onChange }: { values: readonly T[]; value: T; onChange: (value: T) => void }) {
  return <View style={ui.chips}>{values.map(item => <Pressable key={item} onPress={() => onChange(item)} accessibilityRole="button" accessibilityState={{ selected: value === item }}
    style={[ui.chip, item === value && ui.primary]}><Text style={[ui.chipText, item === value && { color: '#FFF' }]}>{item}</Text></Pressable>)}</View>;
}

export function Dialog({ title, visible, onClose, children }: PropsWithChildren<{ title: string; visible: boolean; onClose: () => void }>) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={ui.backdrop}><View style={ui.dialog} accessibilityViewIsModal>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 16 }}>
        <Text accessibilityRole="header" style={ui.heading}>{title}</Text>{children}
        <Button label="Close" tone="secondary" onPress={onClose} />
      </ScrollView>
    </View></View>
  </Modal>;
}

export function RouteLink({ label, href }: { label: string; href: Href }) {
  return <Pressable accessibilityRole="link" onPress={() => router.push(href)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={ui.link}>{label}</Text></Pressable>;
}

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  heading: { fontFamily: 'IrishGrover', fontSize: 24, color: palette.ink },
  subtitle: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 3 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 4, paddingBottom: 24, gap: 16, width: '100%', maxWidth: 620, alignSelf: 'center' },
  grow: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  body: { color: palette.text, fontSize: 14, lineHeight: 21 },
  small: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  title: { fontFamily: 'IrishGrover', fontSize: 18, color: palette.ink },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: palette.border, borderRadius: 14, padding: 14, shadowColor: '#1F2D3D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 3, elevation: 3 },
  button: { minHeight: 46, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#1F2D3D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 3, elevation: 3 },
  primary: { backgroundColor: palette.teal },
  secondary: { backgroundColor: '#FFF', borderWidth: 1, borderColor: palette.border },
  danger: { backgroundColor: palette.danger },
  buttonText: { fontFamily: 'IrishGrover', fontSize: 18, color: '#FFF', textAlign: 'center', flexShrink: 1 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: palette.border },
  chipText: { fontFamily: 'IrishGrover', fontSize: 15, color: palette.muted },
  input: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14, paddingVertical: 12, minHeight: 46, color: palette.text, fontSize: 15 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 24, paddingHorizontal: 14, borderWidth: 1, borderColor: palette.border },
  searchInput: { flex: 1, minWidth: 0, minHeight: 46, color: palette.text, fontSize: 13 },
  link: { color: palette.muted, fontSize: 13, textDecorationLine: 'underline', textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(32,42,68,0.45)', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 480, maxHeight: '85%', alignSelf: 'center', borderRadius: 22, padding: 24, backgroundColor: palette.background },
  error: { color: palette.danger, fontSize: 14, lineHeight: 20 },
});

