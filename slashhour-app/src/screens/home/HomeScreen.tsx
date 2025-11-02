import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LogoHeader />

      <TabBar
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'following' | 'nearby')}
      />

      {activeTab === 'following' ? <FeedScreen /> : <NearYouScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
