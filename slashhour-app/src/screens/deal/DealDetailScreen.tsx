import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Deal } from '../../types/models';
import { getCategoryImage } from '../../utils/categoryImages';
import RedemptionModal from '../../components/RedemptionModal';
import PriceCard from '../../components/PriceCard';
import CountdownBox from '../../components/CountdownBox';
import StockBar from '../../components/StockBar';
import FollowButton from '../../components/FollowButton';
import ImageCarousel from '../../components/ImageCarousel';
import { useDealDetail } from '../../hooks/useDealDetail';
import { useDeal } from '../../hooks/queries/useDealsQuery';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

interface DealDetailScreenProps {
  route: {
    params: {
      deal?: Deal;
      dealId?: string;
    };
  };
  navigation: any;
}

export default function DealDetailScreen({ route, navigation }: DealDetailScreenProps) {
  const { deal: dealParam, dealId } = route.params;

  // If dealId is provided, fetch the full deal from API
  const { data: fetchedDeal, isLoading: isFetchingDeal, error: fetchError } = useDeal(dealId || '');

  // Use either the passed deal or the fetched deal
  const deal = dealParam || fetchedDeal;

  // 🔍 DEBUG: Log the actual deal data
  console.log('🔍 DealDetailScreen - Full deal object:', JSON.stringify(deal, null, 2));

  // Show loading state while fetching deal
  if (dealId && isFetchingDeal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: SPACING.md, color: COLORS.textSecondary }}>
            Loading deal...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if fetching failed
  if (dealId && fetchError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
          <Text style={{ fontSize: 48, marginBottom: SPACING.md }}>😕</Text>
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.error, textAlign: 'center' }}>
            Failed to load deal
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: SPACING.lg, padding: SPACING.md, backgroundColor: COLORS.primary, borderRadius: RADIUS.md }}
          >
            <Text style={{ color: COLORS.white, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no deal available (shouldn't happen, but safety check)
  if (!deal) {
    return null;
  }

  const {
    timeRemaining,
    isRedeeming,
    showRedemptionModal,
    redemptionCode,
    savings,
    handleRedeem,
    closeRedemptionModal,
  } = useDealDetail(deal);

  const getDiscountText = () => {
    if (savings.percentage > 0) {
      return `${savings.percentage}% OFF`;
    }
    if (savings.savings > '0') {
      return `Save $${savings.savings}`;
    }
    return 'SPECIAL DEAL';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    scrollView: {
      flex: 1,
    },
    imageContainer: {
      position: 'relative',
    },
    backButtonOverlay: {
      position: 'absolute',
      top: 16,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    backButtonText: {
      fontSize: 24,
      color: COLORS.white,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    content: {
      padding: SPACING.lg,
    },
    // Header Section
    headerSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.lg,
    },
    headerLeft: {
      flex: 1,
      marginRight: SPACING.md,
    },
    headerRight: {
      marginTop: SPACING.xs,
    },
    title: {
      fontSize: 24,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.textPrimary,
      marginBottom: SPACING.xs,
      lineHeight: 32,
    },
    category: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      textTransform: 'capitalize',
      marginBottom: SPACING.xs,
    },
    shopName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    // Price Section
    priceSection: {
      marginBottom: SPACING.lg,
    },
    discountBadgeContainer: {
      alignSelf: 'flex-start',
      marginBottom: SPACING.md,
    },
    discountBadge: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.round,
    },
    discountText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.white,
    },
    pricesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    pricesContainer: {
      flex: 1,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'flex-end',
      marginBottom: SPACING.xs,
    },
    priceLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textPrimary,
      marginRight: SPACING.sm,
    },
    originalPrice: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      color: COLORS.textSecondary,
      textDecorationLine: 'line-through',
    },
    dealPriceLabel: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textPrimary,
      marginRight: SPACING.sm,
    },
    dealPrice: {
      fontSize: 32,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#00BFA5',
    },
    // Savings Section
    savingsSection: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    savingsText: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#6BCB77',
    },
    // Description Section
    section: {
      marginBottom: SPACING.lg,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.textPrimary,
      marginBottom: SPACING.md,
    },
    description: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textSecondary,
      lineHeight: 24,
    },
    // Validity Section
    validityBox: {
      borderWidth: 2,
      borderColor: '#FFD54F',
      borderRadius: RADIUS.lg,
      padding: SPACING.xl,
      alignItems: 'center',
      backgroundColor: '#FFFDE7',
    },
    validityLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textPrimary,
      marginBottom: SPACING.sm,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    validityTime: {
      fontSize: 28,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: '#FF5252',
    },
    // Other Sections
    termItem: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: COLORS.textSecondary,
      lineHeight: 22,
      marginBottom: SPACING.xs,
    },
    address: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: COLORS.textSecondary,
      lineHeight: 22,
    },
    // Redeem Button
    redeemButton: {
      backgroundColor: COLORS.primary,
      padding: SPACING.lg,
      borderRadius: RADIUS.lg,
      alignItems: 'center',
      marginTop: SPACING.lg,
      marginBottom: SPACING.xxl,
    },
    redeemButtonDisabled: {
      backgroundColor: COLORS.gray300,
    },
    redeemButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.white,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel with Back Button Overlay */}
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={deal.images || []}
            height={300}
            width={undefined}
            borderRadius={0}
            showPagination={true}
            fallbackImage={getCategoryImage(deal.category)}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonOverlay}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Header Section: Title, Category, Shop Name, Follow Button */}
          <View style={styles.headerSection}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{deal.title}</Text>
              <Text style={styles.category}>{deal.category}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (deal.business?.id) {
                    navigation.navigate('BusinessProfile', {
                      businessId: deal.business.id,
                      businessName: deal.business.business_name,
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.shopName}>{deal.business?.business_name}</Text>
              </TouchableOpacity>
            </View>
            {deal.business?.id && (
              <View style={styles.headerRight}>
                <FollowButton
                  businessId={deal.business.id}
                  businessName={deal.business.business_name}
                  businessCategory={deal.category}
                  size="small"
                  variant="primary"
                />
              </View>
            )}
          </View>

          {/* Price Section: Discount Badge + Prices */}
          <View style={styles.priceSection}>
            <View style={styles.pricesRow}>
              {/* Left: Discount Badge */}
              <View style={styles.discountBadgeContainer}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{getDiscountText()}</Text>
                </View>
              </View>

              {/* Right: Prices */}
              <View style={styles.pricesContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Original Price:</Text>
                  <Text style={styles.originalPrice}>${deal.original_price}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.dealPriceLabel}>Deal Price:</Text>
                  <Text style={styles.dealPrice}>${deal.discounted_price}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* You Save Section */}
          {savings.savings !== '0' && (
            <View style={styles.savingsSection}>
              <Text style={styles.savingsText}>
                You Save: ${savings.savings} ({savings.percentage}% OFF)
              </Text>
            </View>
          )}

          {/* Description */}
          {deal.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{deal.description}</Text>
            </View>
          )}

          {/* Validity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Validity</Text>
            <View style={styles.validityBox}>
              <Text style={styles.validityLabel}>Deal ends in</Text>
              <Text style={styles.validityTime}>{timeRemaining}</Text>
            </View>
          </View>

          {/* Availability */}
          {deal.quantity_available && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <StockBar
                quantityAvailable={deal.quantity_available}
                quantityRedeemed={deal.quantity_redeemed}
              />
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
              <ActivityIndicator color={COLORS.white} />
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
        savings={savings.savings}
        onClose={closeRedemptionModal}
      />
    </SafeAreaView>
  );
}
