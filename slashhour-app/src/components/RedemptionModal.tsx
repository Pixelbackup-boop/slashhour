import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Icon } from './icons';

interface RedemptionModalProps {
  visible: boolean;
  redemptionCode: string;
  dealTitle: string;
  businessName: string;
  savings: string;
  onClose: () => void;
}

export default function RedemptionModal({
  visible,
  redemptionCode,
  dealTitle,
  businessName,
  savings,
  onClose,
}: RedemptionModalProps) {
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

            <View style={styles.dealInfo}>
              <Text style={styles.dealTitle}>{dealTitle}</Text>
              <Text style={styles.businessName}>{businessName}</Text>
            </View>

            <View style={styles.qrSection}>
              <Text style={styles.qrLabel}>Show this QR code at the store:</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={redemptionCode}
                  size={200}
                  backgroundColor="white"
                />
              </View>
            </View>

            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>Redemption Code:</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{redemptionCode}</Text>
              </View>
              <Text style={styles.codeHint}>
                Or provide this code to the cashier
              </Text>
            </View>

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
  dealInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
    color: '#666',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  codeSection: {
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    textAlign: 'center',
  },
  codeHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  instructions: {
    marginBottom: 24,
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
