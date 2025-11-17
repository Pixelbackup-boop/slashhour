/**
 * MessageTextWithLinks Component
 * Renders message text with clickable, trackable links
 */

import React from 'react';
import { Text, StyleSheet, Linking, Alert, TextStyle } from 'react-native';
import { URL_REGEX } from '../utils/linkTracker';
import { trackLinkClick } from '../utils/linkTracker';

interface MessageTextWithLinksProps {
  text: string;
  userId?: string;
  broadcastId?: string | null;
  style?: TextStyle;
  linkStyle?: TextStyle;
}

interface TextPart {
  text: string;
  isLink: boolean;
}

export function MessageTextWithLinks({
  text,
  userId,
  broadcastId,
  style,
  linkStyle,
}: MessageTextWithLinksProps) {
  /**
   * Parse text into parts (plain text and links)
   */
  const parseTextWithLinks = (inputText: string): TextPart[] => {
    const parts: TextPart[] = [];
    let lastIndex = 0;

    // Reset regex lastIndex
    URL_REGEX.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = URL_REGEX.exec(inputText)) !== null) {
      const linkText = match[0];
      const linkIndex = match.index;

      // Add text before link
      if (linkIndex > lastIndex) {
        parts.push({
          text: inputText.substring(lastIndex, linkIndex),
          isLink: false,
        });
      }

      // Add link
      parts.push({
        text: linkText,
        isLink: true,
      });

      lastIndex = linkIndex + linkText.length;
    }

    // Add remaining text after last link
    if (lastIndex < inputText.length) {
      parts.push({
        text: inputText.substring(lastIndex),
        isLink: false,
      });
    }

    // If no links found, return the whole text
    if (parts.length === 0) {
      parts.push({ text: inputText, isLink: false });
    }

    return parts;
  };

  /**
   * Handle link press - track click and open URL
   */
  const handleLinkPress = async (url: string) => {
    try {
      // Normalize URL (add https:// if it starts with www.)
      const normalizedUrl = url.startsWith('www.') ? `https://${url}` : url;

      // Track click if this is a broadcast message
      if (broadcastId && userId) {
        await trackLinkClick({
          broadcastId,
          userId,
          linkUrl: normalizedUrl,
        });
      }

      // Check if URL can be opened
      const supported = await Linking.canOpenURL(normalizedUrl);

      if (supported) {
        await Linking.openURL(normalizedUrl);
      } else {
        Alert.alert('Error', `Cannot open URL: ${normalizedUrl}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error opening link:', error);
      }
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const textParts = parseTextWithLinks(text);

  return (
    <Text style={style}>
      {textParts.map((part, index) => {
        if (part.isLink) {
          return (
            <Text
              key={index}
              style={[styles.link, linkStyle]}
              onPress={() => handleLinkPress(part.text)}
            >
              {part.text}
            </Text>
          );
        }
        return <Text key={index}>{part.text}</Text>;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: '#007AFF', // iOS blue
    textDecorationLine: 'underline',
  },
});
