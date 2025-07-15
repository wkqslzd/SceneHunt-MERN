import React from 'react';
import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkDetailsPage from './WorkDetailsPage';

const BookDetailsPage = () => {
  // Render book-specific header info
  const renderBookHeaderInfo = (media) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
      <Typography variant="body1">Author: {media.author}</Typography>
    </Box>
  );

  return <WorkDetailsPage renderHeaderInfo={renderBookHeaderInfo} />;
};

export default BookDetailsPage; 