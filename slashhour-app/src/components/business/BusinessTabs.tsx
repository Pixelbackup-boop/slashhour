import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { Business } from '../../types/models';
import { useBusinessContact } from '../../hooks/useBusinessContact';
import { groupBusinessHours } from '../../utils/businessHours';

interface BusinessTabsProps {
  business: Business;
  isOwner: boolean;
}

type TabType = 'about' | 'location' | 'contact' | 'time';

function BusinessTabs({ business, isOwner }: BusinessTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const { handlePhonePress, handleEmailPress, handleWebsitePress } = useBusinessContact();

  return (
    <View style={styles.tabSection}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About
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
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            Contact
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'time' && styles.activeTab]}
          onPress={() => setActiveTab('time')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'time' && styles.activeTabText]}>
            Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <View style={styles.tabContent}>
          {business.description ? (
            <Text style={styles.description}>{business.description}</Text>
          ) : isOwner ? (
            <Text style={styles.emptyPrompt}>
              💡 Please write about your shop to get more sales! Tell customers what makes your business special.
            </Text>
          ) : null}
        </View>
      )}

      {activeTab === 'location' && (
        <View style={styles.tabContent}>
          {business.address ? (
            <>
              <Text style={styles.address}>{business.address}</Text>
              {business.city && business.country && (
                <Text style={styles.address}>
                  {business.city}, {business.country}
                </Text>
              )}
            </>
          ) : isOwner ? (
            <Text style={styles.emptyPrompt}>
              📍 Please add your location to help more customers find you and increase sales!
            </Text>
          ) : null}
        </View>
      )}

      {activeTab === 'contact' && (
        <View style={styles.tabContent}>
          {business.phone || business.email || business.website ? (
            <>
              {business.phone && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handlePhonePress(business.phone!)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.contactIcon}>📞</Text>
                  <Text style={styles.contactText}>{business.phone}</Text>
                  <Text style={styles.contactAction}>Call</Text>
                </TouchableOpacity>
              )}
              {business.email && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleEmailPress(business.email!)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.contactIcon}>✉️</Text>
                  <Text style={styles.contactText}>{business.email}</Text>
                  <Text style={styles.contactAction}>Email</Text>
                </TouchableOpacity>
              )}
              {business.website && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleWebsitePress(business.website!)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.contactIcon}>🌐</Text>
                  <Text style={styles.contactText} numberOfLines={1}>{business.website}</Text>
                  <Text style={styles.contactAction}>Visit</Text>
                </TouchableOpacity>
              )}
            </>
          ) : isOwner ? (
            <Text style={styles.emptyPrompt}>
              📞 Add your contact information to make it easy for customers to reach you!
            </Text>
          ) : null}
        </View>
      )}

      {activeTab === 'time' && (
        <View style={styles.tabContent}>
          {business.hours && Object.keys(business.hours).length > 0 ? (
            <>
              {groupBusinessHours(business.hours).map((group, index) => (
                <View key={index} style={styles.hourRow}>
                  <Text style={styles.dayText}>{group.days}</Text>
                  <Text style={styles.timeText}>{group.hours}</Text>
                </View>
              ))}
            </>
          ) : isOwner ? (
            <Text style={styles.emptyPrompt}>
              ⏰ Please add your business hours so customers know when they can visit you!
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabSection: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginTop: 4,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
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
  tabContent: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  emptyPrompt: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
    paddingTop: SPACING.md,
    paddingBottom: 0,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  contactIcon: {
    fontSize: 20,
  },
  contactText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  contactAction: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});

// Export with memo to prevent unnecessary re-renders
export default memo(BusinessTabs);
