import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '../icons';
import { COLORS, SPACING, RADIUS } from '../../theme';

interface BusinessCoverImageProps {
  coverUrl: string | null;
  isOwner: boolean;
  isUploading: boolean;
  onPress: () => void;
}

function BusinessCoverImage({ coverUrl, isOwner, isUploading, onPress }: BusinessCoverImageProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isOwner ? 0.7 : 1}
      disabled={!isOwner}
    >
      {coverUrl ? (
        <View style={styles.coverImage}>
          <Image
            source={{ uri: coverUrl }}
            style={styles.coverImageBackground}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
          {isOwner && (
            <View style={styles.coverEditBadge}>
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Icon name="edit" size={16} color={COLORS.white} style="line" />
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.coverImagePlaceholder}>
          {isOwner && (
            <View style={styles.coverEditBadge}>
              {isUploading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <View style={styles.editBadgeContent}>
                  <Icon name="camera" size={16} color={COLORS.white} style="line" />
                  <Text style={styles.editBadgeText}>Add Cover</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  coverImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray200,
    position: 'relative',
  },
  coverImageBackground: {
    width: '100%',
    height: '100%',
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
    borderRadius: RADIUS.round,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  editBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  editBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

// Export with memo to prevent unnecessary re-renders
export default memo(BusinessCoverImage);
