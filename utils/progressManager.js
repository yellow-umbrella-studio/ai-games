// utils/progressManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@game_progress';

export const getProgress = async () => {
  try {
    const progress = await AsyncStorage.getItem(PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {};
  } catch (error) {
    console.error('Error getting progress:', error);
    return {};
  }
};

export const updateProgress = async (gameId, levelId, status) => {
  try {
    const currentProgress = await getProgress();
    
    if (!currentProgress[gameId]) {
      currentProgress[gameId] = {
        currentLevel: '1',
        completedLevels: []
      };
    }

    if (status === 'completed') {
      if (!currentProgress[gameId].completedLevels.includes(levelId)) {
        currentProgress[gameId].completedLevels.push(levelId);
      }
      // Update current level to next level
      const nextLevel = (parseInt(levelId) + 1).toString();
      currentProgress[gameId].currentLevel = nextLevel;
    }

    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(currentProgress));
    return currentProgress;
  } catch (error) {
    console.error('Error updating progress:', error);
    return null;
  }
};