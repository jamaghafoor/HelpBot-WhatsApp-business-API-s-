import User from '../models/User.js';

/**
 * Get all users (chat list)
 * GET /api/users
 */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find()
      .slice('messages', -1) // Fetch only the last message from the messages array
      .sort({ last_message_at: -1 })
      .lean();

    // Add a last_message property to the returned user objects for easier frontend consumption
    const formattedUsers = users.map(user => {
      const lastMsg = user.messages && user.messages.length > 0 ? user.messages[0] : null;
      return {
        ...user,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      data: formattedUsers,
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
}

/**
 * Get a specific user by user_id or phone
 * GET /api/users/:identifier
 * :identifier can be user_id (e.g., "user_923001234567") or phone (e.g., "+923001234567")
 */
export async function getUserByIdentifier(req, res) {
  try {
    const { identifier } = req.params;

    let user;

    // Check if identifier looks like a phone number (starts with + or digit)
    if (identifier.startsWith('+') || /^\d/.test(identifier)) {
      user = await User.findOne({ phone: identifier });
    } else {
      // Otherwise treat it as user_id
      user = await User.findOne({ user_id: identifier });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with identifier: ${identifier}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
}

/**
 * Get messages for a specific user
 * GET /api/users/:identifier/messages
 */
export async function getUserMessages(req, res) {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 50 } = req.query;

    let user;

    if (identifier.startsWith('+') || /^\d/.test(identifier)) {
      user = await User.findOne({ phone: identifier });
    } else {
      user = await User.findOne({ user_id: identifier });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with identifier: ${identifier}`,
      });
    }

    // Paginate messages (newest first)
    const totalMessages = user.messages.length;
    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = totalMessages - (page - 1) * limit;
    const paginatedMessages = user.messages.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      user_id: user.user_id,
      phone: user.phone,
      name: user.name,
      total_messages: totalMessages,
      page: Number(page),
      limit: Number(limit),
      data: paginatedMessages,
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
}

/**
 * Mark user messages as read (reset unread count)
 * PATCH /api/users/:identifier/read
 */
export async function markAsRead(req, res) {
  try {
    const { identifier } = req.params;

    let query;
    if (identifier.startsWith('+') || /^\d/.test(identifier)) {
      query = { phone: identifier };
    } else {
      query = { user_id: identifier };
    }

    const user = await User.findOneAndUpdate(
      query,
      { $set: { unread_count: 0 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with identifier: ${identifier}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: { user_id: user.user_id, unread_count: user.unread_count },
    });
  } catch (error) {
    console.error('❌ Error marking as read:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
      error: error.message,
    });
  }
}
