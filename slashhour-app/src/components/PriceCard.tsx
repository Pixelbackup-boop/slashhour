import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceCardProps {
  originalPrice: string | number;
  dealPrice: string | number;
  savings: string;
  percentage: number;
}

export default function PriceCard({ originalPrice, dealPrice, savings, percentage }: PriceCardProps) {
  return (
    <View style={styles.priceSection}>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Original Price:</Text>
        <Text style={styles.originalPrice}>${originalPrice}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Deal Price:</Text>
        <Text style={styles.dealPrice}>${dealPrice}</Text>
      </View>
      <View style={styles.savingsRow}>
        <Text style={styles.savingsText}>
          You Save: ${savings} ({percentage}% OFF)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  savingsRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6BCB77',
    textAlign: 'center',
  },
});
