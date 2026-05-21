import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { Chat, Message } from '../types';
import { BackIcon, Checkmarks } from '../components/Icons';
import { Navigation } from '../navigation/SimpleNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api';

const formatMessageTime = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (error) {
    return '';
  }
};

interface ChatroomScreenProps {
  chatId: string;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  navigation: Navigation;
}

export default function ChatroomScreen({
  chatId,
  chats,
  setChats,
  navigation,
}: ChatroomScreenProps) {
  const currentActiveChat = chats.find(c => c.id === chatId);

  const [inputText, setInputText] = useState('');
  const [isTypingState, setIsTypingState] = useState(false);

  const roomFlatListRef = useRef<FlatList>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (currentActiveChat && roomFlatListRef.current) {
      setTimeout(() => {
        roomFlatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatId, currentActiveChat?.messages.length, chats]);

  // Load API messages and mark as read when chat opens
  useEffect(() => {
    if (chatId !== '1') {
      // Mark as read
      api.markMessagesReadApi(chatId).then(() => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c));
      }).catch(err => console.error("Error marking read", err));

      // Fetch full messages
      api.getUserMessagesApi(chatId).then((res: any) => {
        if (res && res.success && Array.isArray(res.data)) {
          const formattedMsgs: Message[] = res.data.map((msg: any) => ({
            id: msg.message_id || msg._id || String(Math.random()),
            text: msg.body || '',
            timestamp: formatMessageTime(msg.timestamp),
            isUser: msg.direction === 'outbound',
            status: msg.status === 'received' ? 'delivered' : msg.status,
          }));

          setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: formattedMsgs } : c));
        }
      }).catch(err => console.error("Error fetching messages", err));
    }
  }, [chatId]);

  // Typing Dot Animations
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim1: Animated.CompositeAnimation;
    let anim2: Animated.CompositeAnimation;
    let anim3: Animated.CompositeAnimation;

    if (isTypingState) {
      const animateDot = (dot: Animated.Value, delay: number) => {
        const animation = Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: -8, duration: 400, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.delay(300),
          ])
        );
        animation.start();
        return animation;
      };
      anim1 = animateDot(typingDot1, 0);
      anim2 = animateDot(typingDot2, 150);
      anim3 = animateDot(typingDot3, 300);
    } else {
      typingDot1.setValue(0);
      typingDot2.setValue(0);
      typingDot3.setValue(0);
    }

    return () => {
      anim1?.stop();
      anim2?.stop();
      anim3?.stop();
    };
  }, [isTypingState, typingDot1, typingDot2, typingDot3]);

  if (!currentActiveChat) {
    return null;
  }

  // Simulation response logic
  const triggerAutoReply = (targetChatId: string, userMsgText: string) => {
    const activeChat = chats.find(c => c.id === targetChatId);
    if (!activeChat) return;

    let responseText = '';
    const lowerText = userMsgText.toLowerCase();

    if (activeChat.id === '1') {
      // HelpBot AI replies
      if (lowerText.includes('api') || lowerText.includes('key') || lowerText.includes('token')) {
        responseText = 'Your WhatsApp Business API Client is authenticated. Navigate to "Credentials Console" to generate secondary access keys! 🔑';
      } else if (lowerText.includes('status') || lowerText.includes('operational') || lowerText.includes('health')) {
        responseText = 'Service Status: GREEN 🟢\nLatency: 124ms\nSuccess rate: 99.98%\nEverything is running perfectly!';
      } else if (lowerText.includes('webhook') || lowerText.includes('url')) {
        responseText = 'Your active Webhook URL is `https://api.helpbot.io/v1/webhook`. The gateway verified all test handshakes! 🔗';
      } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        responseText = 'Hello! I am HelpBot support intelligence. Tell me if you need help with APIs, Webhooks, or Server Latency status! 🤖';
      } else {
        responseText = 'Understood! I have registered your webhook inquiry. Meta server endpoints are working smoothly. Let me know what else I can fetch! 💬';
      }
    } else {
      // Team members
      if (activeChat.id === '2') {
        responseText = `Oh! That sounds awesome. I'll merge these layout edits. Let me know if we need the dashboard to match this aesthetic! 🎨`;
      } else if (activeChat.id === '3') {
        responseText = `Acknowledged. I'll test the headers on our sandbox container first to ensure webhook validation passes. 💻`;
      } else if (activeChat.id === '4') {
        responseText = `Perfect! That will be standard procedure for our Meta demo deck. Let's touch base later today! 📈`;
      } else {
        responseText = `Got it. Just starting the benchmark simulation now. Latency remains steady under high pressure load! 🚀`;
      }
    }

    setTimeout(() => {
      setIsTypingState(true);
    }, 700);

    setTimeout(() => {
      setIsTypingState(false);

      const newReply: Message = {
        id: `${targetChatId}_reply_${Date.now()}`,
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      };

      setChats(prevChats =>
        prevChats.map(c => {
          if (c.id === targetChatId) {
            return {
              ...c,
              lastMessage: responseText.replace(/\n/g, ' '),
              time: 'Just now',
              messages: [...c.messages, newReply],
            };
          }
          return c;
        })
      );
    }, 2400);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const messageText = inputText;
    setInputText('');

    const newMsg: Message = {
      id: `user_${Date.now()}`,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      status: 'sent',
    };

    setChats(prevChats =>
      prevChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            lastMessage: messageText,
            time: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    if (chatId === '1') {
      triggerAutoReply(chatId, messageText);
    } else {
      const phone = currentActiveChat?.role || '';
      api.sendMessageApi(phone, messageText).then((res: any) => {
        if (res && res.success) {
          setChats(prevChats =>
            prevChats.map(c => {
              if (c.id === chatId) {
                return {
                  ...c,
                  messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
                };
              }
              return c;
            })
          );
        }
      }).catch(err => console.error("Error sending message via API:", err));
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {/* Chatroom Header */}
        <View style={styles.roomHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backCircleBtn}
            activeOpacity={0.7}
          >
            <BackIcon />
          </TouchableOpacity>

          <Image source={{ uri: currentActiveChat.avatar }} style={styles.roomHeaderAvatar} />

          <View style={styles.roomTitleBlock}>
            <Text style={styles.roomHeaderName}>{currentActiveChat.name}</Text>
            <Text style={styles.roomHeaderStatus}>
              {isTypingState ? 'typing...' : currentActiveChat.online ? 'Online' : 'Offline'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.roomHeaderActions}>
            <TouchableOpacity style={styles.actionRoundBtn} activeOpacity={0.7}>
              <Text style={styles.actionEmoji}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionRoundBtn} activeOpacity={0.7}>
              <Text style={styles.actionEmoji}>📹</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conversation Area */}
        <FlatList
          ref={roomFlatListRef}
          data={currentActiveChat.messages}
          keyExtractor={msg => msg.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesScrollContainer}
          ListFooterComponent={
            isTypingState ? (
              <View style={styles.incomingBubbleWrapper}>
                <View style={styles.incomingBubble}>
                  <View style={styles.typingDotContainer}>
                    <Animated.View
                      style={[styles.typingDot, { transform: [{ translateY: typingDot1 }] }]}
                    />
                    <Animated.View
                      style={[styles.typingDot, { transform: [{ translateY: typingDot2 }] }]}
                    />
                    <Animated.View
                      style={[styles.typingDot, { transform: [{ translateY: typingDot3 }] }]}
                    />
                  </View>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            if (item.isUser) {
              return (
                <View style={styles.outgoingBubbleWrapper}>
                  <View style={styles.outgoingBubble}>
                    <Text style={styles.outgoingText}>{item.text}</Text>
                    <View style={styles.bubbleStatusBlock}>
                      <Text style={styles.bubbleTimestamp}>{item.timestamp}</Text>
                      <Checkmarks status={item.status} />
                    </View>
                  </View>
                </View>
              );
            } else {
              return (
                <View style={styles.incomingBubbleWrapper}>
                  <View style={styles.incomingBubble}>
                    <Text style={styles.incomingText}>{item.text}</Text>
                    <Text style={styles.incomingTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              );
            }
          }}
        />

        {/* Chat Room Input Toolbar */}
        <View style={styles.inputToolbar}>
          <View style={styles.inputRoundedBackground}>
            <TouchableOpacity style={styles.toolbarAddBtn} activeOpacity={0.7}>
              <Text style={styles.plusEmoji}>＋</Text>
            </TouchableOpacity>

            <TextInput
              placeholder={`Message ${currentActiveChat.name.split(' ')[0]}...`}
              placeholderTextColor="#64748B"
              style={styles.chatTextInput}
              multiline
              value={inputText}
              onChangeText={setInputText}
            />

            <TouchableOpacity style={styles.emojiPickerBtn} activeOpacity={0.7}>
              <Text style={styles.smileEmoji}>😊</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            style={[
              styles.sendRoundBtn,
              !inputText.trim() && styles.sendRoundBtnDisabled,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.sendIconPositioner}>
              <Text style={styles.sendButtonArrow}>➤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  keyboardContainer: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1E2538',
    backgroundColor: '#0E1424',
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E2538',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  roomHeaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#151B2C',
  },
  roomTitleBlock: {
    flex: 1,
    marginLeft: 12,
  },
  roomHeaderName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  roomHeaderStatus: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  roomHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E2538',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 16,
  },
  messagesScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  outgoingBubbleWrapper: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  outgoingBubble: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    borderBottomRightRadius: 3,
    maxWidth: '80%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  outgoingText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  bubbleStatusBlock: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleTimestamp: {
    color: '#C7D2FE',
    fontSize: 9.5,
    marginRight: 4,
  },
  incomingBubbleWrapper: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incomingBubble: {
    backgroundColor: '#1E2538',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    borderBottomLeftRadius: 3,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  incomingText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 20,
  },
  incomingTimestamp: {
    color: '#64748B',
    fontSize: 9.5,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginHorizontal: 3,
  },
  inputToolbar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0E1424',
    borderTopWidth: 1,
    borderColor: '#1E2538',
    alignItems: 'center',
  },
  inputRoundedBackground: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151B2C',
    borderRadius: 22,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#222D44',
    marginRight: 10,
    height: 44,
  },
  toolbarAddBtn: {
    marginRight: 8,
  },
  plusEmoji: {
    color: '#6366F1',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatTextInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 6,
  },
  emojiPickerBtn: {
    marginLeft: 8,
  },
  smileEmoji: {
    fontSize: 18,
  },
  sendRoundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  sendRoundBtnDisabled: {
    backgroundColor: '#1E2538',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIconPositioner: {
    transform: [{ rotate: '0deg' }],
  },
  sendButtonArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
