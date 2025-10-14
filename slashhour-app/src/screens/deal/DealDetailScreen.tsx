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
import { useDealDetail } from '../../hooks/useDealDetail';

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
        savings={savings.savings}
        onClose={closeRedemptionModal}
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
