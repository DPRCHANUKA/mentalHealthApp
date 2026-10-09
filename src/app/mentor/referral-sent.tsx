import { MentorScreen } from '@/components/mentor/screen';
import { mentorStyles as s } from '@/components/mentor/styles';
import { Button, ui } from '@/components/wellbeing/screen';
import { useMentorSession } from '@/state/mentor-session';
import { Ionicons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

const SUCCESS_SOUND = require('../../../assets/sounds/success.mp3');
const GREEN = '#5B8F73';

export default function ReferralSentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { referrals } = useMentorSession();
  const referral = referrals.find(item => item.id === id);

  const player = useAudioPlayer(SUCCESS_SOUND);
  const status = useAudioPlayerStatus(player);
  const played = useRef(false);

  const circle = useRef(new Animated.Value(0)).current;
  const tick = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;

  // Animation
  useEffect(() => {
    if (!referral) return;
    Animated.sequence([
      Animated.spring(circle, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(tick, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        Animated.timing(ripple, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(content, { toValue: 1, duration: 500, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, [!!referral]);

  // Sound (plays once, when it is loaded)
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (referral && status.isLoaded && !played.current) {
      played.current = true;
      try {
        player.seekTo(0);
        player.play();
      } catch {}
    }
  }, [referral, status.isLoaded]);

  return <MentorScreen navigation={false} contentStyle={{ paddingTop: 36, gap: 24 }}>
    {referral ? <>
      <View style={[s.panel, { alignItems: 'center', gap: 18, paddingVertical: 32 }]}>
        {/* Animated tick */}
        <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: GREEN,
              opacity: ripple.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
              transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
            }}
          />
          <Animated.View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: GREEN,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: GREEN,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
              transform: [{ scale: circle }],
            }}
          >
            <Animated.View
              style={{
                transform: [
                  { scale: tick },
                  { rotate: tick.interpolate({ inputRange: [0, 1], outputRange: ['-40deg', '0deg'] }) },
                ],
              }}
            >
              <Ionicons name="checkmark" size={52} color="#FFF" />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            alignItems: 'center',
            gap: 18,
            opacity: content,
            transform: [{ translateY: content.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          }}
        >
          <Text style={[ui.heading, { color: GREEN, fontSize: 32 }]}>Referral prepared</Text>
          <Text style={[s.eyebrow, { backgroundColor: '#E3EEEB', padding: 10, borderRadius: 12 }]}>DEMO CONFIRMATION</Text>
          <Text style={[ui.title, { textAlign: 'center' }]}>Demo confirmation for{'\n'}{referral.student}</Text>
          <Text style={[ui.small, { textAlign: 'center' }]}>Not delivered. This referral exists only in this app session.</Text>
        </Animated.View>
      </View>

      <Animated.View style={[s.panel, { opacity: content }]}>
        <Text style={s.eyebrow}>REFERRAL SUMMARY</Text>
        <Text style={ui.title}>To: {referral.recipient}</Text>
        <Text style={ui.title}>Service: {referral.service}</Text>
        <Text style={ui.title}>Priority: {referral.priority}</Text>
        {!!referral.reason && <Text style={ui.body}>Reason: {referral.reason}</Text>}
      </Animated.View>
    </> : <>
      <Text style={ui.heading}>No referral available</Text>
      <Text style={ui.body}>This demo referral may have been cleared when the app reloaded.</Text>
    </>}
    <Button label="View my referrals" tone="secondary" onPress={() => router.replace('/mentor/referrals')} />
    <Button label="Back to Mentor Home" onPress={() => router.replace('/mentor/mentor-home')} style={{ borderRadius: 16 }} />
  </MentorScreen>;
}