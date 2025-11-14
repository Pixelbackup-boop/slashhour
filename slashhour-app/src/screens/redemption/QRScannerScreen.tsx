import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/icons';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { redemptionService } from '../../services/api/redemptionService';
import { trackScreenView } from '../../services/analytics';

interface QRScannerScreenProps {
  route: {
    params: {
      businessId: string;
      businessName: string;
    };
  };
  navigation: any;
}

export default function QRScannerScreen({ route, navigation }: QRScannerScreenProps) {
  const { businessId, businessName } = route.params;
  const { colors } = useTheme();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    trackScreenView('QRScannerScreen');
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    // The QR code should contain the redemption ID
    const redemptionId = data;

    Alert.alert(
      'Redemption Code Scanned',
      'Do you want to validate this redemption?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Validate',
          style: 'default',
          onPress: () => validateRedemption(redemptionId),
        },
      ]
    );
  };

  const isValidUUID = (str: string): boolean => {
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const validateRedemption = async (redemptionId: string) => {
    console.log('🔍 [QR Scanner] Starting validation for redemption ID:', redemptionId);

    // Validate UUID format first
    if (!isValidUUID(redemptionId)) {
      console.log('❌ [QR Scanner] Invalid UUID format:', redemptionId);
      Alert.alert(
        'Invalid QR Code',
        'This is not a valid SlashHour redemption code. Please scan a valid SlashHour QR code.',
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }

    try {
      setIsValidating(true);
      console.log('🌐 [QR Scanner] Calling redemptionService.validateRedemption...');
      const response = await redemptionService.validateRedemption(redemptionId);
      console.log('✅ [QR Scanner] Validation successful:', response);

      Alert.alert(
        'Success',
        'Redemption validated successfully!',
        [
          {
            text: 'Scan Another',
            onPress: () => setScanned(false),
          },
          {
            text: 'View All Redemptions',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      console.error('❌ [QR Scanner] Validation error:', err);
      console.error('❌ [QR Scanner] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Determine user-friendly error message
      let errorTitle = 'Validation Failed';
      let errorMessage = 'Failed to validate redemption. Please try again.';

      if (err.response?.status === 404) {
        errorTitle = 'Invalid Code';
        errorMessage = 'This is not a valid SlashHour redemption code. Please scan a valid SlashHour QR code.';
      } else if (err.response?.status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to validate this redemption.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'This redemption cannot be validated.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert(
        errorTitle,
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Manual Entry',
      'Enter the redemption code manually:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Validate',
          onPress: (redemptionId) => {
            if (redemptionId && redemptionId.trim()) {
              validateRedemption(redemptionId.trim());
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Icon name="camera" size={64} color={colors.error} style="line" />
          <Text style={[styles.errorTitle, { color: colors.error }]}>Camera Access Required</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Please enable camera access to scan QR codes for redemption validation.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.background, marginTop: SPACING.sm }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="x-circle" size={24} color={colors.textPrimary} style="line" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Scan QR Code</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{businessName}</Text>
        </View>
      </View>

      {/* Camera Scanner */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={[styles.overlayPart, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />

          {/* Middle (scanner frame) */}
          <View style={styles.scannerRow}>
            <View style={[styles.overlayPart, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTopLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerTopRight, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBottomRight, { borderColor: colors.primary }]} />
            </View>
            <View style={[styles.overlayPart, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
          </View>

          {/* Bottom overlay */}
          <View style={[styles.overlayPart, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={[styles.instructionText, { color: colors.white }]}>
            {scanned
              ? isValidating
                ? 'Validating redemption...'
                : 'Redemption scanned'
              : 'Point camera at customer QR code'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.actions, { backgroundColor: colors.white }]}>
        {scanned && !isValidating && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background }]}
            onPress={() => setScanned(false)}
          >
            <Icon name="camera" size={20} color={colors.primary} style="solid" />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Scan Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={handleManualEntry}
        >
          <Icon name="pen" size={20} color={colors.textPrimary} style="solid" />
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>Manual Entry</Text>
        </TouchableOpacity>
      </View>

      {isValidating && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingBox, { backgroundColor: colors.white }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textPrimary }]}>Validating...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitleContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginTop: 2,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPart: {
    flex: 1,
    width: '100%',
  },
  scannerRow: {
    flexDirection: 'row',
    height: 250,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  instructions: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: RADIUS.full,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minWidth: 150,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: SPACING.xs,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
