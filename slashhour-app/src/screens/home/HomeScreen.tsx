import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import FeedScreen from './FeedScreen';
import NearYouScreen from './NearYouScreen';
import AppHeader from '../../components/AppHeader';
import TabBar, { Tab } from '../../components/TabBar';
import { COLORS } from '../../theme';

const tabs: Tab[] = [
  { id: 'following', label: 'You Follow' },
  { id: 'nearby', label: 'Near You' },
];

export default function HomeScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'following' | 'nearby'>('following');

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        userName={user?.name || user?.username}
      />

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
