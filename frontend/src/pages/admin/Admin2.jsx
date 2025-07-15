import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip,
  Button,
  Stack,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const TABS = [
  { value: 'pending', label: 'Pending', icon: <AccessTimeIcon /> },
  { value: 'approved', label: 'Approved', icon: <CheckCircleIcon /> },
  { value: 'rejected', label: 'Rejected', icon: <CancelIcon /> }
];

const PAGE_SIZE = 10;

function Admin2() {
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [submissions, setSubmissions] = useState({
    pending: [],
    approved: [],
    rejected: []
  });
  const [total, setTotal] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/connection-submissions');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch submissions');
        }

        // Categorize submissions by status
        const categorizedSubmissions = {
          pending: data.data.filter(sub => sub.status === 'pending'),
          approved: data.data.filter(sub => sub.status === 'approved'),
          rejected: data.data.filter(sub => sub.status === 'rejected')
        };

        setSubmissions(categorizedSubmissions);
        setTotal({
          pending: categorizedSubmissions.pending.length,
          approved: categorizedSubmissions.approved.length,
          rejected: categorizedSubmissions.rejected.length
        });
      } catch (err) {
        setError('Failed to load submissions');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f5c518';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSubmissionCard = (submission) => (
    <Card 
      key={submission._id}
      sx={{ 
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {/* Left side - Images */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CardMedia
                  component="img"
                  image={submission.fromWork.image.startsWith('data:') ? submission.fromWork.image : `data:image/jpeg;base64,${submission.fromWork.image}`}
                  alt={submission.fromWork.title}
                  sx={{ 
                    height: 140,
                    borderRadius: 1,
                    objectFit: 'cover'
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {submission.fromWork.title} ({submission.fromWork.type}) ({submission.fromWork.year})
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <CardMedia
                  component="img"
                  image={submission.toWork.image.startsWith('data:') ? submission.toWork.image : `data:image/jpeg;base64,${submission.toWork.image}`}
                  alt={submission.toWork.title}
                  sx={{ 
                    height: 140,
                    borderRadius: 1,
                    objectFit: 'cover'
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {submission.toWork.title} ({submission.toWork.type}) ({submission.toWork.year})
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right side - Details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Chip 
                  label={submission.type}
                  sx={{ 
                    bgcolor: '#f5c518',
                    color: '#000',
                    fontWeight: 'bold',
                    mb: 1
                  }}
                />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {submission.fromWork.title} ({submission.fromWork.type}) ({submission.fromWork.year}) → {submission.toWork.title} ({submission.toWork.type}) ({submission.toWork.year})
                </Typography>
              </Box>
              <Chip
                icon={submission.status === 'pending' ? <AccessTimeIcon /> : 
                      submission.status === 'approved' ? <CheckCircleIcon /> : <CancelIcon />}
                label={submission.status}
                sx={{ 
                  bgcolor: getStatusColor(submission.status),
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                AI Judgment:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {submission.aiJudgment || 'No AI judgment available'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {submission.createdBy?.username || 'Anonymous'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatDate(submission.createdAt)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                to={`/admin/connection-submission/${submission._id}`}
                variant="contained"
                sx={{ 
                  bgcolor: '#f5c518',
                  color: '#000',
                  '&:hover': {
                    bgcolor: '#e6b800'
                  }
                }}
              >
                Review
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ pt: 0, px: 3, pb: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#000' }}>
        Connection Submissions
      </Typography>
      
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setPage(1); }}
        sx={{ 
          mb: 3,
          borderBottom: '2px solid #f5c518',
          '& .MuiTab-root': {
            color: '#666',
            fontWeight: 'bold',
            textTransform: 'none',
            minWidth: 120
          },
          '& .Mui-selected': {
            color: '#f5c518'
          }
        }}
      >
        {TABS.map(t => (
          <Tab 
            key={t.value} 
            icon={t.icon} 
            iconPosition="start" 
            label={`${t.label} (${total[t.value] || 0})`} 
            value={t.value} 
          />
        ))}
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress sx={{ color: '#f5c518' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box>
          {submissions[tab]?.map(renderSubmissionCard)}
        </Box>
      )}
    </Box>
  );
}

export default Admin2; 