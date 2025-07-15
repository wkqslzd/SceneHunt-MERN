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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import CommentSection from '../../components/CommentSection';
import { useAuth } from '../../contexts/AuthContext';
import WorkSearchBox from '../../components/WorkSearchBox';
import DetailedConnectionsExplorer from '../../components/DetailedConnectionsExplorer';

// Genre mapping (English to English)
const genreMapping = {
  'Romance': 'Romance',
  'Drama': 'Drama',
  'Comedy': 'Comedy',
  'Tragedy': 'Tragedy',
  'Action': 'Action',
  'Adventure': 'Adventure',
  'Fantasy': 'Fantasy',
  'Science Fiction': 'Science Fiction',
  'Mystery': 'Mystery',
  'Historical': 'Historical',
  'Horror': 'Horror',
  'War': 'War',
  'Thriller': 'Thriller',
  'Crime': 'Crime',
  'SliceOfLife': 'Slice of Life',
  'Psychological': 'Psychological',
  'Philosophical': 'Philosophical',
  'ComingOfAge': 'Coming of Age',
  'Political': 'Political',
  'Satire': 'Satire',
  'Nature': 'Nature',
  'Other': 'Other'
};

// Utility function: Group primary/secondary works by type
function groupByType(arr) {
  if (!Array.isArray(arr)) return {};
  const result = {};
  arr.forEach(item => {
    const t = item.type || 'Other';
    if (!result[t]) result[t] = [];
    result[t].push(item);
  });
  return result;
}

const WorkDetailsPage = ({ renderHeaderInfo }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State variables
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [pendingPrimaryUpstream, setPendingPrimaryUpstream] = useState(null);
  const [pendingPrimaryDownstream, setPendingPrimaryDownstream] = useState(null);
  
  // Use the global user to determine permissions
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  
  // Get media details
  const fetchWorkDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/works/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work details');
      }
      const data = await response.json();
      setMedia(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to get the details of the work:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/works/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Content not found');
        const data = await res.json();
        setMedia(data);
        setPendingPrimaryUpstream(data.primaryUpstreamWorks);
        setPendingPrimaryDownstream(data.primaryDownstreamWorks);
        setError(null);
      })
      .catch((err) => {
        setMedia(null);
        setError(err.message || 'Content not found');
      })
      .finally(() => setLoading(false));

  }, [id]);

  // Search for works
  const searchWorks = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/works/search?title=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.works);
      }
    } catch (error) {
      console.error('Error searching works:', error);
    }
  };

  // Handle expand/collapse
  const handleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Scroll to rating section
  const scrollToRating = () => {
    const element = document.getElementById('rating-section');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    } else {
      console.error('Rating section element not found');
    }
  };
  
  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle adding connections
  const handleAddConnection = async () => {
    if (!selectedWork) return;
    if (editMode) {
      if (selectedDirection === 'upstream') {
        setPendingPrimaryUpstream(prev => ({
          ...prev,
          [selectedType]: [...(prev[selectedType] || []), selectedWork]
        }));
      } else {
        setPendingPrimaryDownstream(prev => ({
          ...prev,
          [selectedType]: [...(prev[selectedType] || []), selectedWork]
        }));
      }
      setOpenAddDialog(false);
      return;
    }
    // Under non-edit mode, the original logic
    try {
      const response = await fetch(`/api/works/${id}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: selectedType,
          direction: selectedDirection,
          targetWorkId: selectedWork._id
        }),
      });

      if (response.ok) {
        // Re-fetch the work details
        const updatedWork = await fetch(`/api/works/${id}`).then(res => res.json());
        setMedia(updatedWork);
        setSnackbarMessage('Connection added successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to add connection');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    setOpenAddDialog(false);
  };

  // Handle deleting connections
  const handleDeleteConnection = async (workId, type, direction) => {
    try {
      const response = await fetch(`/api/works/${id}/connections/${workId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          direction
        }),
      });

      if (response.ok) {
        // Re-fetch the work details
        const updatedWork = await fetch(`/api/works/${id}`).then(res => res.json());
        setMedia(updatedWork);
        setSnackbarMessage('Connection deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to delete connection');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

// Add a function to save all changes
const handleSaveConnections = async () => {
  try {
    const connections = [];
    Object.entries(pendingPrimaryUpstream).forEach(([type, works]) => {
      (Array.isArray(works) ? works : []).forEach(work => {
        connections.push({
          targetWorkId: work._id,
          type,
          direction: 'upstream'
        });
      });
    });
    Object.entries(pendingPrimaryDownstream).forEach(([type, works]) => {
      (Array.isArray(works) ? works : []).forEach(work => {
        connections.push({
          targetWorkId: work._id,
          type,
          direction: 'downstream'
        });
      });
    });

    const token = localStorage.getItem('token'); // Or get from context

    const results = await Promise.all(
      connections.map(async (connection) => {
        const response = await fetch(`/api/works/${id}/primary-connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            targetWorkId: connection.targetWorkId,
            type: connection.type,
            direction: connection.direction
          })
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        return { success: true };
      })
    );

    const failures = results.filter(result => !result.success);
    if (failures.length > 0) {
      throw new Error(`Failed to add some connections: ${failures.map(f => f.error).join(', ')}`);
    }

    const updatedWork = await fetch(`/api/works/${id}`).then(res => res.json());
    setMedia(updatedWork);
    setPendingPrimaryUpstream(updatedWork.primaryUpstreamWorks);
    setPendingPrimaryDownstream(updatedWork.primaryDownstreamWorks);
    setEditMode(false);
    setSnackbarMessage('All connections saved successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  } catch (error) {
    setSnackbarMessage(error.message || 'Failed to save connections');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  }
};

// Delete primary connection
const handleDeletePrimaryConnection = async (connectionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/works/${id}/primary-connections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    const updatedWork = await fetch(`/api/works/${id}`).then(res => res.json());
    setMedia(updatedWork);
    setPendingPrimaryUpstream(updatedWork.primaryUpstreamWorks);
    setPendingPrimaryDownstream(updatedWork.primaryDownstreamWorks);
    setSnackbarMessage('连接删除成功');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  } catch (error) {
    setSnackbarMessage(error.message || 'Failed to delete connection');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  }
};

// Handle rating update
const handleRatingUpdate = async () => {
  await fetchWorkDetails();
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
          <Typography>Loading...</Typography>
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
          <Typography variant="h5" color="error" gutterBottom>Error</Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#f5c518', color: '#000' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }
  
  // If media is not found
  if (!media) {
    return (
      <Container maxWidth={false} sx={{ py: 8, px: { xs: 1, md: 6 } }}>
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <Typography variant="h5" gutterBottom>Content Not Found</Typography>
          <Typography variant="body1" paragraph>
            Sorry, the content you are looking for does not exist or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#f5c518', color: '#000' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Convert English genres to Chinese display
  const displayGenres = (Array.isArray(media.genre) ? media.genre : media.genres || []).map(g => genreMapping[g] || g);
  
  // Render primary connections (supports ObjectId and populated objects)
  const renderPrimaryConnections = (type, direction, works, pendingWorks, setPendingWorks) => {
    // works: { [type]: [ { work, type } ] } 或 null
    // pendingWorks: { [type]: [ { work, type } ] } 或 null
    const items = (pendingWorks && pendingWorks[type]) || (works && works[type]) || [];
    return (
      <Box key={type} sx={{ 
        border: '1px solid #eee',
        borderRadius: 1,
        p: 2,
        position: 'relative'
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: '#666' }}>
          {type}
        </Typography>
        {isAdmin && editMode && (
          <IconButton
            size="small"
            onClick={() => {
              setSelectedType(type);
              setSelectedDirection(direction);
              setOpenAddDialog(true);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {items.length > 0 ? items.map((item, index) => {
            // item may be { work: ObjectId, type } or { work: {...}, type }
            const w = item.work && typeof item.work === 'object' && item.work.title ? item.work : item;
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Typography 
                  variant="body2"
                  sx={{ 
                    color: '#e50914',
                    cursor: w._id && w.type ? 'pointer' : 'default',
                    '&:hover': w._id && w.type ? { textDecoration: 'underline' } : undefined
                  }}
                  onClick={() => w._id && w.type && navigate(`/${w.type}/${w._id}`)}
                >
                  {w.title ? `${w.title} (${w.type}) (${w.year || ''})` : w._id || 'Missing data'}
                </Typography>
                {isAdmin && editMode && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (item._id) {
                        handleDeletePrimaryConnection(item._id);
                      } else {
                        setPendingWorks(prev => ({
                          ...prev,
                          [type]: prev[type].filter((_, i) => i !== index)
                        }));
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            );
          }) : (
            <Typography variant="body2" color="text.secondary">
              No works found
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Render secondary connections
  const renderSecondaryConnections = (direction) => {
    const secWorks = direction === 'upstream' ? media.secondaryUpstreamWorks : media.secondaryDownstreamWorks;
    const grouped = groupByType(secWorks);
    const types = ['Visual Homage', 'Quote Borrowing', 'Thematic Echo', 'Character Inspiration', 'Other'];
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Detailed Connections
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2
        }}>
          {types.map((type) => (
            <Box key={type} sx={{ 
              border: '1px solid #eee',
              borderRadius: 1,
              p: 2
            }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#666' }}>
                {type}
              </Typography>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {(grouped[type] || []).length > 0 ? grouped[type].map((item, index) => {
                  const w = item.work && typeof item.work === 'object' && item.work.title ? item.work : item;
                  return (
                    <Typography 
                      key={index}
                      variant="body2"
                      sx={{ 
                        color: '#e50914',
                        cursor: w._id && w.type ? 'pointer' : 'default',
                        '&:hover': w._id && w.type ? { textDecoration: 'underline' } : undefined
                      }}
                      onClick={() => w._id && w.type && navigate(`/${w.type}/${w._id}`)}
                    >
                      {w.title ? `${w.title} (${w.type}) (${w.year || ''})` : w._id || '数据缺失'}
                    </Typography>
                  );
                }) : (
                  <Typography variant="body2" color="text.secondary">
                    No works found
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Replace the add connection dialog with a compact WorkSearchBox
  const renderAddConnectionDialog = () => (
    <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
      <DialogTitle>Search for the work you want on this site</DialogTitle>
      <DialogContent>
        <WorkSearchBox 
          compact={true} 
          onSelect={(workInfo) => {
            if (selectedDirection === 'upstream') {
              setPendingPrimaryUpstream(prev => ({
                ...prev,
                [selectedType]: [...(prev[selectedType] || []), workInfo]
              }));
            } else {
              setPendingPrimaryDownstream(prev => ({
                ...prev,
                [selectedType]: [...(prev[selectedType] || []), workInfo]
              }));
            }
            setOpenAddDialog(false);
          }} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenAddDialog(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

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
            {/* Type tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {media.type === 'book' ? 'Book' : media.type === 'screen' ? 'Screen' : media.type}
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
                {media.averageRating ? (media.averageRating * 2).toFixed(1) : '0.0'}
              </Typography>
              <Typography variant="body1" sx={{ display: 'inline', ml: 1 }}>
                /10 ({media.ratingCount} ratings)
              </Typography>
            </Box>
            {/* Detailed information */}
            <Box sx={{ mb: 3 }}>
              {/* Render header information for specific types */}
              {renderHeaderInfo && renderHeaderInfo(media)}
              
              {/* General information */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">Language: {media.language}</Typography>
              </Box>
              {media.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">Created: {new Date(media.createdAt).toLocaleDateString('en-US')}</Typography>
                </Box>
              )}
              {media.updatedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">Updated: {new Date(media.updatedAt).toLocaleDateString('en-US')}</Typography>
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
            Rate
          </Button>
        </Box>
      </Box>
      
      {/* Synopsis */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1 }}>
          Synopsis
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
          {expanded ? 'Show Less' : 'Show More'}
        </Typography>
      </Paper>

      {/* Derivative relationships */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1 }}>
            Derivative Relationships
          </Typography>
          {isAdmin && !editMode && (
            <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ ml: 2 }}>
              Edit
            </Button>
          )}
          {isAdmin && editMode && (
            <Button variant="contained" color="primary" onClick={handleSaveConnections} sx={{ ml: 2 }}>
              Save
            </Button>
          )}
        </Box>
        {/* Upstream works */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#666', mb: 2 }}>
            Upstream Influences (Works That Influenced This Work)
          </Typography>
          {/* Primary Connections */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Primary Connections
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mb: 2
            }}>
              {['Adaptation', 'Sequel'].map((type) => (
                renderPrimaryConnections(
                  type,
                  'upstream',
                  groupByType(media.primaryUpstreamWorks),
                  pendingPrimaryUpstream,
                  setPendingPrimaryUpstream
                )
              ))}
            </Box>
          </Box>
          {/* Secondary Connections */}
          {renderSecondaryConnections('upstream')}
        </Box>
        {/* Downstream works */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#666', mb: 2 }}>
            Downstream Influences (Works Influenced by This Work)
          </Typography>
          {/* Primary Connections */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Primary Connections
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mb: 2
            }}>
              {['Adaptation', 'Sequel'].map((type) => (
                renderPrimaryConnections(
                  type,
                  'downstream',
                  groupByType(media.primaryDownstreamWorks),
                  pendingPrimaryDownstream,
                  setPendingPrimaryDownstream
                )
              ))}
            </Box>
          </Box>
          {/* Secondary Connections */}
          {renderSecondaryConnections('downstream')}
        </Box>
      </Paper>

      {/* Detailed connection exploration block */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1 }}>
          Connection Insights
        </Typography>
        <DetailedConnectionsExplorer
          workId={id}
          direction="upstream"
          onShare={(type) => navigate(`/connection/submit/${id}?type=${type}`)}
        />
      </Paper>

      {/* Comments section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Paper sx={{ p: 3, borderRadius: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee', pb: 1 }}>
              Comments
            </Typography>
            <Box id="rating-section" />
            <CommentSection 
              mediaId={id} 
              mediaType={media?.type} 
              onRatingUpdate={handleRatingUpdate}
            />
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

      {renderAddConnectionDialog()}
    </Container>
  );
};

export default WorkDetailsPage; 