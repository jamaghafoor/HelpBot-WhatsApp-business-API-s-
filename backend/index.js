import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/dbConnection.js';
import webhookRoutes from './routes/webhookRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Connection
await connectDB();

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to HelpBot Backend!',
    endpoints: {
      webhook_incoming: 'POST /api/webhook/incoming',
      webhook_status: 'POST /api/webhook/status',
      send_message: 'POST /api/messages/send',
      get_all_users: 'GET /api/users',
      get_user: 'GET /api/users/:identifier',
      get_user_messages: 'GET /api/users/:identifier/messages',
      mark_as_read: 'PATCH /api/users/:identifier/read',
    },
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 HelpBot server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/api/webhook/incoming`);
  console.log(`📋 API Docs: http://localhost:${PORT}`);
});