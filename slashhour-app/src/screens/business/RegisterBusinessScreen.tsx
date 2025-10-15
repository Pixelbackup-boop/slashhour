import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRegisterBusiness } from '../../hooks/useRegisterBusiness';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SIZES } from '../../theme';
import { BusinessCategory } from '../../types/models';
import LocationService from '../../services/location/LocationService';
import ReverseGeocodeService from '../../services/location/ReverseGeocodeService';

const BUSINESS_CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: 'restaurant', label: '🍕 Restaurant' },
  { value: 'grocery', label: '🛒 Grocery' },
  { value: 'fashion', label: '👕 Fashion' },
  { value: 'shoes', label: '👟 Shoes' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'home_living', label: '🏠 Home & Living' },
  { value: 'beauty', label: '💄 Beauty' },
  { value: 'health', label: '💊 Health' },
];

export default function RegisterBusinessScreen({ navigation }: any) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { formData, isLoading, error, updateField, setCoordinates, handleRegister, resetForm } = useRegisterBusiness();

  useEffect(() => {
    trackScreenView('RegisterBusinessScreen');
  }, []);

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Get current GPS coordinates
      // LocationService now handles showing native dialogs for:
      // 1. Enabling location services (if disabled) - Android native dialog
      // 2. Requesting permissions (if not granted) - Native permission dialog (both platforms)
      const location = await LocationService.getCurrentLocation();

      console.log('📍 Got GPS coordinates:', location);

      // Reverse geocode to get address
      const address = await ReverseGeocodeService.getAddressFromCoordinates(
        location.latitude,
        location.longitude
      );

      console.log('📍 Got address:', address);

      // Store GPS coordinates first
      setCoordinates(location.latitude, location.longitude);

      // Auto-fill address fields
      if (address.street) {
        updateField('address', address.street);
      }
      if (address.city) {
        updateField('city', address.city);
      }
      if (address.region) {
        updateField('state_province', address.region);
      }
      if (address.country) {
        updateField('country', address.country);
      }
      if (address.postalCode) {
        updateField('postal_code', address.postalCode);
      }

      console.log('✅ Location auto-filled successfully with coordinates:', {
        lat: location.latitude,
        lng: location.longitude,
      });

      Alert.alert(
        'Location Detected! ✅',
        `${address.formattedAddress}\n\nPlease verify this is your business location. You can edit any field if needed.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      let title = 'Location Error';
      let message = 'Failed to get your location. Please enter your address manually.';

      // Check if this is an expected user action (not a real error)
      const isExpectedUserAction =
        error.message === 'LOCATION_SERVICES_DISABLED' ||
        error.message === 'LOCATION_PERMISSION_DENIED' ||
        error.message === 'LOCATION_TIMEOUT';

      // Handle specific error cases when user declines native dialogs
      if (error.message === 'LOCATION_SERVICES_DISABLED') {
        title = 'Location Services Required';
        message = 'You declined to enable location services. Please enable them manually in Settings to use this feature, or enter your address manually.';
        console.log('ℹ️ User declined to enable location services');
      } else if (error.message === 'LOCATION_PERMISSION_DENIED') {
        title = 'Location Permission Required';
        message = 'You declined to grant location permission. Please enable it manually in Settings to use this feature, or enter your address manually.';
        console.log('ℹ️ User declined location permission');
      } else if (error.message === 'LOCATION_TIMEOUT') {
        title = 'Location Timeout';
        message = 'Could not get your location. Please make sure you have good GPS signal and try again, or enter your address manually.';
        console.log('ℹ️ Location timeout');
      } else if (error.message?.includes('Network')) {
        title = 'Network Error';
        message = 'Could not convert your location to an address. Please check your internet connection and try again.';
        console.error('❌ Network error during reverse geocoding:', error);
      } else if (error.message?.includes('address')) {
        // Reverse geocoding error
        title = 'Address Conversion Error';
        message = error.message;
        console.error('❌ Reverse geocoding error:', error);
      } else {
        // Unexpected error
        console.error('❌ Unexpected error getting location:', error);
      }

      Alert.alert(title, message, [{ text: 'OK' }]);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRegisterPress = async () => {
    const result = await handleRegister();
    if (result.success && result.business) {
      Alert.alert(
        'Success!',
        'Your business has been registered successfully. You can now start posting deals!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to the newly created business profile
              navigation.replace('BusinessProfile', {
                businessId: result.business.id,
                businessName: result.business.business_name,
              });
            },
          },
        ]
      );
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel? All information will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            resetForm();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getCategoryLabel = () => {
    if (!formData.category) return 'Select Category';
    const category = BUSINESS_CATEGORIES.find(cat => cat.value === formData.category);
    return category ? category.label : formData.category;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Your Business</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.business_name}
            onChangeText={(value) => updateField('business_name', value)}
            placeholder="e.g., Joe's Coffee Shop"
            autoCapitalize="words"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            disabled={isLoading}
          >
            <Text style={[styles.pickerButtonText, !formData.category && styles.placeholderText]}>
              {getCategoryLabel()}
            </Text>
            <Text style={styles.pickerArrow}>{showCategoryPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={styles.pickerDropdown}>
              {BUSINESS_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    updateField('category', category.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Tell customers about your business..."
            multiline
            numberOfLines={4}
            editable={!isLoading}
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>Location</Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleUseCurrentLocation}
            disabled={isLoading || isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.locationButtonIcon}>📍</Text>
            )}
            <Text style={styles.locationButtonText}>
              {isGettingLocation ? 'Getting Location...' : 'Use My Current Location'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(value) => updateField('address', value)}
            placeholder="e.g., 123 Main Street"
            autoCapitalize="words"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(value) => updateField('city', value)}
            placeholder="e.g., New York"
            autoCapitalize="words"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State/Province</Text>
              <TextInput
                style={styles.input}
                value={formData.state_province}
                onChangeText={(value) => updateField('state_province', value)}
                placeholder="e.g., NY"
                autoCapitalize="characters"
                editable={!isLoading}
                textAlignVertical="center"
                includeFontPadding={false}
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>ZIP/Postal Code</Text>
              <TextInput
                style={styles.input}
                value={formData.postal_code}
                onChangeText={(value) => updateField('postal_code', value)}
                placeholder="e.g., 10001"
                keyboardType="default"
                editable={!isLoading}
                textAlignVertical="center"
                includeFontPadding={false}
              />
            </View>
          </View>

          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(value) => updateField('country', value)}
            placeholder="e.g., US"
            autoCapitalize="characters"
            maxLength={2}
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <Text style={styles.sectionTitle}>Contact Information</Text>

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            placeholder="e.g., +1 (555) 123-4567"
            keyboardType="phone-pad"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="e.g., contact@yourbusiness.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={formData.website}
            onChangeText={(value) => updateField('website', value)}
            placeholder="e.g., https://yourbusiness.com"
            keyboardType="url"
            autoCapitalize="none"
            editable={!isLoading}
            textAlignVertical="center"
            includeFontPadding={false}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegisterPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register Business</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  headerTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  cancelButton: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  headerRight: {
    width: 60, // Same width as cancel button for centering
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  content: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  locationButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    height: SIZES.button.lg,
  },
  locationButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  locationButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.textInverse,
  },
  label: {
    ...TYPOGRAPHY.styles.label,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
    textTransform: 'none',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.gray50,
    minHeight: SIZES.input.md,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    minHeight: SIZES.input.md,
  },
  pickerButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textTertiary,
  },
  pickerArrow: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    marginTop: -SPACING.lg + 4,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pickerOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    height: SIZES.button.lg,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  buttonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.textInverse,
  },
  error: {
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  requiredNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
