import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import DealDetailScreen from '../screens/deal/DealDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import RedemptionHistoryScreen from '../screens/redemption/RedemptionHistoryScreen';
import { Deal } from '../types/models';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  DealDetail: { deal: Deal };
  Profile: undefined;
  RedemptionHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="DealDetail" component={DealDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="RedemptionHistory" component={RedemptionHistoryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
