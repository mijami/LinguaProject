import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateUserProfile, deleteUserProfile } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const ProfileEdit: React.FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({ linkedin: "", github: "", portfolio: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ Fetch user profile data when component mounts
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;
        
        const response = await updateUserProfile(token, {}); // Fetch user details
        const { user } = response;
        
        setName(user.name);
        setBio(user.bio || "");
        setSocialLinks({
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          portfolio: user.socialLinks?.portfolio || "",
        });
      } catch (error: any) {
        setError("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("You must be logged in!");

      if (newPassword && newPassword !== confirmPassword) {
        throw new Error("Passwords do not match!");
      }

      const profileData = { name, bio, socialLinks, password: newPassword };
      const response = await updateUserProfile(token, profileData);

      setMessage("Profile updated successfully!");
      setError("");
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message);
      setMessage("");
    }
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("You must be logged in!");

      Alert.alert("Delete Profile", "Are you sure you want to delete your profile?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteUserProfile(token);
            await AsyncStorage.removeItem("authToken");
            router.push("/auth/login");
          },
          style: "destructive",
        },
      ]);
    } catch (error: any) {
      setError(error.message);
      setMessage("");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{isEditing ? "Edit Profile" : "My Profile"}</Text>
      </View>

      {/* Messages */}
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
      {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

      {/* Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        ) : (
          <Text style={styles.text}>{name}</Text>
        )}
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.label}>Bio:</Text>
        {isEditing ? (
          <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} multiline />
        ) : (
          <Text style={styles.text}>{bio}</Text>
        )}
      </View>

      {/* Social Links */}
      <View style={styles.section}>
        <Text style={styles.label}>Social Links:</Text>
        {isEditing ? (
          <>
            <TextInput style={styles.input} placeholder="LinkedIn URL" value={socialLinks.linkedin} onChangeText={(text) => setSocialLinks({ ...socialLinks, linkedin: text })} />
            <TextInput style={styles.input} placeholder="GitHub URL" value={socialLinks.github} onChangeText={(text) => setSocialLinks({ ...socialLinks, github: text })} />
            <TextInput style={styles.input} placeholder="Portfolio URL" value={socialLinks.portfolio} onChangeText={(text) => setSocialLinks({ ...socialLinks, portfolio: text })} />
          </>
        ) : (
          <View>
            {socialLinks.linkedin && <Text style={styles.link} onPress={() => window.open(socialLinks.linkedin)}>LinkedIn</Text>}
            {socialLinks.github && <Text style={styles.link} onPress={() => window.open(socialLinks.github)}>GitHub</Text>}
            {socialLinks.portfolio && <Text style={styles.link} onPress={() => window.open(socialLinks.portfolio)}>Portfolio</Text>}
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  text: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "#e6e6e6",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  editButton: {
    flex: 1,
    backgroundColor: "#555",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProfileEdit;
