import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Animated as RNAnimated, Animated 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Post {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

const HomeScreen: React.FC = () => {
  const router = useRouter(); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const navigation = useNavigation();

  const fadeAnim = useState(new RNAnimated.Value(0))[0];
  const button1Anim = useState(new RNAnimated.Value(0))[0];
  const button2Anim = useState(new RNAnimated.Value(0))[0];

  useEffect(() => {
    RNAnimated.sequence([
      RNAnimated.timing(button1Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      RNAnimated.timing(button2Anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      router.replace("/auth/login"); // Redirect to login screen after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditModalVisible(true);
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    RNAnimated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setEditModalVisible(false));
  };

  return (
    <View style={styles.container}>
      {/* Top Right Buttons */}
      <View style={styles.topButtons}>
  {/* Profile Button */}
  <TouchableOpacity onPress={() => router.push("./changeProfile")} style={styles.iconButton}>
    <Ionicons name="person-circle-outline" size={28} color="black" />
  </TouchableOpacity>

  {/* Logout Button */}
  <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
    <Ionicons name="log-out-outline" size={28} color="black" />
  </TouchableOpacity>
</View>


      {/* Animated Buttons */}
      
      {/* Centered Content */}
      <View style={styles.centerContainer}>
        <Animated.View style={{ opacity: button1Anim }}>
          <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.gradientButton}>
            <TouchableOpacity style={styles.buttonContent} onPress={() => router.push("./getStarted")}>
              <Ionicons name="play-circle" size={50} color="white" />
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: button1Anim }}>
          <LinearGradient colors={['#ff7e5f', '#feb47b']} style={styles.gradientButton}>
            <TouchableOpacity style={styles.buttonContent} onPress={() => router.push("../blog/blogDetails")}>
              <Ionicons name="book" size={50} color="white" />
              <Text style={styles.buttonText}>Read Blogs</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: button1Anim }}>
          <LinearGradient colors={['#43cea2', '#185a9d']} style={styles.gradientButton}>
            <TouchableOpacity style={styles.buttonContent} onPress={() => router.push("../blog/createBlog")}>
              <Ionicons name="pencil" size={50} color="white" />
              <Text style={styles.buttonText}>Write Blog</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>


        <Animated.View style={{ opacity: button1Anim }}>
          <LinearGradient colors={['#43cea2', '#185a9d']} style={styles.gradientButton}>
            <TouchableOpacity style={styles.buttonContent} onPress={() => router.push("./quizzes")}>
              <Ionicons name="help-circle" size={50} color="white" />
              <Text style={styles.buttonText}>Quizzes</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

   


      
        </View>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f4f7' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* Top Right Buttons */
  topButtons: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Add background for visibility
    padding: 5,
    borderRadius: 10,
    zIndex: 10, // Ensure it appears above other elements
  },
  iconButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: "#fff", // Ensure visibility
    borderRadius: 20,
    elevation: 5, // Add shadow for better visibility
  },

  /* Buttons */
  gradientButton: {
    borderRadius: 25,
    marginVertical: 10,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'center',
  },
  profileButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },

  /* Edit Modal */
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: '80%', padding: 20, borderRadius: 20 },
  modalTitle: { fontSize: 20, marginBottom: 10, color: '#fff', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
  textArea: { height: 100 },
  button: { backgroundColor: "#2196F3", padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: '600' },
});

export default HomeScreen;
