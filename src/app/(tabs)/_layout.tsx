import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';
import { palette } from '@/constants/theme';
import { useResponsive } from '@/lib/responsive';

export default function TabsLayout() {
  const { isWide } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        // Desktop windows get a persistent left sidebar; phones/tablets keep
        // the familiar bottom bar with the raised scan button.
        tabBarPosition: isWide ? 'left' : 'bottom',
      }}
      tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="food" options={{ title: 'Food' }} />
      <Tabs.Screen name="health" options={{ title: 'Health' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
