import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const BG = '#0B3037';
const LOGO = require('../../assets/images/mental-health-logo.png');
const SOUND = require('../../assets/sounds/splash.mp3'); // <- your sound track

/* ---------- SPLASH LENGTH ----------
   Total time of the splash in seconds.
   Set this to the length of your music so everything ends together. */
const SPLASH_SECONDS = 11;

/* ---------- TIMELINE ----------
   These times (seconds) are a 9-second layout (BASE).
   Everything is stretched automatically to SPLASH_SECONDS. */
const BASE = 9;
const T = {
  ellipseIn: 0.3,     // ellipse appears
  ellipseShrink: 1.5, // ellipse gets smaller
  logoOut: 1.9,       // logo comes out through the ellipse and rises
  ellipseOut: 2.9,    // ellipse disappears (after logo is out)
  logoLand: 3.3,      // logo bounces to center and gets smaller
  logoLeft: 4.5,      // logo bounces to the left
  textIn: 5.0,        // letters start to appear
  lights: [6.0, 6.8, 7.6], // light sweeps across the text (add or remove times)
};

const LOGO_SIZE = 120;
const LOGO_RADIUS = 28;
const SHRINK = 0.7;          // final logo scale
const GAP = 14;              // space between logo and text
const ELLIPSE_Y = 30;        // ellipse center sits a bit below screen center
const ELLIPSE_W = 210;
const ELLIPSE_H = 72;        // true ellipse, about 2.9:1 like your picture
const LIFT = -150;           // how high the logo rises
const FULL_TEXT = 'Luma Wellbeing';
const LETTER_DELAY = 80;     // ms between letters appearing
const LIGHT_DELAY = 45;      // ms between letters lighting up (sweep speed)

// logo thickness (nearest -> farthest). Use [] for a flat logo.
const LOGO_EDGE = ['#2F9AA0', '#227A82', '#185B63', '#0F3F47'];
// text thickness (nearest -> farthest)
const TEXT_EDGE = ['#7FD6D0', '#4DB0B0', '#2F8C92', '#1D6870', '#10464E'];

/* ---------- Ellipse ----------
   A perfect circle squashed with scaleY = a true ellipse. */
function Ellipse() {
  return (
    <View style={styles.ellipseBox}>
      <LinearGradient
        colors={['#3A3A3A', '#262626', '#161616']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.ellipseCircle}
      >
        {/* soft shine on the top */}
        <LinearGradient
          colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
          style={styles.ellipseShine}
        />
      </LinearGradient>
    </View>
  );
}

/* ---------- 3D logo ---------- */
function Logo3D() {
  return (
    <View style={styles.logoBox}>
      {/* thickness (far -> near) */}
      {LOGO_EDGE.map((c, i) => ({ c, i }))
        .reverse()
        .map(({ c, i }) => (
          <Image
            key={i}
            source={LOGO}
            resizeMode="contain"
            style={[styles.logoEdge, { top: i + 1, tintColor: c }]}
          />
        ))}

      {/* face */}
      <View style={styles.face}>
        <Image source={LOGO} resizeMode="contain" style={styles.logoFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
          style={styles.gloss}
        />
      </View>
    </View>
  );
}

/* ---------- 3D letter ---------- */
function Letter3D({
  ch,
  appear,
  lit,
}: {
  ch: string;
  appear: Animated.Value;
  lit: Animated.Value;
}) {
  const c = ch === ' ' ? '\u00A0' : ch;

  return (
    <Animated.View
      style={{
        opacity: appear,
        transform: [
          {
            translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
          },
          { translateY: lit.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
          { scale: lit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
        ],
      }}
    >
      {/* soft drop shadow */}
      <Text style={[styles.title, styles.abs, { color: 'rgba(0,0,0,0.35)', top: 8, left: 3 }]}>
        {c}
      </Text>

      {/* thickness (far -> near) */}
      {TEXT_EDGE.map((col, i) => ({ col, i }))
        .reverse()
        .map(({ col, i }) => (
          <Text
            key={i}
            style={[styles.title, styles.abs, { color: col, top: i + 1, left: (i + 1) * 0.7 }]}
          >
            {c}
          </Text>
        ))}

      {/* face */}
      <Text style={styles.title}>{c}</Text>

      {/* light */}
      <Animated.Text style={[styles.title, styles.abs, styles.lit, { opacity: lit }]}>
        {c}
      </Animated.Text>
    </Animated.View>
  );
}

/* ---------- Splash ---------- */
export default function SplashScreen() {
  const router = useRouter();
  const player = useAudioPlayer(SOUND);
  const status = useAudioPlayerStatus(player);

  // ellipse
  const ellipseOpacity = useRef(new Animated.Value(0)).current;
  const ellipseScale = useRef(new Animated.Value(0)).current;

  // logo
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(ELLIPSE_Y)).current;
  const shrink = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  // letters
  const appear = useRef(FULL_TEXT.split('').map(() => new Animated.Value(0))).current;
  const lit = useRef(FULL_TEXT.split('').map(() => new Animated.Value(0))).current;

  // run state
  const startedRef = useRef(false);
  const navigatedRef = useRef(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const navRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // measured text width -> exact centering of logo + text
  const [textW, setTextW] = useState(190);
  const logoW = LOGO_SIZE * SHRINK;
  const total = logoW + GAP + textW;
  const logoShift = -total / 2 + logoW / 2;
  const textLeft = -total / 2 + logoW + GAP;

  const goNext = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    router.replace('/welcome' as Href);
  };

  const begin = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // stretch factor compared to the 9s layout
    const k = SPLASH_SECONDS / BASE;
    const d = (ms: number) => ms * k;
    const at = (sec: number, anim: Animated.CompositeAnimation) =>
      Animated.sequence([Animated.delay(sec * k * 1000), anim]);

    // sound and animation start together
    try {
      player.seekTo(0);
      player.play();
    } catch {}

    const timeline = Animated.parallel([
      // 1) ellipse appears
      at(
        T.ellipseIn,
        Animated.parallel([
          Animated.timing(ellipseOpacity, { toValue: 1, duration: d(400), useNativeDriver: true }),
          Animated.timing(ellipseScale, {
            toValue: 1,
            duration: d(800),
            easing: Easing.out(Easing.back(1.4)),
            useNativeDriver: true,
          }),
        ])
      ),

      // 2) ellipse gets smaller
      at(
        T.ellipseShrink,
        Animated.timing(ellipseScale, {
          toValue: 0.35,
          duration: d(700),
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        })
      ),

      // 3) logo comes out THROUGH the ellipse:
      //    it grows from the ellipse center while rising (same movement)
      at(
        T.logoOut,
        Animated.parallel([
          Animated.timing(logoOpacity, { toValue: 1, duration: d(150), useNativeDriver: true }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: d(1000),
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(y, {
            toValue: LIFT,
            duration: d(1000),
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ),

      // 4) ellipse disappears (after the logo is out)
      at(
        T.ellipseOut,
        Animated.parallel([
          Animated.timing(ellipseOpacity, { toValue: 0, duration: d(400), useNativeDriver: true }),
          Animated.timing(ellipseScale, {
            toValue: 0,
            duration: d(400),
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ),

      // 5) logo bounces to center and gets smaller
      at(
        T.logoLand,
        Animated.parallel([
          Animated.spring(y, {
            toValue: 0,
            damping: 7 / k,
            stiffness: 120 / (k * k),
            mass: 1,
            useNativeDriver: true,
          }),
          Animated.timing(shrink, {
            toValue: SHRINK,
            duration: d(500),
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ),

      // 6) logo bounces to the left
      at(
        T.logoLeft,
        Animated.spring(slide, {
          toValue: 1,
          damping: 8 / k,
          stiffness: 110 / (k * k),
          mass: 1,
          useNativeDriver: true,
        })
      ),

      // 7) letters appear one by one
      ...appear.map((v, i) =>
        at(
          T.textIn + (i * LETTER_DELAY) / 1000,
          Animated.timing(v, {
            toValue: 1,
            duration: d(350),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        )
      ),

      // 8) light sweeps across the text (one sweep per T.lights entry)
      ...T.lights.flatMap((start) =>
        lit.map((v, i) =>
          at(
            start + (i * LIGHT_DELAY) / 1000,
            Animated.sequence([
              Animated.timing(v, { toValue: 1, duration: d(180), useNativeDriver: true }),
              Animated.timing(v, { toValue: 0, duration: d(360), useNativeDriver: true }),
            ])
          )
        )
      ),
    ]);

    animRef.current = timeline;
    timeline.start();

    // go to the next screen exactly when the splash time is over
    navRef.current = setTimeout(goNext, SPLASH_SECONDS * 1000);
  };

  // start as soon as the sound is loaded
  useEffect(() => {
    if (status.isLoaded) begin();
  }, [status.isLoaded]);

  // fallback: start anyway if the sound takes too long to load
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    const fallback = setTimeout(begin, 1500);

    return () => {
      clearTimeout(fallback);
      animRef.current?.stop();
      if (navRef.current) clearTimeout(navRef.current);
      startedRef.current = false;
      navigatedRef.current = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.stage}>
        {/* ellipse */}
        <Animated.View
          style={[
            styles.ellipseWrap,
            { opacity: ellipseOpacity, transform: [{ scale: ellipseScale }] },
          ]}
        >
          <Ellipse />
        </Animated.View>

        {/* 3D title */}
        <View style={[styles.textWrap, { marginLeft: textLeft }]}>
          <View
            style={styles.letterRow}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (Math.abs(w - textW) > 1) setTextW(w);
            }}
          >
            {FULL_TEXT.split('').map((ch, i) => (
              <Letter3D key={i} ch={ch} appear={appear[i]} lit={lit[i]} />
            ))}
          </View>
        </View>

        {/* 3D logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { translateY: y },
              {
                translateX: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, logoShift],
                }),
              },
              { scale: Animated.multiply(logoScale, shrink) },
            ],
          }}
        >
          <Logo3D />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
  },
  stage: {
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abs: {
    position: 'absolute',
  },

  // ellipse
  ellipseWrap: {
    position: 'absolute',
    top: LOGO_SIZE / 2 + ELLIPSE_Y - ELLIPSE_H / 2,
    left: '50%',
    marginLeft: -ELLIPSE_W / 2,
    width: ELLIPSE_W,
    height: ELLIPSE_H,
  },
  ellipseBox: {
    width: ELLIPSE_W,
    height: ELLIPSE_H,
  },
  // perfect circle, squashed vertically = true ellipse
  ellipseCircle: {
    position: 'absolute',
    left: 0,
    top: (ELLIPSE_H - ELLIPSE_W) / 2,
    width: ELLIPSE_W,
    height: ELLIPSE_W,
    borderRadius: ELLIPSE_W / 2,
    overflow: 'hidden',
    transform: [{ scaleY: ELLIPSE_H / ELLIPSE_W }],
  },
  ellipseShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },

  // logo
  logoBox: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logoEdge: {
    position: 'absolute',
    left: 0,
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_RADIUS,
  },
  face: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_RADIUS,
    overflow: 'hidden',
  },
  logoFill: {
    width: '100%',
    height: '100%',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: LOGO_SIZE * 0.4,
  },

  // title
  textWrap: {
    position: 'absolute',
    top: 0,
    height: LOGO_SIZE,
    left: '50%',
    width: 400,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  letterRow: {
    flexDirection: 'row',
  },
  title: {
    fontFamily: 'IrishGrover',
    fontSize: 28,
    color: '#FFFFFF',
  },
  lit: {
    top: 0,
    left: 0,
    color: '#C9FFF9',
    textShadowColor: 'rgba(120, 255, 240, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});