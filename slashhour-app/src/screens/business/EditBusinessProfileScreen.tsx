import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEditBusinessProfile } from '../../hooks/useEditBusinessProfile';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES } from '../../theme';
import { Business, BusinessCategory } from '../../types/models';
import LocationService from '../../services/location/LocationService';
import ReverseGeocodeService from '../../services/location/ReverseGeocodeService';
import BusinessHoursEditor, { BusinessHours } from '../../components/BusinessHoursEditor';
import { sanitizeSlug, getSlugValidationError, formatSlugUrl } from '../../utils/slugUtils';

// Category options with display names
const CATEGORY_OPTIONS: { value: BusinessCategory; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home_living', label: 'Home & Living' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'health', label: 'Health' },
];

interface EditBusinessProfileScreenProps {
  route: {
    params: {
      business: Business;
    };
  };
  navigation: any;
}

type EditTab = 'contact' | 'location' | 'hours';

export default function EditBusinessProfileScreen({ route, navigation }: EditBusinessProfileScreenProps) {
  const { business } = route.params;
  const { formData, isLoading, error, updateField, setCoordinates, setHours, handleSave, resetForm } = useEditBusinessProfile(business);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EditTab>('contact');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    trackScreenView('EditBusinessProfileScreen', { businessId: business.id });
  }, [business.id]);

  // Check if slug is already set (locked after first save)
  const isSlugLocked = Boolean(business.slug);

  // Check if category can be changed (30-day restriction)
  const categoryRestriction = useMemo(() => {
    if (!business.category_last_changed_at) {
      return { canChange: true, daysRemaining: 0 };
    }

    const lastChanged = new Date(business.category_last_changed_at);
    const thirtyDaysLater = new Date(lastChanged);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const now = new Date();
    const canChange = now >= thirtyDaysLater;
    const daysRemaining = Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return { canChange, daysRemaining: Math.max(0, daysRemaining) };
  }, [business.category_last_changed_at]);

  // Validate slug when it changes
  useEffect(() => {
    if (formData.slug) {
      const error = getSlugValidationError(formData.slug);
      setSlugError(error);
    } else {
      setSlugError(null);
    }
  }, [formData.slug]);

  // Handle manual slug editing (only for new businesses)
  const handleSlugChange = (input: string) => {
    if (isSlugLocked) return; // Don't allow editing if already saved
    const sanitized = sanitizeSlug(input);
    updateField('slug', sanitized);
  };

  // Handle category picker
  const handleCategoryPress = () => {
    if (!categoryRestriction.canChange) {
      Alert.alert(
        'Category Locked',
        `Category can only be changed once per month. You can change it again in ${categoryRestriction.daysRemaining} day(s).`,
        [{ text: 'OK' }]
      );
      return;
    }
    setShowCategoryPicker(true);
  };

  const handleCategorySelect = (category: BusinessCategory) => {
    updateField('category', category);
    setShowCategoryPicker(false);
  };

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

      if (__DEV__) {
        console.log('📍 Got GPS coordinates:', location);
      }

      // Reverse geocode to get address
      const address = await ReverseGeocodeService.getAddressFromCoordinates(
        location.latitude,
        location.longitude
      );

      if (__DEV__) {
        console.log('📍 Got address:', address);
      }

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

      if (__DEV__) {
        console.log('✅ Location auto-filled successfully with coordinates:', {
          lat: location.latitude,
          lng: location.longitude,
        });
      }

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
        {/* Basic Information - Always Visible */}
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

          <Text style={styles.label}>URL Slug * {isSlugLocked && '🔒'}</Text>
          <TextInput
            style={[
              styles.input,
              slugError && styles.inputError,
              isSlugLocked && styles.inputLocked,
            ]}
            value={formData.slug}
            onChangeText={handleSlugChange}
            placeholder="your-shop-name"
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSlugLocked}
          />
          <View style={styles.slugPreview}>
            <Text style={styles.slugPreviewLabel}>Your URL: </Text>
            <Text style={styles.slugPreviewUrl}>{formatSlugUrl(formData.slug || 'your-shop-name')}</Text>
          </View>
          {isSlugLocked && (
            <Text style={styles.slugLockedMessage}>🔒 URL slug cannot be changed after it's set</Text>
          )}
          {!isSlugLocked && slugError && (
            <Text style={styles.validationError}>{slugError}</Text>
          )}
          {!isSlugLocked && !slugError && formData.slug && (
            <Text style={styles.validationSuccess}>✓ URL is available</Text>
          )}

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

          <Text style={styles.label}>Category * {!categoryRestriction.canChange && '🔒'}</Text>
          <TouchableOpacity
            style={[
              styles.categoryContainer,
              !categoryRestriction.canChange && styles.categoryLocked,
            ]}
            onPress={handleCategoryPress}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryValue}>
              {CATEGORY_OPTIONS.find(c => c.value === formData.category)?.label || formData.category}
            </Text>
            {categoryRestriction.canChange ? (
              <Text style={styles.categoryNote}>Tap to change • Can only be changed once per month</Text>
            ) : (
              <Text style={styles.categoryLockedNote}>
                🔒 Can be changed again in {categoryRestriction.daysRemaining} day(s)
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigationSection}>
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
              onPress={() => setActiveTab('contact')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                Contact
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'location' && styles.activeTab]}
              onPress={() => setActiveTab('location')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'location' && styles.activeTabText]}>
                Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'hours' && styles.activeTab]}
              onPress={() => setActiveTab('hours')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'hours' && styles.activeTabText]}>
                Hours
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'contact' && (
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
        )}

        {activeTab === 'location' && (
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
        )}

        {activeTab === 'hours' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Business Hours</Text>
            <BusinessHoursEditor
              hours={formData.hours || {}}
              onChange={setHours}
            />
          </View>
        )}

        {/* Required Fields Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>* Required fields</Text>
        </View>

        {/* Bottom padding */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              {CATEGORY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryOption,
                    formData.category === option.value && styles.categoryOptionActive,
                  ]}
                  onPress={() => handleCategorySelect(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    formData.category === option.value && styles.categoryOptionTextActive,
                  ]}>
                    {option.label}
                  </Text>
                  {formData.category === option.value && (
                    <Text style={styles.categoryOptionCheckActive}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalNote}>
              <Text style={styles.modalNoteText}>
                ⚠️ Category can only be changed once per month. Choose carefully!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.error,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  inputLocked: {
    backgroundColor: COLORS.gray50,
    color: COLORS.textTertiary,
  },
  slugLockedMessage: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
    fontStyle: 'italic',
  },
  slugPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  slugPreviewLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  slugPreviewUrl: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  validationError: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  validationSuccess: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  tabNavigationSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    paddingTop: 0,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  categoryLocked: {
    opacity: 0.6,
  },
  categoryLockedNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  categoryList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  categoryOptionTextActive: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  categoryOptionCheck: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  categoryOptionCheckActive: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  modalNote: {
    backgroundColor: COLORS.warning,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
  },
  modalNoteText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
