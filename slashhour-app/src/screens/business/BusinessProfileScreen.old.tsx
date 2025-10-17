import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  RefreshControl,
  Dimensions,
  Linking,
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
import FollowButton from '../../components/FollowButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES, LAYOUT } from '../../theme';
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
  const { businessId, businessName } = route.params;
  const user = useUser();
  const { business, deals, isLoading, isRefreshing, error, stats, refresh } = useBusinessProfile(businessId);
  const { isUploading, error: uploadError, uploadLogo, uploadCover } = useBusinessImageUpload();
  const { createOrGetConversation } = useConversations(user?.id);

  // Local state for images (optimistic updates)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Grid layout constants - CLEAN APPROACH
  const EDGE_SPACING = 10; // Left and right screen edge spacing
  const COLUMN_GAP = 10; // Gap between columns
  const ROW_GAP = 10; // Gap between rows

  const screenWidth = Dimensions.get('window').width;
  // Calculate card width: total width minus all spacing, divided by 2
  const cardWidth = Math.floor((screenWidth - EDGE_SPACING * 2 - COLUMN_GAP) / 2);

  // Tab state for upper tabs (About, Location, Contact, Time)
  const [activeTab, setActiveTab] = useState<'about' | 'location' | 'contact' | 'time'>('about');

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

  // Refresh data when screen comes into focus (e.g., after editing)
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
      refresh(); // Refresh to get updated business data
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
      refresh(); // Refresh to get updated business data
      Alert.alert('Success', 'Cover image updated successfully!');
    } else if (uploadError) {
      Alert.alert('Error', uploadError);
    }
  };

  const handleMessagePress = async () => {
    if (!business || !user) return;

    try {
      // Create or get existing conversation with the business
      const conversation = await createOrGetConversation(business.id);

      if (conversation) {
        // Navigate to chat screen
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

  // Check if current user is the business owner
  const isOwner = user?.id === business?.owner_id;

  // Handle contact actions
  const handlePhonePress = async (phone: string) => {
    const phoneNumber = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open phone dialer');
    }
  };

  const handleEmailPress = async (email: string) => {
    const emailUrl = `mailto:${email}`;
    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  const handleWebsitePress = async (website: string) => {
    try {
      const supported = await Linking.canOpenURL(website);
      if (supported) {
        await Linking.openURL(website);
      } else {
        Alert.alert('Error', 'Unable to open this website');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open website');
    }
  };

  // Helper function to group consecutive days with same hours
  const groupBusinessHours = (hours: any) => {
    if (!hours) return [];

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayAbbrev: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };

    // Format time to 12h
    const formatTime = (time24: string): string => {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const groups: Array<{ days: string; hours: string }> = [];
    let currentGroup: string[] = [];
    let currentHours = '';

    dayOrder.forEach((day, index) => {
      const schedule = hours[day];
      if (!schedule) return;

      const hoursText = schedule.closed
        ? 'Closed'
        : `${formatTime(schedule.open)} - ${formatTime(schedule.close)}`;

      if (currentHours === hoursText) {
        currentGroup.push(day);
      } else {
        if (currentGroup.length > 0) {
          const daysLabel =
            currentGroup.length === 1
              ? dayAbbrev[currentGroup[0]]
              : `${dayAbbrev[currentGroup[0]]}-${dayAbbrev[currentGroup[currentGroup.length - 1]]}`;
          groups.push({ days: daysLabel, hours: currentHours });
        }
        currentGroup = [day];
        currentHours = hoursText;
      }

      // Last day
      if (index === dayOrder.length - 1 && currentGroup.length > 0) {
        const daysLabel =
          currentGroup.length === 1
            ? dayAbbrev[currentGroup[0]]
            : `${dayAbbrev[currentGroup[0]]}-${dayAbbrev[currentGroup[currentGroup.length - 1]]}`;
        groups.push({ days: daysLabel, hours: currentHours });
      }
    });

    return groups;
  };

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
            <View style={styles.dealsRowSkeleton}>
              <View style={styles.dealCardWrapper}>
                <DealCardSkeleton />
              </View>
              <View style={styles.dealCardWrapper}>
                <DealCardSkeleton />
              </View>
            </View>
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

  // Render header component for FlatList
  const renderListHeader = () => (
    <>
      {/* Cover Image */}
      <TouchableOpacity
        onPress={handleCoverPress}
        activeOpacity={isOwner ? 0.7 : 1}
        disabled={!isOwner}
      >
        {coverUrl ? (
          <ImageBackground
            source={{ uri: coverUrl }}
            style={styles.coverImage}
            resizeMode="cover"
          >
            {isOwner && (
              <View style={styles.coverEditBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.editBadgeText}>✏️</Text>
                )}
              </View>
            )}
          </ImageBackground>
        ) : (
          <View style={styles.coverImagePlaceholder}>
            {isOwner && (
              <View style={styles.coverEditBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.editBadgeText}>📷 Add Cover</Text>
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Business Info Card */}
      <View style={styles.businessCard}>
        {/* Top Section: Logo + Stats + Follow Button */}
        <View style={styles.topSection}>
          {/* Logo - Overlapping cover */}
          <TouchableOpacity
            onPress={handleLogoPress}
            activeOpacity={isOwner ? 0.7 : 1}
            disabled={!isOwner}
            style={styles.logoContainer}
          >
            <View style={styles.avatarBorderWrapper}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.businessAvatar} />
              ) : (
                <View style={styles.businessAvatar}>
                  <Text style={styles.businessAvatarText}>
                    {business.business_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {isOwner && (
              <View style={styles.logoEditBadge}>
                {isUploading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.editBadgeIcon}>✏️</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Stats and Action Buttons */}
          <View style={styles.statsAndFollowContainer}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.activeDealCount || 0}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.followerCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalDealsSold || 0}</Text>
                <Text style={styles.statLabel}>Deals Sold</Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsRow}>
              {/* Bell/Notification Button */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
                activeOpacity={0.7}
              >
                <Text style={styles.iconButtonText}>🔔</Text>
              </TouchableOpacity>

              {/* Message Button (Icon Only) */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleMessagePress}
                activeOpacity={0.7}
              >
                <Text style={styles.iconButtonText}>✉️</Text>
              </TouchableOpacity>

              {/* Follow Button */}
              <View style={styles.followButtonInRow}>
                <FollowButton
                  businessId={business.id}
                  businessName={business.business_name}
                  size="medium"
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.businessName}>{business.business_name}</Text>

        {/* Tab Section - Navigation + Content */}
        <View style={styles.tabSection}>
          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'location' && styles.activeTab]}
              onPress={() => setActiveTab('location')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'location' && styles.activeTabText]}>
                Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
              onPress={() => setActiveTab('contact')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                Contact
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'time' && styles.activeTab]}
              onPress={() => setActiveTab('time')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'time' && styles.activeTabText]}>
                Time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'about' && (
            <View style={styles.tabContent}>
              {business.description ? (
                <Text style={styles.description}>{business.description}</Text>
              ) : isOwner ? (
                <Text style={styles.emptyPrompt}>
                  💡 Please write about your shop to get more sales! Tell customers what makes your business special.
                </Text>
              ) : null}
            </View>
          )}

          {activeTab === 'location' && (
            <View style={styles.tabContent}>
              {business.address ? (
                <>
                  <Text style={styles.address}>{business.address}</Text>
                  {business.city && business.country && (
                    <Text style={styles.address}>
                      {business.city}, {business.country}
                    </Text>
                  )}
                </>
              ) : isOwner ? (
                <Text style={styles.emptyPrompt}>
                  📍 Please add your location to help more customers find you and increase sales!
                </Text>
              ) : null}
            </View>
          )}

          {activeTab === 'contact' && (
            <View style={styles.tabContent}>
              {business.phone || business.email || business.website ? (
                <>
                  {business.phone && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={() => handlePhonePress(business.phone!)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.contactIcon}>📞</Text>
                      <Text style={styles.contactText}>{business.phone}</Text>
                      <Text style={styles.contactAction}>Call</Text>
                    </TouchableOpacity>
                  )}
                  {business.email && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={() => handleEmailPress(business.email!)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.contactIcon}>✉️</Text>
                      <Text style={styles.contactText}>{business.email}</Text>
                      <Text style={styles.contactAction}>Email</Text>
                    </TouchableOpacity>
                  )}
                  {business.website && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={() => handleWebsitePress(business.website!)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.contactIcon}>🌐</Text>
                      <Text style={styles.contactText} numberOfLines={1}>{business.website}</Text>
                      <Text style={styles.contactAction}>Visit</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : isOwner ? (
                <Text style={styles.emptyPrompt}>
                  📞 Add your contact information to make it easy for customers to reach you!
                </Text>
              ) : null}
            </View>
          )}

          {activeTab === 'time' && (
            <View style={styles.tabContent}>
              {business.hours && Object.keys(business.hours).length > 0 ? (
                <>
                  {groupBusinessHours(business.hours).map((group, index) => (
                    <View key={index} style={styles.hourRow}>
                      <Text style={styles.dayText}>{group.days}</Text>
                      <Text style={styles.timeText}>{group.hours}</Text>
                    </View>
                  ))}
                </>
              ) : isOwner ? (
                <Text style={styles.emptyPrompt}>
                  ⏰ Please add your business hours so customers know when they can visit you!
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </View>

      {/* Deals & Reviews Section */}
      <View style={styles.dealsReviewsSection}>
        {/* Bottom Tab Navigation (Deals / Reviews) */}
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
      {/* Bottom padding for tab bar */}
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
      {/* Bottom padding for tab bar */}
      <View style={{ height: LAYOUT.tabBarHeight + SPACING.lg }} />
    </View>
  );

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

      {/* Main Content - Show different content based on active bottom tab */}
      {activeBottomTab === 'deals' ? (
        deals.length === 0 ? (
          // Empty state for deals - just render the header and empty message
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
          // Deals grid with FlashList
          <FlashList
            data={deals}
            renderItem={({ item, index }) => {
              const isLeftColumn = index % 2 === 0;
              const isFirstRow = index < 2;

              // FlashList with numColumns: each column gets equal width automatically
              // We just add padding to create spacing, card fills remaining space
              return (
                <View
                  style={{
                    flex: 1, // Let FlashList manage the width
                    paddingLeft: isLeftColumn ? EDGE_SPACING : COLUMN_GAP / 2,
                    paddingRight: isLeftColumn ? COLUMN_GAP / 2 : EDGE_SPACING,
                    paddingTop: isFirstRow ? ROW_GAP : 0,
                    paddingBottom: ROW_GAP,
                  }}
                >
                  <ShopDealCard
                    deal={item}
                    onPress={() => handleDealPress(item)}
                  />
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
        // Reviews tab
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

      {/* Floating Post Deal Button - Only visible to business owner */}
      {isOwner && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() =>
            navigation.navigate('CreateDeal', {
              businessId: business.id,
              businessName: business.business_name,
            })
          }
        >
          <Text style={styles.floatingButtonIcon}>+</Text>
          <Text style={styles.floatingButtonText}>Post Deal</Text>
        </TouchableOpacity>
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
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
  topSection: {
    flexDirection: 'row',
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  coverImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray200,
  },
  coverImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEditBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: RADIUS.full,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  logoContainer: {
    marginRight: SPACING.md,
    marginTop: -40,
    marginLeft: -SPACING.sm,
  },
  statsAndFollowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  avatarBorderWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.white,
    padding: 1,
    backgroundColor: COLORS.primary,
    // Drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  businessAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  editBadgeIcon: {
    fontSize: 14,
  },
  editBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  businessAvatarText: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  businessName: {
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tabSection: {
    // Wrapper for tab navigation + content
    // Easy to control spacing independently
    paddingTop: 0,
    paddingBottom: 0,
  },
  categoryBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  tabContent: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  emptyPrompt: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  hoursText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  followButtonInRow: {
    minWidth: 100,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  contactAction: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dealsGrid: {
    paddingTop: 0, // Padding handled in wrapper View
    paddingBottom: SPACING.md,
    // No gap, padding, or margins - all handled in renderItem wrapper
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
    ...SHADOWS.sm,
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
  floatingButton: {
    position: 'absolute',
    bottom: LAYOUT.tabBarHeight + SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    ...SHADOWS.lg,
    elevation: 8, // For Android shadow
  },
  floatingButtonIcon: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginRight: SPACING.xs,
  },
  floatingButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
});
