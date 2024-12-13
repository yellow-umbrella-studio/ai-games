import AsyncStorage from '@react-native-async-storage/async-storage';

const COINS_KEY = '@game_coins';

export const getCoins = async () => {
  try {
    const coins = await AsyncStorage.getItem(COINS_KEY);
    return coins ? parseInt(coins) : 100; // Default starting coins
  } catch (error) {
    console.error('Error getting coins:', error);
    return 100;
  }
};

export const updateCoins = async (amount) => {
  try {
    const currentCoins = await getCoins();
    const newCoins = currentCoins + amount;
    await AsyncStorage.setItem(COINS_KEY, newCoins.toString());
    return newCoins;
  } catch (error) {
    console.error('Error updating coins:', error);
    return null;
  }
};