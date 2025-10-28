import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { initSentry } from './src/config/sentry';
import { queryClient } from './src/config/queryClient';
import { ThemeProvider } from './src/context/ThemeContext';
import { usePushNotifications } from './src/hooks/usePushNotifications';

// Initialize Sentry error tracking
initSentry();

export default function App() {
  // Initialize push notifications (registers device token and handles taps)
  usePushNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
