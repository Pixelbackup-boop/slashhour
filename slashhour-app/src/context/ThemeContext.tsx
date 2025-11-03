import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { paperTheme, paperDarkTheme } from '../theme/paperTheme';
import { getColors } from '../theme/tokens';

/**
 * Theme Context for managing dark mode state
 *
 * Features:
 * - System theme detection
 * - Manual theme override
 * - Persistence (can be added with AsyncStorage)
 * - React Native Paper integration
 * - Optimized with useMemo to prevent unnecessary re-renders (2025 best practice)
 */

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: ReturnType<typeof getColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');

  // Determine if dark mode should be active
  const isDark = themeMode === 'auto'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // CRITICAL FIX: Memoize colors object to prevent recreation on every render
  // This is a 2025 best practice for performance optimization
  const colors = useMemo(() => getColors(isDark), [isDark]);

  // Toggle between light and dark (removes auto mode)
  // Memoize callback to prevent recreation
  const toggleTheme = React.useCallback(() => {
    setThemeMode(current => {
      if (current === 'auto') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemColorScheme]);

  // Log theme changes for debugging
  useEffect(() => {
    console.log(`🎨 Theme changed: Mode=${themeMode}, IsDark=${isDark}, System=${systemColorScheme}`);
  }, [themeMode, isDark, systemColorScheme]);

  // CRITICAL FIX: Memoize context value to prevent all consumers from re-rendering
  // This is essential for performance in 2025 React Native apps
  const value: ThemeContextType = useMemo(() => ({
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    colors,
  }), [isDark, themeMode, toggleTheme, colors]);

  // Select Paper theme based on dark mode
  const paperThemeToUse = isDark ? paperDarkTheme : paperTheme;

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperThemeToUse}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * Usage:
 * const { isDark, colors, toggleTheme } = useTheme();
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
