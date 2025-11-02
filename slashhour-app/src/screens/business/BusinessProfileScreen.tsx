import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../stores/useAuthStore';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessImageUpload } from '../../hooks/useBusinessImageUpload';
import { useConversations } from '../../hooks/useConversations';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { dealService } from '../../services/api/dealService';
import ShopDealCard from '../../components/ShopDealCard';
import DealCardSkeleton from '../../components/DealCardSkeleton';
import BusinessProfileSkeleton from '../../components/BusinessProfileSkeleton';
import {
  BusinessCoverImage,
  BusinessHeader,
  BusinessTabs,
  FloatingPostButton,
} from '../../components/business';
import { ReviewList, ReviewForm } from '../../components/reviews';
import { TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../../theme';
import { Deal } from '../../types/models';

interface BusinessProfileScreenProps {
  route: {
    params: {
      businessId: string;
      businessName?: string;
    };
  };
  navigation: any;
}

export default function BusinessProfileScreen({ route, navigation }: BusinessProfileScreenProps) {
  const { colors } = useTheme();
  const { businessId } = route.params;
  const user = useUser();
  const { business, deals, isLoading, isRefreshing, error, stats, refresh } = useBusinessProfile(businessId);
  const { isUploading, error: uploadError, uploadLogo, uploadCover } = useBusinessImageUpload();
  const { createOrGetConversation } = useConversations(user?.id);

  // Local state for images (optimistic updates)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Grid layout constants
  const EDGE_SPACING = 10;
  const COLUMN_GAP = 10;
  const ROW_GAP = 10;

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = Math.floor((screenWidth - EDGE_SPACING * 2 - COLUMN_GAP) / 2);

  // Tab state for lower tabs (Deals, Reviews)
  const [activeBottomTab, setActiveBottomTab] = useState<'deals' | 'reviews'>('deals');

  // Review form state
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);
  const [reviewListKey, setReviewListKey] = useState(0);

  useEffect(() => {
    trackScreenView('BusinessProfileScreen', { businessId });
  }, [businessId]);

  // Update local state when business data loads
  useEffect(() => {
    if (business) {
      setLogoUrl(business.logo_url || null);
      setCoverUrl(business.cover_image_url || null);
    }
  }, [business]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);

  // Calculate isOwner early so it can be used in callbacks
  const isOwner = user?.id === business?.owner_id;

  const handleDealPress = useCallback((deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  }, [navigation]);

  const handleEditPress = useCallback(() => {
    navigation.navigate('EditBusinessProfile', { business });
  }, [navigation, business]);

  const handleLogoPress = useCallback(async () => {
    if (!isOwner || isUploading) return;

    const newLogoUrl = await uploadLogo(businessId);
    if (newLogoUrl) {
      setLogoUrl(newLogoUrl);
      refresh();
      Alert.alert('Success', 'Logo updated successfully!');
    } else if (uploadError) {
      Alert.alert('Error', uploadError);
    }
  }, [isOwner, isUploading, uploadLogo, businessId, refresh, uploadError]);

  const handleCoverPress = useCallback(async () => {
    if (!isOwner || isUploading) return;

    const newCoverUrl = await uploadCover(businessId);
    if (newCoverUrl) {
      setCoverUrl(newCoverUrl);
      refresh();
      Alert.alert('Success', 'Cover image updated successfully!');
    } else if (uploadError) {
      Alert.alert('Error', uploadError);
    }
  }, [isOwner, isUploading, uploadCover, businessId, refresh, uploadError]);

  const handleMessagePress = useCallback(async () => {
    if (!business || !user) return;

    try {
      const conversation = await createOrGetConversation(business.id);
      if (conversation) {
        navigation.navigate('Chat', {
          conversationId: conversation.id,
          businessId: business.id,
          businessName: business.business_name,
          businessLogo: business.logo_url,
        });
      } else {
        Alert.alert('Error', 'Failed to start conversation. Please try again.');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  }, [business, user, createOrGetConversation, navigation]);

  const handleEditDeal = useCallback((deal: Deal) => {
    navigation.navigate('EditDeal', {
      deal,
      businessId: business!.id,
      businessName: business!.business_name
    });
  }, [navigation, business]);

  const handleDeleteDeal = useCallback(async (deal: Deal) => {
    Alert.alert(
      'Delete Deal',
      'Are you sure you want to delete this deal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dealService.deleteDeal(deal.id);
              refresh();
              Alert.alert('Success', 'Deal deleted successfully');
            } catch (error) {
              console.error('Error deleting deal:', error);
              Alert.alert('Error', 'Failed to delete deal. Please try again.');
            }
          }
        }
      ]
    );
  }, [refresh]);

  // Review handlers
  const handleWriteReview = useCallback(() => {
    setIsReviewFormVisible(true);
  }, []);

  const handleReviewSubmitSuccess = useCallback(() => {
    setReviewListKey(prev => prev + 1);
  }, []);

  const handleCloseReviewForm = useCallback(() => {
    setIsReviewFormVisible(false);
  }, []);

  // Memoize card style calculation
  const getCardStyle = useCallback((index: number) => {
    const isLeftColumn = index % 2 === 0;
    const isFirstRow = index < 2;

    return {
      flex: 1,
      paddingLeft: isLeftColumn ? EDGE_SPACING : COLUMN_GAP / 2,
      paddingRight: isLeftColumn ? COLUMN_GAP / 2 : EDGE_SPACING,
      paddingTop: isFirstRow ? ROW_GAP : 0,
      paddingBottom: ROW_GAP,
    };
  }, []);

  // Memoize renderItem for FlashList
  const renderDealItem = useCallback(
    ({ item, index }: { item: Deal; index: number }) => (
      <View style={getCardStyle(index)}>
        <ShopDealCard
          deal={item}
          onPress={() => handleDealPress(item)}
          isOwner={isOwner}
          onEditPress={() => handleEditDeal(item)}
          onDeletePress={() => handleDeleteDeal(item)}
        />
      </View>
    ),
    [getCardStyle, handleDealPress, isOwner, handleEditDeal, handleDeleteDeal]
  );

  // Memoize keyExtractor for FlashList
  const dealKeyExtractor = useCallback(
    (item: Deal, index: number) => `${item.id}-${index}`,
    []
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
    },
    editButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    scrollView: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xxl,
    },
    errorIcon: {
      fontSize: 64,
      marginBottom: SPACING.md,
    },
    errorMessage: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.white,
      backgroundColor: colors.error,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      textAlign: 'center',
      marginBottom: SPACING.lg,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    businessCard: {
      backgroundColor: colors.white,
      padding: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    dealsReviewsSection: {
      backgroundColor: colors.white,
      paddingTop: 0,
    },
    bottomTabNavigation: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingHorizontal: SPACING.md,
    },
    bottomTab: {
      flex: 1,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.sm,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeBottomTab: {
      borderBottomColor: colors.primary,
    },
    bottomTabText: {
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textSecondary,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    activeBottomTabText: {
      color: colors.primary,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    bottomTabContent: {
      padding: SPACING.md,
    },
    emptyState: {
      backgroundColor: colors.white,
      borderRadius: RADIUS.lg,
      padding: SPACING.xxl,
      alignItems: 'center',
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: SPACING.md,
    },
    emptyText: {
      ...TYPOGRAPHY.styles.h3,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    emptySubtext: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    dealsGrid: {
      paddingTop: 0,
      paddingBottom: SPACING.md,
    },
    dealsGridSkeleton: {
      paddingHorizontal: SPACING.sm,
      paddingBottom: SPACING.md,
      backgroundColor: colors.backgroundSecondary,
    },
    dealsRowSkeleton: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
      paddingHorizontal: SPACING.xs,
    },
    dealCardWrapper: {
      flex: 1,
    },
  });

  // Render header component for FlatList
  const renderListHeader = useCallback(() => (
    <>
      <BusinessCoverImage
        coverUrl={coverUrl}
        isOwner={isOwner}
        isUploading={isUploading}
        onPress={handleCoverPress}
      />

      <View style={styles.businessCard}>
        <BusinessHeader
          businessId={business!.id}
          businessName={business!.business_name}
          businessCategory={business!.category}
          logoUrl={logoUrl}
          stats={stats}
          isOwner={isOwner}
          isUploading={isUploading}
          onLogoPress={handleLogoPress}
          onMessagePress={handleMessagePress}
          onEditPress={handleEditPress}
          onFollowersPress={() => navigation.navigate('FollowersList', { businessId: business!.id })}
        />

        <BusinessTabs business={business!} isOwner={isOwner} />
      </View>

      {/* Deals & Reviews Section */}
      <View style={styles.dealsReviewsSection}>
        <View style={styles.bottomTabNavigation}>
          <TouchableOpacity
            style={[styles.bottomTab, activeBottomTab === 'deals' && styles.activeBottomTab]}
            onPress={() => setActiveBottomTab('deals')}
            activeOpacity={0.7}
          >
            <Text style={[styles.bottomTabText, activeBottomTab === 'deals' && styles.activeBottomTabText]}>
              Deals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomTab, activeBottomTab === 'reviews' && styles.activeBottomTab]}
            onPress={() => setActiveBottomTab('reviews')}
            activeOpacity={0.7}
          >
            <Text style={[styles.bottomTabText, activeBottomTab === 'reviews' && styles.activeBottomTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  ), [coverUrl, isOwner, isUploading, handleCoverPress, business, stats, logoUrl, handleLogoPress, handleMessagePress, handleEditPress, activeBottomTab]);

  // Render empty state when no deals
  const renderEmptyDeals = useCallback(() => (
    <View style={styles.bottomTabContent}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyText}>No active deals right now</Text>
        <Text style={styles.emptySubtext}>
          Follow this business to get notified when they post new deals
        </Text>
      </View>
      <View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />
    </View>
  ), []);

  // Render reviews tab
  const renderReviewsTab = useCallback(() => (
    <ReviewList
      key={reviewListKey}
      businessId={businessId}
      onWriteReview={handleWriteReview}
      showWriteButton={true}
      headerComponent={renderListHeader()}
    />
  ), [reviewListKey, businessId, handleWriteReview, renderListHeader]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <BusinessProfileSkeleton />
          <View style={styles.dealsGridSkeleton}>
            <View style={styles.dealsRowSkeleton}>
              <View style={styles.dealCardWrapper}>
                <DealCardSkeleton />
              </View>
              <View style={styles.dealCardWrapper}>
                <DealCardSkeleton />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !business) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>{error || 'Business not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Main Content */}
      {activeBottomTab === 'deals' ? (
        deals.length === 0 ? (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {renderListHeader()}
            {renderEmptyDeals()}
          </ScrollView>
        ) : (
          <FlashList
            data={deals}
            renderItem={renderDealItem}
            keyExtractor={dealKeyExtractor}
            ListHeaderComponent={renderListHeader}
            numColumns={2}
            contentContainerStyle={styles.dealsGrid}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )
      ) : (
        renderReviewsTab()
      )}

      {/* Floating Post Deal Button */}
      {isOwner && (
        <FloatingPostButton
          onPress={() =>
            navigation.navigate('CreateDeal', {
              businessId: business.id,
              businessName: business.business_name,
            })
          }
        />
      )}

      {/* Review Form Modal */}
      {business && (
        <ReviewForm
          businessId={businessId}
          businessName={business.business_name}
          visible={isReviewFormVisible}
          onClose={handleCloseReviewForm}
          onSuccess={handleReviewSubmitSuccess}
        />
      )}
    </SafeAreaView>
  );
}
