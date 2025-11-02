import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useUser } from '../../stores/useAuthStore';
import { useSocket } from '../../hooks/useSocket';
import { useConversations } from '../../hooks/useConversations';
import { trackScreenView } from '../../services/analytics';
import LogoHeader from '../../components/LogoHeader';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES, LAYOUT } from '../../theme';
import { Conversation } from '../../types/models';

export default function ConversationsListScreen({ navigation }: any) {
  const user = useUser();
  const { isConnected, connect } = useSocket();
  const {
    conversations,
    totalUnreadCount,
    isLoading,
    error,
    refresh,
  } = useConversations(user?.id);

  useEffect(() => {
    trackScreenView('ConversationsListScreen');
  }, []);

  // Connect to socket when screen loads
  useEffect(() => {
    if (user?.id && !isConnected) {
      connect(user.id);
    }
  }, [user?.id, isConnected, connect]);

  const formatTimestamp = (dateString?: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      businessId: conversation.businessId,
      businessName: conversation.business.businessName,
      businessLogo: conversation.business.logoUrl,
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isCustomer = item.customerId === user?.id;
    const otherParty = isCustomer ? item.business : item.customer;
    const displayName = isCustomer
      ? item.business.businessName
      : (item.customer.name || item.customer.username);
    const avatarUrl = isCustomer ? item.business.logoUrl : item.customer.avatarUrl;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Conversation Info */}
        <View style={styles.conversationInfo}>
          <View style={styles.topRow}>
            <Text
              style={[
                styles.conversationName,
                item.unreadCount > 0 && styles.conversationNameUnread,
              ]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessageAt)}
            </Text>
          </View>

          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.lastMessageUnread,
            ]}
            numberOfLines={2}
          >
            {item.lastMessageText || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
      <Text style={styles.emptyStateText}>
        Start a conversation with a business by tapping the message button on their profile
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>⚠️</Text>
      <Text style={styles.emptyStateTitle}>Error Loading Messages</Text>
      <Text style={styles.emptyStateText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <LogoHeader />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.connectionIndicator}>
            {isConnected && <View style={styles.connectedDot} />}
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LogoHeader />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.connectionIndicator}>
          {isConnected && <View style={styles.connectedDot} />}
        </View>
      </View>

      {/* Conversations List */}
      {error && conversations.length === 0 ? (
        renderError()
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyListContainer : styles.listContainer
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={15}
        />
      )}
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
    ...TYPOGRAPHY.styles.displayMedium,
    color: COLORS.textPrimary,
  },
  connectionIndicator: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  listContainer: {
    paddingBottom: LAYOUT.tabBarHeight + SPACING.md,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  avatarContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray200,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  conversationName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  conversationNameUnread: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  lastMessage: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    paddingBottom: LAYOUT.tabBarHeight + 120,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
