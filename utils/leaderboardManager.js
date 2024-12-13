// utils/leaderboardManager.js
import { db } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  getDocs,
  updateDoc,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LEADERBOARD_KEY = '@user_leaderboard_id';

export const getUserLeaderboardId = async () => {
  try {
    return await AsyncStorage.getItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error getting leaderboard ID:', error);
    return null;
  }
};

export const registerUser = async (username, trophies) => {
  try {
    // Check if username already exists
    const usersRef = collection(db, 'leaderboard');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { error: 'Username already taken' };
    }

    // Add new user
    const userDoc = await addDoc(collection(db, 'leaderboard'), {
      username,
      trophies,
      lastUpdated: new Date().toISOString()
    });

    // Save user ID locally
    await AsyncStorage.setItem(LEADERBOARD_KEY, userDoc.id);
    return { success: true, id: userDoc.id };
  } catch (error) {
    console.error('Error registering user:', error);
    return { error: 'Failed to register user' };
  }
};

export const updateUserScore = async (userId, trophies) => {
  try {
    const userRef = doc(db, 'leaderboard', userId);
    await updateDoc(userRef, {
      trophies,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating score:', error);
    return false;
  }
};

export const getLeaderboard = async () => {
  try {
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(leaderboardRef, orderBy('trophies', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
      leaderboard.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

export const getUserRank = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDoc = await getDoc(doc(db, 'leaderboard', userId));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const allUsers = await getLeaderboard();
    const rank = allUsers.findIndex(user => user.id === userId) + 1;
    
    return {
      rank,
      ...userData
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};