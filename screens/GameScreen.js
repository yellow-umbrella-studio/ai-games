import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCoins, updateCoins } from '../utils/coinsManager';
import { LinearGradient } from 'expo-linear-gradient';
import { updateProgress } from '../utils/progressManager';
import { getProgress } from '../utils/progressManager';
import { getTrophies, updateTrophies } from '../utils/trophyManager';
import SettingsModal from '../components/SettingsModal';
import StoreModal from '../components/StoreModal';

const REVEAL_COST = 25;
const REMOVE_COST = 30;
const EXTRA_COST = 50;
const CORRECT_ANSWER_REWARD = 10;
const { width } = Dimensions.get('window');
const LETTER_BOX_SIZE = Math.min(width / 7, 45);
const KEY_WIDTH = (width - 80) / 10; // For 10 keys per row with padding
// Dummy data for the game
const generateKeyboardLetters = (answer, totalLetters = 20) => {
  // Convert answer to uppercase and remove duplicates
  const answerLetters = [...new Set(answer.toUpperCase())];
  
  // All possible letters to choose from (excluding answer letters)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    .filter(letter => !answerLetters.includes(letter));
  
  // Calculate how many random letters we need
  const remainingLettersCount = totalLetters - answerLetters.length;
  
  // Get random letters from remaining alphabet
  const randomLetters = [];
  for (let i = 0; i < remainingLettersCount; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    randomLetters.push(alphabet[randomIndex]);
    // Remove used letter to avoid duplicates
    alphabet.splice(randomIndex, 1);
  }
  
  // Combine answer letters and random letters
  const allLetters = [...answerLetters, ...randomLetters];
  
  // Shuffle the combined array
  for (let i = allLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
  }
  
  return allLetters;
};

const GameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    gameId, 
    currentLevel,
    levelData,
    totalLevels 
  } = route.params;

  // Add validation and default values
  if (!levelData || !levelData.answer) {
    console.error('Invalid level data:', levelData);
    Alert.alert(
      'Error',
      'Unable to load level data',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
    return null;
  }

  const [input, setInput] = useState('');
  const [lockedIndices, setLockedIndices] = useState([]);
  const [usedEraser, setUsedEraser] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [coins, setCoins] = useState(0);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  const [trophies, setTrophies] = useState(0);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [isStoreVisible, setIsStoreVisible] = useState(false);

  
    const transitionAnimation = useRef(new Animated.Value(0)).current;
    const coinsAnimation = useRef(new Animated.Value(0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const [shimmerValue] = useState(new Animated.Value(0));
    const [bounceValue] = useState(new Animated.Value(1));

    useEffect(() => {
      if (levelData.answer) {
        const letters = generateKeyboardLetters(levelData.answer);
        setAvailableLetters(letters);
      }
    }, [levelData.answer]);
    
    useEffect(() => {
      // Create infinite shimmer animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);
  
    const animateHint = () => {
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

      const checkLevelCompletion = async () => {
        const progress = await getProgress();
        const gameProgress = progress[gameId] || { completedLevels: [] };
        setIsLevelCompleted(gameProgress.completedLevels.includes(currentLevel));
      };


      useEffect(() => {
        loadCoins();
        loadTrophies();
        checkLevelCompletion();
      }, []);

      const loadTrophies = async () => {
        const userTrophies = await getTrophies();
        setTrophies(userTrophies);
      };
    
      const loadCoins = async () => {
        const userCoins = await getCoins();
        setCoins(userCoins);
      };


    
      const handleCoinTransaction = async (cost, action) => {
        if (coins >= cost) {
          const newCoins = await updateCoins(-cost);
          if (newCoins !== null) {
            setCoins(newCoins);
            action();
          }
        } else {
          Alert.alert('Not Enough Coins', 'You need more coins to use this hint!');
        }
      };
  
    useEffect(() => {
      if (input.length === levelData.answer.length) {
        checkAnswer();
      }
    }, [input]);
  
    const handleLetterPress = (letter) => {
      if (input.length < levelData.answer.length) {
        setInput(input + letter);
      }
    };
  
    const handleLetterRemove = (index) => {
      if (!lockedIndices.includes(index)) {
        setInput(input.slice(0, index) + input.slice(index + 1));
      }
    };
  
    const checkAnswer = async () => {
      if (input === levelData.answer) {
        let newCoins = coins;
        
        if (!isLevelCompleted) {
          newCoins = await updateCoins(CORRECT_ANSWER_REWARD);
          const newTrophies = await updateTrophies(1);
          setCoins(newCoins);
          setTrophies(newTrophies);
          await updateProgress(gameId, currentLevel, 'completed');
        }
        
        setShowLevelComplete(true);
    
        Animated.sequence([
          Animated.timing(transitionAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(coinsAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ]).start(() => {
          if (isLevelCompleted) {
            navigation.goBack();
          } else {
            if (parseInt(currentLevel) < totalLevels) {
              navigation.goBack(); // Go back to levels screen instead of directly to next level
            } else {
              navigation.navigate('Home');
              Alert.alert('Congratulations!', 'You completed all levels!');
            }
          }
        });
      } else {
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]).start();
      }
    };
  
      const revealLetter = () => {
        handleCoinTransaction(REVEAL_COST, () => {
          for (let i = 0; i < levelData.answer.length; i++) {
            if (!input[i]) {
              const newInput = input.slice(0, i) + levelData.answer[i] + input.slice(i + 1);
              setInput(newInput);
              setLockedIndices([...lockedIndices, i]);
              break;
            }
          }
        });
      };

      const skipLevel = () => {
        handleCoinTransaction(EXTRA_COST, async () => {
          Alert.alert(
            'Skip Level',
            `Use ${EXTRA_COST} coins to see the answer and skip to the next level?`,
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Skip',
                onPress: async () => {
                  setInput(levelData.answer);
                  
                  if (!isLevelCompleted) {
                    await updateProgress(gameId, currentLevel, 'completed');
                  }
                  
                  setTimeout(() => {
                    setShowLevelComplete(true);
                    setTimeout(() => {
                      if (isLevelCompleted) {
                        navigation.goBack();
                      } else if (parseInt(currentLevel) < totalLevels) {
                        navigation.goBack(); // Go back to levels screen
                      } else {
                        navigation.navigate('Home');
                        Alert.alert('Congratulations!', 'You completed all levels!');
                      }
                    }, 2000);
                  }, 1000);
                }
              }
            ]
          );
        });
      };
    
    
      const removeIncorrectLetter = () => {
        if (!usedEraser) {
          handleCoinTransaction(REMOVE_COST, () => {
            const correctLetters = new Set(levelData.answer.split(''));
            const incorrectLetters = availableLetters.filter(letter => !correctLetters.has(letter));
            if (incorrectLetters.length > 0) {
              // Get a random incorrect letter to remove
              const randomIndex = Math.floor(Math.random() * incorrectLetters.length);
              const letterToRemove = incorrectLetters[randomIndex];
              setAvailableLetters(availableLetters.filter(letter => letter !== letterToRemove));
              setUsedEraser(true);
            }
          });
        }
      };

      const LevelCompleteOverlay = ({ coinsEarned = 10 }) => {
        const backgroundOpacity = useRef(new Animated.Value(0)).current;
        const contentScale = useRef(new Animated.Value(0)).current;
        const coinsOpacity = useRef(new Animated.Value(0)).current;
        const coinsScale = useRef(new Animated.Value(0)).current;
        const coinsTranslateY = useRef(new Animated.Value(-50)).current;
        const starPositions = Array(8).fill(0).map(() => ({
          x: useRef(new Animated.Value(0)).current,
          y: useRef(new Animated.Value(0)).current,
          rotate: useRef(new Animated.Value(0)).current,
          scale: useRef(new Animated.Value(0)).current,
        }));
      
        useEffect(() => {
          // Main animation sequence
          Animated.sequence([
            // Fade in background
            Animated.timing(backgroundOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            // Show content with bounce effect
            Animated.spring(contentScale, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
      
          // Animate stars
          starPositions.forEach((star, index) => {
            const angle = (index * Math.PI * 2) / starPositions.length;
            const radius = 100;
            const delay = index * 100;
      
            Animated.sequence([
              Animated.delay(400 + delay),
              Animated.parallel([
                Animated.timing(star.x, {
                  toValue: Math.cos(angle) * radius,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(star.y, {
                  toValue: Math.sin(angle) * radius,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.timing(star.rotate, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.spring(star.scale, {
                  toValue: 1,
                  friction: 3,
                  useNativeDriver: true,
                }),
              ]),
            ]).start();
          });
      
          // Coins animation
          Animated.sequence([
            Animated.delay(600),
            Animated.parallel([
              Animated.timing(coinsOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(coinsScale, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
              }),
              Animated.timing(coinsTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
        }, []);
      
        return (
          <Animated.View style={[styles.overlay, { opacity: backgroundOpacity }]}>
            <Animated.View style={[styles.content, { transform: [{ scale: contentScale }] }]}>
              {/* Stars animation */}
              {starPositions.map((star, index) => (
                <Animated.Text
                  key={index}
                  style={[styles.star, {
                    transform: [
                      { translateX: star.x },
                      { translateY: star.y },
                      { rotate: star.rotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })},
                      { scale: star.scale },
                    ],
                  }]}>
                  ⭐
                </Animated.Text>
              ))}
      
              <Text style={styles.title}>Level Complete!</Text>
              
              {/* Only show coins reward if level wasn't completed before */}
              {!isLevelCompleted && (
            <>
              <Animated.View style={[styles.rewardContainer, {
                opacity: coinsOpacity,
                transform: [{ scale: coinsScale }, { translateY: coinsTranslateY }],
              }]}>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>🏆</Text>
                  <Text style={styles.rewardText}>+1</Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>💰</Text>
                  <Text style={styles.rewardText}>+{coinsEarned}</Text>
                </View>
              </Animated.View>
            </>
          )}
      
              <Text style={styles.subtitle}>
                {isLevelCompleted ? 'Well done again!' : 'Great job!'}
              </Text>
            </Animated.View>
          </Animated.View>
        );
      };
      
    
  
      return (
        <SafeAreaView style={styles.container}>
          {showLevelComplete && (
            <LevelCompleteOverlay coinsEarned={CORRECT_ANSWER_REWARD} />
          )}
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Text style={styles.iconText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.statsContainer}>
              <Text style={styles.levelText}>LEVEL {currentLevel}</Text>
              <Text style={styles.statText}>🏆 {trophies}</Text>
              <TouchableOpacity onPress={() => setIsStoreVisible(true)}>
  <View style={styles.coinsBadge}>
    <Text style={styles.coinsIcon}>💰</Text>
    <Text style={styles.coinsText}>{coins}</Text>
  </View>
</TouchableOpacity>
            </View>
          </View>
    
          <View style={styles.imageCard}>
            <Image source={{ uri: levelData.image }} style={styles.image} />
          </View>
    
          <Animated.View style={[styles.inputContainer, { transform: [{ translateX: shakeAnimation }] }]}>
            {Array.from({ length: levelData.answer.length }).map((_, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.letterBox,
                  lockedIndices.includes(index) && styles.letterBoxLocked,
                  input[index] && styles.letterBoxFilled
                ]} 
                onPress={() => handleLetterRemove(index)}
              >
                <Text style={[
                  styles.letterText,
                  lockedIndices.includes(index) && styles.letterTextLocked
                ]}>
                  {input[index] || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
    
          <View style={styles.hintsContainer}>
            <TouchableOpacity style={styles.hintButton} onPress={revealLetter}>
              <Text style={styles.hintIcon}>🔍</Text>
              <View style={styles.hintCost}>
                <Text style={styles.hintCostText}>{REVEAL_COST}</Text>
              </View>
            </TouchableOpacity>
    
            <TouchableOpacity 
              style={[styles.hintButton, usedEraser && styles.hintButtonDisabled]} 
              onPress={removeIncorrectLetter}
            >
              <Text style={styles.hintIcon}>💡</Text>
              <View style={styles.hintCost}>
                <Text style={styles.hintCostText}>{REMOVE_COST}</Text>
              </View>
            </TouchableOpacity>
    
            <TouchableOpacity style={styles.hintButton} onPress={skipLevel}>
  <Text style={styles.hintIcon}>⚡</Text>
  <View style={styles.hintCost}>
    <Text style={styles.hintCostText}>{EXTRA_COST}</Text>
  </View>
</TouchableOpacity>
          </View>
    
          <View style={styles.keyboardContainer}>
            {availableLetters.map((letter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.key}
                onPress={() => handleLetterPress(letter)}
              >
                <Text style={styles.keyText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <StoreModal 
  visible={isStoreVisible}
  onClose={() => setIsStoreVisible(false)}
  onCoinsUpdated={(newCoins) => setCoins(newCoins)}
/>
        </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#FDF6EC',
        paddingTop: 50, // Increased top padding
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
      },
      iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      },
      iconText: {
        fontSize: 24,
        color: '#3B3B3B',
      },
      statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
      },
      levelText: {
        fontSize: 16,
        color: '#3B3B3B',
        fontWeight: '600',
      },
      coinsText: {
        fontSize: 16,
        color: '#3B3B3B',
        fontWeight: '600',
      },
      imageCard: {
        width: '92%',
        height: 280, // Increased height
        alignSelf: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        marginBottom: 15, // Reduced margin
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      inputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12, // Reduced margin
      },
      letterBox: {
        width: 45,
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E2E8F0',
      },
      letterBoxFilled: {
        borderColor: '#CBD5E0',
        backgroundColor: '#FFF',
      },
      letterBoxLocked: {
        backgroundColor: '#EDF2F7',
        borderColor: '#CBD5E0',
      },
      letterText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D3748',
      },
      letterTextLocked: {
        color: '#4A5568',
      },
      hintsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 12, // Reduced margin
      },
      hintButton: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7DFC6',
      },
      hintButtonDisabled: {
        opacity: 0.5,
      },
      hintIcon: {
        fontSize: 24,
      },
      hintCost: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.1)',
      },
      hintCostText: {
        fontSize: 12,
        color: '#3B3B3B',
        fontWeight: '600',
      },
      keyboardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        padding: 15,
        paddingBottom: 25, // Added bottom padding
        marginTop: 'auto',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
      },
      key: {
        width: KEY_WIDTH, // Dynamic key width
        height: 48, // Increased height
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7DFC6',
      },
      keyText: {
        fontSize: 20, // Increased font size
        fontWeight: 'bold',
        color: '#2D3748',
      },
      overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      },
      content: {
        alignItems: 'center',
        position: 'relative',
        padding: 40,
      },
      star: {
        position: 'absolute',
        fontSize: 24,
      },
      title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      subtitle: {
        fontSize: 24,
        color: '#FFF',
        marginTop: 20,
        opacity: 0.9,
      },
      coinsContainer: {
        alignItems: 'center',
        marginTop: 20,
      },
      coinIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
      },
      coinIcon: {
        fontSize: 36,
        marginRight: 10,
      },
      coinsEarned: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
      },
      coinsText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
      },
      rewardContainer: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 20,
      },
      rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
      },
      rewardIcon: {
        fontSize: 24,
        marginRight: 10,
      },
      rewardText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
      },
    
    });
    

export default GameScreen;