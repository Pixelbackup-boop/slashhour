import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StockBarProps {
  quantityAvailable: number;
  quantityRedeemed: number;
}

export default function StockBar({ quantityAvailable, quantityRedeemed }: StockBarProps) {
  const remaining = quantityAvailable - quantityRedeemed;
  const percentage = ((remaining / quantityAvailable) * 100);

  return (
    <View>
      <View style={styles.stockBar}>
        <View style={[styles.stockFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.stockText}>
        {remaining} of {quantityAvailable} remaining
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stockBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stockFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  stockText: {
    fontSize: 14,
    color: '#666',
  },
});
