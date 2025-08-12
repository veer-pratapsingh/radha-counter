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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth > 768;
const imageSize = Math.min(screenWidth * 0.7, screenHeight * 0.35, 300);

const presetColors = [
  "#fffaf0",
  "#ffe4e1",
  "#f0fff0",
  "#e0f7fa",
  "#fff3e0",
  "#ede7f6",
  "#fce4ec",
  "#e1f5fe",
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

export default function App() {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [bgColor, setBgColor] = useState("#fffaf0");
  const [imageUri, setImageUri] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/6/65/Radha_Rani.jpg"
  );
  const [history, setHistory] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [namesVisible, setNamesVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem("radhaHistory");
      const savedTotal = await AsyncStorage.getItem("radhaTotal");
      const savedBgColor = await AsyncStorage.getItem("radhaBgColor");
      const savedImage = await AsyncStorage.getItem("radhaImage");

      if (savedHistory) {
        const hist = JSON.parse(savedHistory);
        setHistory(hist);
        setCount(hist[today] || 0);
      }
      if (savedTotal) setTotalCount(parseInt(savedTotal, 10));
      if (savedBgColor) setBgColor(savedBgColor);
      if (savedImage) setImageUri(savedImage);
    } catch (e) {
      console.log("Error loading data", e);
    }
  };

  const saveData = async (updatedHistory, updatedTotal, updatedBgColor, updatedImage) => {
    try {
      await AsyncStorage.setItem("radhaHistory", JSON.stringify(updatedHistory));
      await AsyncStorage.setItem("radhaTotal", updatedTotal.toString());
      await AsyncStorage.setItem("radhaBgColor", updatedBgColor);
      if (updatedImage) await AsyncStorage.setItem("radhaImage", updatedImage);
    } catch (e) {
      console.log("Error saving data", e);
    }
  };

  const onTap = () => {
    const newCount = count + 1;
    const newTotal = totalCount + 1;
    const updatedHistory = { ...history, [today]: newCount };

    setCount(newCount);
    setTotalCount(newTotal);
    setHistory(updatedHistory);

    saveData(updatedHistory, newTotal, bgColor, imageUri);
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
      saveData(history, totalCount, bgColor, result.assets[0].uri);
    }
  };

  const changeColor = (color) => {
    setBgColor(color);
    saveData(history, totalCount, color, imageUri);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Heading and Quote */}
      <View>
        <Text style={styles.heading}>Shri Radha Rani</Text>
        <Text style={styles.quote}>
          कृष्णाय वासुदेवाय हरये परमात्मने॥{"\n"}
          प्रणत: क्लेशनाशाय गोविंदाय नमो नम:॥
        </Text>
      </View>

      <View style={styles.centerArea}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.hindiLabel}>राधाकृष्ण</Text>

        {/* Tap Button */}
        <TouchableOpacity style={styles.tapButton} onPress={onTap} activeOpacity={0.7}>
          <Text style={styles.tapButtonText}>Tap Here</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      {/* Side Menu */}
      <Modal visible={menuVisible} animationType="slide" transparent={true}>
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <ScrollView>
              <Text style={styles.menuTitle}>Settings</Text>

              {/* Background Color */}
              <Text style={styles.menuLabel}>Change Background Color</Text>
              <View style={styles.colorRow}>
                {presetColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      bgColor === color ? styles.colorSelected : null,
                    ]}
                    onPress={() => changeColor(color)}
                  />
                ))}
              </View>

              {/* Change Image */}
              <TouchableOpacity style={styles.menuButtonLarge} onPress={pickImage}>
                <Text style={styles.menuButtonText}>Choose Image from Gallery</Text>
              </TouchableOpacity>

              {/* Show total count */}
              <Text style={[styles.menuLabel, { marginTop: 30 }]}>Total Taps: {totalCount}</Text>

              {/* Open Calendar */}
              <TouchableOpacity
                style={styles.menuButtonLarge}
                onPress={() => {
                  setCalendarVisible(true);
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuButtonText}>View Calendar</Text>
              </TouchableOpacity>

              {/* Radha Rani 28 Names */}
              <TouchableOpacity
                style={styles.menuButtonLarge}
                onPress={() => {
                  setNamesVisible(true);
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuButtonText}>Radha Rani 28 Names</Text>
              </TouchableOpacity>

              {/* Close Menu */}
              <TouchableOpacity style={styles.menuButtonLarge} onPress={() => setMenuVisible(false)}>
                <Text style={[styles.menuButtonText, { color: "red" }]}>Close Menu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal */}
      <Modal visible={calendarVisible} animationType="slide" transparent={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "#d81b60" },
            }}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.selectedDateText}>
            {selectedDate ? `Taps on ${selectedDate}: ${history[selectedDate] || 0}` : "Select a date"}
          </Text>
          <Button title="Close Calendar" onPress={() => setCalendarVisible(false)} />
        </View>
      </Modal>

      {/* Radha Rani 28 Names Modal */}
      <Modal visible={namesVisible} animationType="slide" transparent={false}>
        <View style={styles.namesContainer}>
          <Text style={styles.namesTitle}>Radha Rani 28 Names</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {radhaNames.map((name) => (
              <Text key={name} style={styles.nameItem}>
                {name}
              </Text>
            ))}
          </ScrollView>
          <Button title="Close" onPress={() => setNamesVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: screenHeight * 0.06,
    marginBottom: 5,
    color: "#d81b60",
    fontFamily: "serif",
  },
  quote: {
    fontSize: isTablet ? 22 : 18,
    color: "#6a1b9a",
    fontStyle: "italic",
    textAlign: "center",
    marginHorizontal: screenWidth * 0.05,
    marginBottom: screenHeight * 0.02,
    fontFamily: "serif",
  },
  centerArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: {
    width: imageSize,
    height: imageSize,
    marginBottom: 20,
    borderRadius: 15,
  },
  count: {
    fontSize: isTablet ? 100 : Math.min(screenWidth * 0.2, 80),
    fontWeight: "bold",
    color: "#d81b60",
    textAlign: "center",
  },
  hindiLabel: {
    fontSize: isTablet ? 34 : Math.min(screenWidth * 0.07, 28),
    color: "#880e4f",
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "serif",
  },
  tapButton: {
    marginTop: screenHeight * 0.03,
    backgroundColor: "#d81b60",
    paddingVertical: isTablet ? 25 : 20,
    paddingHorizontal: isTablet ? 80 : 60,
    borderRadius: 50,
    elevation: 3,
  },
  tapButtonText: {
    color: "white",
    fontSize: isTablet ? 26 : 22,
    fontWeight: "bold",
  },
  menuButton: {
    position: "absolute",
    top: screenHeight * 0.06,
    left: screenWidth * 0.05,
    backgroundColor: "#d81b60",
    padding: isTablet ? 15 : 10,
    borderRadius: 25,
  },
  menuText: { color: "white", fontSize: isTablet ? 28 : 24, fontWeight: "bold" },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    backgroundColor: "white",
    width: isTablet ? "60%" : "80%",
    height: "100%",
    padding: screenWidth * 0.05,
    paddingTop: screenHeight * 0.06,
  },
  menuTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  menuLabel: {
    fontSize: isTablet ? 20 : 18,
    marginBottom: 10,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  colorCircle: {
    width: isTablet ? 44 : 36,
    height: isTablet ? 44 : 36,
    borderRadius: isTablet ? 22 : 18,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSelected: {
    borderColor: "#d81b60",
    borderWidth: 3,
  },
  menuButtonLarge: {
    backgroundColor: "#d81b60",
    padding: isTablet ? 18 : 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  menuButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: isTablet ? 18 : 16,
  },
  calendarContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fffaf0",
  },
  selectedDateText: {
    fontSize: isTablet ? 22 : 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#d81b60",
    fontWeight: "600",
  },
  namesContainer: {
    flex: 1,
    padding: 40,
    backgroundColor: "#fffaf0",
  },
  namesTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#d81b60",
  },
  nameItem: {
    fontSize: isTablet ? 20 : 18,
    marginBottom: 12,
    color: "#4a148c",
    fontFamily: "serif",
  },
});