import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFollowing } from '../hooks/useFollowing';

interface FollowButtonProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'outline';
}

export default function FollowButton({
  businessId,
  businessName,
  businessCategory,
  size = 'medium',
  variant = 'primary',
}: FollowButtonProps) {
  const {
    isFollowing,
    isLoading,
    isProcessing,
    followBusiness,
    unfollowBusiness,
  } = useFollowing(businessId, businessName, businessCategory);

  const handlePress = async () => {
    try {
      if (isFollowing) {
        // Confirm before unfollowing
        Alert.alert(
          'Unfollow Business',
          `Are you sure you want to unfollow ${businessName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Unfollow',
              style: 'destructive',
              onPress: async () => {
                await unfollowBusiness();
              },
            },
          ]
        );
      } else {
        await followBusiness();
      }
    } catch (error) {
      // Error already logged in hook
      Alert.alert(
        'Error',
        isFollowing
          ? 'Failed to unfollow business. Please try again.'
          : 'Failed to follow business. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles[size],
          variant === 'outline' && styles.outlineButton,
          styles.disabled,
        ]}
        disabled
      >
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#FF6B6B' : '#fff'}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        isFollowing ? styles.followingButton : styles.followButton,
        variant === 'outline' && isFollowing && styles.outlineFollowingButton,
        variant === 'outline' && !isFollowing && styles.outlineFollowButton,
        (isProcessing || isLoading) && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={isProcessing || isLoading}
      activeOpacity={0.7}
    >
      {isProcessing ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#FF6B6B' : '#fff'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${size}Text`],
            isFollowing ? styles.followingText : styles.followText,
            variant === 'outline' && isFollowing && styles.outlineFollowingText,
            variant === 'outline' && !isFollowing && styles.outlineFollowText,
          ]}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  followButton: {
    backgroundColor: '#FF6B6B',
  },
  followingButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  outlineButton: {
    backgroundColor: 'transparent',
  },
  outlineFollowButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  outlineFollowingButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#999',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  followText: {
    color: '#fff',
  },
  followingText: {
    color: '#FF6B6B',
  },
  outlineFollowText: {
    color: '#FF6B6B',
  },
  outlineFollowingText: {
    color: '#999',
  },
});
