import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Get the current color palette
  const colors = getColors(isDark);

  // Toggle between light and dark (removes auto mode)
  const toggleTheme = () => {
    setThemeMode(current => {
      if (current === 'auto') {
        return systemColorScheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'light' ? 'dark' : 'light';
    });
  };

  // Log theme changes for debugging
  useEffect(() => {
    console.log(`🎨 Theme changed: Mode=${themeMode}, IsDark=${isDark}, System=${systemColorScheme}`);
  }, [themeMode, isDark, systemColorScheme]);

  const value: ThemeContextType = {
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    colors,
  };

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
