import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Tabs, Tab, Paper, Avatar, CircularProgress, Grid, Card, CardContent, CardHeader, CardMedia, IconButton, Tooltip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const CONNECTION_TYPES = [
  'Visual Homage',
  'Quote Borrowing',
  'Thematic Echo',
  'Character Inspiration',
  'Other'
];

const typeToLabel = {
  'Visual Homage': 'Visual Homage',
  'Quote Borrowing': 'Quote Borrowing',
  'Thematic Echo': 'Thematic Echo',
  'Character Inspiration': 'Character Inspiration',
  'Other': 'Other'
};

function DetailedConnectionsExplorer({ workId, direction = 'upstream', onShare }) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  // Get the like status and number
  const fetchLikeStatus = async (submissionId) => {
    try {
      const [statusRes, countRes] = await Promise.all([
        fetch(`/api/likes/check?targetType=connectionSubmission&targetId=${submissionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`/api/likes/count?targetType=connectionSubmission&targetId=${submissionId}`)
      ]);
      
      const [statusData, countData] = await Promise.all([
        statusRes.json(),
        countRes.json()
      ]);

      setLikes(prev => ({
        ...prev,
        [submissionId]: statusData.liked
      }));
      setLikeCounts(prev => ({
        ...prev,
        [submissionId]: countData.count
      }));
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  // Handle like/unlike
  const handleLike = async (submissionId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // If the user is not logged in, you can add a prompt or redirect to the login page here
        return;
      }

      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType: 'connectionSubmission',
          targetId: submissionId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update the like status and number
        setLikes(prev => ({
          ...prev,
          [submissionId]: data.liked
        }));
        setLikeCounts(prev => ({
          ...prev,
          [submissionId]: data.liked 
            ? (prev[submissionId] || 0) + 1 
            : (prev[submissionId] || 1) - 1
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Use the new API endpoint
    fetch(`/api/connection-submissions/work?workId=${workId}&direction=${direction}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setPosts(data.data || []);
        // Get the like status and number for each submission
        data.data?.forEach(post => {
          fetchLikeStatus(post._id);
        });
        setLoading(false);
      })
      .catch(err => {
        setError('Unable to load connection insights. Please try again later.');
        setLoading(false);
      });
  }, [workId, direction]);

  const currentType = CONNECTION_TYPES[tab];
  const filteredPosts = posts.filter(post => post.type === currentType);

  return (
    <Paper sx={{ mt: 4, mb: 4, p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '.MuiTab-root': {
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#666',
              textTransform: 'none',
              minWidth: 120
            },
            '.Mui-selected': {
              color: '#f5c518'
            },
            mb: 1
          }}
        >
          {CONNECTION_TYPES.map((type, idx) => (
            <Tab key={type} label={typeToLabel[type]} />
          ))}
        </Tabs>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 6, color: '#666' }}>
          <Typography variant="h6" gutterBottom color="error">
            {error}
          </Typography>
          <Typography variant="body2">
            Please refresh the page or try again later.
          </Typography>
        </Box>
      ) : filteredPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: '#666' }}>
          <Typography variant="h6" gutterBottom>
            Waiting for Story Connections to be Discovered!
          </Typography>
          <Typography variant="body1" paragraph>
            Have you noticed any interesting connections between stories?
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3 }}>
            "A thousand readers, a thousand Hamlets" - Share your unique perspective!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPosts.map(post => (
            <Grid item xs={12} key={post._id}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <CardHeader
                  avatar={<Avatar src={post.createdBy?.avatar} alt={post.createdBy?.nickname || post.createdBy?.username || 'User'} />}
                  title={<Box sx={{ fontWeight: 'bold' }}>{post.createdBy?.nickname || post.createdBy?.username || 'User'}</Box>}
                  subheader={post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US') : ''}
                  action={post.relatedWork ? (
                    <Tooltip title="View related work">
                      <IconButton href={`/${post.relatedWork.type}/${post.relatedWork._id}`} target="_blank">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                />
                <CardContent>
                  {/* Related works */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Related Work:
                      <Button
                        href={`/${post.fromWork._id === workId ? post.toWork.type : post.fromWork.type}/${post.fromWork._id === workId ? post.toWork._id : post.fromWork._id}`}
                        target="_blank"
                        sx={{ ml: 1, textTransform: 'none', color: '#f5c518', fontWeight: 'bold' }}
                        size="small"
                      >
                        {post.fromWork._id === workId ? post.toWork.title : post.fromWork.title} ({post.fromWork._id === workId ? post.toWork.year : post.fromWork.year})
                      </Button>
                    </Typography>
                  </Box>
                  {/* Evidence image comparison */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {post.fromWork._id === workId ? (
                      <>
                        <CardMedia
                          component="img"
                          image={post.fromWork.image.startsWith('data:') ? post.fromWork.image : `data:image/jpeg;base64,${post.fromWork.image}`}
                          alt={post.fromWork.title}
                          sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                        />
                        <CardMedia
                          component="img"
                          image={post.toWork.image.startsWith('data:') ? post.toWork.image : `data:image/jpeg;base64,${post.toWork.image}`}
                          alt={post.toWork.title}
                          sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                        />
                      </>
                    ) : (
                      <>
                        <CardMedia
                          component="img"
                          image={post.toWork.image.startsWith('data:') ? post.toWork.image : `data:image/jpeg;base64,${post.toWork.image}`}
                          alt={post.toWork.title}
                          sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                        />
                        <CardMedia
                          component="img"
                          image={post.fromWork.image.startsWith('data:') ? post.fromWork.image : `data:image/jpeg;base64,${post.fromWork.image}`}
                          alt={post.fromWork.title}
                          sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                        />
                      </>
                    )}
                  </Box>
                  {/* Submission comment */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Submission Comment:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      p: 2, 
                      bgcolor: '#f9f9f9', 
                      borderRadius: 1,
                      border: '1px solid #eee'
                    }}>
                      {post.userComment}
                    </Typography>
                  </Box>
                  {/* AI judgment */}
                  {post.aiJudgment && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        AI Analysis:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        p: 2, 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 1,
                        border: '1px solid #eee',
                        fontStyle: 'italic'
                      }}>
                        {post.aiJudgment}
                      </Typography>
                    </Box>
                  )}
                  {/* Admin review */}
                  {post.adminReview?.reviewComment && (
                    <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mt: 1 }}>
                      <Typography variant="subtitle2" color="primary">Admin Review:</Typography>
                      <Typography variant="body2">{post.adminReview.reviewComment}</Typography>
                    </Box>
                  )}
                  {/* Like button */}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      startIcon={likes[post._id] ? <ThumbUpAltIcon /> : <ThumbUpAltOutlinedIcon />}
                      size="small"
                      sx={{ 
                        color: likes[post._id] ? '#f5c518' : '#888',
                        '&:hover': {
                          color: '#f5c518'
                        }
                      }}
                      onClick={() => handleLike(post._id)}
                    >
                      {likeCounts[post._id] || 0} Likes
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Submission button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: '#f5c518', color: '#000', fontWeight: 'bold', px: 4, py: 1.5, borderRadius: 2, boxShadow: '0 2px 8px rgba(245,197,24,0.08)' }}
          onClick={() => onShare(CONNECTION_TYPES[tab])}
        >
          Share Your Discovery
        </Button>
      </Box>
    </Paper>
  );
}

export default DetailedConnectionsExplorer; 