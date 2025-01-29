import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FontAwesome, Ionicons } from "@expo/vector-icons";

interface Post {
    id: string;
    title: string;
    content: string;
    likes: { userId: string; name: string }[]; // List of users who liked
    author: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
}

const BlogDetails: React.FC = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const api = axios.create({
        baseURL: "http://localhost:5000", // Adjust to your actual backend URL
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get<Post[]>("/posts");
            setPosts(response.data);
        } catch (err) {
            setError("Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    const handleLikeToggle = async (postId: string) => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) {
                Alert.alert("Error", "Authentication required!");
                return;
            }
    
            // Find the post in state
            const updatedPost = data.find((post) => post.id === postId);
            if (!updatedPost) return;
    
            const alreadyLiked = updatedPost.likes.some(like => like.userId === "currentUserId");
    
            // Send the correct request (Like or Unlike)
            let response;
            if (alreadyLiked) {
                response = await api.delete(`/posts/${postId}/like`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await api.post(`/posts/${postId}/like`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
    
            // Update UI
            setData(prevData =>
                prevData.map(post =>
                    post.id === postId ? { ...post, likes: response.data.likes } : post
                )
            );
    
        } catch (error) {
            console.error("Like error:", error);
            Alert.alert("Error", "Failed to like post.");
        }
    };
    const renderPost = (post: Post) => {
        const likes = Array.isArray(post.likes) ? post.likes : [];
        const isLiked = likes.some(like => like.userId === "currentUserId");
    
        return (
            <View style={styles.postContainer} key={post.id}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <View style={styles.postInfo}>
                    <Text style={styles.postedBy}>By {post.author.name}</Text>
                    <Text style={styles.postTime}>{new Date(post.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
    
                {/* Like Button */}
                <TouchableOpacity
                    onPress={() => handleLikeToggle(post.id)}
                    style={[styles.likeButton, isLiked && styles.liked]}
                >
                    <FontAwesome name="thumbs-up" size={20} color="white" />
                    <Text style={styles.likesCount}> {likes.length} Likes</Text>
                </TouchableOpacity>
    
                {/* Show Liked Users */}
                <View style={styles.likesContainer}>
                    {likes.length > 0 ? (
                        <Text style={styles.likesText}>
                            Liked by: {likes.map(like => like.name).join(", ")}
                        </Text>
                    ) : (
                        <Text style={styles.likesText}>No likes yet</Text>
                    )}
                </View>
            </View>
        );
    };
    
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>{posts.map(renderPost)}</ScrollView>

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

                <TouchableOpacity style={styles.navButton} onPress={() => router.push("./createBlog")}>
                    <Ionicons name="pencil" size={28} color="white" />
                    <Text style={styles.navText}>Write</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    contentContainer: { padding: 16, paddingBottom: 80 },
    postContainer: { marginBottom: 20, padding: 15, backgroundColor: "#f8f9fa", borderRadius: 10, borderWidth: 1, borderColor: "#dee2e6" },
    postTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    postInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    postedBy: { color: "#6c757d" },
    postTime: { color: "#6c757d" },
    postContent: { fontSize: 16, lineHeight: 24, marginBottom: 15 },
    actionsContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    likeButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#007BFF", padding: 8, borderRadius: 5 },
    liked: { backgroundColor: "#0056b3" },
    likesCount: { color: "white", fontSize: 16, marginLeft: 8 },
    likesContainer: { marginTop: 10 },
    likesText: { color: "#333", fontStyle: "italic" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    navBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", backgroundColor: "#007BFF", paddingVertical: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
    navButton: { alignItems: "center", flex: 1 },
    navText: { color: "white", fontSize: 14, marginTop: 4 },
});

export default BlogDetails;
