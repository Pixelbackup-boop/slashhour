import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon, IconName } from './icons';
import { UserRedemption } from '../types/models';
import { getCategoryImage } from '../utils/categoryImages';

interface RedemptionCardProps {
  redemption: UserRedemption;
  onPress?: () => void;
  onViewQR?: () => void;
}

export default React.memo(function RedemptionCard({ redemption, onPress, onViewQR }: RedemptionCardProps) {
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

  const getCategoryIcon = (category: string): IconName => {
    const icons: { [key: string]: IconName } = {
      restaurant: 'building',
      grocery: 'cart',
      fashion: 'shopping-bag',
      shoes: 'shopping-bag',
      electronics: 'lightning',
      home_living: 'home-simple',
      beauty: 'star',
      health: 'shield',
    };
    return icons[category] || 'award';
  };

  // Get the deal image - use actual deal image if available, otherwise fall back to category image
  const getImageSource = () => {
    if (redemption.deal?.images && redemption.deal.images.length > 0) {
      // Deal images can be either DealImage objects with url property or strings
      const firstImage = redemption.deal.images[0];
      const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
      return { uri: imageUrl };
    }
    // Fall back to category image (which is a require() object)
    return getCategoryImage(redemption.dealCategory);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Deal Image */}
      <Image
        source={getImageSource()}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
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
            <Icon name={getCategoryIcon(redemption.dealCategory)} size={14} color="#666" style="line" />
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

        {/* View QR Code Button */}
        {onViewQR && (
          <TouchableOpacity
            style={styles.viewQRButton}
            onPress={(e) => {
              e.stopPropagation();
              onViewQR();
            }}
            activeOpacity={0.7}
          >
            <Icon name="qrcode" size={18} color="#fff" style="line" />
            <Text style={styles.viewQRButtonText}>View QR Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

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
  viewQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewQRButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
