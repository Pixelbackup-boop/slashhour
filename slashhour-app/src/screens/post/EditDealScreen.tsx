import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useEditDeal } from '../../hooks/useEditDeal';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { Deal } from '../../types/models';
import { DEAL_CATEGORIES, formatDealDate } from '../../utils/dealUtils';

interface EditDealScreenProps {
  route: {
    params: {
      deal: Deal;
      businessId: string;
      businessName: string;
    };
  };
  navigation: any;
}

export default function EditDealScreen({ route, navigation }: EditDealScreenProps) {
  const { deal, businessId, businessName } = route.params;
  const {
    formData,
    isLoading,
    error,
    updateField,
    addNewImage,
    removeNewImage,
    removeExistingImage,
    handleUpdate,
  } = useEditDeal(deal, businessId);
  const { business } = useBusinessProfile(businessId);

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Determine max images based on verification status
  const maxImages = business?.is_verified ? 10 : 5;
  const totalImages = formData.existingImages.length + formData.newImages.length;

  React.useEffect(() => {
    trackScreenView('EditDealScreen', { businessId, dealId: deal.id });
  }, [businessId, deal.id]);

  // Handle Android hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCancel();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleSave = async () => {
    const success = await handleUpdate();
    if (success) {
      Alert.alert(
        'Success',
        'Your deal has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('BusinessProfile', { businessId, businessName }),
          },
        ]
      );
    }
  };

  const pickImage = async () => {
    // Check if max images reached
    if (totalImages >= maxImages) {
      Alert.alert(
        'Maximum Images Reached',
        `You can upload up to ${maxImages} images${business?.is_verified ? ' (Verified Business)' : ''}. ${!business?.is_verified ? 'Verify your business to upload up to 10 images!' : ''}`
      );
      return;
    }

    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      addNewImage(result.assets[0].uri);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Deal</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Business Name */}
        <View style={styles.section}>
          <Text style={styles.businessInfo}>Editing deal for: {businessName}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>📝 Basic Information</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Deal Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50% Off All Shoes"
                value={formData.title}
                onChangeText={(value) => updateField('title', value)}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your deal..."
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.categoriesGrid}>
                {DEAL_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      formData.category === cat.value && styles.categoryChipActive,
                    ]}
                    onPress={() => updateField('category', cat.value)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === cat.value && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>💰 Pricing</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Original Price ($) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.original_price}
                onChangeText={(value) => updateField('original_price', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Discounted Price ($) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.discounted_price}
                onChangeText={(value) => updateField('discounted_price', value)}
                keyboardType="decimal-pad"
              />
            </View>

            {formData.original_price && formData.discounted_price && (
              <View style={styles.savingsPreview}>
                <Text style={styles.savingsText}>
                  Savings:{' '}
                  {(
                    ((parseFloat(formData.original_price) - parseFloat(formData.discounted_price)) /
                      parseFloat(formData.original_price)) *
                    100
                  ).toFixed(0)}
                  % (${(parseFloat(formData.original_price) - parseFloat(formData.discounted_price)).toFixed(2)})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📸 Images</Text>
            <Text style={styles.imageCount}>
              {totalImages} / {maxImages}
              {business?.is_verified && <Text style={styles.verifiedBadge}> ✓ Verified</Text>}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.hint}>
              {business?.is_verified
                ? 'As a verified business, you can upload up to 10 images.'
                : `Upload up to 5 images. Get verified to upload up to 10!`}
            </Text>

            <View style={styles.imagesGrid}>
              {/* Existing images from server */}
              {formData.existingImages.map((image, index) => (
                <View key={`existing-${index}`} style={styles.imagePreview}>
                  <Image source={{ uri: image.url }} style={styles.imagePreviewImage} />
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={() => removeExistingImage(index)}
                  >
                    <Text style={styles.imageRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* New images to upload */}
              {formData.newImages.map((image, index) => (
                <View key={`new-${index}`} style={styles.imagePreview}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreviewImage} />
                  <View style={styles.newImageBadge}>
                    <Text style={styles.newImageBadgeText}>NEW</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.imageRemoveButton}
                    onPress={() => removeNewImage(index)}
                  >
                    <Text style={styles.imageRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {totalImages < maxImages && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                  <Text style={styles.addImageIcon}>+</Text>
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>📅 Availability</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Expiry Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDealDate(formData.expires_at)}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={formData.expires_at || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowEndDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      updateField('expires_at', selectedDate);
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity Available (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Leave empty for unlimited"
                value={formData.quantity_available}
                onChangeText={(value) => updateField('quantity_available', value)}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Per User</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={formData.max_per_user}
                onChangeText={(value) => updateField('max_per_user', value)}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
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
  backButton: {
    padding: SPACING.xs,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  businessInfo: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  imageCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  verifiedBadge: {
    color: COLORS.success,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  savingsPreview: {
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  savingsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  dateButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.white,
  },
  imagePreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  newImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  newImageBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  addImageIcon: {
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  addImageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
});
