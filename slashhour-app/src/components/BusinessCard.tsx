import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Business, FollowedBusiness } from '../types/models';
import FollowButton from './FollowButton';

interface BusinessCardProps {
  business: Business | FollowedBusiness;
  onPress?: () => void;
}

export default React.memo(function BusinessCard({ business, onPress }: BusinessCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>
              {business.business_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.businessName}>{business.business_name}</Text>
            <Text style={styles.category}>{business.category}</Text>
            {business.address && (
              <Text style={styles.address} numberOfLines={1}>
                {business.address}
              </Text>
            )}
          </View>
        </View>

        <FollowButton
          businessId={business.id}
          businessName={business.business_name}
          businessCategory={business.category}
          size="small"
          variant="outline"
        />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: '#999',
  },
});
