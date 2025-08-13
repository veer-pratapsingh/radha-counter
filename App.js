import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Button,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth > 768;
const isSmallScreen = screenHeight < 700;
const imageSize = isSmallScreen ? Math.min(screenWidth * 0.45, 180) : Math.min(screenWidth * 0.6, screenHeight * 0.25, 220);

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
  "1. राधा",
  "2. रासेश्वरी",
  "3. रम्या",
  "4. कृष्णमत्राधिदेवता",
  "5. सर्वाद्या",
  "6. सर्ववंद्या",
  "7. वृंदावनविहारिणी",
  "8. वृंदाराधा",
  "9. रमा",
  "10. अशेषगोपीमंडलपूजिता",
  "11. सत्या",
  "12. सत्यपरा",
  "13. सत्यभामा",
  "14. श्रीकृष्णवल्लभा",
  "15. वृषभानुसुता",
  "16. गोपी",
  "17. मूल प्रकृति",
  "18. ईश्वरी",
  "19. गान्धर्वा",
  "20. राधिका",
  "21. राम्या",
  "22. रुक्मिणी",
  "23. परमेश्वरी",
  "24. परात्परतरा",
  "25. पूर्णा",
  "26. पूर्णचन्द्रविमानना",
  "27. भुक्ति-मुक्तिप्रदा",
  "28. भवव्याधि-विनाशिनी",
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
    divineImage: "📸 Divine Image",
    stats: "📊 आपकी साधना",
    calendar: "📅 Calendar",
    names: "🌸 28 Names",
    close: "❌ Close",
    calendarTitle: "📅 साधना कैलेंडर",
    selectDate: "📅 तारीख चुनें",
    dateCount: "को जाप",
    namesTitle: "🌸 श्री राधा रानी के 28 नाम 🌸",
    closeButton: "बंद करें",
    language: "🌐 भाषा"
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
    divineImage: "📸 Divine Image",
    stats: "📊 Your Sadhana",
    calendar: "📅 Calendar",
    names: "🌸 28 Names",
    close: "❌ Close",
    calendarTitle: "📅 Sadhana Calendar",
    selectDate: "📅 Select Date",
    dateCount: "Japa Count",
    namesTitle: "🌸 Shri Radha Rani's 28 Names 🌸",
    closeButton: "Close",
    language: "🌐 Language"
  }
};

export default function App() {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [bgGradient, setBgGradient] = useState(["#FFE0B2", "#FFCCBC", "#FFF3E0"]);
  const [imageUri, setImageUri] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/6/65/Radha_Rani.jpg"
  );
  const [history, setHistory] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [namesVisible, setNamesVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [language, setLanguage] = useState("hindi");
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const today = new Date().toISOString().split("T")[0];
  const t = languages[language];

  useEffect(() => {
    loadData();
    startGlowAnimation();
  }, []);

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
        // Always use today's date for current count
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
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newCount = count + 1;
    const newTotal = totalCount + 1;
    const updatedHistory = { ...history, [today]: newCount };

    setCount(newCount);
    setTotalCount(newTotal);
    setHistory(updatedHistory);

    saveData(updatedHistory, newTotal, bgGradient, imageUri, language);
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

        <View style={styles.centerArea}>
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
            <Text style={styles.totalLabel}>{t.totalCount}: {totalCount}</Text>
          </View>

          <Text style={styles.hindiLabel}>{t.radheKrishna}</Text>

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
        </View>

        {/* Floating Menu Button */}
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <LinearGradient colors={['#FF1744', '#E91E63']} style={styles.menuButtonGradient}>
            <Text style={styles.menuText}>⚙️</Text>
          </LinearGradient>
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

                {/* Divine Image */}
                <TouchableOpacity style={styles.menuButtonLarge} onPress={pickImage}>
                  <LinearGradient colors={['#4CAF50', '#8BC34A']} style={styles.menuButtonGradient}>
                    <Text style={styles.menuButtonText}>{t.divineImage}</Text>
                  </LinearGradient>
                </TouchableOpacity>

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

                <TouchableOpacity style={styles.menuButtonLarge} onPress={() => setMenuVisible(false)}>
                  <LinearGradient colors={['#FF5722', '#F44336']} style={styles.menuButtonGradient}>
                    <Text style={styles.menuButtonText}>{t.close}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
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
    paddingTop: isSmallScreen ? screenHeight * 0.005 : screenHeight * 0.01,
    paddingBottom: isSmallScreen ? 0 : screenHeight * 0.005,
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
    flex: 1, 
    justifyContent: isSmallScreen ? "space-around" : "space-evenly", 
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.05,
    paddingVertical: isSmallScreen ? screenHeight * 0.01 : screenHeight * 0.02,
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
    fontSize: isSmallScreen ? Math.min(screenWidth * 0.2, 60) : (isTablet ? 120 : Math.min(screenWidth * 0.25, 90)),
    fontWeight: "bold",
    color: "#FF1744",
    textAlign: "center",
    textShadowColor: 'rgba(255, 23, 68, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  totalLabel: {
    fontSize: isSmallScreen ? 10 : (isTablet ? 16 : 12),
    color: '#8B4513',
    fontWeight: '500',
    marginTop: 5,
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
    borderRadius: 25,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  menuButtonGradient: {
    padding: isTablet ? 15 : 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { 
    color: "white", 
    fontSize: isTablet ? 24 : 20, 
    fontWeight: "bold"
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    width: isTablet ? "60%" : "85%",
    height: "100%",
    padding: screenWidth * 0.05,
    paddingTop: screenHeight * 0.06,
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
});