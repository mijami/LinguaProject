import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import apiClient from "../services/api";

const CreateBlog: React.FC = () => {
  const [formData, setFormData] = useState({ 
    title: "", 
    content: "",
    author: "",
    tags: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (value: string, name: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert("Error", "Title and Content are required!");
      return;
    }
  
    setLoading(true);
  
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token:", token); // Debug token
      if (!token) {
        Alert.alert("Error", "Authentication required!");
        setLoading(false);
        return;
      }
  
      // Prepare blog post data
      const postData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : [],
      };
  
      console.log("Submitting Blog:", postData); // Debug payload
  
      // Send request to backend
      const response = await apiClient.post("/posts", postData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Response:", response.data); // Debug response
  
      Alert.alert("Success", "Blog post created successfully!");
      router.replace("/blog/blogDetails");
    } catch (error: any) {
      console.error("Error creating blog:", error.response?.data || error);
      Alert.alert("Error", error.response?.data?.error || "Failed to create blog post");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Create a New Blog</Text>

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter blog title..."
              value={formData.title}
              onChangeText={(value) => handleChange(value, "title")}
            />
          </View>

          {/* Content Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Write your blog content..."
              value={formData.content}
              onChangeText={(value) => handleChange(value, "content")}
              multiline
              numberOfLines={8}
            />
          </View>

          

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Blog</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/homeScreen")}>
          <Ionicons name="home" size={28} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("../(tabs)/quizzes")}>
          <Ionicons name="help-circle" size={28} color="white" />
          <Text style={styles.navText}>Quizzes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/blog/blogDetails")}>
          <Ionicons name="book" size={28} color="white" />
          <Text style={styles.navText}>Blogs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flexContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80, // Prevents overlap with navbar
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
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

export default CreateBlog;
