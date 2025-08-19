import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export const apiService = {
  // Login/Register user
  async loginUser(name) {
    try {
      const userRef = doc(db, USERS_COLLECTION, name);
      
      // Try to get user document
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (networkError) {
        // If offline, create user locally and return success
        console.log('Offline mode - creating user locally');
        return { 
          success: true, 
          user: {
            name,
            todayJapa: 0,
            totalJapa: 0,
            lastActive: new Date().toISOString().split('T')[0],
            achievements: [],
            streak: 0
          },
          offline: true
        };
      }
      
      if (!userSnap.exists()) {
        // Create new user
        await setDoc(userRef, {
          name,
          todayJapa: 0,
          totalJapa: 0,
          lastActive: new Date().toISOString().split('T')[0],
          achievements: [],
          streak: 0,
          createdAt: new Date().toISOString()
        });
      }
      
      return { success: true, user: userSnap.exists() ? userSnap.data() : null };
    } catch (error) {
      console.error('Login error:', error);
      // Fallback for offline mode
      return { 
        success: true, 
        user: {
          name,
          todayJapa: 0,
          totalJapa: 0,
          achievements: [],
          streak: 0
        },
        offline: true
      };
    }
  },

  // Update user japa count
  async updateUserJapa(name, todayJapa, totalJapa, achievements = [], streak = 0) {
    try {
      const userRef = doc(db, USERS_COLLECTION, name);
      const today = new Date().toISOString().split('T')[0];
      
      await updateDoc(userRef, {
        todayJapa,
        totalJapa,
        achievements,
        streak,
        lastActive: today,
        lastUpdated: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.log('Update error (offline mode):', error.message);
      // Return success even if offline - data will sync when online
      return { success: true, offline: true };
    }
  },

  // Get community stats
  async getCommunityStats() {
    try {
      const usersQuery = query(collection(db, USERS_COLLECTION), orderBy('totalJapa', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users = [];
      let todayTotal = 0;
      let allTimeTotal = 0;
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push(userData);
        todayTotal += userData.todayJapa || 0;
        allTimeTotal += userData.totalJapa || 0;
      });
      
      return { 
        success: true, 
        data: { users, todayTotal, allTimeTotal } 
      };
    } catch (error) {
      console.log('Community stats error (offline):', error.message);
      // Return mock data for offline mode
      return { 
        success: true, 
        data: { 
          users: [{ name: 'You (Offline)', todayJapa: 0, totalJapa: 0 }], 
          todayTotal: 0, 
          allTimeTotal: 0 
        },
        offline: true
      };
    }
  },

  // Real-time community updates
  subscribeToCommunityUpdates(callback) {
    const usersQuery = query(collection(db, USERS_COLLECTION), orderBy('totalJapa', 'desc'));
    
    return onSnapshot(usersQuery, (querySnapshot) => {
      const users = [];
      let todayTotal = 0;
      let allTimeTotal = 0;
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push(userData);
        todayTotal += userData.todayJapa || 0;
        allTimeTotal += userData.totalJapa || 0;
      });
      
      callback({ users, todayTotal, allTimeTotal });
    });
  },

  // Reset daily counts (call this at midnight)
  async resetDailyCounts() {
    try {
      const usersQuery = query(collection(db, USERS_COLLECTION));
      const querySnapshot = await getDocs(usersQuery);
      
      const batch = [];
      querySnapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, { todayJapa: 0 }));
      });
      
      await Promise.all(batch);
      return { success: true };
    } catch (error) {
      console.error('Reset daily counts error:', error);
      return { success: false, error: error.message };
    }
  }
};