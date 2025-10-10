import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Deal } from '../types/models';
import { getCategoryImage } from '../utils/categoryImages';

interface DealCardProps {
  deal: Deal;
  onPress?: () => void;
}

export default function DealCard({ deal, onPress }: DealCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  const calculateTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(deal.expires_at);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Expired';
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 3600000); // Update every hour (3600000ms = 1 hour)

    return () => clearInterval(interval);
  }, [deal.expires_at]);

  const calculateDiscount = () => {
    const original = Number(deal.original_price) || 0;
    const discounted = Number(deal.discounted_price) || 0;
    const savings = original - discounted;
    const percentage = original > 0 ? (savings / original) * 100 : 0;
    return {
      savings: savings.toFixed(2),
      percentage: Math.round(percentage),
    };
  };

  const getDiscountText = () => {
    const { percentage, savings } = calculateDiscount();
    if (percentage > 0) {
      return `${percentage}% OFF`;
    }
    if (savings > '0') {
      return `$${savings} OFF`;
    }
    return 'SPECIAL DEAL';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={getCategoryImage(deal.category)}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.header}>
        <Text style={styles.businessName}>{deal.business?.business_name}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{getDiscountText()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{deal.title}</Text>

      {deal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {deal.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          {deal.original_price && (
            <Text style={styles.originalPrice}>${deal.original_price}</Text>
          )}
          {deal.discounted_price && (
            <Text style={styles.dealPrice}>${deal.discounted_price}</Text>
          )}
        </View>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownIcon}>⏰</Text>
          <Text style={styles.countdownText}>{timeRemaining}</Text>
        </View>
      </View>

      {deal.quantity_available && (
        <View style={styles.limitBadge}>
          <Text style={styles.limitText}>
            Limited: {deal.quantity_redeemed || 0}/{deal.quantity_available}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  header: {
    padding: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  countdownText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  limitBadge: {
    marginTop: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  limitText: {
    fontSize: 12,
    color: '#F38181',
    fontWeight: '600',
  },
});
