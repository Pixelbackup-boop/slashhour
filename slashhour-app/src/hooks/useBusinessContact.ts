import { Alert, Linking } from 'react-native';

export const useBusinessContact = () => {
  const handlePhonePress = async (phone: string) => {
    const phoneNumber = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open phone dialer');
    }
  };

  const handleEmailPress = async (email: string) => {
    const emailUrl = `mailto:${email}`;
    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email client');
    }
  };

  const handleWebsitePress = async (website: string) => {
    try {
      const supported = await Linking.canOpenURL(website);
      if (supported) {
        await Linking.openURL(website);
      } else {
        Alert.alert('Error', 'Unable to open this website');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open website');
    }
  };

  return {
    handlePhonePress,
    handleEmailPress,
    handleWebsitePress,
  };
};
