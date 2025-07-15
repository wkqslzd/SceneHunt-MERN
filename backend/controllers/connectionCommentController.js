const ConnectionComment = require('../models/ConnectionComment');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');

// Recursively get all replies of a comment
async function getReplies(commentId) {
  const replies = await ConnectionComment.find({ parentId: commentId })
    .populate('userId', 'username nickname avatar')
    .sort({ createdAt: 1 });

  // Recursively get all replies of each reply
  const repliesWithNestedReplies = await Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await getReplies(reply._id);
      return {
        ...reply.toObject(),
        replies: nestedReplies
      };
    })
  );

  return repliesWithNestedReplies;
}

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { connectionId, content, parentId } = req.body;
    const userId = req.user.userId;

    // Check if the connection exists
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // If it's a reply, check if the parent comment exists
    if (parentId) {
      const parentComment = await ConnectionComment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      // Ensure the parent comment belongs to the same connection
      if (parentComment.connectionId.toString() !== connectionId) {
        return res.status(400).json({ message: 'Parent comment does not belong to this connection' });
      }
    }

    // Create new comment
    const comment = new ConnectionComment({
      connectionId,
      userId,
      content,
      parentId
    });

    await comment.save();

    // Return the full comment information
    const populatedComment = await ConnectionComment.findById(comment._id)
      .populate('userId', 'username nickname avatar')
      .populate('parentId');

    res.status(201).json({
      message: 'Comment created successfully',
      data: populatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all comments of a connection
exports.getConnectionComments = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Check if the connection exists
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Get all root comments (excluding replies)
    const rootComments = await ConnectionComment.find({
      connectionId,
      parentId: null
    })
    .populate('userId', 'username nickname avatar')
    .sort({ createdAt: -1 });

    // Get all nested replies of each root comment
    const commentsWithNestedReplies = await Promise.all(
      rootComments.map(async (comment) => {
        const replies = await getReplies(comment._id);
        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.json({
      message: 'Comments retrieved successfully',
      data: commentsWithNestedReplies
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const comment = await ConnectionComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the comment author
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await ConnectionComment.findById(commentId)
      .populate('userId', 'username nickname avatar')
      .populate('parentId');

    res.json({
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await ConnectionComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the comment author
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment and all its replies
    await ConnectionComment.deleteMany({ parentId: commentId });
    await comment.deleteOne();

    res.json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}; 