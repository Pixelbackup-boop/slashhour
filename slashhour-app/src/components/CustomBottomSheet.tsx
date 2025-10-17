/**
 * Custom Bottom Sheet Component
 *
 * Modern modal alternative using @gorhom/bottom-sheet
 * Provides smooth, gesture-driven sheet for actions, filters, etc.
 *
 * Usage:
 *   const bottomSheetRef = useRef<BottomSheet>(null);
 *   <CustomBottomSheet ref={bottomSheetRef} snapPoints={['25%', '50%']}>
 *     <View>Your content here</View>
 *   </CustomBottomSheet>
 */

import React, { forwardRef, useMemo, ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import { haptics } from '../utils/haptics';

interface CustomBottomSheetProps {
  children: ReactNode;
  snapPoints?: string[] | number[];
  title?: string;
  onClose?: () => void;
  enablePanDownToClose?: boolean;
  backgroundStyle?: object;
  handleIndicatorStyle?: object;
}

const CustomBottomSheet = forwardRef<BottomSheet, CustomBottomSheetProps>(
  (
    {
      children,
      snapPoints = ['50%', '75%'],
      title,
      onClose,
      enablePanDownToClose = true,
      backgroundStyle,
      handleIndicatorStyle,
    },
    ref
  ) => {
    // Memoize snap points
    const memoizedSnapPoints = useMemo(() => snapPoints, [JSON.stringify(snapPoints)]);

    // Render backdrop component
    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    );

    // Handle sheet changes
    const handleSheetChanges = (index: number) => {
      if (index === -1) {
        onClose?.();
      } else {
        haptics.light();
      }
    };

    const handleClose = () => {
      haptics.medium();
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.close();
      }
      onClose?.();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={memoizedSnapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.bottomSheetBackground, backgroundStyle]}
        handleIndicatorStyle={[styles.handleIndicator, handleIndicatorStyle]}
      >
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.contentContainer}>{children}</View>
      </BottomSheet>
    );
  }
);

CustomBottomSheet.displayName = 'CustomBottomSheet';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    ...SHADOWS.xl,
  },
  handleIndicator: {
    backgroundColor: COLORS.gray300,
    width: 40,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  title: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
});

export default CustomBottomSheet;
