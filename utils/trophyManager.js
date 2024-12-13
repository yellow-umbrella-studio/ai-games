import AsyncStorage from '@react-native-async-storage/async-storage';

const TROPHY_KEY = '@game_trophies';

export const getTrophies = async () => {
  try {
    const trophies = await AsyncStorage.getItem(TROPHY_KEY);
    return trophies ? parseInt(trophies) : 0;
  } catch (error) {
    console.error('Error getting trophies:', error);
    return 0;
  }
};

export const updateTrophies = async (amount) => {
  try {
    const currentTrophies = await getTrophies();
    const newTrophies = currentTrophies + amount;
    await AsyncStorage.setItem(TROPHY_KEY, newTrophies.toString());
    return newTrophies;
  } catch (error) {
    console.error('Error updating trophies:', error);
    return null;
  }
};