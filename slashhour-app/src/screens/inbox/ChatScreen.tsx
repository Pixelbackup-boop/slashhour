import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, IMessage, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat';
import { useUser } from '../../stores/useAuthStore';
import { useSocket } from '../../hooks/useSocket';
import { useChat } from '../../hooks/useChat';
import { trackScreenView } from '../../services/analytics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../../theme';
import { Message } from '../../types/models';

interface ChatScreenProps {
  route: {
    params: {
      conversationId: string;
      businessId: string;
      businessName: string;
      businessLogo?: string;
    };
  };
  navigation: any;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { conversationId, businessName, businessLogo } = route.params;
  const user = useUser();
  const { isConnected, connect } = useSocket();
  const {
    messages,
    isLoading,
    error,
    isSending,
    isTyping,
    hasMore,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    setTyping,
  } = useChat({
    conversationId,
    userId: user?.id || '',
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    trackScreenView('ChatScreen', { conversationId, businessName });
  }, [conversationId, businessName]);

  // Connect to socket when screen loads
  useEffect(() => {
    if (user?.id && !isConnected) {
      connect(user.id);
    }
  }, [user?.id, isConnected, connect]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      markAsRead();
    });

    return unsubscribe;
  }, [navigation, markAsRead]);

  // Transform our Message type to GiftedChat IMessage format
  const transformToGiftedMessages = (msgs: Message[]): IMessage[] => {
    return msgs.map((msg) => ({
      _id: msg.id,
      text: msg.messageText,
      createdAt: new Date(msg.createdAt),
      user: {
        _id: msg.senderId,
        name: msg.sender.name || msg.sender.username,
        avatar: msg.sender.avatarUrl,
      },
      sent: true,
      received: msg.isRead,
    }));
  };

  const handleSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const message = newMessages[0];
      if (message && message.text) {
        sendMessage(message.text);
      }
    },
    [sendMessage]
  );

  const handleLoadEarlier = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    await loadMoreMessages();
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, loadMoreMessages]);

  const handleInputTextChanged = useCallback(
    (text: string) => {
      // Clear previous debounce timeout
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }

      // Debounce typing indicator with 300ms delay (2025 best practice)
      if (text.length > 0) {
        setTyping(true);

        // Auto-stop typing indicator after 2 seconds of no activity
        typingDebounceRef.current = setTimeout(() => {
          setTyping(false);
        }, 2000);
      } else {
        setTyping(false);
      }
    },
    [setTyping]
  );

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, []);

  // Custom render for input toolbar
  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  // Custom render for message bubbles
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: styles.bubbleLeft,
          right: styles.bubbleRight,
        }}
        textStyle={{
          left: styles.bubbleTextLeft,
          right: styles.bubbleTextRight,
        }}
        timeTextStyle={{
          left: styles.timeTextLeft,
          right: styles.timeTextRight,
        }}
      />
    );
  };

  // Custom render for composer (text input)
  const renderComposer = (props: any) => {
    return (
      <Composer
        {...props}
        textInputStyle={styles.textInput}
        composerHeight={null}
        multiline={true}
      />
    );
  };

  // Custom render for send button
  const renderSend = (props: any) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </View>
      </Send>
    );
  };

  // Custom render for footer (typing indicator)
  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Typing...</Text>
        </View>
      );
    }
    return null;
  };

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            {businessLogo ? (
              <Image source={{ uri: businessLogo }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>
                  {businessName ? businessName.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {businessName}
              </Text>
              {isConnected && (
                <Text style={styles.headerSubtitle}>Active now</Text>
              )}
            </View>
          </View>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{businessName}</Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          {businessLogo ? (
            <Image source={{ uri: businessLogo }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>
                {businessName ? businessName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {businessName}
            </Text>
            {isConnected && (
              <Text style={styles.headerSubtitle}>Active now</Text>
            )}
          </View>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <GiftedChat
          messages={transformToGiftedMessages(messages)}
          onSend={handleSend}
          user={{
            _id: user?.id || '',
            name: user?.name || user?.username || '',
            avatar: user?.avatar_url,
          }}
          renderInputToolbar={renderInputToolbar}
          renderBubble={renderBubble}
          renderComposer={renderComposer}
          renderSend={renderSend}
          renderFooter={renderFooter}
          onInputTextChanged={handleInputTextChanged}
          loadEarlier={hasMore}
          isLoadingEarlier={isLoadingMore}
          onLoadEarlier={handleLoadEarlier}
          // Styling
          alwaysShowSend
          bottomOffset={0}
          scrollToBottomComponent={() => (
            <View style={styles.scrollToBottomButton}>
              <Text style={styles.scrollToBottomText}>↓</Text>
            </View>
          )}
          // Performance
          inverted={true}
          infiniteScroll
          // Accessibility
          placeholder="Type a message..."
          // Disable features not yet implemented
          renderActions={undefined}
          renderAvatar={undefined}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.gray200,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  chatContainer: {
    flex: 1,
  },
  inputToolbar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minHeight: 50,
  },
  inputPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
    marginRight: SPACING.sm,
    marginLeft: 0,
    maxHeight: 100,
    minHeight: 40,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
    height: 40,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  bubbleLeft: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
  },
  bubbleTextLeft: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  bubbleTextRight: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  timeTextLeft: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  timeTextRight: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  typingIndicator: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  typingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  scrollToBottomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollToBottomText: {
    fontSize: 20,
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
