import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Chat } from '../types';
import { ChatbotIcon, SearchIcon } from '../components/Icons';
import { Navigation } from '../navigation/SimpleNavigator';
import api from "../api";

interface ListingScreenProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  navigation: Navigation;
  isFocused: boolean;
}

type FilterType = 'ALL' | 'UNREAD';

// Helper to format ISO date strings beautifully
const formatMessageTime = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();

    // If it's today, show time (e.g. 11:32 AM)
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If it was yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise show month and day (e.g. May 21)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (error) {
    return '';
  }
};

// Deterministic premium avatar background colors based on name
const getAvatarColor = (name: string): string => {
  const colors = [
    '#4F46E5', // Indigo
    '#0EA5E9', // Sky blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ListingScreen({ chats, setChats, navigation, isFocused }: ListingScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const listFlatListRef = useRef<FlatList>(null);

  // Filtering list data based on state
  const getFilteredChats = () => {
    let result = chats;

    // Filter by type
    if (selectedFilter === 'UNREAD') {
      result = chats.filter(c => c.unreadCount > 0);
    }

    // Search query
    if (searchQuery.trim() !== '') {
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  };

  useEffect(() => {
    if (!isFocused) return;

    const fetchUsers = () => {
      api.getAllUsersApi()
        .then((res: any) => {
          if (res && res.success && Array.isArray(res.data)) {
            const apiChats: Chat[] = res.data.map((user: any) => {
              const lastMsg = user.last_message || (user.messages && user.messages.length > 0 ? user.messages[user.messages.length - 1] : null);
              const formattedMessages = (user.messages || []).map((msg: any) => ({
                id: msg.message_id || msg._id || String(Math.random()),
                text: msg.body || '',
                timestamp: formatMessageTime(msg.timestamp),
                isUser: msg.direction === 'outbound',
                status: msg.status === 'received' ? 'delivered' : msg.status,
              }));

              return {
                id: user.user_id,
                name: user.name || user.phone,
                avatar: user.profile_picture || '',
                role: user.phone || 'WhatsApp Contact',
                lastMessage: lastMsg ? lastMsg.body : 'No messages yet',
                time: lastMsg ? formatMessageTime(lastMsg.timestamp) : '',
                unreadCount: user.unread_count || 0,
                online: user.is_active || false,
                messages: formattedMessages,
              };
            });

            setChats(apiChats);
          }
        })
        .catch((error: any) => {
          console.error("❌ Error fetching users from API:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    fetchUsers();
    const intervalId = setInterval(fetchUsers, 5000);

    return () => clearInterval(intervalId);
  }, [isFocused]);

  return (
    <View style={styles.innerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ChatbotIcon />
          <View style={styles.appNameContainer}>
            <Text style={styles.appNameText}>HelpBot</Text>
            <View style={styles.statusServerRow}>
              <View style={styles.onlinePulsePoint} />
              <Text style={styles.serverStatusText}>CONNECT WITH YOUR CLIENTS</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsHeaderBtn} activeOpacity={0.7}>
          <Text style={styles.gearText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarWrapper}>
        <SearchIcon />
        <TextInput
          placeholder="Search team or AI agents..."
          placeholderTextColor="#64748B"
          style={styles.searchTextInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Text style={styles.clearSearchText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'All Chats' },
            { id: 'UNREAD', label: 'Unread' },
          ].map(tab => {
            const active = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedFilter(tab.id as FilterType)}
                style={[styles.filterPill, active && styles.filterPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Chat Cards FlatList */}
      {isLoading && chats.length === 0 ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4, 5].map(key => (
            <View key={key} style={styles.chatCard}>
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#1E2538' }]} />
              <View style={styles.cardCenterBlock}>
                <View style={styles.nameRow}>
                  <View style={{ width: 120, height: 16, backgroundColor: '#1E2538', borderRadius: 4 }} />
                  <View style={{ width: 40, height: 12, backgroundColor: '#1E2538', borderRadius: 4 }} />
                </View>
                <View style={{ width: 80, height: 12, backgroundColor: '#1E2538', borderRadius: 4, marginTop: 6, marginBottom: 8 }} />
                <View style={{ width: '80%', height: 14, backgroundColor: '#1E2538', borderRadius: 4 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          ref={listFlatListRef}
        data={getFilteredChats()}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitleText}>No {selectedFilter === "UNREAD" ? "unread" : "active"} conversations</Text>
            <Text style={styles.emptySubText}>Try adjusting your search queries or tabs.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const hasUnread = item.unreadCount > 0;
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('Chatroom', { chatId: item.id })}
              style={styles.chatCard}
              activeOpacity={0.7}
            >
              {/* Avatar Container */}
              <View style={styles.avatarFrame}>
                {item.avatar ? (
                  <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(item.name) }]}>
                    <Text style={styles.avatarPlaceholderText}>
                      {(item.name || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {/* {item.online && <View style={styles.onlineDotOverlay} />} */}
              </View>

              {/* Core Text Section */}
              <View style={styles.cardCenterBlock}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardContactName}>{item.name}</Text>
                  <Text style={styles.cardTimeText}>{item.time}</Text>
                </View>
                <Text style={styles.cardContactRole}>{item.role}</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.cardSnippetText, hasUnread && styles.cardSnippetTextUnread]}
                >
                  {item.lastMessage}
                </Text>
              </View>

              {/* Badge Column */}
              {hasUnread && (
                <View style={styles.unreadBadgeWrapper}>
                  <View style={styles.unreadGradientBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appNameContainer: {
    marginLeft: 12,
  },
  appNameText: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusServerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlinePulsePoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  serverStatusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  settingsHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#151B2C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222D44',
  },
  gearText: {
    fontSize: 18,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151B2C',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#222D44',
  },
  searchTextInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
    marginLeft: 10,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    paddingHorizontal: 6,
  },
  clearSearchText: {
    color: '#64748B',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 14,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#151B2C',
    borderWidth: 1,
    borderColor: '#222D44',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#151B2C',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222D44',
    alignItems: 'center',
  },
  avatarFrame: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E2538',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  onlineDotOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#151B2C',
  },
  cardCenterBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardContactName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  cardTimeText: {
    color: '#64748B',
    fontSize: 12,
  },
  cardContactRole: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardSnippetText: {
    color: '#94A3B8',
    fontSize: 13.5,
  },
  cardSnippetTextUnread: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  unreadBadgeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadGradientBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitleText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});
