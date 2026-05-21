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
const INITIAL_CHATS: Chat[] = [];

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
