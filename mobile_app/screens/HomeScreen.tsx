import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { styles } from '../styles';
import CornerAccents from '../components/CornerAccents';
import { BrandText, LockIcon } from '../components/Icons';

interface HomeScreenProps {
  onShowAuth: () => void;
}

// ── Blinking cursor ──────────────────────────────────────────────────────────
function BlinkingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ])).start();
  }, []);
  return <Animated.Text style={{ color: '#4ade80', fontSize: 13, opacity }}>█</Animated.Text>;
}

// ── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({ text, style, speed = 55 }: { text: string; style?: any; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0; setDisplayed('');
    const t = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <Text style={style}>{displayed}</Text>;
}

// ── Floating 3-D-ish card ────────────────────────────────────────────────────
function FloatingCard() {
  const bobY   = useRef(new Animated.Value(0)).current;
  const tiltX  = useRef(new Animated.Value(0)).current; // skewX proxy via rotate
  const scanX  = useRef(new Animated.Value(-1)).current;
  const chipGlow = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bob up/down
    Animated.loop(Animated.sequence([
      Animated.timing(bobY,  { toValue: -10, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(bobY,  { toValue:   0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();

    // Gentle tilt
    Animated.loop(Animated.sequence([
      Animated.timing(tiltX, { toValue:  1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(tiltX, { toValue: -1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    // Scan beam sweeping left→right
    Animated.loop(Animated.sequence([
      Animated.timing(scanX, { toValue: 1.2, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(scanX, { toValue: -1, duration: 0, useNativeDriver: true }),
      Animated.delay(600),
    ])).start();

    // Chip glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(chipGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(chipGlow, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
    ])).start();

    // Tap ring burst — repeating
    const burstRing = () => {
      ringScale.setValue(0.4);
      ringOpacity.setValue(0.8);
      Animated.parallel([
        Animated.timing(ringScale,   { toValue: 1.6, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0,   duration: 1000, useNativeDriver: true }),
      ]).start(() => setTimeout(burstRing, 1400));
    };
    setTimeout(burstRing, 600);
  }, []);

  const skew = tiltX.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] });
  const scanTranslate = scanX.interpolate({ inputRange: [-1, 1.2], outputRange: [-220, 220] });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 220, marginVertical: 8 }}>

      {/* Tap ring behind card */}
      <Animated.View style={{
        position: 'absolute',
        width: 200, height: 130, borderRadius: 16,
        borderWidth: 2, borderColor: '#6366f1',
        opacity: ringOpacity,
        transform: [{ scale: ringScale }],
      }} />

      {/* Shadow / depth layer */}
      <Animated.View style={{
        position: 'absolute',
        width: 200, height: 120, borderRadius: 14,
        backgroundColor: '#6366f1',
        opacity: 0.12,
        transform: [{ translateY: bobY }, { translateY: 14 }, { scaleX: 0.88 }],
      }} />

      {/* Card body */}
      <Animated.View style={{
        width: 200, height: 120, borderRadius: 12,
        backgroundColor: '#0d0d1a',
        borderWidth: 1, borderColor: '#6366f1',
        overflow: 'hidden',
        transform: [{ translateY: bobY }, { skewX: skew }],
      }}>
        {/* Gradient-like top strip */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 40,
          backgroundColor: '#6366f1', opacity: 0.18,
        }} />

        {/* Chip */}
        <Animated.View style={{
          position: 'absolute', top: 18, left: 16,
          width: 32, height: 24, borderRadius: 4,
          backgroundColor: '#f59e0b',
          opacity: chipGlow,
        }}>
          {/* Chip lines */}
          <View style={{ position: 'absolute', top: 8, left: 4, right: 4, height: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <View style={{ position: 'absolute', top: 14, left: 4, right: 4, height: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <View style={{ position: 'absolute', left: 14, top: 4, bottom: 4, width: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </Animated.View>

        {/* RFID symbol top-right */}
        <View style={{ position: 'absolute', top: 14, right: 14 }}>
          {[10, 16, 22].map((s, i) => (
            <View key={i} style={{
              position: 'absolute',
              width: s, height: s, borderRadius: s / 2,
              borderWidth: 1.2, borderColor: '#6366f1',
              opacity: 0.5 + i * 0.15,
              top: -(s / 2) + 5, left: -(s / 2) + 5,
            }} />
          ))}
        </View>

        {/* Card number dots */}
        <View style={{ position: 'absolute', bottom: 28, left: 16, flexDirection: 'row', gap: 6 }}>
          {[0,1,2,3].map(g => (
            <View key={g} style={{ flexDirection: 'row', gap: 3 }}>
              {[0,1,2,3].map(d => (
                <View key={d} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#6366f1', opacity: 0.6 }} />
              ))}
            </View>
          ))}
        </View>

        {/* BillIO brand on card */}
        <View style={{ position: 'absolute', bottom: 10, right: 14 }}>
          <BrandText size={11} />
        </View>

        {/* Scan beam */}
        <Animated.View style={{
          position: 'absolute', top: 0, bottom: 0, width: 40,
          backgroundColor: '#818cf8',
          opacity: 0.12,
          transform: [{ translateX: scanTranslate }],
        }} />
      </Animated.View>
    </View>
  );
}

// ── Live feed ticker ─────────────────────────────────────────────────────────
const FEED_ITEMS = [
  { type: 'topup',   uid: 'A3F2••••', amount: '+$50',  time: 'just now' },
  { type: 'payment', uid: 'B1C9••••', amount: '-$12',  time: '2s ago'   },
  { type: 'topup',   uid: 'D4E7••••', amount: '+$100', time: '5s ago'   },
  { type: 'payment', uid: 'F0A1••••', amount: '-$8',   time: '9s ago'   },
];

function LiveFeed() {
  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setIdx(i => (i + 1) % FEED_ITEMS.length);
    }, 2500);
    return () => clearInterval(cycle);
  }, []);

  const item = FEED_ITEMS[idx];
  const isTopup = item.type === 'topup';

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#0a0a12', borderWidth: 1,
      borderColor: isTopup ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
      padding: 12, marginBottom: 16, gap: 10,
    }}>
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: isTopup ? '#22c55e' : '#ef4444',
      }} />
      <Text style={{ color: '#555570', fontSize: 11, fontFamily: 'monospace', flex: 1 }}>
        {item.uid}
      </Text>
      <Text style={{ color: isTopup ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 'bold' }}>
        {item.amount}
      </Text>
      <Text style={{ color: '#555570', fontSize: 10 }}>{item.time}</Text>
    </Animated.View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen({ onShowAuth }: HomeScreenProps) {
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-24)).current;
  const bodyFade    = useRef(new Animated.Value(0)).current;
  const bodySlide   = useRef(new Animated.Value(32)).current;
  const btnScale    = useRef(new Animated.Value(0.88)).current;
  const btnFade     = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 700, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(bodyFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(bodySlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      ]),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <ScrollView style={styles.homeContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.homeContent}>

        {/* ── Brand ── */}
        <Animated.View style={[styles.homeHeader, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <Animated.View style={{ opacity: glowOpacity }}>
            <Text style={styles.homeTitle}><BrandText size={52} /></Text>
          </Animated.View>
          <TypewriterText text="Secure · Real-time · IoT Payments" style={styles.homeSubtitle} speed={42} />
        </Animated.View>

        {/* ── 3D Card hero ── */}
        <Animated.View style={{ opacity: bodyFade, transform: [{ translateY: bodySlide }] }}>
          <View style={{
            backgroundColor: '#0a0a12', borderWidth: 1, borderColor: '#1f2937',
            marginBottom: 20, position: 'relative', overflow: 'visible',
          }}>
            <CornerAccents color="#6366f1" size={12} thickness={2} />
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#555570', fontSize: 10, letterSpacing: 2 }}>RFID CARD READER</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' }} />
                  <Text style={{ color: '#555570', fontSize: 9, letterSpacing: 1 }}>STANDBY</Text>
                </View>
              </View>
            </View>

            <FloatingCard />

            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <Text style={{ color: '#555570', fontSize: 10, textAlign: 'center', letterSpacing: 1 }}>
                TAP CARD TO AUTHENTICATE
              </Text>
            </View>
          </View>

          {/* ── Live feed ── */}
          <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: '#555570', fontSize: 10, letterSpacing: 2 }}>LIVE TRANSACTIONS</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#22c55e' }} />
                <Text style={{ color: '#22c55e', fontSize: 9, letterSpacing: 1 }}>STREAMING</Text>
              </View>
            </View>
            <LiveFeed />
          </View>

          {/* ── Stats row ── */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'UPTIME',   value: '99.9%',    color: '#22c55e' },
              { label: 'PROTOCOL', value: 'MQTT',     color: '#6366f1' },
              { label: 'FREQ',     value: '13.56MHz', color: '#f59e0b' },
            ].map(s => (
              <View key={s.label} style={{
                flex: 1, backgroundColor: '#0a0a12',
                borderWidth: 1, borderColor: '#1f2937', padding: 12, alignItems: 'center',
              }}>
                <Text style={{ color: s.color, fontSize: 13, fontWeight: 'bold' }}>{s.value}</Text>
                <Text style={{ color: '#555570', fontSize: 9, letterSpacing: 1, marginTop: 3 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Terminal ── */}
          <View style={[styles.homeTerminal, { marginBottom: 24 }]}>
            <CornerAccents color="#6366f1" size={12} thickness={2} />
            <View style={styles.homeTerminalHeader}>
              <View style={styles.homeTerminalDots}>
                <View style={[styles.homeTerminalDot, { backgroundColor: '#ef4444' }]} />
                <View style={[styles.homeTerminalDot, { backgroundColor: '#f59e0b' }]} />
                <View style={[styles.homeTerminalDot, { backgroundColor: '#22c55e' }]} />
              </View>
              <Text style={styles.homeTerminalTitle}>billIO.log</Text>
              <Text style={styles.homeTerminalAction}>LIVE</Text>
            </View>
            <View style={styles.homeTerminalBody}>
              <Text style={styles.homeTerminalText}><Text style={styles.homeTerminalPrompt}>sys  </Text><Text style={{ color: '#22c55e' }}>BillIO v1.0 initialized</Text></Text>
              <Text style={styles.homeTerminalText}><Text style={styles.homeTerminalPrompt}>net  </Text><Text style={{ color: '#f59e0b' }}>Connecting to MQTT broker...</Text></Text>
              <Text style={[styles.homeTerminalText, styles.homeTerminalError]}><Text style={styles.homeTerminalErrorLabel}>err  </Text>WebSocket fault — retrying</Text>
              <Text style={styles.homeTerminalText}><Text style={styles.homeTerminalPrompt}>rfid </Text>Listening on 13.56 MHz</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.homeTerminalText, { marginBottom: 0 }]}><Text style={styles.homeTerminalPrompt}>~    </Text></Text>
                <BlinkingCursor />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── CTA ── */}
        <Animated.View style={{ opacity: btnFade, transform: [{ scale: btnScale }], marginBottom: 40 }}>
          <TouchableOpacity style={styles.homeAuthButton} onPress={onShowAuth} activeOpacity={0.82}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LockIcon size={20} color="#fff" />
              <Text style={styles.homeAuthButtonText}>Sign In / Sign Up</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.homeFooter}>
          <Text style={styles.homeFooterText}>© 2026 1nt3rn4l_53rv3r_3rr0r | SYSTEM v1.0</Text>
        </View>

      </View>
    </ScrollView>
  );
}
