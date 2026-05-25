import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Animated, Dimensions, Keyboard } from 'react-native';
import { Chat } from '../types';
import ListingScreen from '../screens/ListingScreen';
import ChatroomScreen from '../screens/ChatroomScreen';

const { width } = Dimensions.get('window');

export interface Navigation {
  navigate: (screen: 'Listing' | 'Chatroom', params?: { chatId: string }) => void;
  goBack: () => void;
}

interface SimpleNavigatorProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export default function SimpleNavigator({ chats, setChats }: SimpleNavigatorProps) {

  // Navigation states
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [renderedChatId, setRenderedChatId] = useState<string | null>(null);

  // Animated Screen Navigation
  const slideAnim = useRef(new Animated.Value(width)).current;

  // Custom Navigation Object passed to screens
  const navigation: Navigation = {
    navigate: (screen, params) => {
      if (screen === 'Chatroom' && params?.chatId) {
        // Clear unread counts for this chat
        setChats(prevChats =>
          prevChats.map(c => (c.id === params.chatId ? { ...c, unreadCount: 0 } : c))
        );

        setRenderedChatId(params.chatId);
        setActiveChatId(params.chatId);

        // Smooth transition in
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      }
    },
    goBack: () => {
      Keyboard.dismiss();
      // Smooth transition out
      Animated.spring(slideAnim, {
        toValue: width,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start(() => {
        setActiveChatId(null);
        setRenderedChatId(null);
      });
    },
  };

  // Sync state if activeChatId changes externally or cleanup occurs
  useEffect(() => {
    if (activeChatId) {
      setRenderedChatId(activeChatId);
    }
  }, [activeChatId]);

  return (
    <View style={[styles.container, { paddingTop: 40, paddingBottom: 40 }]}>
      {/* 1. Base Listing Screen (always loaded for fast stack response) */}
      <ListingScreen chats={chats} setChats={setChats} navigation={navigation} isFocused={!activeChatId} />

      {/* 2. Floating Animated Chatroom Screen */}
      {renderedChatId && (
        <Animated.View
          style={[
            styles.chatroomSlidePanel,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ChatroomScreen
            chatId={renderedChatId}
            chats={chats}
            setChats={setChats}
            navigation={navigation}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  chatroomSlidePanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B0F19',
    zIndex: 100,
  },
});
