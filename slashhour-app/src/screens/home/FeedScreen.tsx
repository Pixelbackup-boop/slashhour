import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Deal } from '../../types/models';
import DealCard from '../../components/DealCard';
import { useFeed } from '../../hooks/useFeed';

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const { deals, isLoading, error, isRefreshing, handleRefresh } = useFeed();

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Deals</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading deals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Deals</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>😕</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (deals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Deals</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptyMessage}>No deals yet!</Text>
          <Text style={styles.emptySubtext}>
            Follow some businesses to see their deals here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Deals</Text>
        <Text style={styles.headerSubtitle}>
          {deals.length} deal{deals.length !== 1 ? 's' : ''} from businesses you follow
        </Text>
      </View>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DealCard deal={item} onPress={() => handleDealPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B6B']}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#F38181',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
