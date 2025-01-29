/*************************************************************
 *  server.js - Single-File Example
 *************************************************************/

import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { body, validationResult } from 'express-validator';
import connectDB from './config/mongodb.js'; // Adjust path if needed

dotenv.config();

// ✅ Ensure CORS allows frontend requests



/*************************************************************
 * 1) MONGOOSE MODELS
 *************************************************************/
const { Schema, model, models } = mongoose;

// Comment Schema
const commentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
});

// Post Schema
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    img: {
      type: String,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: 'Image URL must be a valid URL'
      }
    },
    author: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      name: {
        type: String,
        required: true,
        trim: true
      }
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for full-text search if needed
postSchema.index({ title: 'text', content: 'text' });

// User Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    bio: {
      type: String,
      trim: true
    },
    profilePicture: {
      type: String, // Store a URL or base64
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: 'Profile picture must be a valid URL'
      }
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash the password before saving (pre-save hook)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create models (check if they exist to avoid overwrite in watch mode)
const Post = models.Post || model('Post', postSchema);
const User = models.User || model('User', userSchema);

/*************************************************************
 * 2) AUTH MIDDLEWARE
 *************************************************************/
// This middleware checks for a Bearer token, verifies it, finds the user,
// and attaches it to req.user.

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format (missing Bearer)' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Decode and verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should contain e.g., { userId: "...", iat: ..., exp: ... }
    const userId = decoded.userId; // or decoded._id, depending on how you sign the token

    // Find the user in the DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach the user to the request for later usage
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/*************************************************************
 * 3) EXPRESS APP SETUP
 *************************************************************/
const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: "http://localhost:8081", // ✅ Change to match your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ✅ Allow credentials (tokens, cookies)
  })
);

// Configure CORS (allow from .env ALLOWED_ORIGINS or '*')
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);

/*************************************************************
 * 4) CONNECT TO MONGODB
 *************************************************************/
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

/*************************************************************
 * 5) VALIDATION RULES (express-validator)
 *************************************************************/
const ERROR_MESSAGES = {
  NAME_REQUIRED: 'Name is required',
  EMAIL_REQUIRED: 'Valid email is required',
  PASSWORD_LENGTH: 'Password must be at least 6 characters long',
  PASSWORD_REQUIRED: 'Password is required'
};

const validateRegistration = [
  body('name').trim().notEmpty().withMessage(ERROR_MESSAGES.NAME_REQUIRED),
  body('email').isEmail().normalizeEmail().withMessage(ERROR_MESSAGES.EMAIL_REQUIRED),
  body('password').isLength({ min: 6 }).withMessage(ERROR_MESSAGES.PASSWORD_LENGTH)
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage(ERROR_MESSAGES.EMAIL_REQUIRED),
  body('password').exists().withMessage(ERROR_MESSAGES.PASSWORD_REQUIRED)
];

/*************************************************************
 * 6) AUTH ROUTES: REGISTER, LOGIN
 *************************************************************/

// Register user
app.post('/register', validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login 
  app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2) Compare the provided password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3) Sign a new JWT with the user's ID (or other payload data)
    //    Make sure process.env.JWT_SECRET is set in your .env file
    const token = jwt.sign(
      { userId: user._id },              // Payload
      process.env.JWT_SECRET,           // Secret
      { expiresIn: '1h' }               // Options (e.g. 1 hour expiry)
    );

    // 4) Return the token (and optionally the user info) in JSON response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ error: 'Server error' });
  }
});


/*************************************************************
 * 7) USER PROFILE ROUTES
 *************************************************************/

// Check user (just verifies token & returns user data)
app.get('/user/check', auth, async (req, res) => {
  try {
    // req.user is attached by the auth middleware
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User is authenticated',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get detailed user profile
app.get('/user/profile', auth, async (req, res) => {
  try {
    // The user is available from the auth middleware
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// app.put('/user/profile', async (req, res) => {
//   res.status(200).json({ message: "Route works!" });
// });


// // Update user profile (PUT or PATCH)
app.put('/user/profile', auth, async (req, res) => {
  
 
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.user._id); // Ensure this matches your token payload

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Apply updates
    const { name, email, password, bio, profilePicture } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Delete own profile

app.delete('/user/profile', auth, async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from the auth middleware

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/*************************************************************
 * 8) POSTS ROUTES
 *************************************************************/

// Create a post
app.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, img } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newPost = new Post({
      title,
      content,
      img,
      author: {
        id: user._id,
        name: user.name
      }
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get single post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    console.log('Fetching post with ID:', req.params.id);
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Like a post
app.get('/posts', async (req, res) => {
  try {
      const posts = await Post.find().lean();

      // Ensure every post has a 'likes' array
      const updatedPosts = posts.map(post => ({
          ...post,
          likes: Array.isArray(post.likes) ? post.likes : [],
      }));

      res.json(updatedPosts);
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});
app.patch('/posts/:id/like', auth, async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const userId = req.user._id.toString();

      if (post.likes.some((like) => like.userId === userId)) {
          post.likes = post.likes.filter((like) => like.userId !== userId);
      } else {
          post.likes.push({ userId, name: req.user.name });
      }

      await post.save();
      res.json({ message: "Like updated", post });
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});



app.post('/posts/:id/like', auth, async (req, res) => {
  try {
      const postId = req.params.id;
      const userId = req.user._id;
      const post = await Post.findById(postId);

      if (!post) return res.status(404).json({ message: "Post not found" });

      // Check if user already liked the post
      if (post.likes.some(like => like.userId.toString() === userId.toString())) {
          return res.status(400).json({ message: "Already liked this post" });
      }

      post.likes.push({ userId, name: req.user.name });
      await post.save();

      res.status(200).json({ message: "Liked!", likes: post.likes });
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});


// Unlike a post
app.delete('/posts/:id/like', auth, async (req, res) => {
  try {
      const postId = req.params.id;
      const userId = req.user._id;
      const post = await Post.findById(postId);

      if (!post) return res.status(404).json({ message: "Post not found" });

      // Remove like if it exists
      post.likes = post.likes.filter(like => like.userId.toString() !== userId.toString());
      await post.save();

      res.status(200).json({ message: "Like removed", likes: post.likes });
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});


/*************************************************************
 * 9) COMMENTS ROUTES
 *************************************************************/
// Add comment to a post
app.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Update a comment
app.put('/posts/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Updated comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the owner of the comment
    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.text = text; // Update the comment text
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Delete a comment
app.delete('/posts/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all comments of a post
app.get('/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate('comments.user', 'name');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ comments: post.comments });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

/*************************************************************
 * 10) MISC ROUTES & ERROR HANDLING
 *************************************************************/

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Lingua Learner API!', status: 'healthy' });
});

// Get all users (for admin or debugging)
app.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // omit password
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/*************************************************************
 * 11) START THE SERVER
 *************************************************************/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
