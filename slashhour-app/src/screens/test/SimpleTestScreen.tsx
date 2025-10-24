import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SimpleTestScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>✅ Test Screen Works!</Text>
        <Text style={styles.subtitle}>If you can see this, navigation is working correctly.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test 1: Haptic Feedback</Text>
          <Text style={styles.cardText}>
            Go to Home → You Follow → Tap any deal card.
            {'\n'}You should feel a light vibration!
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test 2: Animations</Text>
          <Text style={styles.cardText}>
            Deal cards should slide in smoothly with a fade effect.
            {'\n'}Press a card - it should scale down slightly.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test 3: Pull to Refresh</Text>
          <Text style={styles.cardText}>
            On the feed screen, pull down from the top.
            {'\n'}You should see a loading spinner and data refreshes.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
