import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useBreathingSession(duration: number) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const accumulated = useRef(0);
  const startedAt = useRef<number | null>(null);
  const currentElapsed = useCallback(() => Math.min(duration, accumulated.current + (startedAt.current === null ? 0 : (Date.now() - startedAt.current) / 1000)), [duration]);
  const pause = useCallback(() => {
    accumulated.current = currentElapsed();
    startedAt.current = null;
    setElapsed(accumulated.current);
    setRunning(false);
  }, [currentElapsed]);
  const reset = useCallback(() => {
    startedAt.current = null;
    accumulated.current = 0;
    setElapsed(0);
    setRunning(false);
  }, []);
  const play = useCallback(() => {
    if (startedAt.current !== null) return;
    if (accumulated.current >= duration) accumulated.current = 0;
    startedAt.current = Date.now();
    setRunning(true);
  }, [duration]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const seconds = currentElapsed();
      setElapsed(seconds);
      if (seconds >= duration) pause();
    }, 100);
    return () => clearInterval(timer);
  }, [running, duration, currentElapsed, pause]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') pause(); });
    return () => subscription.remove();
  }, [pause]);
  useFocusEffect(useCallback(() => () => pause(), [pause]));
  const phase = Math.floor(elapsed / 4) % 4;
  return { elapsed, running, play, pause, reset, phase, remaining: 4 - (Math.floor(elapsed) % 4), complete: elapsed >= duration };
}

