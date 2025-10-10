import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { feedService } from '../../services/api/feedService';
import { Deal } from '../../types/models';
import DealCard from '../../components/DealCard';

export default function NearYouScreen() {
  const navigation = useNavigation<any>();
  const [deals, setDeals] = useState<(Deal & { distance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5); // Default 5km radius

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location to see nearby deals.');
        setLoading(false);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      setLoading(false);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (err) {
      console.error('Error getting location:', err);
      throw new Error('Failed to get your location');
    }
  };

  const fetchNearbyDeals = async () => {
    try {
      setError(null);

      // Request permission if not already granted
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Fetch nearby deals
      const response = await feedService.getNearYouFeed(
        currentLocation.lat,
        currentLocation.lng,
        radius,
        1,
        20
      );
      setDeals(response.deals);
    } catch (err: any) {
      console.error('Error fetching nearby deals:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load nearby deals';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNearbyDeals();
  }, [radius]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNearbyDeals();
  };

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetail', { deal });
  };

  const handleChangeRadius = () => {
    Alert.alert(
      'Search Radius',
      'Select search radius',
      [
        { text: '2 km', onPress: () => setRadius(2) },
        { text: '5 km', onPress: () => setRadius(5) },
        { text: '10 km', onPress: () => setRadius(10) },
        { text: '20 km', onPress: () => setRadius(20) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Near You</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Finding nearby deals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Near You</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>📍</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNearbyDeals}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (deals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Near You</Text>
          <TouchableOpacity style={styles.radiusButton} onPress={handleChangeRadius}>
            <Text style={styles.radiusButtonText}>{radius} km</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>🗺️</Text>
          <Text style={styles.emptyMessage}>No deals nearby</Text>
          <Text style={styles.emptySubtext}>
            Try increasing your search radius
          </Text>
          <TouchableOpacity style={styles.radiusButtonLarge} onPress={handleChangeRadius}>
            <Text style={styles.radiusButtonText}>Change Radius ({radius} km)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Near You</Text>
          <Text style={styles.headerSubtitle}>
            {deals.length} deal{deals.length !== 1 ? 's' : ''} within {radius} km
          </Text>
        </View>
        <TouchableOpacity style={styles.radiusButton} onPress={handleChangeRadius}>
          <Text style={styles.radiusButtonText}>{radius} km</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <DealCard deal={item} onPress={() => handleDealPress(item)} />
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>📍 {item.distance.toFixed(1)} km away</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  radiusButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  radiusButtonLarge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  radiusButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    right: 24,
    backgroundColor: 'rgba(78, 205, 196, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
