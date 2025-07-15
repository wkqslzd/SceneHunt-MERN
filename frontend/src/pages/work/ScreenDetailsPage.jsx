import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkDetailsPage from './WorkDetailsPage';

const ScreenDetailsPage = () => {
  // Render screen-specific header info
  const renderScreenHeaderInfo = (media) => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <PersonIcon fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body1">Director: {media.director}</Typography>
      </Box>
      {media.actors && media.actors.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          <GroupIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body1" sx={{ mr: 1 }}>Cast: </Typography>
          {media.actors.map((actor, index) => (
            <Chip
              key={index}
              label={actor}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      )}
      {media.releaseDate && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body1">Release Date: {new Date(media.releaseDate).toLocaleDateString('en-US')}</Typography>
        </Box>
      )}
    </>
  );

  return <WorkDetailsPage renderHeaderInfo={renderScreenHeaderInfo} />;
};

export default ScreenDetailsPage; 