import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CountdownBoxProps {
  timeRemaining: string;
  isFlashDeal?: boolean;
}

export default function CountdownBox({ timeRemaining, isFlashDeal }: CountdownBoxProps) {
  return (
    <View>
      <View style={styles.countdownBox}>
        <Text style={styles.countdownIcon}>⏰</Text>
        <View>
          <Text style={styles.countdownLabel}>Deal ends in</Text>
          <Text style={styles.countdownText}>{timeRemaining}</Text>
        </View>
      </View>
      {isFlashDeal && (
        <View style={styles.flashBadge}>
          <Text style={styles.flashText}>⚡ FLASH DEAL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  countdownBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  countdownIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  flashBadge: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  flashText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
  },
});
