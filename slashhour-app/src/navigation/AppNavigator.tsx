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
import AppHeader from '../components/AppHeader';
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
import BookmarksScreen from '../screens/bookmarks/BookmarksScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';
import EditBusinessProfileScreen from '../screens/business/EditBusinessProfileScreen';
import RegisterBusinessScreen from '../screens/business/RegisterBusinessScreen';
import CreateDealScreen from '../screens/post/CreateDealScreen';
import EditDealScreen from '../screens/post/EditDealScreen';
import SimpleTestScreen from '../screens/test/SimpleTestScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import YouFollowSettingsScreen from '../screens/settings/YouFollowSettingsScreen';
import NearYouSettingsScreen from '../screens/settings/NearYouSettingsScreen';
import VerifyEmailScreen from '../screens/settings/VerifyEmailScreen';
import VerifyPhoneScreen from '../screens/settings/VerifyPhoneScreen';
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
  Bookmarks: undefined;
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

/**
 * CRITICAL FIX (2025 Best Practice): Define header options at module level
 * to prevent function recreation on every render. This ensures headers
 * behave like the fixed bottom tab bar - stable and performant.
 *
 * Source: React Navigation docs + 2025 performance guidelines
 * "Always define your animation configuration at the top-level of the file
 * to ensure that the references don't change across re-renders."
 */
const HEADER_WITH_BACK_BUTTON = {
  headerShown: true,
  header: () => <AppHeader showBackButton={true} />,
} as const;

const HEADER_WITHOUT_BACK = {
  headerShown: true,
  header: () => <AppHeader showBackButton={false} />,
} as const;

const HEADER_WITH_BACK_FADE = {
  ...HEADER_WITH_BACK_BUTTON,
  animation: 'fade' as const,
  animationDuration: 200,
};

/**
 * Helper function to create common stack screens with AppHeader
 * This reduces code duplication across nested navigators
 * Now using static header options for performance
 */
function createCommonStackScreens(StackNavigator: any) {
  return (
    <>
      <StackNavigator.Screen
        name="DealDetail"
        component={DealDetailScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <StackNavigator.Screen
        name="DealDetails"
        component={DealDetailScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <StackNavigator.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
    </>
  );
}

// Stack Navigator for Home Tab
const HomeStack = createNativeStackNavigator();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
      {createCommonStackScreens(HomeStack)}
    </HomeStack.Navigator>
  );
}

// Stack Navigator for Search Tab
const SearchStack = createNativeStackNavigator();
function SearchStackNavigator() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <SearchStack.Screen name="SearchScreen" component={SearchScreen} />
      {createCommonStackScreens(SearchStack)}
    </SearchStack.Navigator>
  );
}

// Stack Navigator for Notifications Tab
const NotificationsStack = createNativeStackNavigator();
function NotificationsStackNavigator() {
  return (
    <NotificationsStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <NotificationsStack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      {createCommonStackScreens(NotificationsStack)}
    </NotificationsStack.Navigator>
  );
}

// Stack Navigator for Inbox Tab
const InboxStack = createNativeStackNavigator();
function InboxStackNavigator() {
  return (
    <InboxStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <InboxStack.Screen name="InboxScreen" component={ConversationsListScreen} />
      <InboxStack.Screen
        name="Chat"
        component={ChatScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
    </InboxStack.Navigator>
  );
}

// Stack Navigator for Profile Tab
const ProfileStack = createNativeStackNavigator();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="YouFollowSettings"
        component={YouFollowSettingsScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="NearYouSettings"
        component={NearYouSettingsScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{ headerShown: false }}
      />
      {createCommonStackScreens(ProfileStack)}

      {/* Profile-specific screens */}
      <ProfileStack.Screen
        name="RedemptionHistory"
        component={RedemptionHistoryScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="FollowingList"
        component={FollowingListScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="FollowersList"
        component={FollowersListScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="EditBusinessProfile"
        component={EditBusinessProfileScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="RegisterBusiness"
        component={RegisterBusinessScreen}
        options={HEADER_WITH_BACK_BUTTON}
      />
      <ProfileStack.Screen
        name="CreateDeal"
        component={CreateDealScreen}
        options={HEADER_WITH_BACK_FADE}
      />
      <ProfileStack.Screen
        name="EditDeal"
        component={EditDealScreen}
        options={HEADER_WITH_BACK_FADE}
      />
    </ProfileStack.Navigator>
  );
}

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
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🔍" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
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
        component={InboxStackNavigator}
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
        component={ProfileStackNavigator}
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
            {/* Main tab navigator with nested stacks */}
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />

            {/* Test screen - kept at root level for development/debugging */}
            <Stack.Screen
              name="UXTest"
              component={SimpleTestScreen}
              options={HEADER_WITH_BACK_BUTTON}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
