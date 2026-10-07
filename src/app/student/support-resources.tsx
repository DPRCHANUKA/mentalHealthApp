import { useState } from 'react';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Pressable, Text, View } from 'react-native';
import { Asset, Button, Dialog, Screen, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { campusResources } from '@/constants/wellbeing-content';

export default function SupportResourcesScreen() {
  const [message, setMessage] = useState('');
  async function open(url: string, fallback: string) {
    try { await Linking.openURL(url); }
    catch { setMessage(fallback); }
  }
  return <Screen title="Support Resources" subtitle="Connect with SLIIT support services" contentStyle={{ paddingHorizontal: 20, gap: 14 }}>
    {campusResources.map((resource, index) => <View key={resource.title} style={[ui.card, { backgroundColor: index === 0 || index === 3 ? palette.pink : palette.lavender, padding: 16, gap: 12 }]}>
      <View style={ui.row}>
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}><Asset source={assets[resource.asset]} /></View>
                <View style={ui.grow}><Text style={[ui.title, { fontSize: 17 }]}>{resource.title}</Text><Text selectable style={ui.small}>{resource.phone}</Text></View>
        <Button label="Call" onPress={() => open('tel:' + resource.dial, 'Unable to open your dialer. Please call ' + resource.phone + ' from your phone.')} style={{ minWidth: 60, paddingHorizontal: 12, flexShrink: 0 }} />
      </View>
      <Text style={ui.small}>{resource.detail}</Text>
      <View style={ui.row}>

        <Pressable accessibilityRole="link" accessibilityLabel={'Official SLIIT information for ' + resource.title} onPress={() => open(resource.source, 'Open this official page in your browser: ' + resource.source)} style={{ minHeight: 46, justifyContent: 'center', paddingHorizontal: 10 }}>
          <Text style={ui.link}>SLIIT details</Text>
        </Pressable>
      </View>
    </View>)}
    <Button label="Open SLIIT Support Desk" tone="secondary" onPress={() => open('https://support.sliit.lk/', 'Visit https://support.sliit.lk/ in your browser.')} />
    <Button label="Need urgent help? Tap here" tone="danger" onPress={() => router.push('/student/emergency-support')} />
    <Text style={ui.small}>SLIIT published contacts · Checked 7 October 2026. Call opens your phone dialer. Campus services are not listed as 24-hour crisis services.</Text>
    <Dialog title="Contact information" visible={!!message} onClose={() => setMessage('')}><Text selectable style={ui.body}>{message}</Text></Dialog>
  </Screen>;
}

