import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import notificationService, {
  Notification,
  NotificationsResponse,
} from '../../services/api/notificationService';
import { logger } from '../../utils/logger';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadNotifications = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response: NotificationsResponse =
          await notificationService.getNotifications(pageNum, 20);

        // Add safety check for response structure
        if (!response || !response.notifications) {
          logger.warn('Invalid response from notifications API:', response);
          setNotifications([]);
          setHasMore(false);
          return;
        }

        if (append) {
          setNotifications((prev) => [...prev, ...response.notifications]);
        } else {
          setNotifications(response.notifications);
        }

        setHasMore(
          response.pagination.page < response.pagination.totalPages
        );
      } catch (error) {
        logger.error('Error loading notifications:', error);
        // Set empty notifications on error to prevent crash
        setNotifications([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  // Reload notifications when screen comes into focus (when user taps on the tab)
  useFocusEffect(
    useCallback(() => {
      loadNotifications(1);
    }, [loadNotifications])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadNotifications(1);
  }, [loadNotifications]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage, true);
    }
  }, [page, loadingMore, hasMore, loadNotifications]);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read if not already
      if (!notification.is_read) {
        await notificationService.markAsRead([notification.id]);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      // Navigate based on action_url
      if (notification.action_url) {
        const path = notification.action_url;
        logger.info('Notification action_url:', path);

        if (path.startsWith('/deals/')) {
          const dealId = path.replace('/deals/', '');
          logger.info('Navigating to deal:', dealId);
          navigation.navigate('DealDetails' as never, { dealId } as never);
        } else if (path.startsWith('/businesses/')) {
          const businessId = path.replace('/businesses/', '');
          logger.info('Navigating to business:', businessId);
          navigation.navigate('BusinessProfile' as never, { businessId } as never);
        }
      }
    } catch (error) {
      logger.error('Error handling notification press:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      logger.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      logger.error('Error marking all as read:', error);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.notificationImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.notificationText}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                !item.is_read && styles.unreadText,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>

          <Text style={styles.time}>{formatTime(item.sent_at)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You'll see notifications here when businesses you follow post new deals
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#E63946" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some((n) => !n.is_read) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E63946"
            colors={['#E63946']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  markAllRead: {
    fontSize: 14,
    color: '#E63946',
    fontWeight: '600',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#E63946',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
  },
  notificationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  unreadText: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E63946',
    marginLeft: 6,
  },
  body: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 28,
    color: '#CCCCCC',
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NotificationsScreen;
