import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import { CATEGORIES, getAllCategoryIds } from '../constants/categories';

interface CategorySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onSave: (categories: string[]) => void;
  title?: string;
  description?: string;
}

/**
 * CategorySelectionModal Component
 * 2025 Best Practice: Modal-based multi-select with "All Categories" toggle
 *
 * Features:
 * - Clean, simple checkbox-based selection
 * - "All Categories" smart toggle
 * - Smooth animations (250ms)
 * - Shows selected count
 * - No external dependencies
 */
export default function CategorySelectionModal({
  visible,
  onClose,
  selectedCategories,
  onSave,
  title = 'Select Categories',
  description = 'Choose which categories you want to include',
}: CategorySelectionModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Local state for editing (don't save until user confirms)
  const [tempSelected, setTempSelected] = useState<string[]>(selectedCategories);

  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  // Update local state when prop changes
  useEffect(() => {
    setTempSelected(selectedCategories);
  }, [selectedCategories]);

  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Check if all categories are selected
  const allSelected = useMemo(() => {
    return tempSelected.length === CATEGORIES.length;
  }, [tempSelected]);

  // Toggle all categories
  const handleToggleAll = () => {
    if (allSelected) {
      setTempSelected([]);
    } else {
      setTempSelected(getAllCategoryIds());
    }
  };

  // Toggle individual category
  const handleToggleCategory = (categoryId: string) => {
    if (tempSelected.includes(categoryId)) {
      setTempSelected(tempSelected.filter((id) => id !== categoryId));
    } else {
      setTempSelected([...tempSelected, categoryId]);
    }
  };

  // Save and close
  const handleSave = () => {
    onSave(tempSelected);
    onClose();
  };

  // Cancel without saving
  const handleCancel = () => {
    setTempSelected(selectedCategories); // Reset to original
    onClose();
  };

  const dynamicStyles = useMemo(
    () => ({
      modalContent: {
        backgroundColor: colors.white,
      },
      title: {
        color: colors.textPrimary,
      },
      description: {
        color: colors.textSecondary,
      },
      allToggleRow: {
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.borderLight,
      },
      allToggleLabel: {
        color: colors.textPrimary,
      },
      categoryRow: {
        borderBottomColor: colors.borderLight,
      },
      categoryLabel: {
        color: colors.textPrimary,
      },
      categoryDescription: {
        color: colors.textTertiary,
      },
      checkbox: {
        borderColor: colors.gray300,
      },
      checkboxSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      saveButton: {
        backgroundColor: colors.primary,
      },
      cancelButton: {
        backgroundColor: colors.backgroundSecondary,
      },
      cancelButtonText: {
        color: colors.textPrimary,
      },
    }),
    [colors]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleCancel}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleCancel}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            paddingBottom: insets.bottom + SPACING.lg,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.modalContent, dynamicStyles.modalContent]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>{title}</Text>
            {description && (
              <Text style={[styles.description, dynamicStyles.description]}>
                {description}
              </Text>
            )}
          </View>

          {/* All Categories Toggle */}
          <TouchableOpacity
            style={[styles.allToggleRow, dynamicStyles.allToggleRow]}
            onPress={handleToggleAll}
            activeOpacity={0.7}
          >
            <View style={styles.allToggleLeft}>
              <Text style={[styles.allToggleLabel, dynamicStyles.allToggleLabel]}>
                All Categories
              </Text>
              <Text style={styles.allToggleCount}>
                {tempSelected.length} of {CATEGORIES.length} selected
              </Text>
            </View>
            <View
              style={[
                styles.checkbox,
                dynamicStyles.checkbox,
                allSelected && dynamicStyles.checkboxSelected,
              ]}
            >
              {allSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          {/* Category List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {CATEGORIES.map((category) => {
              const isSelected = tempSelected.includes(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryRow, dynamicStyles.categoryRow]}
                  onPress={() => handleToggleCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryLeft}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryLabel, dynamicStyles.categoryLabel]}>
                        {category.label}
                      </Text>
                      {category.description && (
                        <Text
                          style={[styles.categoryDescription, dynamicStyles.categoryDescription]}
                        >
                          {category.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      dynamicStyles.checkbox,
                      isSelected && dynamicStyles.checkboxSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, dynamicStyles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, dynamicStyles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, dynamicStyles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
  },
  modalContent: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.lg,
    ...SHADOWS.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.styles.h2,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
  allToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  allToggleLeft: {
    flex: 1,
  },
  allToggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: 2,
  },
  allToggleCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: '#666',
  },
  scrollView: {
    maxHeight: 400,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    width: 32,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderWidth: 0,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: '#fff',
  },
});
