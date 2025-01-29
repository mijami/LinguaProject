import { 
  StyleSheet, 
  Image, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Linking, 
  View,
  Text
} from "react-native";
import { useState } from "react";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Collapsible from "react-native-collapsible";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function getStarted() {
  const [search, setSearch] = useState("");
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const router = useRouter();

  const languages = [
    "English", "Spanish", "Bangla", "French", "German", "Chinese", "Japanese", "Korean",
    "Italian", "Portuguese", "Russian", "Arabic", "Hindi", "Bengali", "Punjabi",
    "Javanese", "Vietnamese", "Telugu", "Marathi", "Tamil", "Urdu", "Turkish",
    "Gujarati", "Polish", "Ukrainian", "Persian", "Malay", "Swahili", "Dutch",
    "Greek", "Czech", "Romanian", "Hungarian", "Finnish", "Swedish", "Norwegian",
    "Danish", "Hebrew", "Thai", "Indonesian", "Catalan", "Slovak", "Bulgarian",
    "Croatian", "Serbian", "Lithuanian", "Latvian", "Estonian", "Basque",
    "Galician", "Icelandic", "Maltese", "Slovenian", "Filipino", "Malayalam",
    "Kannada", "Oriya", "Sinhala", "Burmese", "Khmer", "Lao", "Amharic",
    "Somali", "Yoruba", "Igbo", "Hausa", "Zulu", "Xhosa", "Afrikaans", "Maori",
    "Welsh", "Scottish Gaelic", "Irish", "Breton", "Corsican", "Luxembourgish",
    "Macedonian", "Albanian", "Belarusian", "Georgian", "Armenian", "Azerbaijani",
    "Kazakh", "Uzbek", "Tamil", "Nepali", "Pashto", "Sindhi", "Kurdish",
    "Malayalam", "Shona", "Tswana", "Tatar", "Uighur", "Bhojpuri"
  ];

  const filteredLanguages = languages.filter((lang) =>
    lang.toLowerCase().includes(search.toLowerCase())
  );

  const handleLanguagePress = (language: string) => {
    setActiveSections((prevSections) =>
      prevSections.includes(language)
        ? prevSections.filter((section) => section !== language)
        : [...prevSections, language]
    );
  };

  const handleCoursePress = (language: string) => {
    const query = encodeURIComponent(`${language} learning course`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <Image
            source={{
              uri: "https://miro.medium.com/v2/resize:fit:828/format:webp/1*D_HWO2OrvucTNcyBsV__tQ.jpeg",
            }} // Replace with your image URL
            style={styles.headerImage}
          />
        }
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText>Back</ThemedText>
        </TouchableOpacity>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Learn With Youtube</ThemedText>
        </ThemedView>
        <TextInput
          style={styles.searchInput}
          placeholder="Search language"
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View>
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => handleLanguagePress(item)}
              >
                <ThemedText>{item}</ThemedText>
              </TouchableOpacity>
              <Collapsible collapsed={!activeSections.includes(item)}>
                <TouchableOpacity
                  style={styles.courseOption}
                  onPress={() => handleCoursePress(item)}
                >
                  <ThemedText>Start {item} Course</ThemedText>
                </TouchableOpacity>
              </Collapsible>
            </View>
          )}
        />
      </ParallaxScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("./homeScreen")}>
          <Ionicons name="home" size={28} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("../blog/blogDetails")}>
          <FontAwesome name="book" size={28} color="white" />
          <Text style={styles.navText}>Read</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("../blog/createBlog")}>
          <Ionicons name="pencil" size={28} color="white" />
          <Text style={styles.navText}>Write</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 5,
    left: 5,
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 8,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    height: 40,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 16,
  },
  languageOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  courseOption: {
    padding: 12,
    backgroundColor: "#F0F0F0",
  },

  /* Bottom Navigation Bar */
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  navButton: {
    alignItems: "center",
    flex: 1,
  },
  navText: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
  },
});
