import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert } from '@mui/material';
import ConnectionSubmissionForm from '../../components/ConnectionSubmissionForm';

function ConnectionSubmissionPage() {
  const { workId } = useParams();
  const navigate = useNavigate();
  const [currentWork, setCurrentWork] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        const response = await fetch(`/api/works/${workId}`);
        if (!response.ok) {
          throw new Error('Work not found');
        }
        const data = await response.json();
        setCurrentWork(data);
      } catch (err) {
        setError('Failed to load work details');
      }
    };
    fetchWork();
  }, [workId]);

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/connection-submissions', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to submit connection');
      }


    } catch (err) {
      setError('Failed to submit connection. Please try again.');
    }
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentWork) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <ConnectionSubmissionForm
          currentWork={currentWork}
          onSubmit={handleSubmit}
        />
      </Box>
    </Container>
  );
}

export default ConnectionSubmissionPage; 