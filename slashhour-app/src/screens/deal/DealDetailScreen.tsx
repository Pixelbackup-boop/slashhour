import React, { useEffect } from 'react';
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
import { Icon } from '../../components/icons';
import { useDealDetail } from '../../hooks/useDealDetail';
import { useDeal } from '../../hooks/queries/useDealsQuery';
import { useBookmark } from '../../hooks/useBookmarks';
import { useUser } from '../../stores/useAuthStore';
import { haptics } from '../../utils/haptics';
import { shareDeal } from '../../utils/sharing';
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

  if (__DEV__) {
    console.log('🎯 [DealDetailScreen] Route params:', {
      dealId,
      hasDealParam: !!dealParam,
      dealParamTitle: dealParam?.title,
    });
  }

  // If dealId is provided, fetch the full deal from API
  const { data: fetchedDeal, isLoading: isFetchingDeal, error: fetchError } = useDeal(dealId || '');

  if (__DEV__ && fetchError) {
    console.error('❌ [DealDetailScreen] React Query error:', {
      dealId,
      error: fetchError,
      message: (fetchError as any)?.message,
      response: (fetchError as any)?.response,
    });
  }

  // Use either the passed deal or the fetched deal
  const deal = dealParam || fetchedDeal;

  // Normalize business data: backend returns 'businesses' but some places use 'business'
  if (deal && deal.businesses && !deal.business) {
    deal.business = deal.businesses;
  }

  // IMPORTANT: Call all hooks unconditionally before any early returns (Rules of Hooks)
  const {
    timeRemaining,
    isRedeeming,
    showRedemptionModal,
    redemptionCode,
    savings,
    handleRedeem,
    closeRedemptionModal,
  } = useDealDetail(deal);

  // Get current user to check ownership
  const currentUser = useUser();

  // Bookmark state management
  const { isBookmarked, toggleBookmark, isProcessing, setIsBookmarked } = useBookmark(deal?.id || '', false);

  // Sync bookmark state from deal object when it loads
  useEffect(() => {
    if (deal && (deal.isBookmarked !== undefined || deal.isWishlisted !== undefined)) {
      const bookmarkStatus = deal.isBookmarked || deal.isWishlisted || false;
      setIsBookmarked(bookmarkStatus);

      if (__DEV__) {
        console.log('📌 [DealDetailScreen] Syncing bookmark state from deal:', {
          dealId: deal.id,
          isBookmarked: bookmarkStatus,
          dealHasIsBookmarked: deal.isBookmarked,
          dealHasIsWishlisted: deal.isWishlisted,
        });
      }
    }
  }, [deal?.id, deal?.isBookmarked, deal?.isWishlisted]);

  // Show loading state while fetching deal
  if (dealId && isFetchingDeal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }} edges={['left', 'right', 'bottom']}>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }} edges={['left', 'right', 'bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
          <Icon name="face-frown" size={48} color={COLORS.error} style="line" />
          <Text style={{ fontSize: TYPOGRAPHY.fontSize.lg, color: COLORS.error, textAlign: 'center', marginTop: SPACING.md }}>
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

  const getDiscountText = () => {
    if (savings.percentage > 0) {
      return `${savings.percentage}% OFF`;
    }
    if (savings.savings > '0') {
      return `Save $${savings.savings}`;
    }
    return 'SPECIAL DEAL';
  };

  // Helper to get deal status info
  const getStatusInfo = () => {
    const status = deal.status?.toLowerCase();

    if (status === 'deleted') {
      return { badge: 'Deleted', isInactive: true, color: '#757575', icon: 'x-circle' };
    }
    if (status === 'expired') {
      return { badge: 'Expired', isInactive: true, color: '#FF9800', icon: 'clock' };
    }
    if (status === 'sold_out') {
      return { badge: 'Sold Out', isInactive: true, color: '#9C27B0', icon: 'package' };
    }

    return { badge: null, isInactive: false, color: null, icon: null };
  };

  const statusInfo = getStatusInfo();

  const handleBookmarkPress = async () => {
    haptics.medium();
    try {
      await toggleBookmark();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleSharePress = async () => {
    haptics.medium();
    try {
      await shareDeal(deal);
    } catch (error) {
      console.error('Failed to share deal:', error);
    }
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
    // Status Badge Section
    statusBadgeSection: {
      alignItems: 'center',
      marginBottom: SPACING.xl,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.round,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    statusBadgeText: {
      color: COLORS.white,
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    // Description Section
    section: {
      marginBottom: SPACING.lg,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.textPrimary,
      marginBottom: 0,
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
      backgroundColor: '#BDBDBD', // Darker grey, more obviously disabled
      opacity: 0.6, // Dimmed appearance
    },
    redeemButtonText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: COLORS.white,
    },
    redeemButtonTextDisabled: {
      color: '#666666', // Dark grey text for disabled state
    },
    // Action Buttons Container (Share & Bookmark)
    actionButtonsContainer: {
      position: 'absolute',
      top: 16,
      right: 16,
      flexDirection: 'row',
      gap: 8,
      zIndex: 10,
    },
    actionButton: {
      width: 34,
      height: 34,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Carousel with Bookmark Button Overlay */}
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={deal.images || []}
            height={300}
            width={undefined}
            borderRadius={0}
            showPagination={true}
            fallbackImage={getCategoryImage(deal.category)}
            contentFit="contain"
          />

          {/* Bookmark Button Overlay */}
          <View style={styles.actionButtonsContainer}>
            {/* Bookmark Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBookmarkPress}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Icon
                name="heart"
                size={18}
                color={isBookmarked ? COLORS.error : COLORS.gray400}
                style={isBookmarked ? 'solid' : 'line'}
              />
            </TouchableOpacity>
          </View>
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
            {/* Only show Follow button if user is NOT the business owner */}
            {deal.business?.id && currentUser?.id !== deal.business.owner_id && (
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

          {/* Status Badge - For Inactive Deals */}
          {statusInfo.isInactive && (
            <View style={styles.statusBadgeSection}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Icon name={statusInfo.icon as any} size={16} color={COLORS.white} style="solid" />
                <Text style={styles.statusBadgeText}>{statusInfo.badge}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          {deal.description && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Description</Text>
                <TouchableOpacity
                  onPress={handleSharePress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="arrow-up-from-bracket"
                    size={20}
                    color={COLORS.gray400}
                    style="line"
                  />
                </TouchableOpacity>
              </View>
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
            style={[
              styles.redeemButton,
              (isRedeeming || statusInfo.isInactive) && styles.redeemButtonDisabled
            ]}
            onPress={handleRedeem}
            disabled={isRedeeming || statusInfo.isInactive}
          >
            {isRedeeming ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={[
                styles.redeemButtonText,
                statusInfo.isInactive && styles.redeemButtonTextDisabled
              ]}>
                {statusInfo.isInactive ? 'DEAL NO LONGER AVAILABLE' : 'Redeem This Deal'}
              </Text>
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
