import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeedScreen from './FeedScreen';
import NearYouScreen from './NearYouScreen';
import TabBar, { Tab } from '../../components/TabBar';
import LogoHeader from '../../components/LogoHeader';
import { COLORS } from '../../theme';

const tabs: Tab[] = [
  { id: 'following', label: 'You Follow' },
  { id: 'nearby', label: 'Near You' },
];

export default function HomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'following' | 'nearby'>('following');
  const insets = useSafeAreaInsets();

  // Memoize container style to prevent recreating on every render
  const containerStyle = useMemo(() => [
    styles.container,
    {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }
  ], [insets.top, insets.left, insets.right]);

  return (
    <View style={containerStyle}>
      <LogoHeader />

      <TabBar
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'following' | 'nearby')}
      />

      {activeTab === 'following' ? <FeedScreen /> : <NearYouScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
