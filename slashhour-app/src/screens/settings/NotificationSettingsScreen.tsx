import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { trackScreenView } from '../../services/analytics';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS, COLORS, LAYOUT } from '../../theme';
import { CATEGORIES, getAllCategoryIds, formatSelectedCategories } from '../../constants/categories';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Simple animation config
const animateLayout = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

// Type definitions (following TypeScript 2025 guidelines)
type NotificationType = 'nearby' | 'newDeals' | 'flashDeals';

interface NotificationSettingsScreenProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

// Notification settings state type
interface NotificationSettings {
  notifyNearbyDeals: boolean;
  notifyNewDeals: boolean;
  notifyFlashDeals: boolean;
  nearbyCategories: string[];
  newDealsCategories: string[];
  flashDealsCategories: string[];
}

export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Notification Settings State
  const [notifyNearbyDeals, setNotifyNearbyDeals] = useState(true);
  const [notifyNewDeals, setNotifyNewDeals] = useState(true);
  const [notifyFlashDeals, setNotifyFlashDeals] = useState(true);

  // Category Selection State (type inferred from getAllCategoryIds - guideline #5)
  const [nearbyCategories, setNearbyCategories] = useState(getAllCategoryIds());
  const [newDealsCategories, setNewDealsCategories] = useState(getAllCategoryIds());
  const [flashDealsCategories, setFlashDealsCategories] = useState(getAllCategoryIds());

  // Accordion Expansion State
  const [nearbyDealsExpanded, setNearbyDealsExpanded] = useState(false);
  const [newDealsExpanded, setNewDealsExpanded] = useState(false);
  const [flashDealsExpanded, setFlashDealsExpanded] = useState(false);

  // Category list expansion state
  const [nearbyCategoriesListExpanded, setNearbyCategoriesListExpanded] = useState(false);
  const [newDealsCategoriesListExpanded, setNewDealsCategoriesListExpanded] = useState(false);
  const [flashDealsCategoriesListExpanded, setFlashDealsCategoriesListExpanded] = useState(false);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    trackScreenView('NotificationSettings');
    loadSettings();
  }, []);

  // Load settings from API
  const loadSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/users/notification-settings');
      // const data = await response.json();
      // setNotifyNearbyDeals(data.notifyNearbyDeals);
      // setNearbyCategories(data.nearbyCategories);
      // ... etc
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  // Save settings to API
  const saveSettings = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/v1/users/notification-settings', {
      //   method: 'PUT',
      //   body: JSON.stringify({
      //     notifyNearbyDeals,
      //     nearbyCategories,
      //     notifyNewDeals,
      //     newDealsCategories,
      //     notifyFlashDeals,
      //     flashDealsCategories,
      //   }),
      // });

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show toast
      Toast.show({
        type: 'success',
        text1: 'Settings saved',
        text2: 'Your notification preferences have been updated',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save',
        text2: 'Please try again',
        position: 'bottom',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle with animation, haptic, and save
  const handleNearbyDealsToggle = async (value: boolean) => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (value && !notifyNearbyDeals) {
      // Enabling notifications - request location permission
      Alert.alert(
        'Location Access',
        'Allow Slashhour to access your location to notify you about nearby deals?',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Allow',
            onPress: async () => {
              animateLayout();
              setNotifyNearbyDeals(true);
              setNearbyDealsExpanded(true);
              await saveSettings();
              // TODO: Request actual location permission
            }
          },
        ]
      );
    } else {
      animateLayout();
      setNotifyNearbyDeals(value);
      if (!value) {
        setNearbyDealsExpanded(false);
        setNearbyCategoriesListExpanded(false);
      }
      await saveSettings();
    }
  };

  const handleNewDealsToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateLayout();
    setNotifyNewDeals(value);
    if (!value) {
      setNewDealsExpanded(false);
      setNewDealsCategoriesListExpanded(false);
    }
    await saveSettings();
  };

  const handleFlashDealsToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateLayout();
    setNotifyFlashDeals(value);
    if (!value) {
      setFlashDealsExpanded(false);
      setFlashDealsCategoriesListExpanded(false);
    }
    await saveSettings();
  };

  // Helper to get category state - uses Record utility type (guideline #4)
  const getCategoryState = (type: NotificationType): {
    categories: string[];
    setCategories: (categories: string[]) => void;
  } => {
    const stateMap: Record<NotificationType, {
      categories: string[];
      setCategories: (categories: string[]) => void;
    }> = {
      nearby: { categories: nearbyCategories, setCategories: setNearbyCategories },
      newDeals: { categories: newDealsCategories, setCategories: setNewDealsCategories },
      flashDeals: { categories: flashDealsCategories, setCategories: setFlashDealsCategories },
    };
    return stateMap[type];
  };

  // Category toggle handler - clean, no uninitialized variables
  const handleCategoryToggle = async (
    type: NotificationType,
    categoryId: string
  ) => {
    await Haptics.selectionAsync();

    const allIds = getAllCategoryIds();
    const { categories: currentCategories, setCategories } = getCategoryState(type);

    // Calculate new categories
    const newCategories = categoryId === 'all'
      ? currentCategories.length === allIds.length ? [] : allIds
      : currentCategories.includes(categoryId)
        ? currentCategories.filter((id) => id !== categoryId)
        : [...currentCategories, categoryId];

    setCategories(newCategories);
    await saveSettings();
  };

  // Toggle accordion sections - using NotificationType alias
  const toggleAccordion = async (type: NotificationType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateLayout();

    // Use Record for cleaner type-safe mapping (guideline #4)
    const toggleMap: Record<NotificationType, () => void> = {
      nearby: () => setNearbyDealsExpanded(!nearbyDealsExpanded),
      newDeals: () => setNewDealsExpanded(!newDealsExpanded),
      flashDeals: () => setFlashDealsExpanded(!flashDealsExpanded),
    };

    toggleMap[type]();
  };

  // Toggle category list - using NotificationType alias
  const toggleCategoryList = async (type: NotificationType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateLayout();

    // Use Record for cleaner type-safe mapping (guideline #4)
    const toggleMap: Record<NotificationType, () => void> = {
      nearby: () => setNearbyCategoriesListExpanded(!nearbyCategoriesListExpanded),
      newDeals: () => setNewDealsCategoriesListExpanded(!newDealsCategoriesListExpanded),
      flashDeals: () => setFlashDealsCategoriesListExpanded(!flashDealsCategoriesListExpanded),
    };

    toggleMap[type]();
  };

  // Dynamic styles (memoized for performance)
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: colors.backgroundSecondary,
    },
    headerTitle: {
      color: colors.textPrimary,
    },
    sectionTitle: {
      color: colors.textPrimary,
    },
    sectionDescription: {
      color: colors.textSecondary,
    },
    settingCard: {
      backgroundColor: colors.white,
    },
    settingLabel: {
      color: colors.textPrimary,
    },
    settingDescription: {
      color: colors.textTertiary,
    },
    divider: {
      backgroundColor: colors.borderLight,
    },
    actionArrow: {
      color: colors.textTertiary,
    },
    checkbox: {
      borderColor: colors.gray300,
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  }), [colors]);

  const containerStyle = useMemo(() => [
    styles.container,
    dynamicStyles.container,
    {
      paddingBottom: insets.bottom + LAYOUT.tabBarHeight + SPACING.lg,
    }
  ], [insets.bottom, dynamicStyles.container]);

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
          Notification Settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={[styles.introText, dynamicStyles.sectionDescription]}>
            Manage how you receive notifications from Slashhour
          </Text>
        </View>

        {/* Notification Settings Card */}
        <View style={[styles.settingCard, dynamicStyles.settingCard]}>

          {/* ============================================ */}
          {/* NEARBY DEALS - Accordion with Categories    */}
          {/* ============================================ */}

          {/* Main Toggle Row */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.labelRow}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Nearby Deals
                </Text>
                {notifyNearbyDeals && (
                  <TouchableOpacity
                    onPress={() => toggleAccordion('nearby')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                      {nearbyDealsExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Switch
              value={notifyNearbyDeals}
              onValueChange={handleNearbyDealsToggle}
              trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
              thumbColor={notifyNearbyDeals ? colors.primary : colors.gray400}
            />
          </View>

          {/* Progressive Disclosure - Show details when ON and Expanded */}
          {notifyNearbyDeals && nearbyDealsExpanded && (
            <View style={styles.accordionContent}>
              {/* Description */}
              <View style={styles.descriptionRow}>
                <Text style={[styles.descriptionIcon, { color: colors.textSecondary }]}>📍</Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  Get notified about deals near you
                </Text>
              </View>

              {/* Categories Summary Button */}
              <TouchableOpacity
                style={[styles.categoriesSummary, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => toggleCategoryList('nearby')}
                activeOpacity={0.7}
              >
                <View style={styles.categoriesSummaryLeft}>
                  <Text style={[styles.categoriesLabel, { color: colors.textPrimary }]}>
                    Categories
                  </Text>
                  <View style={styles.categoryBadges}>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        {formatSelectedCategories(nearbyCategories)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: colors.textTertiary }]}>
                  {nearbyCategoriesListExpanded ? '⌃' : '⌵'}
                </Text>
              </TouchableOpacity>

              {/* Expanded Category List */}
              {nearbyCategoriesListExpanded && (
                <View style={styles.categoryList}>
                  {/* All Categories Toggle */}
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => handleCategoryToggle('nearby', 'all')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                      All Categories
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.gray300 },
                        nearbyCategories.length === getAllCategoryIds().length && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {nearbyCategories.length === getAllCategoryIds().length && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Individual Categories */}
                  {CATEGORIES.map((category) => {
                    const isSelected = nearbyCategories.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.categoryRow}
                        onPress={() => handleCategoryToggle('nearby', category.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.categoryRowLeft}>
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                            {category.label}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.checkbox,
                            { borderColor: colors.gray300 },
                            isSelected && {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <View style={[styles.divider, dynamicStyles.divider]} />

          {/* ============================================ */}
          {/* NEW DEALS FROM FOLLOWING - Accordion        */}
          {/* ============================================ */}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.labelRow}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  New Deals from Following
                </Text>
                {notifyNewDeals && (
                  <TouchableOpacity
                    onPress={() => toggleAccordion('newDeals')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                      {newDealsExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Switch
              value={notifyNewDeals}
              onValueChange={handleNewDealsToggle}
              trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
              thumbColor={notifyNewDeals ? colors.primary : colors.gray400}
            />
          </View>

          {notifyNewDeals && newDealsExpanded && (
            <View style={styles.accordionContent}>
              <View style={styles.descriptionRow}>
                <Text style={[styles.descriptionIcon, { color: colors.textSecondary }]}>🔔</Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  Get notified when businesses you follow post new deals
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.categoriesSummary, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => toggleCategoryList('newDeals')}
                activeOpacity={0.7}
              >
                <View style={styles.categoriesSummaryLeft}>
                  <Text style={[styles.categoriesLabel, { color: colors.textPrimary }]}>
                    Categories
                  </Text>
                  <View style={styles.categoryBadges}>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        {formatSelectedCategories(newDealsCategories)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: colors.textTertiary }]}>
                  {newDealsCategoriesListExpanded ? '⌃' : '⌵'}
                </Text>
              </TouchableOpacity>

              {newDealsCategoriesListExpanded && (
                <View style={styles.categoryList}>
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => handleCategoryToggle('newDeals', 'all')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                      All Categories
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.gray300 },
                        newDealsCategories.length === getAllCategoryIds().length && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {newDealsCategories.length === getAllCategoryIds().length && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {CATEGORIES.map((category) => {
                    const isSelected = newDealsCategories.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.categoryRow}
                        onPress={() => handleCategoryToggle('newDeals', category.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.categoryRowLeft}>
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                            {category.label}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.checkbox,
                            { borderColor: colors.gray300 },
                            isSelected && {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <View style={[styles.divider, dynamicStyles.divider]} />

          {/* ============================================ */}
          {/* FLASH DEALS - Accordion                     */}
          {/* ============================================ */}

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.labelRow}>
                <Text style={[styles.settingLabel, dynamicStyles.settingLabel]}>
                  Flash Deals
                </Text>
                {notifyFlashDeals && (
                  <TouchableOpacity
                    onPress={() => toggleAccordion('flashDeals')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                      {flashDealsExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Switch
              value={notifyFlashDeals}
              onValueChange={handleFlashDealsToggle}
              trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
              thumbColor={notifyFlashDeals ? colors.primary : colors.gray400}
            />
          </View>

          {notifyFlashDeals && flashDealsExpanded && (
            <View style={styles.accordionContent}>
              <View style={styles.descriptionRow}>
                <Text style={[styles.descriptionIcon, { color: colors.textSecondary }]}>⚡</Text>
                <Text style={[styles.settingDescription, dynamicStyles.settingDescription]}>
                  Get notified about time-sensitive deals expiring soon
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.categoriesSummary, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => toggleCategoryList('flashDeals')}
                activeOpacity={0.7}
              >
                <View style={styles.categoriesSummaryLeft}>
                  <Text style={[styles.categoriesLabel, { color: colors.textPrimary }]}>
                    Categories
                  </Text>
                  <View style={styles.categoryBadges}>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        {formatSelectedCategories(flashDealsCategories)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.chevron, { color: colors.textTertiary }]}>
                  {flashDealsCategoriesListExpanded ? '⌃' : '⌵'}
                </Text>
              </TouchableOpacity>

              {flashDealsCategoriesListExpanded && (
                <View style={styles.categoryList}>
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => handleCategoryToggle('flashDeals', 'all')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                      All Categories
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: colors.gray300 },
                        flashDealsCategories.length === getAllCategoryIds().length && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {flashDealsCategories.length === getAllCategoryIds().length && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {CATEGORIES.map((category) => {
                    const isSelected = flashDealsCategories.includes(category.id);
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.categoryRow}
                        onPress={() => handleCategoryToggle('flashDeals', category.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.categoryRowLeft}>
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>
                            {category.label}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.checkbox,
                            { borderColor: colors.gray300 },
                            isSelected && {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h1,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  intro: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  introText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  settingCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
  },
  expandIcon: {
    fontSize: 12,
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    lineHeight: 18,
    marginTop: SPACING.xs / 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },

  // Accordion Content Styles
  accordionContent: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.md,
    paddingBottom: SPACING.md,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  descriptionIcon: {
    fontSize: 16,
    marginTop: 2,
  },

  // Categories Summary Button
  categoriesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  categoriesSummaryLeft: {
    flex: 1,
  },
  categoriesLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  categoryBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.primary,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.textTertiary,
    marginLeft: SPACING.sm,
  },

  // Category List Styles
  categoryList: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  categoryRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textPrimary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
