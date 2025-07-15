const Review = require('../models/Review');
const Work = require('../models/Work');
const mongoose = require('mongoose');

// Recursively get all replies of a comment
async function getReplies(reviewId) {
  const replies = await Review.find({ parentId: reviewId })
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

// Create or update a review
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { workId, rating, comment, parentId } = req.body;
    const userId = req.user._id;

    // Check if the work exists
    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    // If it's a reply, check if the parent review exists
    if (parentId) {
      const parentReview = await Review.findById(parentId);
      if (!parentReview) {
        return res.status(404).json({ message: 'Parent review not found' });
      }
      // Ensure the parent review belongs to the same work
      if (parentReview.workId.toString() !== workId) {
        return res.status(400).json({ message: 'Parent review does not belong to this work' });
      }
    }

    let review;
    if (parentId) {
      // If it's a reply, directly create a new review (without rating)
      review = new Review({
        workId,
        userId,
        comment,
        parentId
      });
      await review.save();
    } else {
      // If it's a root review, it must include a rating
      if (!rating) {
        return res.status(400).json({ message: 'Root review must include a rating' });
      }

      // Find and update or create
      review = await Review.findOne({
        workId,
        userId,
        parentId: null
      });

      if (review) {
        // Update existing review
        const oldRating = review.rating;
        review.rating = rating;
        review.comment = comment;
        await review.save();

        // Update the average rating of the work
        const totalRating = work.averageRating * work.ratingCount - oldRating + rating;
        work.averageRating = totalRating / work.ratingCount;
        await work.save();
      } else {
        // Create a new review
        review = new Review({
          workId,
          userId,
          rating,
          comment,
          parentId: null
        });
        await review.save();

        // Update the average rating of the work
        const totalRating = work.averageRating * work.ratingCount + rating;
        work.ratingCount += 1;
        work.averageRating = totalRating / work.ratingCount;
        await work.save();
      }
    }

    // Return the complete review information
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username nickname avatar')
      .populate('parentId');

    res.status(200).json({
      message: 'Review created/updated successfully',
      data: populatedReview
    });
  } catch (error) {
    console.error('Create/Update Review Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Get all reviews of a work
exports.getWorkReviews = async (req, res) => {
  try {
    const { workId } = req.params;

    // Get all root reviews (excluding replies)
    const rootReviews = await Review.find({
      workId,
      parentId: null
    })
    .populate('userId', 'username nickname avatar')
    .sort({ createdAt: -1 });

    // Get all nested replies of each root review
    const reviewsWithNestedReplies = await Promise.all(
      rootReviews.map(async (review) => {
        const replies = await getReplies(review._id);
        return {
          ...review.toObject(),
          replies
        };
      })
    );

    res.json({
      message: 'Reviews retrieved successfully',
      data: reviewsWithNestedReplies
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all reviews of a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ userId })
      .populate('workId', 'title type coverImage')
      .populate('parentId')
      .sort({ createdAt: -1 });

    res.json({
      message: 'User reviews retrieved successfully',
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}; 