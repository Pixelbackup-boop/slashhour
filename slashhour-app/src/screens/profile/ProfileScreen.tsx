import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store/store';
import { authService } from '../../services/api/authService';
import { trackScreenView } from '../../services/analytics';
import { useUserProfile } from '../../hooks/useUserProfile';
import StatCard from '../../components/StatCard';
import InfoRow from '../../components/InfoRow';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, isLoading, error } = useUserProfile();

  useEffect(() => {
    trackScreenView('ProfileScreen');
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            authService.logout();
            dispatch(logout());
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || user?.username || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || user?.phone || user?.username}</Text>
          {user?.username && (
            <Text style={styles.userUsername}>@{user.username}</Text>
          )}
        </View>

        {/* Statistics Section */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading your stats...</Text>
          </View>
        ) : stats ? (
          <>
            {/* Savings Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Your Savings</Text>
              <View style={styles.statsGrid}>
                <StatCard value={formatCurrency(stats.totalSavings)} label="Total Saved" />
                <StatCard value={formatCurrency(stats.monthlySavings)} label="This Month" />
              </View>
            </View>

            {/* Redemptions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎉 Deals Redeemed</Text>
              <View style={styles.statsGrid}>
                <StatCard value={stats.totalRedemptions} label="Total Deals" />
                <StatCard value={stats.monthlyRedemptions} label="This Month" />
              </View>
            </View>

            {/* Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Your Activity</Text>
              <View style={styles.infoCard}>
                <InfoRow
                  label="Categories Explored"
                  value={`${stats.categoriesUsed} / ${stats.totalCategories}`}
                />
                <InfoRow label="Businesses Following" value={stats.followingCount} />
                <InfoRow
                  label="Average Savings"
                  value={
                    stats.totalRedemptions > 0
                      ? formatCurrency(stats.totalSavings / stats.totalRedemptions)
                      : '$0.00'
                  }
                />
              </View>
            </View>

            {/* Savings Impact */}
            {stats.totalSavings > 0 && (
              <View style={styles.impactCard}>
                <Text style={styles.impactTitle}>🎯 You're Fighting Inflation!</Text>
                <Text style={styles.impactText}>
                  You've saved {formatCurrency(stats.totalSavings)} on essential goods through Slashhour.
                  That's money back in your pocket!
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No statistics available yet.</Text>
            <Text style={styles.emptyStateSubtext}>Start redeeming deals to see your savings!</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Quick Actions</Text>
          <View style={styles.infoCard}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('RedemptionHistory')}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🎫</Text>
                <Text style={styles.actionLabel}>Redemption History</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Account</Text>
          <View style={styles.infoCard}>
            <InfoRow
              label="Member Since"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'
              }
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0 - MVP</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  impactCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#F38181',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    padding: 16,
    paddingTop: 0,
  },
});
