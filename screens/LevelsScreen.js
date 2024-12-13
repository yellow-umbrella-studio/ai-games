import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../utils/progressManager';

const LevelsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId, gameTitle, gameLevels, totalLevels } = route.params;
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const progress = await getProgress();
      const gameProgress = progress[gameId] || { currentLevel: '1', completedLevels: [] };
      const currentLevelNum = parseInt(gameProgress.currentLevel);
  
      // Create levels array based on totalLevels from Firebase
      const levelsData = Array.from({ length: totalLevels }, (_, i) => {
        const levelId = (i + 1).toString().padStart(3, '0'); // Convert to "001" format
        const levelKey = `level_${levelId}`; // Match Firebase key format
        const levelData = gameLevels?.[levelKey] || {};
        
        return {
          id: (i + 1).toString(), // Keep as regular number for display
          isUnlocked: i + 1 <= currentLevelNum,
          isCompleted: gameProgress.completedLevels.includes((i + 1).toString()),
          isCurrent: (i + 1).toString() === gameProgress.currentLevel,
          answer: levelData.answer,
          image: levelData.image,
        };
      });
  
      setLevels(levelsData);
    } catch (error) {
      console.error('Error loading level progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [gameId])
  );

  const handleLevelPress = (level) => {
  if (level.isUnlocked) {
    // For debugging
    console.log('Level data being passed:', {
      gameId,
      currentLevel: level.id,
      levelData: {
        image: level.image,
        answer: level.answer
      },
      totalLevels
    });

    if (!level.answer || !level.image) {
      Alert.alert('Error', 'Level data is incomplete');
      return;
    }

    navigation.navigate('Game', {
      gameId,
      currentLevel: level.id,
      levelData: {
        image: level.image,
        answer: level.answer.toUpperCase(),
      },
      totalLevels
    });
  }
};

  const renderLevel = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.levelCard,
        !item.isUnlocked && styles.levelLocked,
        item.isCompleted && styles.levelCompleted,
        item.isCurrent && styles.levelCurrent,
      ]}
      onPress={() => handleLevelPress(item)}
      disabled={!item.isUnlocked}
    >
      <Text style={[
        styles.levelNumber,
        !item.isUnlocked && styles.levelNumberLocked,
        item.isCompleted && styles.levelNumberCompleted,
        item.isCurrent && styles.levelNumberCurrent,
      ]}>
        {item.id}
      </Text>
      
      {!item.isUnlocked && (
        <Text style={styles.lockIcon}>🔒</Text>
      )}
      
      {item.isCompleted && (
        <Text style={styles.checkIcon}>✓</Text>
      )}
    </TouchableOpacity>
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
    <LinearGradient
      colors={['#FFF5E6', '#FFE4C4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{gameTitle}</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={levels}
          renderItem={renderLevel}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.levelsList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
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
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2C1654',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C1654',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  placeholder: {
    width: 40,
  },
  levelsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  levelCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  levelLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  levelCompleted: {
    backgroundColor: '#F0F9FF',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C1654',
  },
  levelNumberLocked: {
    color: '#94A3B8',
  },
  levelNumberCompleted: {
    color: '#3B82F6',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 14,
  },
  starIcon: {
    position: 'absolute',
    bottom: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
  },
  levelCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  levelLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  levelCompleted: {
    backgroundColor: '#E6FFE6', // Light green for completed levels
  },
  levelCurrent: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C1654',
  },
  levelNumberLocked: {
    color: '#94A3B8',
  },
  levelNumberCompleted: {
    color: '#4CAF50',
  },
  levelNumberCurrent: {
    color: '#4CAF50',
  },
  checkIcon: {
    position: 'absolute',
    bottom: 8,
    fontSize: 16,
    color: '#4CAF50',
  },
});

export default LevelsScreen;