import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          console.log("User is logged in, token:", token);
          router.replace("/homeScreen"); // Redirect to dashboard if token exists
        } else {
          setLoading(false); // Show button if no token
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
        setLoading(false);
      }
    };

    checkUserToken();
  }, []);

  const handleNavigation = async () => {
    setLoading(true);
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{ uri: "https://miro.medium.com/v2/resize:fit:828/format:webp/1*D_HWO2OrvucTNcyBsV__tQ.jpeg" }} // Replace with your actual image
        style={styles.image}
      />
      <Text style={styles.title}>Welcome to Lingua Learner!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleNavigation}
        accessible={true}
        accessibilityLabel="Start Learning"
      >
        <Text style={styles.buttonText}>Let's Start</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f4f4f4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default IndexPage;
