# Lingualearner

_This is a React Native app built with Expo Router, designed to help users learn languages through quizzes, blogs, and video resources._

## 📌 Features
- **User Authentication** (Login & Signup)
- **Home Screen** with Navigation
- **Interactive Quizzes**
- **Profile Management**
- **Language Learning Resources**
- **Blog Reading & Writing**

## 🚀 Installation & Setup
1. **Clone the repository**
    ```sh
    git clone https://github.com/your-repo-name.git
    cd your-project-folder
    ```
2. **Install dependencies**
    ```sh
    npm install
    ```
3. **Start the app**
    ```sh
    npx expo start
    ```

## 🚀 Usage
1. **User Authentication**
    - Users can Login or Sign Up in `login.tsx`.
    - Authentication is stored using `AsyncStorage`.
    - API calls are made using `apiClient` from `/services/api.ts`.

2. **Home Screen (`homeScreen.tsx`)**
    - Displays navigation options:
        - Get Started
        - Read Blogs
        - Write Blog
        - Quizzes
    - Users can logout.

3. **Quizzes (`quizzes.tsx`)**
    - Multiple-choice quizzes to test knowledge.
    - Animated transitions between questions.
    - Tracks user's score.

4. **Get Started (`getStarted.tsx`)**
    - Displays a list of languages for learning.
    - Provides YouTube video links for learning resources.

5. **Profile Management (`changeProfile.tsx`)**
    - Users can edit their profile information.
    - Supports updating bio & social links.
    - Option to delete account.

## 🛠️ Tech Stack
- **React Native (Expo)**
- **TypeScript**
- **AsyncStorage** (for authentication storage)
- **Axios** (for API calls)
- **Expo Router** (for navigation)

## 📌 API Endpoints
- `POST /register` → Sign up a new user.
- `POST /login` → Authenticate user.
- `GET /profile` → Fetch user profile.
- `PUT /profile` → Update profile info.
- `DELETE /profile` → Delete user account.
