import axios from 'axios';

// Create Axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // Ensure this matches your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

/**
 * Extracts and formats error messages from API responses.
 */
const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  return error.response?.data?.message || 'An error occurred, please try again.';
};

// -------------------------- Authentication APIs --------------------------

/**
 * Logs in a user.
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/login', { email, password });
    return response.data; // { token: string }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Registers a new user.
 */
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await apiClient.post('/register', { name, email, password });
    return response.data; // { message: string }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Sets the authentication token in headers for protected routes.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token); // Persist token in localStorage
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

/**
 * Logs out the user by clearing the authentication token.
 */
export const logoutUser = () => {
  setAuthToken(null);
};

// -------------------------- User Profile APIs --------------------------

/**
 * Interface for updating the user profile.
 */
interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
  profilePicture?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

/**
 * Updates the logged-in user's profile.
 */
export const updateUserProfile = async (token: string, profileData: UpdateProfileRequest) => {
  try {
    const response = await apiClient.put('/user/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { message: string, user: object }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};


/**
 * Fetches the logged-in user's profile data.
 */
export const fetchUserProfile = async (token: string) => {
  try {
    const response = await apiClient.get('/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { user: object }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

// -------------------------- Blog APIs --------------------------

/**
 * Creates a new blog post.
 */
export const createPost = async (token: string, postData: any) => {
  try {
    const response = await apiClient.post('/posts', postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { message: string, post: object }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetches all blog posts.
 */
export const fetchAllPosts = async () => {
  try {
    const response = await apiClient.get('/posts');
    return response.data; // { posts: array }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Fetches details of a single blog post by ID.
 */
export const fetchPostDetails = async (postId: string) => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data; // { post: object }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Deletes a blog post.
 */
export const deletePost = async (token: string, postId: string) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { message: string }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};


export const deleteUserProfile = async (token: string) => {
  try {
    const response = await apiClient.delete('/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // { message: "Profile deleted successfully" }
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};