import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
  Animated,
  StatusBar,
  Vibration,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from './api';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth > 768;
const isSmallScreen = screenHeight < 700;
const imageSize = isSmallScreen ? Math.min(screenWidth * 0.65, 220) : Math.min(screenWidth * 0.8, screenHeight * 0.35, 280);

const presetGradients = [
  ["#FFE0B2", "#FFCCBC", "#FFF3E0"], // Warm Orange
  ["#F8BBD9", "#E1BEE7", "#F3E5F5"], // Pink Purple
  ["#C8E6C9", "#DCEDC8", "#F1F8E9"], // Green
  ["#B3E5FC", "#E1F5FE", "#E0F2F1"], // Blue
  ["#FFCDD2", "#F8BBD9", "#FCE4EC"], // Rose
  ["#D1C4E9", "#E1BEE7", "#F3E5F5"], // Lavender
  ["#FFF9C4", "#FFF59D", "#FFFDE7"], // Golden
  ["#FFCCBC", "#FFAB91", "#FBE9E7"], // Peach
];

const radhaNames = [
  "1. राधा", "2. रासेश्वरी", "3. रम्या", "4. कृष्णमत्राधिदेवता", "5. सर्वाद्या",
  "6. सर्ववंद्या", "7. वृंदावनविहारिणी", "8. वृंदाराधा", "9. रमा", "10. अशेषगोपीमंडलपूजिता",
  "11. सत्या", "12. सत्यपरा", "13. सत्यभामा", "14. श्रीकृष्णवल्लभा", "15. वृषभानुसुता",
  "16. गोपी", "17. मूल प्रकृति", "18. ईश्वरी", "19. गान्धर्वा", "20. राधिका",
  "21. राम्या", "22. रुक्मिणी", "23. परमेश्वरी", "24. परात्परतरा", "25. पूर्णा",
  "26. पूर्णचन्द्रविमानना", "27. भुक्ति-मुक्तिप्रदा", "28. भवव्याधि-विनाशिनी",
];

const languages = {
  hindi: {
    title: "श्री राधा रानी",
    subtitle: "Divine Counter",
    todayCount: "आज का जाप",
    totalCount: "कुल जाप",
    radheKrishna: "॥ राधाकृष्ण ॥",
    tapButton: "🙏 जाप करें 🙏",
    settings: "🔹 सेटिंग्स 🔹",
    themes: "🎨 Divine Themes",
    changeImage: "📸 छवि बदलें",
    resetImage: "🔄 मूल छवि",
    stats: "📊 आपकी साधना",
    calendar: "📅 Calendar",
    names: "🌸 28 Names",
    close: "❌ Close",
    calendarTitle: "📅 साधना कैलेंडर",
    selectDate: "📅 तारीख चुनें",
    dateCount: "को जाप",
    namesTitle: "🌸 श्री राधा रानी के 28 नाम 🌸",
    closeButton: "बंद करें",
    language: "🌐 भाषा",
    reset: "🔄 सभी डेटा रीसेट करें",
    login: "🔐 लॉगिन",
    logout: "🚪 लॉगआउट",
    community: "👥 समुदाय",
    enterName: "अपना नाम दर्ज करें",
    todayTotal: "आज का कुल",
    allTimeTotal: "सभी समय का कुल",
    communityTitle: "🌸 राधा नाम समुदाय 🌸"
  },
  english: {
    title: "Shri Radha Rani",
    subtitle: "Divine Counter",
    todayCount: "Today's Japa",
    totalCount: "Total Japa",
    radheKrishna: "॥ RadhaKrishna ॥",
    tapButton: "🙏 Tap to Count 🙏",
    settings: "🔹 Settings 🔹",
    themes: "🎨 Divine Themes",
    changeImage: "📸 Change Image",
    resetImage: "🔄 Default Image",
    stats: "📊 Your Sadhana",
    calendar: "📅 Calendar",
    names: "🌸 28 Names",
    close: "❌ Close",
    calendarTitle: "📅 Sadhana Calendar",
    selectDate: "📅 Select Date",
    dateCount: "Japa Count",
    namesTitle: "🌸 Shri Radha Rani's 28 Names 🌸",
    closeButton: "Close",
    language: "🌐 Language",
    reset: "🔄 Reset All Data",
    login: "🔐 Login",
    logout: "🚪 Logout",
    community: "👥 Community",
    enterName: "Enter your name",
    todayTotal: "Today's Total",
    allTimeTotal: "All Time Total",
    communityTitle: "🌸 Radha Naam Community 🌸"
  }
};

export default function App() {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [bgGradient, setBgGradient] = useState(["#FFE0B2", "#FFCCBC", "#FFF3E0"]);
  const defaultImageUri = "https://i.pinimg.com/736x/f3/55/a9/f355a9bb1f18ff06bb238d2e4c234587.jpg";
  const [imageUri, setImageUri] = useState(defaultImageUri);
  const [history, setHistory] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [namesVisible, setNamesVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  // --- NEW STATES ---
  const [streak, setStreak] = useState(0);
  const [lastTapDate, setLastTapDate] = useState("");
  const [achievements, setAchievements] = useState([]);
  const [milestoneMessage, setMilestoneMessage] = useState("");
  // --- LOGIN & COMMUNITY STATES ---
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [communityData, setCommunityData] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [communityUnsubscribe, setCommunityUnsubscribe] = useState(null);
  const [authUnsubscribe, setAuthUnsubscribe] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const t = languages[language];

  useEffect(() => {
    loadData();
    startGlowAnimation();
    setupAuthListener();
    
    // Cleanup on unmount
    return () => {
      if (communityUnsubscribe) {
        communityUnsubscribe();
      }
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, []);

  const setupAuthListener = () => {
    const unsubscribe = apiService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
        
        // Load user data from Firestore
        const result = await apiService.getUserData(firebaseUser.uid);
        if (result.success) {
          loadUserData(result.data);
        }
        
        setupCommunityListener();
      } else {
        setUser(null);
        setIsLoggedIn(false);
        // Reset all data on logout
        setCount(0);
        setTotalCount(0);
        setAchievements([]);
        setStreak(0);
        setLastTapDate("");
      }
    });
    setAuthUnsubscribe(() => unsubscribe);
  };

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const loadData = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("radhaHistory");
      const savedTotal = await AsyncStorage.getItem("radhaTotal");
      const savedBgGradient = await AsyncStorage.getItem("radhaBgGradient");
      const savedImage = await AsyncStorage.getItem("radhaImage");
      const savedLanguage = await AsyncStorage.getItem("radhaLanguage");

      if (savedHistory) {
        const hist = JSON.parse(savedHistory);
        setHistory(hist);
        const todayCount = hist[today] || 0;
        setCount(todayCount);
      }
      if (savedTotal) setTotalCount(parseInt(savedTotal, 10));
      if (savedBgGradient) setBgGradient(JSON.parse(savedBgGradient));
      if (savedImage) setImageUri(savedImage);
      if (savedLanguage) setLanguage(savedLanguage);
    } catch (e) {
      console.log("Error loading data", e);
    }
  };

  const saveData = async (updatedHistory, updatedTotal, updatedBgGradient, updatedImage, updatedLanguage) => {
    try {
      await AsyncStorage.setItem("radhaHistory", JSON.stringify(updatedHistory));
      await AsyncStorage.setItem("radhaTotal", updatedTotal.toString());
      await AsyncStorage.setItem("radhaBgGradient", JSON.stringify(updatedBgGradient));
      if (updatedImage) await AsyncStorage.setItem("radhaImage", updatedImage);
      if (updatedLanguage) await AsyncStorage.setItem("radhaLanguage", updatedLanguage);
    } catch (e) {
      console.log("Error saving data", e);
    }
  };

  const onTap = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const newCount = count + 1;
    const newTotal = totalCount + 1;
    const updatedHistory = { ...history, [today]: newCount };
    let newStreak = streak;
    let streakNotification = "";

    // 🔥 Streak logic
    if (lastTapDate === today) {
      // same day → continue
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().split("T")[0];
      if (lastTapDate === yestStr) {
        newStreak = streak + 1;
        streakNotification = `🔥 ${newStreak} Day Streak! Keep it up! 🙏`;
      } else {
        newStreak = 1; // reset
        streakNotification = "🔥 New streak started! Day 1 🌟";
      }
      setStreak(newStreak);
      setLastTapDate(today);
    }

    // 📿 Check milestone (108 = 1 mala)
    if (newCount % 108 === 0) {
      setMilestoneMessage(`🎉 You completed ${newCount / 108} Mala(s)! Radhe Radhe 🙏`);
      if (!achievements.includes("MalaCompleted")) {
        setAchievements([...achievements, "MalaCompleted"]);
      }
    } else if (streakNotification) {
      setMilestoneMessage(streakNotification);
    }

    // 🌟 Achievements
    if (newTotal >= 1000 && !achievements.includes("1000Japas")) {
      setAchievements([...achievements, "1000Japas"]);
      setMilestoneMessage("🌸 Achievement Unlocked: Vrindavan Seeker (1000 Japas) 🌸");
    }

    // 🏆 Streak achievements
    if (newStreak === 7 && !achievements.includes("7DayStreak")) {
      setAchievements([...achievements, "7DayStreak"]);
      setMilestoneMessage("🏆 Achievement Unlocked: Weekly Devotee (7 Day Streak)! 🏆");
    } else if (newStreak === 30 && !achievements.includes("30DayStreak")) {
      setAchievements([...achievements, "30DayStreak"]);
      setMilestoneMessage("👑 Achievement Unlocked: Monthly Master (30 Day Streak)! 👑");
    }

    setCount(newCount);
    setTotalCount(newTotal);
    setHistory(updatedHistory);

    saveData(updatedHistory, newTotal, bgGradient, imageUri, language);
    
    // Sync with Firebase
    if (isLoggedIn) {
      syncUserData();
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      saveData(history, totalCount, bgGradient, result.assets[0].uri, language);
    }
  };

  const changeGradient = (gradient) => {
    setBgGradient(gradient);
    saveData(history, totalCount, gradient, imageUri, language);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(history).forEach(date => {
      if (history[date] > 0) {
        marked[date] = {
          marked: true,
          dotColor: '#FF6B35',
          customStyles: {
            container: {
              backgroundColor: history[date] > 50 ? '#FFD700' : history[date] > 20 ? '#FFA500' : '#FFE4B5',
              borderRadius: 15,
            },
            text: {
              color: '#8B4513',
              fontWeight: 'bold',
            },
          },
        };
      }
    });
    
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#FF1744',
      };
    }
    
    return marked;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    saveData(history, totalCount, bgGradient, imageUri, newLanguage);
  };

  const resetImage = async () => {
    setImageUri(defaultImageUri);
    await AsyncStorage.removeItem("radhaImage");
  };

  const resetData = async () => {
    try {
      await AsyncStorage.multiRemove(['radhaHistory', 'radhaTotal']);
      setCount(0);
      setTotalCount(0);
      setHistory({});
      setStreak(0);
      setLastTapDate("");
      setAchievements([]);
      setMenuVisible(false);
    } catch (e) {
      console.log('Error resetting data', e);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await apiService.signInWithGoogle();
    
    if (!result.success) {
      alert('Login failed: ' + result.error);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    if (communityUnsubscribe) {
      communityUnsubscribe();
      setCommunityUnsubscribe(null);
    }
    
    const result = await apiService.signOut();
    if (result.success) {
      setMenuVisible(false);
    }
  };

  const setupCommunityListener = () => {
    const unsubscribe = apiService.subscribeToCommunityUpdates((data) => {
      setCommunityData(data.users);
      setTodayTotal(data.todayTotal);
      setAllTimeTotal(data.allTimeTotal);
    });
    setCommunityUnsubscribe(() => unsubscribe);
  };

  const syncUserData = async () => {
    if (user && user.uid) {
      await apiService.updateUserJapa(user.uid, count, totalCount, achievements, streak);
    }
  };

  const loadUserData = async (userData) => {
    if (userData) {
      setCount(userData.todayJapa || 0);
      setTotalCount(userData.totalJapa || 0);
      setAchievements(userData.achievements || []);
      setStreak(userData.streak || 0);
      setLastTapDate(userData.lastActive || "");
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={bgGradient} style={styles.container}>
        {/* Divine Header */}
        <View style={styles.headerContainer}>
          <View style={styles.omContainer}>
            <Text style={styles.omSymbol}>ॐ</Text>
          </View>
          <Text style={styles.heading}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>
              कृष्णाय वासुदेवाय हरये परमात्मने॥{"\n"}
              प्रणत: क्लेशनाशाय गोविंदाय नमो नम:॥
            </Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.centerArea}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Divine Image with Glow Effect */}
          <Animated.View style={[
            styles.imageContainer,
            {
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
            },
          ]}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          </Animated.View>

          {/* Count Display */}
          <View style={styles.countContainer}>
            <Text style={styles.countLabel}>{t.todayCount}</Text>
            <Text style={styles.count}>{count}</Text>
          </View>

          <Text style={styles.hindiLabel}>{t.radheKrishna}</Text>

          {/* Progress bar for Mala */}
          <View style={styles.progressBar}>
            <View style={{ width: `${(count % 108) / 108 * 100}%`, height: 10, backgroundColor: "#FF6B35", borderRadius: 10 }} />
          </View>
          <Text style={{ fontSize: 14, marginTop: 5 }}>Mala Progress: {count % 108}/108</Text>

          {/* Divine Tap Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.tapButton} onPress={onTap} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FF6B35', '#F7931E', '#FFD700']}
                style={styles.tapButtonGradient}
              >
                <Text style={styles.tapButtonText}>{t.tapButton}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Milestone Popup */}
          {milestoneMessage ? (
            <View style={styles.milestonePopup}>
              <Text style={styles.milestoneText}>{milestoneMessage}</Text>
              <TouchableOpacity onPress={() => setMilestoneMessage("")}>
                <Text style={{ color: "blue", marginTop: 5 }}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        {/* Menu Button */}
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <View style={styles.menuButtonContainer}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>

        {/* Divine Menu */}
        <Modal visible={menuVisible} animationType="slide" transparent={true}>
          <View style={styles.menuOverlay}>
            <LinearGradient colors={['#FFF8E1', '#FFFFFF']} style={styles.menuContainer}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>{t.settings}</Text>
                </View>

                {/* Language Selection */}
                <Text style={styles.menuLabel}>{t.language}</Text>
                <View style={styles.languageContainer}>
                  <TouchableOpacity
                    style={[styles.languageButton, language === 'hindi' && styles.languageSelected]}
                    onPress={() => changeLanguage('hindi')}
                  >
                    <Text style={[styles.languageText, language === 'hindi' && styles.languageTextSelected]}>हिंदी</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.languageButton, language === 'english' && styles.languageSelected]}
                    onPress={() => changeLanguage('english')}
                  >
                    <Text style={[styles.languageText, language === 'english' && styles.languageTextSelected]}>English</Text>
                  </TouchableOpacity>
                </View>

                {/* Theme Selection */}
                <Text style={styles.menuLabel}>{t.themes}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gradientRow}>
                  {presetGradients.map((gradient, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.gradientOption}
                      onPress={() => changeGradient(gradient)}
                    >
                      <LinearGradient
                        colors={gradient}
                        style={[
                          styles.gradientCircle,
                          JSON.stringify(bgGradient) === JSON.stringify(gradient) ? styles.gradientSelected : null,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Image Options */}
                <View style={styles.imageOptionsContainer}>
                  <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <LinearGradient colors={['#4CAF50', '#8BC34A']} style={styles.imageButtonGradient}>
                      <Text style={styles.imageButtonText}>{t.changeImage}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageButton} onPress={resetImage}>
                    <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.imageButtonGradient}>
                      <Text style={styles.imageButtonText}>{t.resetImage}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <Text style={styles.statsTitle}>{t.stats}</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t.todayCount}:</Text>
                    <Text style={styles.statValue}>{count}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>{t.totalCount}:</Text>
                    <Text style={styles.statValue}>{totalCount}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🔥 Current Streak:</Text>
                    <Text style={styles.statValue}>{streak} days</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>🏆 Achievements:</Text>
                    <Text style={styles.statValue}>{achievements.length}</Text>
                  </View>
                </View>

                {/* Progress & Achievements Section */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressTitle}>🎯 Progress & Achievements</Text>
                  
                  {/* All Available Achievements */}
                  <View style={styles.achievementsList}>
                    <View style={[styles.achievementItem, achievements.includes("MalaCompleted") && styles.achievementUnlocked]}>
                      <Text style={styles.achievementIcon}>📿</Text>
                      <View style={styles.achievementContent}>
                        <Text style={styles.achievementText}>First Mala Completed</Text>
                        <Text style={styles.achievementDesc}>Complete 108 japas in one session</Text>
                      </View>
                      <Text style={styles.achievementStatus}>
                        {achievements.includes("MalaCompleted") ? "✅" : "🔒"}
                      </Text>
                    </View>

                    <View style={[styles.achievementItem, achievements.includes("1000Japas") && styles.achievementUnlocked]}>
                      <Text style={styles.achievementIcon}>🌸</Text>
                      <View style={styles.achievementContent}>
                        <Text style={styles.achievementText}>Vrindavan Seeker</Text>
                        <Text style={styles.achievementDesc}>Reach 1000 total japas ({totalCount}/1000)</Text>
                      </View>
                      <Text style={styles.achievementStatus}>
                        {achievements.includes("1000Japas") ? "✅" : "🔒"}
                      </Text>
                    </View>

                    <View style={[styles.achievementItem, achievements.includes("7DayStreak") && styles.achievementUnlocked]}>
                      <Text style={styles.achievementIcon}>🏆</Text>
                      <View style={styles.achievementContent}>
                        <Text style={styles.achievementText}>Weekly Devotee</Text>
                        <Text style={styles.achievementDesc}>Maintain 7 day streak</Text>
                      </View>
                      <Text style={styles.achievementStatus}>
                        {achievements.includes("7DayStreak") ? "✅" : "🔒"}
                      </Text>
                    </View>

                    <View style={[styles.achievementItem, achievements.includes("30DayStreak") && styles.achievementUnlocked]}>
                      <Text style={styles.achievementIcon}>👑</Text>
                      <View style={styles.achievementContent}>
                        <Text style={styles.achievementText}>Monthly Master</Text>
                        <Text style={styles.achievementDesc}>Maintain 30 day streak</Text>
                      </View>
                      <Text style={styles.achievementStatus}>
                        {achievements.includes("30DayStreak") ? "✅" : "🔒"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Menu Actions */}
                <TouchableOpacity
                  style={styles.menuButtonLarge}
                  onPress={() => {
                    setCalendarVisible(true);
                    setMenuVisible(false);
                  }}
                >
                  <LinearGradient colors={['#2196F3', '#03A9F4']} style={styles.menuButtonGradient}>
                    <Text style={styles.menuButtonText}>{t.calendar}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuButtonLarge}
                  onPress={() => {
                    setNamesVisible(true);
                    setMenuVisible(false);
                  }}
                >
                  <LinearGradient colors={['#9C27B0', '#E91E63']} style={styles.menuButtonGradient}>
                    <Text style={styles.menuButtonText}>{t.names}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Login/Logout Button */}
                {!isLoggedIn ? (
                  <TouchableOpacity style={styles.menuButtonLarge} onPress={() => { handleGoogleLogin(); setMenuVisible(false); }} disabled={isLoading}>
                    <LinearGradient colors={['#4285F4', '#34A853']} style={styles.menuButtonGradient}>
                      <Text style={styles.menuButtonText}>
                        {isLoading ? 'Connecting...' : '🔐 Login with Google'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.userInfo}>
                      <Text style={styles.welcomeText}>Welcome, {user?.displayName}!</Text>
                    </View>
                    <TouchableOpacity style={styles.menuButtonLarge} onPress={() => { setCommunityVisible(true); setMenuVisible(false); }}>
                      <LinearGradient colors={['#673AB7', '#512DA8']} style={styles.menuButtonGradient}>
                        <Text style={styles.menuButtonText}>{t.community}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButtonLarge} onPress={handleLogout}>
                      <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.menuButtonGradient}>
                        <Text style={styles.menuButtonText}>{t.logout}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.menuButtonLarge} onPress={resetData}>
                  <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.menuButtonGradient}>
                    <Text style={styles.menuButtonText}>{t.reset}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButtonLarge} onPress={() => setMenuVisible(false)}>
                  <LinearGradient colors={['#FF5722', '#F44336']} style={styles.menuButtonGradient}>
                    <Text style={styles.menuButtonText}>{t.close}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
            <TouchableOpacity 
              style={styles.menuRightSpace} 
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
          </View>
        </Modal>

        {/* Divine Calendar */}
        <Modal visible={calendarVisible} animationType="slide" transparent={false}>
          <LinearGradient colors={['#FFF8E1', '#FFFFFF']} style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>{t.calendarTitle}</Text>
            </View>
            <Calendar
              onDayPress={onDayPress}
              markedDates={getMarkedDates()}
              markingType={'custom'}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#FF6B35',
                selectedDayBackgroundColor: '#FF1744',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#FF6B35',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#FF6B35',
                selectedDotColor: '#ffffff',
                arrowColor: '#FF6B35',
                monthTextColor: '#FF1744',
                indicatorColor: '#FF6B35',
                textDayFontWeight: '600',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
              style={styles.calendar}
            />
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>
                {selectedDate ? 
                  `${selectedDate} ${t.dateCount}: ${history[selectedDate] || 0}` : 
                  t.selectDate
                }
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setCalendarVisible(false)}>
              <LinearGradient colors={['#FF5722', '#F44336']} style={styles.closeButtonGradient}>
                <Text style={styles.closeButtonText}>{t.closeButton}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Modal>

        {/* Login Overlay for non-logged users */}
        {!isLoggedIn && (
          <View style={styles.loginOverlay}>
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>🙏 श्री राधे 🙏</Text>
              <Text style={styles.loginSubtitle}>Join the divine community</Text>
              <TouchableOpacity style={styles.googleLoginButton} onPress={handleGoogleLogin} disabled={isLoading}>
                <Text style={styles.googleLoginText}>
                  {isLoading ? 'Connecting...' : '🔐 Continue with Google'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Community Modal */}
        <Modal visible={communityVisible} animationType="slide" transparent={false}>
          <LinearGradient colors={['#FFF8E1', '#FFFFFF']} style={styles.communityContainer}>
            <View style={styles.communityHeader}>
              <Text style={styles.communityTitle}>{t.communityTitle}</Text>
              <View style={styles.totalStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{todayTotal}</Text>
                  <Text style={styles.statLabel}>{t.todayTotal}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{allTimeTotal}</Text>
                  <Text style={styles.statLabel}>{t.allTimeTotal}</Text>
                </View>
              </View>
            </View>
            <ScrollView style={styles.communityList}>
              {communityData.map((userData, index) => (
                <View key={index} style={[styles.userItem, userData.uid === user?.uid && styles.currentUser]}>
                  <View style={styles.userRank}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.userInfoContainer}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userStats}>Today: {userData.todayJapa} | Total: {userData.totalJapa}</Text>
                  </View>
                  {userData.uid === user?.uid && <Text style={styles.youLabel}>You</Text>}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setCommunityVisible(false)}>
              <LinearGradient colors={['#FF5722', '#F44336']} style={styles.closeButtonGradient}>
                <Text style={styles.closeButtonText}>{t.closeButton}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Modal>

        {/* Divine Names Modal */}
        <Modal visible={namesVisible} animationType="slide" transparent={false}>
          <LinearGradient colors={['#FFF8E1', '#FFFFFF']} style={styles.namesContainer}>
            <View style={styles.namesHeader}>
              <Text style={styles.namesTitle}>{t.namesTitle}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.namesScrollContent} showsVerticalScrollIndicator={false}>
              {radhaNames.map((name, index) => (
                <View key={name} style={styles.nameItemContainer}>
                  <View style={styles.nameNumberContainer}>
                    <Text style={styles.nameNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.nameItem}>{name.split('. ')[1]}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setNamesVisible(false)}>
              <LinearGradient colors={['#FF5722', '#F44336']} style={styles.closeButtonGradient}>
                <Text style={styles.closeButtonText}>{t.closeButton}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: screenHeight * 0.01,
    paddingBottom: screenHeight * 0.005,
    paddingHorizontal: screenWidth * 0.05,
  },
  omContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  omSymbol: {
    fontSize: isSmallScreen ? 20 : (isTablet ? 32 : 24),
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: isSmallScreen ? 24 : (isTablet ? 42 : 32),
    fontWeight: "bold",
    textAlign: "center",
    color: "#8B4513",
    fontFamily: "serif",
    textShadowColor: 'rgba(255, 107, 53, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: isSmallScreen ? 12 : (isTablet ? 18 : 14),
    color: '#FF6B35',
    fontStyle: 'italic',
    marginBottom: isSmallScreen ? 5 : 10,
  },
  quoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: isSmallScreen ? 10 : 15,
    marginHorizontal: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quote: {
    fontSize: isSmallScreen ? 12 : (isTablet ? 20 : 16),
    color: "#8B4513",
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: "serif",
    lineHeight: isSmallScreen ? 18 : (isTablet ? 28 : 24),
  },
  centerArea: { 
    flexGrow: 1,
    justifyContent: "space-evenly", 
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: screenHeight * 0.03,
    minHeight: screenHeight * 0.7,
  },
  imageContainer: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 15,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  countContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: isSmallScreen ? 10 : screenHeight * 0.015,
    minWidth: screenWidth * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  countLabel: {
    fontSize: isSmallScreen ? 12 : (isTablet ? 18 : 14),
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 5,
  },
  count: {
    fontSize: isSmallScreen ? Math.min(screenWidth * 0.15, 45) : (isTablet ? 80 : Math.min(screenWidth * 0.18, 65)),
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
    textShadowColor: 'rgba(139, 69, 19, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  hindiLabel: {
    fontSize: isSmallScreen ? Math.min(screenWidth * 0.06, 20) : (isTablet ? 32 : Math.min(screenWidth * 0.07, 28)),
    color: "#8B4513",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "serif",
    textShadowColor: 'rgba(139, 69, 19, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tapButton: {
    borderRadius: 50,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  tapButtonGradient: {
    paddingVertical: isSmallScreen ? 15 : (isTablet ? 25 : 20),
    paddingHorizontal: isSmallScreen ? 40 : (isTablet ? 80 : 60),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapButtonText: {
    color: "white",
    fontSize: isSmallScreen ? 18 : (isTablet ? 28 : 24),
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuButton: {
    position: "absolute",
    top: (StatusBar.currentHeight || 0) + screenHeight * 0.02,
    left: screenWidth * 0.05,
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: isTablet ? 20 : 16,
  },
  menuLine: {
    width: isTablet ? 24 : 20,
    height: 3,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
  },
  menuContainer: {
    width: isTablet ? "60%" : "85%",
    height: "100%",
    padding: screenWidth * 0.05,
    paddingTop: screenHeight * 0.06,
  },
  menuRightSpace: {
    flex: 1,
    height: "100%",
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
    fontFamily: "serif",
  },
  menuLabel: {
    fontSize: isTablet ? 22 : 20,
    marginBottom: 15,
    marginTop: 20,
    fontWeight: "600",
    color: "#FF6B35",
  },
  gradientRow: {
    marginBottom: 20,
  },
  gradientOption: {
    marginRight: 15,
  },
  gradientCircle: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 30 : 25,
    borderWidth: 3,
    borderColor: "transparent",
  },
  gradientSelected: {
    borderColor: "#FF1744",
    borderWidth: 4,
  },
  menuButtonLarge: {
    borderRadius: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonGradient: {
    padding: isTablet ? 18 : 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: isTablet ? 20 : 18,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
  },
  statsTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: isTablet ? 18 : 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  statValue: {
    fontSize: isTablet ? 18 : 16,
    color: '#FF1744',
    fontWeight: 'bold',
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
  },
  calendarHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: screenHeight * 0.05,
  },
  calendarTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: '#8B4513',
    fontFamily: 'serif',
  },
  calendar: {
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: isTablet ? 24 : 22,
    textAlign: "center",
    color: "#FF1744",
    fontWeight: "bold",
  },
  namesContainer: {
    flex: 1,
    padding: 20,
  },
  namesHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: screenHeight * 0.05,
  },
  namesTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#8B4513",
    fontFamily: 'serif',
  },
  namesScrollContent: {
    paddingBottom: 100,
  },
  nameItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nameNumberContainer: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  nameNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nameItem: {
    fontSize: isTablet ? 22 : 20,
    color: "#8B4513",
    fontFamily: "serif",
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    bottom: screenHeight * 0.03,
    left: screenWidth * 0.05,
    right: screenWidth * 0.05,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonGradient: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    padding: 5,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  languageSelected: {
    backgroundColor: '#FF6B35',
  },
  languageText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  languageTextSelected: {
    color: 'white',
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  imageButton: {
    flex: 0.48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtonGradient: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
  },
  milestonePopup: {
    position: "absolute",
    bottom: screenHeight * 0.15,
    left: screenWidth * 0.05,
    right: screenWidth * 0.05,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  milestoneText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
  },
  progressBar: {
    width: "90%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginVertical: 5,
  },
  achievementsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
  },
  achievementsTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  achievementIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  achievementText: {
    fontSize: isTablet ? 16 : 14,
    color: '#8B4513',
    fontWeight: '600',
    flex: 1,
  },
  noAchievements: {
    fontSize: isTablet ? 16 : 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 15,
  },
  progressTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 15,
  },
  achievementsList: {
    gap: 8,
  },
  achievementContent: {
    flex: 1,
    marginLeft: 10,
  },
  achievementDesc: {
    fontSize: isTablet ? 12 : 11,
    color: '#666',
    marginTop: 2,
  },
  achievementStatus: {
    fontSize: 18,
    marginLeft: 10,
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  loginModalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: screenWidth * 0.8,
  },
  loginTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: '#8B4513',
  },
  nameInput: {
    height: 50,
    borderColor: '#FF6B35',
    borderWidth: 2,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  loginButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    paddingHorizontal: 20,
  },
  buttonCancel: {
    backgroundColor: '#FF6B35',
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  communityContainer: {
    flex: 1,
    padding: 20,
  },
  communityHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: screenHeight * 0.05,
  },
  communityTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#8B4513",
    marginBottom: 20,
  },
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: screenWidth * 0.35,
  },
  statNumber: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: '#8B4513',
    marginTop: 5,
  },
  communityList: {
    flex: 1,
    marginVertical: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUser: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  userRank: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  userStats: {
    fontSize: isTablet ? 14 : 12,
    color: '#666',
    marginTop: 2,
  },
  youLabel: {
    backgroundColor: '#4CAF50',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#FF6B35',
    fontSize: 16,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loginOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: screenWidth * 0.8,
  },
  loginTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  googleLoginButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  googleLoginText: {
    color: 'white',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
  },
  userInfoContainer: {
    flex: 1,
  },
});