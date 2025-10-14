import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export default function TabBar({ tabs, activeTabId, onTabChange }: TabBarProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTabId === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text
            style={[styles.tabText, activeTabId === tab.id && styles.activeTabText]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
});
