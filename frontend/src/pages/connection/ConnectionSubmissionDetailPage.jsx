import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Alert, Button, Paper, CircularProgress, Stack
} from '@mui/material';

function ConnectionSubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/connection-submissions/${id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch submission');
        setSubmission(data.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch submission');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleAction = async (decision) => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/connection-submissions/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');
      setActionSuccess(`Submission ${decision === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setTimeout(() => {
        navigate('/admin/admin2'); // Modify to the correct management page path
      }, 1500);
    } catch (err) {
      setActionError(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Connection Submission Detail
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* From Work image */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work A (fromWork)
            </Typography>
            {submission.fromWork.image ? (
              <img
                src={submission.fromWork.image.startsWith('data:') ? submission.fromWork.image : `data:image/jpeg;base64,${submission.fromWork.image}`}
                alt={submission.fromWork.title}
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid #ccc' }}
              />
            ) : (
              <Typography color="textSecondary">No image</Typography>
            )}
            <Box sx={{ textAlign: 'center', mt: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Typography variant="subtitle2">Title: {submission.fromWork.title}</Typography>
              <Typography variant="body2">
                Type: {submission.fromWork.type} | Year: {submission.fromWork.year}
              </Typography>
            </Box>
          </Box>
          {/* To Work image */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work B (toWork)
            </Typography>
            {submission.toWork.image ? (
              <img
                src={submission.toWork.image.startsWith('data:') ? submission.toWork.image : `data:image/jpeg;base64,${submission.toWork.image}`}
                alt={submission.toWork.title}
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid #ccc' }}
              />
            ) : (
              <Typography color="textSecondary">No image</Typography>
            )}
            <Box sx={{ textAlign: 'center', mt: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Typography variant="subtitle2">Title: {submission.toWork.title}</Typography>
              <Typography variant="body2">
                Type: {submission.toWork.type} | Year: {submission.toWork.year}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">From Work:</Typography>
          <Typography>{submission.fromWork.title} ({submission.fromWork.type}, {submission.fromWork.year})</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">To Work:</Typography>
          <Typography>{submission.toWork.title} ({submission.toWork.type}, {submission.toWork.year})</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Direction:</Typography>
          <Typography>{submission.direction}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">Type:</Typography>
          <Typography>{submission.type}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">User Comment:</Typography>
          <Typography>{submission.userComment}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">AI Judgment:</Typography>
          <Typography sx={{ whiteSpace: 'pre-line', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {submission.aiJudgment}
          </Typography>
        </Box>
        {/* You can display other fields such as images as needed */}
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {actionSuccess} Redirecting to the submissions list...
          </Alert>
        )}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {submission.status === 'pending' ? (
            <>
              <Button
                variant="contained"
                color="success"
                disabled={actionLoading}
                onClick={() => handleAction('approved')}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={actionLoading}
                onClick={() => handleAction('rejected')}
              >
                Reject
              </Button>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 2,
              borderRadius: 1,
              bgcolor: submission.status === 'approved' ? '#e8f5e9' : '#ffebee'
            }}>
              <Typography variant="subtitle1" sx={{ 
                color: submission.status === 'approved' ? '#2e7d32' : '#c62828',
                fontWeight: 'bold'
              }}>
                {submission.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {submission.status === 'approved' 
                  ? 'This submission has been approved' 
                  : 'This submission has been rejected'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

export default ConnectionSubmissionDetailPage; 