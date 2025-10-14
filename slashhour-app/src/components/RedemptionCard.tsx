import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { UserRedemption } from '../types/models';
import { getCategoryImage } from '../utils/categoryImages';

interface RedemptionCardProps {
  redemption: UserRedemption;
  onPress?: () => void;
}

export default function RedemptionCard({ redemption, onPress }: RedemptionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      restaurant: '🍕',
      grocery: '🛒',
      fashion: '👗',
      shoes: '👟',
      electronics: '📱',
      home_living: '🏠',
      beauty: '💄',
      health: '⚕️',
    };
    return icons[category] || '🎉';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Deal Image */}
      <Image
        source={getCategoryImage(redemption.dealCategory)}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Business Name */}
        <Text style={styles.businessName} numberOfLines={1}>
          {redemption.business?.businessName || 'Business'}
        </Text>

        {/* Deal Title */}
        <Text style={styles.dealTitle} numberOfLines={2}>
          {redemption.deal?.title || 'Deal'}
        </Text>

        {/* Category & Date */}
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(redemption.dealCategory)}</Text>
            <Text style={styles.categoryText}>{redemption.dealCategory}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(redemption.redeemedAt)}</Text>
        </View>

        {/* Savings Info */}
        <View style={styles.savingsRow}>
          <View style={styles.priceInfo}>
            <Text style={styles.originalPrice}>{formatCurrency(redemption.originalPrice)}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.paidPrice}>{formatCurrency(redemption.paidPrice)}</Text>
          </View>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>
              Saved {formatCurrency(redemption.savingsAmount)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  arrow: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 6,
  },
  paidPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  savingsBadge: {
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6BCB77',
  },
});
