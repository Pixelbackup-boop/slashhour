import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../icons';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { Review } from '../../types/models';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { colors } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="star"
        size={16}
        color={index < rating ? colors.warning : colors.gray300}
        style={index < rating ? 'solid' : 'line'}
      />
    ));
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SPACING.sm,
    },
    avatarText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    userDetails: {
      flex: 1,
    },
    username: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
    },
    date: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    verifiedBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: SPACING.xs,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
      marginLeft: SPACING.sm,
    },
    verifiedText: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.success,
      fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    starsContainer: {
      flexDirection: 'row',
      gap: 2,
      marginBottom: SPACING.sm,
    },
    reviewText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    noReviewText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {review.user.name?.[0]?.toUpperCase() || review.user.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{review.user.name || review.user.username}</Text>
            <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
        {review.isVerifiedBuyer && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified Buyer</Text>
          </View>
        )}
      </View>

      <View style={styles.starsContainer}>{renderStars(review.rating)}</View>

      {review.reviewText ? (
        <Text style={styles.reviewText}>{review.reviewText}</Text>
      ) : (
        <Text style={styles.noReviewText}>No written review</Text>
      )}
    </View>
  );
}
