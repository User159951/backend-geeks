import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

import authRoutes from '../routes/auth.routes.js';
import postRoutes from '../routes/post.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// MongoDB connection outside of handler to avoid reconnecting on each request
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connecté');
    isConnected = true;
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err);
  }
};

// Attach DB connection before each request
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

export const handler = serverless(app);
