/**
 * HelpBot Premium Chat Interface
 * Refactored entry point representing the navigation routing structure.
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Chat } from './src/types';
import SimpleNavigator from './src/navigation/SimpleNavigator';

// ==========================================
// PRE-POPULATED CONVERSATIONS
// ==========================================
const INITIAL_CHATS: Chat[] = [
  {
    id: '1',
    name: 'HelpBot AI',
    role: 'Automated System Support',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'All systems operational. WhatsApp API latency is 124ms. 🟢',
    time: '11:01 AM',
    unreadCount: 2,
    online: true,
    messages: [
      {
        id: '1_1',
        text: 'Hey there! I am your AI Business Assistant. How can I help you manage your WhatsApp Cloud APIs today? 🚀',
        timestamp: '11:00 AM',
        isUser: false,
      },
      {
        id: '1_2',
        text: 'All systems operational. WhatsApp API gateway latency is optimal at 124ms. You can test a webhook payload here anytime! 🟢',
        timestamp: '11:01 AM',
        isUser: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Elena Rostova',
    role: 'Lead UX Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Let me know when the staging build is ready to preview.',
    time: '10:45 AM',
    unreadCount: 0,
    online: true,
    messages: [
      {
        id: '2_1',
        text: 'Hi developer! I just sent the updated Figma links for the new WhatsApp Chat Flow.',
        timestamp: 'Yesterday',
        isUser: false,
      },
      {
        id: '2_2',
        text: 'Do you think the deep indigo accent looks premium enough, or should we go for a glowing cyan neon style?',
        timestamp: 'Yesterday',
        isUser: false,
      },
      {
        id: '2_3',
        text: 'Let me know when the staging build is ready to preview. 🎨',
        timestamp: '10:45 AM',
        isUser: false,
      },
    ],
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'Lead Backend Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    lastMessage: "I'm deploying the changes to staging in 10 minutes.",
    time: '10:30 AM',
    unreadCount: 1,
    online: true,
    messages: [
      {
        id: '3_1',
        text: 'Did you merge the webhook security hotfix yet? We need to verify that headers contain the correct signature keys.',
        timestamp: '10:15 AM',
        isUser: false,
      },
      {
        id: '3_2',
        text: "I'm deploying the changes to staging in 10 minutes. Can you do a quick validation?",
        timestamp: '10:30 AM',
        isUser: false,
      },
    ],
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    role: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    lastMessage: "I'll assemble the slide deck for the demo.",
    time: '9:12 AM',
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: '4_1',
        text: 'Hi team, we have a demo scheduled with the WhatsApp Meta partnerships manager tomorrow.',
        timestamp: '9:00 AM',
        isUser: false,
      },
      {
        id: '4_2',
        text: 'Can we ensure the interactive message templates show correctly?',
        timestamp: '9:05 AM',
        isUser: false,
      },
      {
        id: '4_3',
        text: "I'll assemble the slide deck. Let's make sure the sandbox environment is fully operational! 🚀",
        timestamp: '9:12 AM',
        isUser: false,
      },
    ],
  },
  {
    id: '5',
    name: 'Marcus Vance',
    role: 'API DevOps Specialist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Scaled the server instances to 6. Latency is down!',
    time: 'Monday',
    unreadCount: 0,
    online: true,
    messages: [
      {
        id: '5_1',
        text: 'Hey! The test queue load-balancer is dropping some connections on high concurrent requests.',
        timestamp: 'Monday',
        isUser: false,
      },
      {
        id: '5_2',
        text: "Scaled the server instances from 2 to 6. Latency is back to 100ms! All tests pass.",
        timestamp: 'Monday',
        isUser: false,
      },
    ],
  },
];

export default function App() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
        <SimpleNavigator chats={chats} setChats={setChats} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
});
