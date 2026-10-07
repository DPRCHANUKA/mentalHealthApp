import { useState } from 'react';
import * as Linking from 'expo-linking';
import { Text, View, Pressable } from 'react-native';
import { Asset, Button, Dialog, RouteLink, Screen, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';

// Sri Lankan services: https://www.nimh.health.gov.lk/ and https://www.1990.lk/faq/
// These numbers are explicitly region-labelled, not inferred from device location.
export default function EmergencySupportScreen() {
  const [message, setMessage] = useState('');
  async function open(url: string) {
    try { await Linking.openURL(url); }
    catch { setMessage('This device could not open that service. Use the number or website shown on this screen.'); }
  }
  return <Screen title="Emergency Support" subtitle="Immediate support in Sri Lanka">
    <View style={[ui.row, { backgroundColor: palette.danger, borderRadius: 12, padding: 13, alignItems: 'flex-start' }]}>
      <Asset source={assets.emergencyWarningIconSvg} /><Text style={{ flex: 1, color: '#FFF', fontSize: 13, lineHeight: 17, fontWeight: '600' }}>For a medical emergency in Sri Lanka, call 1990 for an ambulance. For urgent mental health support, call 1926.</Text>
    </View>
    <Button label="Call Crisis Helpline (1926)" tone="danger" icon={<Asset source={assets.emergencySvg} width={16} />} onPress={() => open('tel:1926')} />
    <Button label="Message on-Call Counselor" icon={<Asset source={assets.emergencySvg1} width={16} />} onPress={() => setMessage('Campus on-call messaging is not connected. In Sri Lanka, call the National Mental Health Helpline on 1926. For an emergency ambulance, call 1990.')} />
    {[
      { title: 'National Mental Health Helpline', detail: 'Sri Lanka · Call 1926', url: 'tel:1926' },
      { title: '1990 Suwa Seriya Ambulance', detail: 'Sri Lanka · Call 1990 · Free emergency ambulance', url: 'tel:1990' },
      { title: 'National Institute of Mental Health', detail: 'Official Sri Lankan mental health information', url: 'https://www.nimh.health.gov.lk/' },
    ].map(resource => <Pressable accessibilityRole="link" key={resource.title} onPress={() => open(resource.url)} style={[ui.card, ui.row, { borderRadius: 8 }]}>
      <View style={ui.grow}><Text style={{ fontSize: 15, fontWeight: '700', color: palette.ink }}>{resource.title}</Text><Text style={ui.small}>{resource.detail}</Text></View><Asset source={assets.emergencySvg2} width={16} />
    </Pressable>)}
    <RouteLink label="Learn more about support resources" href="/student/support-resources" />
    <Text style={ui.small}>1926 and 1990 are Sri Lankan short-code numbers. Tap a call option to open your phone dialer.</Text>
    <Dialog title="Support information" visible={!!message} onClose={() => setMessage('')}><Text style={ui.body}>{message}</Text></Dialog>
  </Screen>;
}


