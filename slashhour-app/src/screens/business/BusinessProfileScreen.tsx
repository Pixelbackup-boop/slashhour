import React, { useEffect, useState } from 'react';
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
import { trackScreenView } from '../../services/analytics';
import ShopDealCard from '../../components/ShopDealCard';
import DealCardSkeleton from '../../components/DealCardSkeleton';
import BusinessProfileSkeleton from '../../components/BusinessProfileSkeleton';
import {
  BusinessCoverImage,
  BusinessHeader,
  BusinessTabs,
  FloatingPostButton,
} from '../../components/business';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../../theme';
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

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  };

  const handleEditPress = () => {
    navigation.navigate('EditBusinessProfile', { business });
  };

  const handleLogoPress = async () => {
    if (!isOwner || isUploading) return;

    const newLogoUrl = await uploadLogo(businessId);
    if (newLogoUrl) {
      setLogoUrl(newLogoUrl);
      refresh();
      Alert.alert('Success', 'Logo updated successfully!');
    } else if (uploadError) {
      Alert.alert('Error', uploadError);
    }
  };

  const handleCoverPress = async () => {
    if (!isOwner || isUploading) return;

    const newCoverUrl = await uploadCover(businessId);
    if (newCoverUrl) {
      setCoverUrl(newCoverUrl);
      refresh();
      Alert.alert('Success', 'Cover image updated successfully!');
    } else if (uploadError) {
      Alert.alert('Error', uploadError);
    }
  };

  const handleMessagePress = async () => {
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
  };

  const isOwner = user?.id === business?.owner_id;

  // Render header component for FlatList
  const renderListHeader = () => (
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
          logoUrl={logoUrl}
          stats={stats}
          isOwner={isOwner}
          isUploading={isUploading}
          onLogoPress={handleLogoPress}
          onMessagePress={handleMessagePress}
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
  );

  // Render empty state when no deals
  const renderEmptyDeals = () => (
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
  );

  // Render reviews tab (coming soon)
  const renderReviewsTab = () => (
    <View style={styles.bottomTabContent}>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonIcon}>⭐</Text>
        <Text style={styles.comingSoonText}>Reviews Coming Soon!</Text>
        <Text style={styles.comingSoonSubtext}>
          Soon you'll be able to read and write reviews for this business.
        </Text>
      </View>
      <View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
      </View>

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
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            {renderListHeader()}
            {renderEmptyDeals()}
          </ScrollView>
        ) : (
          <FlashList
            data={deals}
            renderItem={({ item, index }) => {
              const isLeftColumn = index % 2 === 0;
              const isFirstRow = index < 2;

              return (
                <View
                  style={{
                    flex: 1,
                    paddingLeft: isLeftColumn ? EDGE_SPACING : COLUMN_GAP / 2,
                    paddingRight: isLeftColumn ? COLUMN_GAP / 2 : EDGE_SPACING,
                    paddingTop: isFirstRow ? ROW_GAP : 0,
                    paddingBottom: ROW_GAP,
                  }}
                >
                  <ShopDealCard deal={item} onPress={() => handleDealPress(item)} />
                </View>
              );
            }}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ListHeaderComponent={renderListHeader}
            numColumns={2}
            estimatedItemSize={300}
            contentContainerStyle={styles.dealsGrid}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {renderListHeader()}
          {renderReviewsTab()}
        </ScrollView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
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
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  editButtonText: {
    color: COLORS.white,
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
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  businessCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dealsReviewsSection: {
    backgroundColor: COLORS.white,
    paddingTop: 0,
  },
  bottomTabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
    borderBottomColor: COLORS.primary,
  },
  bottomTabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  activeBottomTabText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  bottomTabContent: {
    padding: SPACING.md,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  comingSoonIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  comingSoonSubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    backgroundColor: COLORS.white,
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
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dealsGrid: {
    paddingTop: 0,
    paddingBottom: SPACING.md,
  },
  dealsGridSkeleton: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
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
