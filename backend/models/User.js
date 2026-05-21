import mongoose from 'mongoose';

// Individual message schema
const messageSchema = new mongoose.Schema({
  message_id: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'received'],
    default: 'sent',
  },
});

// User schema for the "users" collection
const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: '',
    },
    profile_picture: {
      type: String,
      default: '',
    },
    first_message_at: {
      type: Date,
      default: Date.now,
    },
    last_message_at: {
      type: Date,
      default: Date.now,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    unread_count: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    collection: 'users',
  }
);

const User = mongoose.model('User', userSchema);

export default User;
