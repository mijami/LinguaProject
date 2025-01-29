import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router"; // Use Expo Router for navigation
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/api";

interface LoginResponse {
  token: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter(); // Use the useRouter hook for navigation
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [isLogin, setIsLogin] = useState(true); // Track whether it's login or signup
  const [loading, setLoading] = useState(false); // Track loading state
  const [message, setMessage] = useState(""); // Track messages for UI

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(""); // Clear any previous messages

    try {
      if (isLogin) {
        // Handle login
        const response = await apiClient.post<LoginResponse>("/login", {
          email: formData.email,
          password: formData.password,
        });

        const token = response.data.token; 
        
         await AsyncStorage.setItem("authToken", token);

  

        setMessage("Login successful!");

        // Navigate to home screen after successful login
        router.push("/homeScreen"); // Correctly navigate to home screen
      } else {
        // Handle signup
        const response = await apiClient.post("/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setIsLogin(true); // Switch to login page after successful registration
        setMessage("User registered successfully! Please login.");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Error during authentication");
      Alert.alert("Error", error.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>

      {/* Conditional rendering for signup */}
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
      />

      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#1a1a1a",
  },
  input: {
    width: "50%",
    padding: 15,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#0066ff",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginVertical: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    color: "#ff3b30",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 14,
  },
  toggleButton: {
    marginTop: 15,
    padding: 10,
  },
  toggleText: {
    color: "#0066ff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoginPage;
