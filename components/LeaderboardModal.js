// components/LeaderboardModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  getUserLeaderboardId,
  registerUser,
  getLeaderboard,
  getUserRank
} from '../utils/leaderboardManager';

const { height } = Dimensions.get('window');

const LeaderboardModal = ({ visible, onClose, currentTrophies }) => {
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userId, setUserId] = useState(null);
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      loadData();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    const savedUserId = await getUserLeaderboardId();
    setUserId(savedUserId);

    const leaderboardData = await getLeaderboard();
    setLeaderboard(leaderboardData);

    if (savedUserId) {
      const rank = await getUserRank(savedUserId);
      setUserRank(rank);
    }

    setLoading(false);
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setRegistering(true);
    const result = await registerUser(username, currentTrophies);
    setRegistering(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setUserId(result.id);
    await loadData();
  };

  const renderItem = ({ item, index }) => {
    const isTop3 = index < 3;
    const isUser = item.id === userId;

    return (
      <View style={[
        styles.rankItem,
        isUser && styles.userRankItem,
        isTop3 && styles.topRankItem
      ]}>
        <View style={styles.rankPosition}>
          {isTop3 ? (
            <Text style={styles.medalEmoji}>
              {['🥇', '🥈', '🥉'][index]}
            </Text>
          ) : (
            <Text style={[styles.rankNumber, isUser && styles.userRankNumber]}>
              {index + 1}
            </Text>
          )}
        </View>

        <Text style={[styles.username, isUser && styles.userUsername]}>
          {item.username}
        </Text>

        <Text style={[styles.trophies, isUser && styles.userTrophies]}>
          🏆 {item.trophies}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Leaderboard</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4A5568" />
          ) : !userId ? (
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.registrationContainer}
            >
              <Text style={styles.registerText}>
                Join the leaderboard to compete with other players!
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                maxLength={20}
              />
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={registering}
              >
                <Text style={styles.registerButtonText}>
                  {registering ? 'Joining...' : 'Join Leaderboard'}
                </Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.leaderboardContainer}>
              {userRank && (
                <View style={styles.userStats}>
                  <Text style={styles.userStatsText}>
                    Your Rank: #{userRank.rank} • 🏆 {userRank.trophies}
                  </Text>
                </View>
              )}

              <FlatList
                data={leaderboard}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.leaderboardList}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F7FAFC',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#4A5568',
  },
  registrationContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    flex: 1,
  },
  userStats: {
    backgroundColor: '#F7FAFC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  userStatsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  leaderboardList: {
    paddingHorizontal: 10,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    marginBottom: 8,
  },
  userRankItem: {
    backgroundColor: '#E6FFE6',
  },
  topRankItem: {
    backgroundColor: '#FEF3C7',
  },
  rankPosition: {
    width: 30,
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  username: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2D3748',
  },
  trophies: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  userRankNumber: {
    color: '#4CAF50',
  },
  userUsername: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  userTrophies: {
    color: '#4CAF50',
  },
});

export default LeaderboardModal;