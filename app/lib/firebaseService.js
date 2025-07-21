// Firebase Realtime Database service functions
import { db } from './firebase';
import { 
  ref, 
  push, 
  set, 
  get, 
  query, 
  orderByChild, 
  limitToLast,
  limitToFirst,
  equalTo,
  serverTimestamp,
  child,
  update
} from 'firebase/database';

// Leaderboard functions
export const addScore = async (username, score, gameData, email = null) => {
  try {
    const leaderboardRef = ref(db, 'leaderboard');
    const newScoreRef = push(leaderboardRef);
    
    await set(newScoreRef, {
      username,
      email,
      score,
      accuracy: gameData.accuracy || 0,
      imageSimilarity: gameData.imageSimilarity || 0,
      promptGrade: gameData.promptGrade || 0,
      finalScore: score,
      gameMode: 'promptr',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    console.log('Score added with ID: ', newScoreRef.key);
    return newScoreRef.key;
  } catch (error) {
    console.error('Error adding score: ', error);
    throw error;
  }
};

export const getTopScores = async (limitCount = 100) => {
  try {
    const leaderboardRef = ref(db, 'leaderboard');
    const q = query(leaderboardRef, orderByChild('finalScore'), limitToLast(limitCount));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
      const scores = [];
      snapshot.forEach((childSnapshot) => {
        scores.unshift({ // unshift to reverse order (highest first)
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return scores;
    }
    return [];
  } catch (error) {
    console.error('Error getting scores: ', error);
    throw error;
  }
};

export const getTopPromtrScores = async (limitCount = 100) => {
  try {
    const leaderboardRef = ref(db, 'leaderboard');
    const q = query(leaderboardRef, orderByChild('gameMode'), equalTo('promptr'));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
      const scores = [];
      snapshot.forEach((childSnapshot) => {
        scores.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by finalScore in descending order and limit
      scores.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
      return scores.slice(0, limitCount);
    }
    return [];
  } catch (error) {
    console.error('Error getting promtr scores: ', error);
    throw error;
  }
};

export const getUserScores = async (username) => {
  try {
    const leaderboardRef = ref(db, 'leaderboard');
    const q = query(leaderboardRef, orderByChild('username'), equalTo(username));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
      const scores = [];
      snapshot.forEach((childSnapshot) => {
        scores.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Sort by finalScore in descending order
      scores.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
      return scores;
    }
    return [];
  } catch (error) {
    console.error('Error getting user scores: ', error);
    throw error;
  }
};

// Game session functions
export const saveGameSession = async (sessionData) => {
  try {
    const gameSessionsRef = ref(db, 'gameSessions');
    const newSessionRef = push(gameSessionsRef);
    
    await set(newSessionRef, {
      ...sessionData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    console.log('Game session saved with ID: ', newSessionRef.key);
    return newSessionRef.key;
  } catch (error) {
    console.error('Error saving game session: ', error);
    throw error;
  }
};

export const getGameSessions = async (limitCount = 50) => {
  try {
    const gameSessionsRef = ref(db, 'gameSessions');
    const q = query(gameSessionsRef, orderByChild('timestamp'), limitToLast(limitCount));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
      const sessions = [];
      snapshot.forEach((childSnapshot) => {
        sessions.unshift({ // unshift to reverse order (most recent first)
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return sessions;
    }
    return [];
  } catch (error) {
    console.error('Error getting game sessions: ', error);
    throw error;
  }
};

// User stats functions
export const updateUserStats = async (username, statsUpdate) => {
  try {
    const userStatsRef = ref(db, 'userStats');
    const newStatsRef = push(userStatsRef);
    
    await set(newStatsRef, {
      username,
      ...statsUpdate,
      lastUpdated: serverTimestamp(),
      updatedAt: new Date().toISOString()
    });
    
    return newStatsRef.key;
  } catch (error) {
    console.error('Error updating user stats: ', error);
    throw error;
  }
};

// Daily play tracking functions
export const getTodaysPlayCount = async (identifier) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dailyPlaysRef = ref(db, 'dailyPlays');
    const q = query(dailyPlaysRef, orderByChild('identifier'), equalTo(identifier));
    const snapshot = await get(q);
    
    let count = 0;
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.date === today && data.gameMode === 'promptr') {
          count++;
        }
      });
    }
    return count;
  } catch (error) {
    console.error('Error getting play count: ', error);
    return 0;
  }
};

export const recordPlay = async (identifier, email = null) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyPlaysRef = ref(db, 'dailyPlays');
    const newPlayRef = push(dailyPlaysRef);
    
    await set(newPlayRef, {
      identifier,
      email,
      date: today,
      gameMode: 'promptr',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    return newPlayRef.key;
  } catch (error) {
    console.error('Error recording play: ', error);
    throw error;
  }
};

export const canUserPlay = async (identifier) => {
  const playCount = await getTodaysPlayCount(identifier);
  return playCount < 3;
};

// Generate anonymous username
export const generateAnonymousUsername = () => {
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `guest${randomNumber}`;
};

// User management functions
export const createOrUpdateUser = async (username, email) => {
  try {
    const userRef = ref(db, `users/${username}`);
    await set(userRef, {
      username,
      email,
      createdAt: new Date().toISOString(),
      lastActive: serverTimestamp()
    });
    return username;
  } catch (error) {
    console.error('Error creating/updating user: ', error);
    throw error;
  }
};
