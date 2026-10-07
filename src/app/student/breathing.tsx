import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Asset, Button, Chips, Dialog, Screen, ui, palette } from '@/components/wellbeing/screen';
import { wellbeingAssets as assets } from '@/constants/wellbeing-assets';
import { useBreathingSession } from '@/hooks/use-breathing-session';

const phases = ['BREATHE IN', 'HOLD', 'BREATHE OUT', 'HOLD'];
const durations = ['1 minute', '3 minutes', '5 minutes'] as const;
export default function BreathingScreen() {
  const [duration, setDuration] = useState<(typeof durations)[number]>('5 minutes');
  const [settings, setSettings] = useState(false);
  const [finished, setFinished] = useState(false);
  const seconds = parseInt(duration, 10) * 60;
  const session = useBreathingSession(seconds);
  const time = Math.floor(session.elapsed);
  return <Screen title="Breathing Exercise" subtitle="Box breathing technique" back background={palette.lavender}
    action={<Pressable accessibilityRole="button" accessibilityLabel="Breathing settings" style={ui.iconButton} onPress={() => { session.pause(); setSettings(true); }}><Asset source={assets.breathingButtonSettingsSvg} /></Pressable>}
    contentStyle={{ justifyContent: 'space-between', paddingTop: 24, minHeight: 600 }}>
    <View style={{ flex: 1, minHeight: 330, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 224, height: 224, borderRadius: 112, padding: 13, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.lavender }}>
        <View style={{ flex: 1, padding: 12, backgroundColor: '#FFF', borderRadius: 100, borderWidth: 1, borderColor: palette.border }}>
          <View style={{ flex: 1, borderRadius: 90, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[ui.title, { color: palette.muted, fontSize: 18 }]}>{session.complete ? 'COMPLETE' : session.running ? phases[session.phase] : 'BREATHING'}</Text>
            <Text style={{ color: palette.ink, fontSize: 44, fontWeight: '700' }}>{session.complete ? '✓' : session.remaining}</Text>
          </View>
        </View>
      </View>
    </View>
    <View style={{ gap: 24 }}>
      <View style={{ gap: 6 }}>
        <View accessibilityRole="progressbar" accessibilityLabel="Session progress" accessibilityValue={{ min: 0, max: seconds, now: time }} aria-valuemin={0} aria-valuemax={seconds} aria-valuenow={time} style={{ height: 4, backgroundColor: palette.border, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: 4, width: `${session.elapsed / seconds * 100}%`, backgroundColor: palette.teal }} />
        </View>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={ui.small}>{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</Text><Text style={ui.small}>{seconds / 60}:00</Text></View>
      </View>
      <View style={[ui.row, { justifyContent: 'center' }]}>
        <Button label={session.complete ? 'Replay' : 'Play'} tone="secondary" onPress={() => { setFinished(false); session.play(); }} disabled={session.running} />
        <Pressable accessibilityRole="button" accessibilityLabel="Pause breathing" accessibilityState={{ disabled: !session.running }} disabled={!session.running} onPress={session.pause} style={[ui.button, ui.primary, { minWidth: 58 }]}><Asset source={assets.breathingSvg} width={16} /></Pressable>
        <Button label="Reset" tone="secondary" onPress={() => { session.reset(); setFinished(false); }} />
      </View>
      <Button label="Complete Session" onPress={() => { session.pause(); setFinished(true); }} style={{ borderRadius: 12 }} />
    </View>
    <Dialog title="Breathing settings" visible={settings} onClose={() => setSettings(false)}>
      <Text style={ui.body}>Choose a session length. Each phase lasts four seconds. Changing the length resets the timer.</Text>
      <Chips values={durations} value={duration} onChange={value => { session.reset(); setDuration(value); }} />
    </Dialog>
    <Dialog title="Session finished" visible={finished} onClose={() => setFinished(false)}>
      <Text style={ui.body}>You took {time} seconds to pause and breathe. This session is not saved to your profile.</Text>
    </Dialog>
  </Screen>;
}


