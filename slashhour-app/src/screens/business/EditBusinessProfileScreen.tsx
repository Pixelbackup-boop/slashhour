import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEditBusinessProfile } from '../../hooks/useEditBusinessProfile';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES } from '../../theme';
import { Business } from '../../types/models';
import LocationService from '../../services/location/LocationService';
import ReverseGeocodeService from '../../services/location/ReverseGeocodeService';
import BusinessHoursEditor, { BusinessHours } from '../../components/BusinessHoursEditor';

interface EditBusinessProfileScreenProps {
  route: {
    params: {
      business: Business;
    };
  };
  navigation: any;
}

export default function EditBusinessProfileScreen({ route, navigation }: EditBusinessProfileScreenProps) {
  const { business } = route.params;
  const { formData, isLoading, error, updateField, setCoordinates, setHours, handleSave, resetForm } = useEditBusinessProfile(business);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    trackScreenView('EditBusinessProfileScreen', { businessId: business.id });
  }, [business.id]);

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      Alert.alert(
        'Success',
        'Business profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const onCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);

      // Get current GPS coordinates
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
      if (address.state) {
        updateField('state_province', address.state);
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

      if (error.message === 'LOCATION_SERVICES_DISABLED') {
        title = 'Location Services Required';
        message = 'You declined to enable location services. Please enable them manually in Settings to use this feature, or enter your address manually.';
      } else if (error.message === 'LOCATION_PERMISSION_DENIED') {
        title = 'Location Permission Required';
        message = 'You declined to grant location permission. Please enable it manually in Settings to use this feature, or enter your address manually.';
      } else if (error.message === 'LOCATION_TIMEOUT') {
        title = 'Location Timeout';
        message = 'Could not get your location. Please make sure you have good GPS signal and try again, or enter your address manually.';
      } else if (error.message?.includes('Network')) {
        title = 'Network Error';
        message = 'Could not convert your location to an address. Please check your internet connection and try again.';
      }

      Alert.alert(title, message, [{ text: 'OK' }]);
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shop</Text>
        <TouchableOpacity
          onPress={onSave}
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.business_name}
            onChangeText={(text) => updateField('business_name', text)}
            placeholder="Enter business name"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder="Tell customers about your business..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={150}
          />
          <Text style={[
            styles.charCounter,
            (formData.description?.length || 0) > 150 && styles.charCounterError
          ]}>
            {formData.description?.length || 0}/150 characters
          </Text>

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryValue}>{formData.category}</Text>
            <Text style={styles.categoryNote}>Contact support to change category</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Information</Text>

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="contact@business.com"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            value={formData.website}
            onChangeText={(text) => updateField('website', text)}
            placeholder="https://www.business.com"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>

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
            onChangeText={(text) => updateField('address', text)}
            placeholder="123 Main Street"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => updateField('city', text)}
            placeholder="New York"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.label}>State/Province</Text>
          <TextInput
            style={styles.input}
            value={formData.state_province}
            onChangeText={(text) => updateField('state_province', text)}
            placeholder="NY"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.label}>Country *</Text>
          <TextInput
            style={styles.input}
            value={formData.country}
            onChangeText={(text) => updateField('country', text)}
            placeholder="United States"
            placeholderTextColor={COLORS.textTertiary}
          />

          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={formData.postal_code}
            onChangeText={(text) => updateField('postal_code', text)}
            placeholder="10001"
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Business Hours</Text>
          <BusinessHoursEditor
            hours={formData.hours || {}}
            onChange={setHours}
          />
        </View>

        {/* Required Fields Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>* Required fields</Text>
        </View>

        {/* Bottom padding */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
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
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
  },
  cancelButton: {
    padding: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  errorBanner: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    paddingTop: SPACING.md,
  },
  categoryContainer: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
  },
  categoryValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginBottom: SPACING.xs,
  },
  categoryNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  noteContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noteText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  charCounter: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  charCounterError: {
    color: COLORS.error,
  },
  locationButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
