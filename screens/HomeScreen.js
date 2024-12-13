import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getCoins } from '../utils/coinsManager';
import { getTrophies } from '../utils/trophyManager';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import SettingsModal from '../components/SettingsModal';
import StoreModal from '../components/StoreModal';
import LeaderboardModal from '../components/LeaderboardModal';

const GameCard = ({ game }) => {
  const navigation = useNavigation();

  const handleGamePress = () => {
    navigation.navigate('Levels', {
      gameId: game.id,
      gameTitle: game.name,
      gameLevels: game.levels, // This should be the map of levels from Firebase
      totalLevels: game.totalLevels
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.gameCard, { backgroundColor: game.backgroundColor }]}
      onPress={handleGamePress}
    >
      <Image 
        source={{ uri: game.levelImage }} 
        style={styles.gameImage} 
        resizeMode="cover"
      />
      {game.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newText}>NEW!</Text>
        </View>
      )}
      <Text style={[styles.gameTitle, { color: game.titleColor }]}>{game.name}</Text>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [coins, setCoins] = useState(0);
  const [trophies, setTrophies] = useState(0);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isStoreVisible, setIsStoreVisible] = useState(false);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);


  const handleSettingsPress = () => {
    setIsSettingsVisible(true);
  };


  const fetchGames = async () => {
    try {
      const gamesRef = collection(db, 'games');
      const q = query(gamesRef, orderBy('order'));
      const querySnapshot = await getDocs(q);
      
      const gamesData = [];
      querySnapshot.forEach((doc) => {
        gamesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setGames(gamesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching games:', error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    const userCoins = await getCoins();
    const userTrophies = await getTrophies();
    setCoins(userCoins);
    setTrophies(userTrophies);
    await fetchGames();
  };

  const handleReset = async () => {
    await loadData(); // Reload all data after reset
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <LinearGradient colors={['#FFF5E6', '#FFE4C4']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C1654" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFF5E6', '#FFE4C4']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.statsContainer}>
          <TouchableOpacity onPress={() => setIsLeaderboardVisible(true)}>
  <View style={styles.trophyBadge}>
    <Text style={styles.trophyIcon}>🏆</Text>
    <Text style={styles.trophyText}>{trophies}</Text>
  </View>
</TouchableOpacity>
            <TouchableOpacity onPress={() => setIsStoreVisible(true)}>
  <View style={styles.coinsBadge}>
    <Text style={styles.coinsIcon}>💰</Text>
    <Text style={styles.coinsText}>{coins}</Text>
  </View>
</TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>Word Games</Text>

        <FlatList
          data={games}
          renderItem={({ item }) => <GameCard game={item} />}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gamesList}
        />
         <SettingsModal 
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onReset={handleReset}
      />
      <StoreModal 
  visible={isStoreVisible}
  onClose={() => setIsStoreVisible(false)}
  onCoinsUpdated={(newCoins) => setCoins(newCoins)}
/>
<LeaderboardModal 
  visible={isLeaderboardVisible}
  onClose={() => setIsLeaderboardVisible(false)}
  currentTrophies={trophies}
/>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  settingsButton: {
    padding: 8,
  },
  iconContainer: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsIcon: {
    fontSize: 24,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coinsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  coinsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C1654',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C1654',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 1,
  },
  gamesList: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 15,
    padding: 15,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameImage: {
    width: '100%',
    height: '70%',
    borderRadius: 15,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  newBadge: {
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  newText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C1654',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
