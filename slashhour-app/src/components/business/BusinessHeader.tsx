import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
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
  logoUrl: string | null;
  stats: BusinessStats | null;
  isOwner: boolean;
  isUploading: boolean;
  onLogoPress: () => void;
  onMessagePress: () => void;
}

function BusinessHeader({
  businessId,
  businessName,
  logoUrl,
  stats,
  isOwner,
  isUploading,
  onLogoPress,
  onMessagePress,
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
              <Image source={{ uri: logoUrl }} style={styles.businessAvatar} />
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
                size="medium"
                variant="primary"
              />
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.businessName}>{businessName}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  topSection: {
    flexDirection: 'row',
    marginBottom: 0,
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
});

// Export with memo to prevent unnecessary re-renders
export default memo(BusinessHeader);
