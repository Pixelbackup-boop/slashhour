import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AppHeaderProps {
  userName?: string;
}

export default function AppHeader({ userName }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>🍕 Slashhour</Text>
        <Text style={styles.subtitle}>Welcome, {userName || 'Guest'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
});
