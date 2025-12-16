import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mood-garden', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Mongoose Schemas & Models
const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['amazing', 'happy', 'okay', 'sad', 'anxious']
  },
  plant: {
    type: String,
    required: true
  },
  journal: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  streak: {
    type: Number,
    default: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
const User = mongoose.model('User', userSchema);

// Helper function to calculate streak
const calculateStreak = async (userId) => {
  const user = await User.findOne({ userId });
  if (!user) return 0;

  const lastEntry = user.lastEntryDate;
  if (!lastEntry) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastEntryDay = new Date(lastEntry);
  lastEntryDay.setHours(0, 0, 0, 0);

  const diffTime = today - lastEntryDay;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // If last entry was today or yesterday, keep streak, otherwise reset
  if (diffDays > 1) {
    user.streak = 0;
    await user.save();
    return 0;
  }

  return user.streak;
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mood Garden API is running',
    timestamp: new Date().toISOString()
  });
});

// Get user's streak
app.get('/api/users/:userId/streak', async (req, res) => {
  try {
    const { userId } = req.params;
    const streak = await calculateStreak(userId);
    
    res.json({ streak });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

// Get user's garden (all mood entries)
app.get('/api/users/:userId/garden', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    const entries = await MoodEntry
      .find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching garden:', error);
    res.status(500).json({ error: 'Failed to fetch garden' });
  }
});

// Get mood history with pagination
app.get('/api/users/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const entries = await MoodEntry
      .find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MoodEntry.countDocuments({ userId });
    
    res.json({ 
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Create a new mood entry
app.post('/api/users/:userId/entries', async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, plant, journal } = req.body;

    // Validate input
    if (!mood || !plant) {
      return res.status(400).json({ error: 'Mood and plant are required' });
    }

    // Create mood entry
    const entry = new MoodEntry({
      userId,
      mood,
      plant,
      journal: journal || ''
    });

    await entry.save();

    // Update user streak
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = new User({ userId, streak: 1, lastEntryDate: new Date() });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastEntryDay = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
      if (lastEntryDay) {
        lastEntryDay.setHours(0, 0, 0, 0);
      }

      const diffTime = lastEntryDay ? today - lastEntryDay : null;
      const diffDays = diffTime ? diffTime / (1000 * 60 * 60 * 24) : null;

      if (diffDays === 0) {
        // Already logged today, don't increment streak
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        user.streak += 1;
      } else {
        // Streak broken, reset to 1
        user.streak = 1;
      }

      user.lastEntryDate = new Date();
    }

    await user.save();

    res.status(201).json({ 
      entry,
      streak: user.streak
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// Get mood statistics
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId,
      date: { $gte: dateFrom }
    });

    const stats = {
      total: entries.length,
      byMood: {},
      recentEntries: entries.length
    };

    entries.forEach(entry => {
      stats.byMood[entry.mood] = (stats.byMood[entry.mood] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete a mood entry
app.delete('/api/users/:userId/entries/:entryId', async (req, res) => {
  try {
    const { userId, entryId } = req.params;

    const entry = await MoodEntry.findOneAndDelete({
      _id: entryId,
      userId
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;