import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { trackScreenView } from '../../services/analytics';
import { useMyBusinesses } from '../../hooks/useMyBusinesses';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

export default function PostScreen({ navigation }: any) {
  const { businesses, isLoading: businessesLoading } = useMyBusinesses();
  const shouldNavigateRef = useRef(true);
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    trackScreenView('PostScreen');
  }, []);

  // Listen for tab press to reset navigation flag
  useEffect(() => {
    const unsubscribe = navigation.getParent()?.addListener('tabPress', (e: any) => {
      // Only reset if user is pressing the Post tab
      const targetTab = e.target?.split('-')[0];
      if (targetTab === 'Post') {
        shouldNavigateRef.current = true;
        isNavigatingRef.current = false;
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Auto-navigate to CreateDealScreen when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset navigation flag when screen comes into focus
      // This ensures auto-navigation works every time user comes to Post tab
      shouldNavigateRef.current = true;

      // Only navigate if flag is true and not already navigating
      if (!businessesLoading && businesses.length > 0 && shouldNavigateRef.current && !isNavigatingRef.current) {
        shouldNavigateRef.current = false;
        isNavigatingRef.current = true;
        const business = businesses[0];

        // Use setTimeout to ensure navigation happens after screen is fully mounted
        setTimeout(() => {
          navigation.navigate('CreateDeal', {
            businessId: business.id,
            businessName: business.business_name,
          });
          isNavigatingRef.current = false;
        }, 100);
      }
    }, [businesses, businessesLoading, navigation])
  );

  const handleBecomeBusiness = () => {
    Alert.alert(
      'Become a Business',
      'Would you like to register your business and start posting deals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: () => {
            navigation.navigate('RegisterBusiness');
          },
        },
      ]
    );
  };

  // Show loading state while fetching businesses
  if (businessesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyStateText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If user has businesses, show nothing while useFocusEffect handles auto-navigation
  if (businesses.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Consumer view - Request to become business
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>🏪</Text>
        <Text style={styles.emptyStateTitle}>Share Your Deals</Text>
        <Text style={styles.emptyStateText}>
          Are you a business owner? Register your business to start posting deals and
          reach thousands of customers.
        </Text>

        <TouchableOpacity style={styles.registerButton} onPress={handleBecomeBusiness}>
          <Text style={styles.registerButtonText}>Register Your Business</Text>
        </TouchableOpacity>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Reach local customers instantly</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Post unlimited deals</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Track redemptions and analytics</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Build customer loyalty</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.lg,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  benefitsTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitIcon: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.success,
    marginRight: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
});
