import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useIsAuthenticated } from '../stores/useAuthStore';
import { COLORS, SHADOWS, SPACING } from '../theme';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ConversationsListScreen from '../screens/inbox/ConversationsListScreen';
import ChatScreen from '../screens/inbox/ChatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DealDetailScreen from '../screens/deal/DealDetailScreen';
import RedemptionHistoryScreen from '../screens/redemption/RedemptionHistoryScreen';
import FollowingListScreen from '../screens/following/FollowingListScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';
import EditBusinessProfileScreen from '../screens/business/EditBusinessProfileScreen';
import RegisterBusinessScreen from '../screens/business/RegisterBusinessScreen';
import CreateDealScreen from '../screens/post/CreateDealScreen';
import EditDealScreen from '../screens/post/EditDealScreen';
import { Deal, Business } from '../types/models';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  DealDetail: { deal: Deal };
  RedemptionHistory: undefined;
  FollowingList: undefined;
  BusinessProfile: { businessId: string; businessName?: string };
  EditBusinessProfile: { business: Business };
  RegisterBusiness: undefined;
  CreateDeal: { businessId: string; businessName: string };
  EditDeal: { deal: Deal; businessId: string; businessName: string };
  Chat: {
    conversationId: string;
    businessId: string;
    businessName: string;
    businessLogo?: string;
  };
};

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Inbox: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tab Navigator
function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const user = useUser();

  // Import useConversations for unread count
  const { totalUnreadCount } = require('../hooks/useConversations').useConversations(user?.id);

  // Calculate dynamic tab bar height
  // Base height (60) + safe area bottom inset + extra padding for gesture area
  const tabBarHeight = 60 + insets.bottom + (insets.bottom === 0 ? 8 : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: tabBarHeight,
          paddingBottom: insets.bottom || SPACING.sm,
          paddingTop: SPACING.sm,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...SHADOWS.lg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🔍" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={ConversationsListScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="💬" focused={focused} />
          ),
          // Show unread message count badge
          tabBarBadge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : totalUnreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error,
            color: COLORS.white,
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="👤" focused={focused} />
          ),
          // TODO: Add badge for notifications
          // tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

// Tab Icon Component with emoji support
interface TabIconProps {
  icon: string;
  focused: boolean;
  isPrimary?: boolean;
}

function TabIcon({ icon, focused }: TabIconProps) {
  return (
    <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});

export default function AppNavigator() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true, // Enable swipe gestures
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="DealDetail"
              component={DealDetailScreen}
            />
            <Stack.Screen
              name="RedemptionHistory"
              component={RedemptionHistoryScreen}
            />
            <Stack.Screen
              name="FollowingList"
              component={FollowingListScreen}
            />
            <Stack.Screen
              name="BusinessProfile"
              component={BusinessProfileScreen}
            />
            <Stack.Screen
              name="EditBusinessProfile"
              component={EditBusinessProfileScreen}
            />
            <Stack.Screen
              name="RegisterBusiness"
              component={RegisterBusinessScreen}
            />
            <Stack.Screen
              name="CreateDeal"
              component={CreateDealScreen}
              options={{
                animation: 'fade',
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="EditDeal"
              component={EditDealScreen}
              options={{
                animation: 'fade',
                animationDuration: 200,
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
