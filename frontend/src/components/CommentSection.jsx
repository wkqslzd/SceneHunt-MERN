// src/components/CommentSection.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Rating,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';
import { handleAuthAction, getAuthHeader } from '../utils/auth';

// Recursively render a single comment
function CommentItem({ comment, onReply, onDelete, onEdit, currentUserId, onSubmitReply, onLike }) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

  useEffect(() => {
    // Check if the user has already liked
    const checkLikeStatus = async () => {
      try {
        const response = await axios.get('/api/likes/check', {
          params: {
            targetType: 'review',
            targetId: comment._id
          },
          headers: getAuthHeader()
        });
        setIsLiked(response.data.liked);
      } catch (error) {
        console.error('Failed to check like status:', error);
      }
    };
    checkLikeStatus();
  }, [comment._id]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    await onSubmitReply(comment._id, replyContent);
    setReplyContent('');
    setShowReply(false);
  };

  const handleLike = () => {
    handleAuthAction(async () => {
      try {
        const response = await axios.post('/api/likes/toggle', {
          targetType: 'review',
          targetId: comment._id
        }, { headers: getAuthHeader() });
        setIsLiked(response.data.liked);
        setLikeCount(prev => response.data.liked ? prev + 1 : prev - 1);
      } catch (error) {
        console.error('Failed to like:', error);
      }
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2, ml: comment.parentId ? 4 : 0 }} variant={comment.parentId ? 'outlined' : 'elevation'}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Avatar src={comment.userId.avatar} sx={{ mr: 2 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{comment.userId.nickname || comment.userId.username}</Typography>
          {comment.rating && !comment.parentId && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating value={comment.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1, color: '#f5c518', fontWeight: 'bold' }}>
                {(comment.rating * 2).toFixed(1)}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleString('zh-CN')}
        </Typography>
        {comment.userId._id === currentUserId && (
          <>
            <IconButton size="small" onClick={() => onEdit(comment)} sx={{ ml: 1 }}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={() => onDelete(comment._id)}><DeleteIcon fontSize="small" /></IconButton>
          </>
        )}
      </Box>
      <Typography variant="body1" sx={{ mb: 1 }}>{comment.comment}</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <Button 
          size="small" 
          variant="text" 
          onClick={handleLike}
          startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          sx={{ color: isLiked ? '#e50914' : 'inherit' }}
        >
          {likeCount}
        </Button>
        <Button size="small" variant="text" onClick={() => setShowReply(v => !v)} sx={{ color: '#e50914' }}>reply</Button>
      </Box>
      {showReply && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TextField
            size="small"
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="write your reply..."
            sx={{ mr: 1, flex: 1 }}
          />
          <Button variant="contained" size="small" onClick={handleReply} sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#d50813' } }}>post</Button>
        </Box>
      )}
      {/* Recursively render sub-replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              currentUserId={currentUserId}
              onSubmitReply={onSubmitReply}
              onLike={onLike}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

const CommentSection = ({ mediaId, mediaType, onRatingUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const { user } = useAuth();
  const currentUserId = user?.userID || user?._id;

  // Get the comment list
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reviews/work/${mediaId}`);
      const data = response.data;
      let comments = data.data || [];
      // Pull the latest like count for each comment
      comments = await Promise.all(comments.map(async (comment) => {
        try {
          const res = await axios.get('/api/likes/count', {
            params: { targetType: 'review', targetId: comment._id }
          });
          return { ...comment, likeCount: res.data.count };
        } catch {
          return { ...comment, likeCount: 0 };
        }
      }));
      setComments(comments);
      setError(null);
    } catch (err) {
      setError('Failed to get comments');
      console.error('Failed to get comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [mediaId]);

  // Submit comments
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !rating) {
      setSnackbarMessage('please fill in the comment content and rating');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (editingComment) {
        await axios.put(`/api/reviews/${editingComment._id}`, { comment: newComment, rating });
        setSnackbarMessage('comment updated successfully');
      } else {
        const response = await axios.post('/api/reviews', { workId: mediaId, comment: newComment, rating });
        console.log('Created review:', response.data);
        setSnackbarMessage('comment published successfully');
      }
      setNewComment('');
      setRating(0);
      setHoverRating(0);
      setEditingComment(null);
      setSnackbarOpen(true);
      await fetchComments();
      // Trigger the rating update of the parent component
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (err) {
      console.error('comment operation failed:', err);
      setSnackbarMessage('operation failed');
      setSnackbarOpen(true);
    }
  };

  // Reply
  const handleSubmitReply = async (parentId, content) => {
    if (!content.trim()) return;
    try {
      await axios.post('/api/reviews', { workId: mediaId, parentId, comment: content });
      fetchComments();
    } catch (err) {
      setSnackbarMessage('reply failed');
      setSnackbarOpen(true);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/reviews/${id}`);
      setSnackbarMessage('comment deleted successfully');
      setSnackbarOpen(true);
      fetchComments();
    } catch (err) {
      setSnackbarMessage('delete failed');
      setSnackbarOpen(true);
    }
  };

  // Edit
  const handleEdit = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.comment);
    setRating(comment.rating || 0);
    setHoverRating(comment.rating || 0);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      {/* Post comments - Only logged-in users can see */}
      {user && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>{editingComment ? 'edit comment' : 'post comment'}</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating
                value={rating}
                onChange={(e, v) => setRating(v)}
                onChangeActive={(e, v) => setHoverRating(Math.max(0, v))}
                precision={0.5}
              />
              <Typography variant="body1" sx={{ ml: 1, color: '#f5c518', fontWeight: 'bold' }}>
                {((hoverRating > 0 ? hoverRating : rating) * 2).toFixed(1)}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="write your comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {editingComment && (
                <Button variant="outlined" onClick={() => { setEditingComment(null); setNewComment(''); setRating(0); setHoverRating(0); }}>cancel</Button>
              )}
              <Button variant="contained" endIcon={<SendIcon />} type="submit" sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#d50813' } }}>{editingComment ? 'update' : 'post'}</Button>
            </Box>
          </Box>
        </Paper>
      )}
      {/* Comment list - All users can see */}
      <Box>
        <Typography variant="h6" gutterBottom>all comments ({comments.length})</Typography>
        {comments.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>no comments, come on!</Typography>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={handleSubmitReply}
              onDelete={handleDelete}
              onEdit={handleEdit}
              currentUserId={currentUserId}
              onSubmitReply={handleSubmitReply}
            />
          ))
        )}
      </Box>
      {/* Notification prompt */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentSection;