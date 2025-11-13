import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { Icon } from './icons';

interface RedemptionModalProps {
  visible: boolean;
  redemptionCode: string;
  dealTitle: string;
  businessName: string;
  savings: string;
  originalPrice: number;
  discountedPrice: number;
  businessAddress?: string;
  businessPhone?: string;
  expiresAt: string;
  onClose: () => void;
}

export default function RedemptionModal({
  visible,
  redemptionCode,
  dealTitle,
  businessName,
  savings,
  originalPrice,
  discountedPrice,
  businessAddress,
  businessPhone,
  expiresAt,
  onClose,
}: RedemptionModalProps) {
  const viewShotRef = useRef<ViewShot>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to save images to your gallery.'
        );
        return;
      }

      // Capture the view
      if (!viewShotRef.current) {
        throw new Error('View reference not available');
      }

      const uri = await viewShotRef.current.capture();

      // Save to media library
      await MediaLibrary.createAssetAsync(uri);

      Alert.alert(
        'Success!',
        'Redemption QR code saved to your gallery',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert(
        'Error',
        'Failed to save image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);

      if (!viewShotRef.current) {
        throw new Error('View reference not available');
      }

      const uri = await viewShotRef.current.capture();

      await Share.share({
        message: `My redemption code for ${dealTitle} at ${businessName}`,
        url: Platform.OS === 'ios' ? uri : `file://${uri}`,
        title: 'Share Redemption Code',
      });
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing:', error);
        Alert.alert('Error', 'Failed to share image. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Icon name="check" size={64} color="#6BCB77" style="solid" />
              <Text style={styles.headerTitle}>Deal Redeemed!</Text>
              <Text style={styles.savingsText}>You saved ${savings}</Text>
            </View>

            {/* Capturable View - This will be saved as image */}
            <ViewShot
              ref={viewShotRef}
              options={{
                format: 'png',
                quality: 1.0,
                result: 'tmpfile',
              }}
              style={styles.capturableContainer}
            >
              {/* App Logo Header */}
              <View style={styles.logoHeader}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logo}
                  contentFit="contain"
                />
                <Text style={styles.appName}>SlashHour</Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrSection}>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={redemptionCode}
                    size={180}
                    backgroundColor="white"
                  />
                </View>
              </View>

              {/* Redemption Code */}
              <View style={styles.codeSection}>
                <Text style={styles.codeLabel}>Redemption Code:</Text>
                <Text style={styles.codeText}>{redemptionCode}</Text>
              </View>

              {/* Deal Details */}
              <View style={styles.detailsSection}>
                <Text style={styles.dealTitle}>{dealTitle}</Text>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceLabel}>Original Price</Text>
                    <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
                  </View>
                  <Icon name="arrow-right" size={20} color="#999" style="line" />
                  <View>
                    <Text style={styles.priceLabel}>Deal Price</Text>
                    <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>You Saved ${savings}!</Text>
                </View>
              </View>

              {/* Business Info */}
              <View style={styles.businessSection}>
                <View style={styles.infoRow}>
                  <Icon name="building" size={16} color="#666" style="line" />
                  <Text style={styles.businessName}>{businessName}</Text>
                </View>

                {businessAddress && (
                  <View style={styles.infoRow}>
                    <Icon name="location" size={16} color="#666" style="line" />
                    <Text style={styles.infoText}>{businessAddress}</Text>
                  </View>
                )}

                {businessPhone && (
                  <View style={styles.infoRow}>
                    <Icon name="phone" size={16} color="#666" style="line" />
                    <Text style={styles.infoText}>{businessPhone}</Text>
                  </View>
                )}
              </View>

              {/* Expiry Info */}
              <View style={styles.expirySection}>
                <Icon name="clock" size={14} color="#FF9800" style="line" />
                <Text style={styles.expiryText}>Valid until {formatExpiryDate(expiresAt)}</Text>
              </View>

              {/* Footer */}
              <View style={styles.captureFooter}>
                <Text style={styles.footerText}>Powered by SlashHour</Text>
              </View>
            </ViewShot>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveToGallery}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="arrow-down-to-line" size={20} color="#fff" style="line" />
                    <Text style={styles.actionButtonText}>Save to Gallery</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator color="#FF6B6B" />
                ) : (
                  <>
                    <Icon name="arrow-up-from-bracket" size={20} color="#FF6B6B" style="line" />
                    <Text style={[styles.actionButtonText, styles.shareButtonText]}>Share</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>How to redeem:</Text>
              <Text style={styles.instructionItem}>1. Show this QR code at checkout</Text>
              <Text style={styles.instructionItem}>2. Staff will scan the code</Text>
              <Text style={styles.instructionItem}>3. Enjoy your discount!</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  savingsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6BCB77',
  },
  // Capturable View Styles
  capturableContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    letterSpacing: 1,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    textAlign: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    textAlign: 'center',
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
    textAlign: 'center',
  },
  savingsBadge: {
    backgroundColor: '#E8F8F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  savingsBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6BCB77',
  },
  businessSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  expirySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  expiryText: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '600',
  },
  captureFooter: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 10,
    color: '#999',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
  },
  shareButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  shareButtonText: {
    color: '#FF6B6B',
  },
  // Instructions
  instructions: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
