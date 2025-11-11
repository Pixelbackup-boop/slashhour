import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeedScreen from './FeedScreen';
import NearYouScreen from './NearYouScreen';
import TabBar, { Tab } from '../../components/TabBar';
import LogoHeader from '../../components/LogoHeader';
import { Icon } from '../../components/icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, RADIUS } from '../../theme';

const tabs: Tab[] = [
  { id: 'following', label: 'You Follow' },
  { id: 'nearby', label: 'Near You' },
];

export default function HomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'following' | 'nearby'>('following');
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

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
      <LogoHeader
        rightButton={
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Icon name="search" size={24} color={colors.textPrimary} style="line" />
          </TouchableOpacity>
        }
      />

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
  searchButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
});
