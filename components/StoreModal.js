// components/StoreModal.js
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  Linking,
  Alert,
  Dimensions
} from 'react-native';
import { updateCoins } from '../utils/coinsManager';

const { height } = Dimensions.get('window');

const SOCIAL_REWARDS = [
  { id: '1', name: 'Follow on Twitter', icon: '🐦', coins: 50, url: 'https://twitter.com/yourgame' },
  { id: '2', name: 'Like on Facebook', icon: '👍', coins: 50, url: 'https://facebook.com/yourgame' },
  { id: '3', name: 'Follow on Instagram', icon: '📷', coins: 50, url: 'https://instagram.com/yourgame' },
];

const PROMOTED_GAMES = [
  { id: '1', name: 'Word Puzzle Pro', icon: '🎯', coins: 100 },
  { id: '2', name: 'Math Challenge', icon: '🔢', coins: 100 },
  { id: '3', name: 'Brain Teaser', icon: '🧩', coins: 100 },
];

const StoreModal = ({ visible, onClose, onCoinsUpdated }) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const [claimedRewards, setClaimedRewards] = useState(new Set());

  React.useEffect(() => {
    if (visible) {
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

  const handleClaimReward = async (amount, id) => {
    if (claimedRewards.has(id)) {
      Alert.alert('Already Claimed', 'You have already claimed this reward!');
      return;
    }

    try {
      const newCoins = await updateCoins(amount);
      setClaimedRewards(prev => new Set([...prev, id]));
      onCoinsUpdated(newCoins);
      Alert.alert('Success', `You earned ${amount} coins!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    }
  };

  const handleSocialLink = async (url, coins, id) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        handleClaimReward(coins, id);
      } else {
        Alert.alert('Error', `Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while opening the link');
    }
  };

  const handleWatchAd = () => {
    Alert.alert('Coming Soon', 'This feature will be available soon!');
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
            <Text style={styles.title}>Coin Store</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Social Media Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌟 Follow & Earn</Text>
              {SOCIAL_REWARDS.map((reward) => (
                <TouchableOpacity
                  key={reward.id}
                  style={[
                    styles.rewardButton,
                    claimedRewards.has(reward.id) && styles.rewardButtonClaimed
                  ]}
                  onPress={() => handleSocialLink(reward.url, reward.coins, reward.id)}
                  disabled={claimedRewards.has(reward.id)}
                >
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardIcon}>{reward.icon}</Text>
                    <Text style={styles.rewardText}>{reward.name}</Text>
                  </View>
                  <View style={styles.coinsBadge}>
                    <Text style={styles.coinsText}>+{reward.coins} 💰</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Watch Ads Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📺 Watch & Earn</Text>
              <TouchableOpacity
                style={styles.adButton}
                onPress={handleWatchAd}
              >
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardIcon}>📺</Text>
                  <Text style={styles.rewardText}>Watch an Ad</Text>
                </View>
                <View style={styles.coinsBadge}>
                  <Text style={styles.coinsText}>+25 💰</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Our Games Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎮 Play & Earn</Text>
              {PROMOTED_GAMES.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.rewardButton,
                    claimedRewards.has(game.id) && styles.rewardButtonClaimed
                  ]}
                  onPress={() => handleClaimReward(game.coins, game.id)}
                  disabled={claimedRewards.has(game.id)}
                >
                  <View style={styles.rewardContent}>
                    <Text style={styles.rewardIcon}>{game.icon}</Text>
                    <Text style={styles.rewardText}>{game.name}</Text>
                  </View>
                  <View style={styles.coinsBadge}>
                    <Text style={styles.coinsText}>+{game.coins} 💰</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 15,
  },
  rewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  rewardButtonClaimed: {
    opacity: 0.5,
    backgroundColor: '#EDF2F7',
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rewardText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  coinsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    color: '#92400E',
    fontWeight: 'bold',
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
});

export default StoreModal;