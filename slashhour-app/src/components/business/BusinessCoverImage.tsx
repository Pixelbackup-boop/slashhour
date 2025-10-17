import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
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
  );
}

const styles = StyleSheet.create({
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
  editBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

// Export with memo to prevent unnecessary re-renders
export default memo(BusinessCoverImage);
