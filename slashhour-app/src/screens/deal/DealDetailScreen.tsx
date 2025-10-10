import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Deal } from '../../types/models';
import { getCategoryImage } from '../../utils/categoryImages';
import { redemptionService } from '../../services/api/redemptionService';
import RedemptionModal from '../../components/RedemptionModal';

interface DealDetailScreenProps {
  route: {
    params: {
      deal: Deal;
    };
  };
  navigation: any;
}

export default function DealDetailScreen({ route, navigation }: DealDetailScreenProps) {
  const { deal } = route.params;
  const [timeRemaining, setTimeRemaining] = React.useState('');
  const [isRedeeming, setIsRedeeming] = React.useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = React.useState(false);
  const [redemptionCode, setRedemptionCode] = React.useState('');

  // Calculate savings and discount percentage
  const calculateSavings = () => {
    const original = Number(deal.original_price) || 0;
    const discounted = Number(deal.discounted_price) || 0;
    const savings = original - discounted;
    const percentage = original > 0 ? (savings / original) * 100 : 0;
    return {
      savings: savings.toFixed(2),
      percentage: Math.round(percentage),
    };
  };

  const { savings, percentage } = calculateSavings();

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
      return `${days} ${days === 1 ? 'day' : 'days'} ${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  React.useEffect(() => {
    // Update countdown immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update countdown every hour
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 3600000); // Update every hour (3600000ms = 1 hour)

    return () => clearInterval(interval);
  }, [deal.expires_at]);

  const getDiscountText = () => {
    if (percentage > 0) {
      return `${percentage}% OFF`;
    }
    if (savings > '0') {
      return `Save $${savings}`;
    }
    return 'SPECIAL DEAL';
  };

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);
      const response = await redemptionService.redeemDeal(deal.id);
      setRedemptionCode(response.redemptionCode);
      setShowRedemptionModal(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to redeem deal';
      Alert.alert('Redemption Failed', errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Image
          source={getCategoryImage(deal.category)}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.content}>
          {/* Business Info */}
          <View style={styles.businessSection}>
            <Text style={styles.businessName}>{deal.business?.business_name}</Text>
            <Text style={styles.category}>{deal.category}</Text>
          </View>

          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{getDiscountText()}</Text>
          </View>

          {/* Deal Title */}
          <Text style={styles.title}>{deal.title}</Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Original Price:</Text>
              <Text style={styles.originalPrice}>${deal.original_price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Deal Price:</Text>
              <Text style={styles.dealPrice}>${deal.discounted_price}</Text>
            </View>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsText}>
                You Save: ${savings} ({percentage}% OFF)
              </Text>
            </View>
          </View>

          {/* Description */}
          {deal.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Deal</Text>
              <Text style={styles.description}>{deal.description}</Text>
            </View>
          )}

          {/* Validity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Validity</Text>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownIcon}>⏰</Text>
              <View>
                <Text style={styles.countdownLabel}>Deal ends in</Text>
                <Text style={styles.countdownText}>{timeRemaining}</Text>
              </View>
            </View>
            {deal.is_flash_deal && (
              <View style={styles.flashBadge}>
                <Text style={styles.flashText}>⚡ FLASH DEAL</Text>
              </View>
            )}
          </View>

          {/* Availability */}
          {deal.quantity_available && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.stockBar}>
                <View
                  style={[
                    styles.stockFill,
                    { width: `${((deal.quantity_available - deal.quantity_redeemed) / deal.quantity_available) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.stockText}>
                {deal.quantity_available - deal.quantity_redeemed} of {deal.quantity_available} remaining
              </Text>
            </View>
          )}

          {/* Terms & Conditions */}
          {deal.terms_conditions && deal.terms_conditions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              {deal.terms_conditions.map((term, index) => (
                <Text key={index} style={styles.termItem}>• {term}</Text>
              ))}
            </View>
          )}

          {/* Business Location */}
          {deal.business?.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.address}>{deal.business.address}</Text>
              {deal.business.city && deal.business.country && (
                <Text style={styles.address}>
                  {deal.business.city}, {deal.business.country}
                </Text>
              )}
            </View>
          )}

          {/* Redeem Button */}
          <TouchableOpacity
            style={[styles.redeemButton, isRedeeming && styles.redeemButtonDisabled]}
            onPress={handleRedeem}
            disabled={isRedeeming}
          >
            {isRedeeming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.redeemButtonText}>Redeem This Deal</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RedemptionModal
        visible={showRedemptionModal}
        redemptionCode={redemptionCode}
        dealTitle={deal.title}
        businessName={deal.business?.business_name || ''}
        savings={savings}
        onClose={() => setShowRedemptionModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  businessSection: {
    marginBottom: 16,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  discountBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    lineHeight: 34,
  },
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
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
  termItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  redeemButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  redeemButtonDisabled: {
    backgroundColor: '#ccc',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
