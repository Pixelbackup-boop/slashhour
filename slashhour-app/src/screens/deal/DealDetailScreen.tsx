import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
import { useDealDetail } from '../../hooks/useDealDetail';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

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
  const {
    timeRemaining,
    isRedeeming,
    showRedemptionModal,
    redemptionCode,
    savings,
    handleRedeem,
    closeRedemptionModal,
  } = useDealDetail(deal);

  // Debug logging for images
  React.useEffect(() => {
    console.log('🔍 DealDetailScreen - Deal images:', {
      hasImages: !!deal.images,
      imageCount: deal.images?.length || 0,
      images: deal.images,
      category: deal.category
    });
  }, [deal]);

  const getDiscountText = () => {
    if (savings.percentage > 0) {
      return `${savings.percentage}% OFF`;
    }
    if (savings.savings > '0') {
      return `Save $${savings.savings}`;
    }
    return 'SPECIAL DEAL';
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
          source={
            deal.images && deal.images.length > 0
              ? { uri: deal.images[0].url }
              : getCategoryImage(deal.category)
          }
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.content}>
          {/* Business Info */}
          <View style={styles.businessSection}>
            <View style={styles.businessHeader}>
              <TouchableOpacity
                style={styles.businessInfo}
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
                <Text style={styles.businessName}>{deal.business?.business_name}</Text>
                <Text style={styles.category}>{deal.category}</Text>
              </TouchableOpacity>
              {deal.business?.id && (
                <FollowButton
                  businessId={deal.business.id}
                  businessName={deal.business.business_name}
                  businessCategory={deal.category}
                  size="small"
                  variant="outline"
                />
              )}
            </View>
          </View>

          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{getDiscountText()}</Text>
          </View>

          {/* Deal Title */}
          <Text style={styles.title}>{deal.title}</Text>

          {/* Price Section */}
          <PriceCard
            originalPrice={deal.original_price}
            dealPrice={deal.discounted_price}
            savings={savings.savings}
            percentage={savings.percentage}
          />

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
            <CountdownBox
              timeRemaining={timeRemaining}
              isFlashDeal={deal.is_flash_deal}
            />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.gray100,
  },
  content: {
    padding: SPACING.lg,
  },
  businessSection: {
    marginBottom: SPACING.md,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  businessInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  businessName: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  category: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  discountBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  discountText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  title: {
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    lineHeight: 34,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  termItem: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
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
    ...TYPOGRAPHY.styles.button,
    color: COLORS.white,
  },
});
