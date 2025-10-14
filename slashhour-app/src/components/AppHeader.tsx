import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AppHeaderProps {
  userName?: string;
  onProfilePress: () => void;
}

export default function AppHeader({ userName, onProfilePress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>🍕 Slashhour</Text>
        <Text style={styles.subtitle}>Welcome, {userName || 'Guest'}</Text>
      </View>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={onProfilePress}
      >
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
});
