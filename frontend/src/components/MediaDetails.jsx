// src/components/MediaDetails.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Chip,
  Button,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MovieIcon from '@mui/icons-material/Movie';
import LanguageIcon from '@mui/icons-material/Language';
import DateRangeIcon from '@mui/icons-material/DateRange';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { useParams, useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection'; // Import the comment component

// Genre mapping (English to Chinese)
const genreMapping = {
  'Romance': '爱情',
  'Drama': '剧情',
  'Comedy': '喜剧',
  'Tragedy': '悲剧',
  'Action': '动作',
  'Adventure': '冒险',
  'Fantasy': '奇幻',
  'Science Fiction': '科幻',
  'Mystery': '悬疑',
  'Historical': '历史',
  'Horror': '恐怖',
  'War': '战争',
  'Thriller': '惊悚',
  'Crime': '犯罪',
  'SliceOfLife': '日常',
  'Psychological': '心理',
  'Philosophical': '哲学',
  'ComingOfAge': '成长',
  'Political': '政治',
  'Satire': '讽刺',
  'Nature': '自然',
  'Other': '其他'
};

const MediaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Get media details (backend API)
  useEffect(() => {
    setLoading(true);
    fetch(`/api/works/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('未找到该内容');
        const data = await res.json();
        setMedia(data);
        setError(null);
        // Get the like status and number
        fetchLikeStatus();
        fetchLikeCount();
        // Get the collection status
        fetchFavoriteStatus();
      })
      .catch((err) => {
        setMedia(null);
        setError(err.message || '未找到该内容');
      })
      .finally(() => setLoading(false));
  }, [id]);
  
  // Get the like status
  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/likes/check?targetType=media&targetId=${id}`);
      const data = await response.json();
      setIsLiked(data.liked);
    } catch (error) {
      console.error('获取点赞状态失败:', error);
    }
  };

  // Get the like count
  const fetchLikeCount = async () => {
    try {
      const response = await fetch(`/api/likes/count?targetType=media&targetId=${id}`);
      const data = await response.json();
      setLikeCount(data.count);
    } catch (error) {
      console.error('获取点赞数量失败:', error);
    }
  };

  // Get the collection status
  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check?mediaId=${id}`);
      const data = await response.json();
      setIsFavorited(data.favorited);
    } catch (error) {
      console.error('获取收藏状态失败:', error);
    }
  };

  // Handle like
  const handleLike = async () => {
    try {
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType: 'media',
          targetId: id
        })
      });
      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      setSnackbarMessage(data.liked ? '点赞成功' : '已取消点赞');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('点赞操作失败:', error);
      setSnackbarMessage('操作失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle favorite
  const handleFavorite = async () => {
    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaId: id
        })
      });
      const data = await response.json();
      setIsFavorited(data.favorited);
      setSnackbarMessage(data.favorited ? '收藏成功' : '已取消收藏');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('收藏操作失败:', error);
      setSnackbarMessage('操作失败');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle expand/collapse
  const handleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Scroll to the rating section
  const scrollToRating = () => {
    const element = document.getElementById('rating-section');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    } else {
      console.error('找不到评分区域元素');
    }
  };
  
  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth={false} sx={{ py: 8, px: { xs: 1, md: 6 } }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexDirection: 'column',
          height: '50vh' 
        }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>加载中...</Typography>
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth={false} sx={{ py: 8, px: { xs: 1, md: 6 } }}>
        <Box sx={{ 
          textAlign: 'center', 
          p: 5,
          bgcolor: '#fff8f8',
          borderRadius: 2 
        }}>
          <Typography variant="h5" color="error" gutterBottom>出错了</Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#f5c518', color: '#000' }}
          >
            返回首页
          </Button>
        </Box>
      </Container>
    );
  }
  
  // If the media is not found
  if (!media) {
    return (
      <Container maxWidth={false} sx={{ py: 8, px: { xs: 1, md: 6 } }}>
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <Typography variant="h5" gutterBottom>未找到内容</Typography>
          <Typography variant="body1" paragraph>
            抱歉，您查找的内容不存在或已被移除。
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#f5c518', color: '#000' }}
          >
            返回首页
          </Button>
        </Box>
      </Container>
    );
  }
  
  console.log("Rendering media data:", media);
  
  // Convert English genres to Chinese display
  const displayGenres = (Array.isArray(media.genre) ? media.genre : media.genres || []).map(g => genreMapping[g] || g);
  
  return (
    <Container maxWidth={false} sx={{ py: 4, px: { xs: 1, md: 6 } }}>
      {/* Media details header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        {/* Cover image */}
        <Box sx={{ 
          flexBasis: { xs: '100%', md: '300px' }, 
          flexShrink: 0,
          maxWidth: { xs: '100%', md: '300px' },
          minWidth: { xs: '100%', md: '220px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 'auto', md: '400px' },
          bgcolor: '#fafafa',
          borderRadius: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Box
            component="img"
            src={media.coverImages && media.coverImages.length > 0 ? 
              `${process.env.VITE_BACKEND_URL}${media.coverImages[0]}` : 
              "https://via.placeholder.com/300x450?text=No+Image"}
            alt={media.title}
            sx={{
              width: '100%',
              height: { xs: 'auto', md: '400px' },
              maxWidth: '300px',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </Box>
        
        {/* Work information */}
        <Box sx={{ 
          flex: 1,
          minHeight: { xs: 'auto', md: '400px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          py: 1
        }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {media.title}
            </Typography>
            {/* Type label */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {media.type === 'book' ? '图书作品' : media.type === 'screen' ? '影视作品' : media.type}
              </Typography>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {media.year}
              </Typography>
              {displayGenres.map((genre, index) => (
                <Chip 
                  key={index}
                  label={genre}
                  size="small"
                  sx={{ mr: 0.5 }}
                />
              ))}
            </Box>
            {/* Rating information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f5c518', display: 'inline' }}>
                {media.averageRating ? media.averageRating.toFixed(1) : '0.0'}
              </Typography>
              <Typography variant="body1" sx={{ display: 'inline', ml: 1 }}>
                /10 ({media.ratingCount} 评分)
              </Typography>
            </Box>
            {/* Like and favorite buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                onClick={handleLike}
                sx={{
                  color: isLiked ? '#e50914' : 'inherit',
                  borderColor: isLiked ? '#e50914' : 'inherit',
                  '&:hover': {
                    borderColor: '#e50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.04)'
                  }
                }}
              >
                {likeCount} 点赞
              </Button>
              <Button
                variant="outlined"
                startIcon={isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={handleFavorite}
                sx={{
                  color: isFavorited ? '#e50914' : 'inherit',
                  borderColor: isFavorited ? '#e50914' : 'inherit',
                  '&:hover': {
                    borderColor: '#e50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.04)'
                  }
                }}
              >
                {isFavorited ? '已收藏' : '收藏'}
              </Button>
            </Box>
            {/* Detailed information */}
            <Box sx={{ mb: 3 }}>
              {media.type === 'book' && media.author && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">作者: {media.author}</Typography>
                </Box>
              )}
              {media.type === 'screen' && media.director && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MovieIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">导演: {media.director}</Typography>
                </Box>
              )}
              {media.type === 'screen' && media.actors && media.actors.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <GroupIcon fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                  <Typography variant="body1">主演: {media.actors.join(', ')}</Typography>
                </Box>
              )}
              {media.type === 'screen' && media.releaseDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">上映日期: {new Date(media.releaseDate).toLocaleDateString('zh-CN')}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">语言: {media.language}</Typography>
              </Box>
              {media.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">创建时间: {new Date(media.createdAt).toLocaleDateString('zh-CN')}</Typography>
                </Box>
              )}
              {media.updatedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">更新时间: {new Date(media.updatedAt).toLocaleDateString('zh-CN')}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          {/* Rating button */}
          <Button 
            variant="contained"
            onClick={scrollToRating}
            sx={{ 
              bgcolor: '#e50914',
              color: 'white',
              '&:hover': {
                bgcolor: '#d50813'
              },
              mt: 2,
              minWidth: 120,
              alignSelf: 'flex-end'
            }}
          >
            评分
          </Button>
        </Box>
      </Box>
      
      {/* Work introduction */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1 }}>
          简介
        </Typography>
        <Box sx={{ 
          maxHeight: expanded ? 'none' : '100px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out'
        }}>
          <Typography variant="body1" paragraph>
            {media.description}
          </Typography>
        </Box>
        <Typography 
          onClick={handleExpand} 
          sx={{ 
            color: '#e50914',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {expanded ? '收起' : '展开更多'}
        </Typography>
      </Paper>
      
      {/* Comment section - temporarily commented out, will be enabled after CommentSection is fixed */}
      <Box sx={{ mt: 4 }}>
        {/* Temporary solution: add an error boundary */}
        <Box sx={{ position: 'relative' }}>
          <Paper sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1 }}>
              评论区
            </Typography>
            <Box id="rating-section" />
            <CommentSection mediaId={id} mediaType={media.type} />
          </Paper>
        </Box>
      </Box>
      
      {/* Notification prompt */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MediaDetails;