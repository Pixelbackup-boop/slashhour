import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useIsAuthenticated } from '../stores/useAuthStore';
import { useTheme } from '../context/ThemeContext';
import { SHADOWS, SPACING } from '../theme';
import { navigationRef } from './navigationRef';
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
import FollowersListScreen from '../screens/followers/FollowersListScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';
import EditBusinessProfileScreen from '../screens/business/EditBusinessProfileScreen';
import RegisterBusinessScreen from '../screens/business/RegisterBusinessScreen';
import CreateDealScreen from '../screens/post/CreateDealScreen';
import EditDealScreen from '../screens/post/EditDealScreen';
import SimpleTestScreen from '../screens/test/SimpleTestScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import { Deal, Business } from '../types/models';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  DealDetail: { deal: Deal };
  DealDetails: { dealId: string };
  RedemptionHistory: undefined;
  FollowingList: undefined;
  FollowersList: { businessId: string };
  BusinessProfile: { businessId: string; businessName?: string };
  EditBusinessProfile: { business: Business };
  RegisterBusiness: undefined;
  CreateDeal: { businessId: string; businessName: string };
  EditDeal: { deal: Deal; businessId: string; businessName: string };
  UXTest: undefined;
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
  Notifications: undefined;
  Inbox: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tab Navigator
function MainTabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useUser();

  // Import useConversations for unread count
  const { totalUnreadCount } = require('../hooks/useConversations').useConversations(user?.id);

  // Track unread notification count
  const [unreadNotificationCount, setUnreadNotificationCount] = React.useState(0);

  // Poll for unread notifications count every 30 seconds
  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notificationService = require('../services/api/notificationService').default;
        const count = await notificationService.getUnreadCount();
        setUnreadNotificationCount(count);
      } catch (error) {
        // Silently fail - likely not authenticated yet
      }
    };

    fetchUnreadCount(); // Initial fetch
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [user?.id]);

  // Calculate dynamic tab bar height
  // Base height (60) + safe area bottom inset + extra padding for gesture area
  const tabBarHeight = 60 + insets.bottom + (insets.bottom === 0 ? 8 : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
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
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🔔" focused={focused} />
          ),
          // Show unread notification count badge
          tabBarBadge: unreadNotificationCount > 0 ? (unreadNotificationCount > 99 ? '99+' : unreadNotificationCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.error,
            color: colors.white,
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
            backgroundColor: colors.error,
            color: colors.white,
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
  const { isDark, colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();

  // Create custom navigation theme based on dark mode
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.white,
      text: colors.textPrimary,
      border: colors.borderLight,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
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
              name="DealDetails"
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
              name="FollowersList"
              component={FollowersListScreen}
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
            <Stack.Screen
              name="UXTest"
              component={SimpleTestScreen}
              options={{ title: '🧪 Test Screen' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
