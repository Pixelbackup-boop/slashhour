import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../icons';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { BusinessReviewsResponse } from '../../types/models';
import { reviewService } from '../../services/api/reviewService';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  businessId: string;
  onWriteReview?: () => void;
  showWriteButton?: boolean;
  headerComponent?: React.ReactElement | null;
}

export default function ReviewList({
  businessId,
  onWriteReview,
  showWriteButton = false,
  headerComponent,
}: ReviewListProps) {
  const { colors } = useTheme();
  const [reviewData, setReviewData] = useState<BusinessReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadReviews = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const data = await reviewService.getBusinessReviews(businessId, page, 20);

        if (page === 1) {
          setReviewData(data);
        } else {
          setReviewData((prev) => ({
            ...data,
            reviews: [...(prev?.reviews || []), ...data.reviews],
          }));
        }

        setCurrentPage(page);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load reviews');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [businessId]
  );

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const handleRefresh = () => {
    loadReviews(1, true);
  };

  const handleLoadMore = () => {
    if (
      reviewData?.pagination.hasMore &&
      !isLoading &&
      !isLoadingMore &&
      !isRefreshing
    ) {
      loadReviews(currentPage + 1);
    }
  };

  const renderRatingBar = (star: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <View key={star} style={styles.ratingBarRow}>
        <Text style={styles.ratingBarLabel}>{star}★</Text>
        <View style={styles.ratingBarTrack}>
          <View
            style={[
              styles.ratingBarFill,
              { width: `${percentage}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (!reviewData) return headerComponent || null;

    return (
      <>
        {headerComponent}
        <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
        <View style={styles.summaryTop}>
          <View style={styles.averageRatingContainer}>
            <Text style={styles.averageRatingNumber}>
              {reviewData.averageRating.toFixed(1)}
            </Text>
            <View style={styles.ratingStarsContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon
                  key={i}
                  name="star"
                  size={20}
                  color={i <= Math.round(reviewData.averageRating) ? colors.warning : colors.gray300}
                  style={i <= Math.round(reviewData.averageRating) ? 'solid' : 'line'}
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>
              Based on {reviewData.totalReviews}{' '}
              {reviewData.totalReviews === 1 ? 'review' : 'reviews'}
            </Text>
          </View>

          {showWriteButton && onWriteReview && (
            <TouchableOpacity
              style={[styles.writeButton, { backgroundColor: colors.primary }]}
              onPress={onWriteReview}
            >
              <Text style={styles.writeButtonText}>Write Review</Text>
            </TouchableOpacity>
          )}
        </View>

        {reviewData.totalReviews > 0 && (
          <View style={styles.distributionContainer}>
            {[5, 4, 3, 2, 1].map((star) =>
              renderRatingBar(
                star,
                reviewData.ratingDistribution[star as keyof typeof reviewData.ratingDistribution],
                reviewData.totalReviews
              )
            )}
          </View>
        )}
        </View>
      </>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="star" size={64} color={colors.textSecondary} style="line" />
      <Text style={styles.emptyStateText}>No reviews yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Be the first to review this business!
      </Text>
      {showWriteButton && onWriteReview && (
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
          onPress={onWriteReview}
        >
          <Text style={styles.emptyStateButtonText}>Write a Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      padding: SPACING.xl,
      alignItems: 'center',
    },
    errorContainer: {
      padding: SPACING.xl,
      alignItems: 'center',
    },
    errorText: {
      color: colors.error,
      fontSize: TYPOGRAPHY.fontSize.md,
      textAlign: 'center',
    },
    summaryCard: {
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.md,
    },
    averageRatingContainer: {
      alignItems: 'center',
      flex: 1,
    },
    averageRatingNumber: {
      fontSize: 48,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.xs,
    },
    ratingStarsContainer: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: SPACING.xs,
    },
    totalReviewsText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    writeButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
    },
    writeButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    distributionContainer: {
      marginTop: SPACING.sm,
    },
    ratingBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    ratingBarLabel: {
      width: 35,
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    ratingBarTrack: {
      flex: 1,
      height: 8,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: RADIUS.sm,
      overflow: 'hidden',
      marginHorizontal: SPACING.sm,
    },
    ratingBarFill: {
      height: '100%',
      borderRadius: RADIUS.sm,
    },
    ratingBarCount: {
      width: 30,
      textAlign: 'right',
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: SPACING.xxl,
      paddingHorizontal: SPACING.lg,
    },
    emptyStateText: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    emptyStateSubtext: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    emptyStateButton: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.sm,
    },
    emptyStateButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    loadingMore: {
      padding: SPACING.md,
      alignItems: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.writeButton, { backgroundColor: colors.primary, marginTop: SPACING.md }]}
          onPress={() => loadReviews(1)}
        >
          <Text style={styles.writeButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reviewData || reviewData.reviews.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderEmptyState()}
          </>
        }
        contentContainerStyle={{ flex: 1 }}
      />
    );
  }

  return (
    <FlatList
      data={reviewData.reviews}
      renderItem={({ item }) => <ReviewCard review={item} />}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      contentContainerStyle={{ padding: SPACING.md }}
      ListHeaderComponent={renderHeader()}
      ListFooterComponent={renderFooter()}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    />
  );
}
