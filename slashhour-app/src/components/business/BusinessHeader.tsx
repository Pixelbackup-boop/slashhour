import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import FollowButton from '../FollowButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';

interface BusinessStats {
  activeDealCount: number;
  followerCount: number;
  totalDealsSold: number;
}

interface BusinessHeaderProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
  logoUrl: string | null;
  stats: BusinessStats | null;
  isOwner: boolean;
  isUploading: boolean;
  onLogoPress: () => void;
  onMessagePress: () => void;
  onEditPress: () => void;
}

function BusinessHeader({
  businessId,
  businessName,
  businessCategory,
  logoUrl,
  stats,
  isOwner,
  isUploading,
  onLogoPress,
  onMessagePress,
  onEditPress,
}: BusinessHeaderProps) {
  return (
    <>
      {/* Top Section: Logo + Stats + Follow Button */}
      <View style={styles.topSection}>
        {/* Logo - Overlapping cover */}
        <TouchableOpacity
          onPress={onLogoPress}
          activeOpacity={isOwner ? 0.7 : 1}
          disabled={!isOwner}
          style={styles.logoContainer}
        >
          <View style={styles.avatarBorderWrapper}>
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                style={styles.businessAvatar}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <View style={styles.businessAvatar}>
                <Text style={styles.businessAvatarText}>
                  {businessName.charAt(0).toUpperCase()}
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
              onPress={onMessagePress}
              activeOpacity={0.7}
            >
              <Text style={styles.iconButtonText}>✉️</Text>
            </TouchableOpacity>

            {/* Follow Button */}
            <View style={styles.followButtonInRow}>
              <FollowButton
                businessId={businessId}
                businessName={businessName}
                businessCategory={businessCategory}
                size="medium"
                variant="primary"
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.businessName}>{businessName}</Text>
        {isOwner && (
          <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topSection: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
borderRadius: RADIUS.round,
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
  businessAvatarText: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 0,
    marginBottom: 0,
  },
  businessName: {
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  editIcon: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    marginTop: -8,
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
    marginTop: -8,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.round,
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
});

// Export with memo to prevent unnecessary re-renders
export default memo(BusinessHeader);
