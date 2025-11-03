import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { Review } from '../../types/models';
import { reviewService } from '../../services/api/reviewService';
import { useKeyboardAnimation } from '../../hooks/useKeyboardAnimation';

interface ReviewFormProps {
  businessId: string;
  businessName: string;
  existingReview?: Review | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({
  businessId,
  businessName,
  existingReview,
  visible,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const { colors } = useTheme();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const keyboardOffset = useKeyboardAnimation();

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText || '');
    } else {
      setRating(5);
      setReviewText('');
    }
  }, [existingReview, visible]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        await reviewService.updateReview(existingReview.id, {
          rating,
          review_text: reviewText.trim() || undefined,
        });
        Alert.alert('Success', 'Review updated successfully');
      } else {
        // Create new review
        await reviewService.createReview({
          business_id: businessId,
          rating,
          review_text: reviewText.trim() || undefined,
        });
        Alert.alert('Success', 'Review submitted successfully');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to submit review'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!existingReview) return;

    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await reviewService.deleteReview(existingReview.id);
              Alert.alert('Success', 'Review deleted successfully');
              onSuccess();
              onClose();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete review');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} disabled={isSubmitting}>
            <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      // Wrapper for animation
    },
    container: {
      backgroundColor: colors.white,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.fontSize.lg,
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      color: colors.textPrimary,
      flex: 1,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    closeButtonText: {
      fontSize: TYPOGRAPHY.fontSize.xl,
      color: colors.textSecondary,
    },
    content: {
      padding: SPACING.lg,
    },
    businessName: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.md,
      textAlign: 'center',
    },
    section: {
      marginBottom: SPACING.lg,
    },
    sectionLabel: {
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: SPACING.sm,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: SPACING.sm,
    },
    star: {
      fontSize: 40,
      marginHorizontal: SPACING.xs,
    },
    ratingText: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xs,
    },
    textInput: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: TYPOGRAPHY.fontSize.md,
      color: colors.textPrimary,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    characterCount: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: SPACING.xs,
    },
    buttonContainer: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    submitButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    submitButtonText: {
      color: colors.white,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
    deleteButton: {
      backgroundColor: 'transparent',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.error,
    },
    deleteButtonText: {
      color: colors.error,
      fontSize: TYPOGRAPHY.fontSize.md,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
    },
  });

  const ratingLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: keyboardOffset.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -1],
              }) }]
            }
          ]}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {existingReview ? 'Edit Review' : 'Write a Review'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.businessName}>{businessName}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Your Rating</Text>
                {renderStars()}
                <Text style={styles.ratingText}>{ratingLabels[rating - 1]}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Your Review (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Share your experience with this business..."
                  placeholderTextColor={colors.textSecondary}
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  maxLength={500}
                  editable={!isSubmitting}
                />
                <Text style={styles.characterCount}>{reviewText.length}/500</Text>
              </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {existingReview ? 'Update Review' : 'Submit Review'}
                  </Text>
                )}
              </TouchableOpacity>

              {existingReview && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  disabled={isSubmitting}
                >
                  <Text style={styles.deleteButtonText}>Delete Review</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
