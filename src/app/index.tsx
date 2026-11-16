import { Redirect, type Href } from 'expo-router';
import { useEffect, useState } from 'react';

import { SplashView } from '@/components/splash-view';
import { useApp } from '@/store/app-provider';

const MIN_SPLASH_MS = 1100;

export default function IndexScreen() {
  const { hydrated, session, onboarded, t } = useApp();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!hydrated || !minElapsed) {
    return <SplashView tagline={t('app.tagline')} />;
  }

  const href: Href = !session
    ? '/(auth)/welcome'
    : onboarded
      ? '/(tabs)'
      : '/onboarding';

  return <Redirect href={href} />;
}
