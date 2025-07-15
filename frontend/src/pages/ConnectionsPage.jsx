import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import MovieIcon from '@mui/icons-material/Movie';
import BookIcon from '@mui/icons-material/Book';

// Mock connections data
const mockConnections = [
  {
    id: 1,
    sourceId: 1,
    sourceTitle: "The Lord of the Rings",
    sourceType: "Book",
    sourceYear: 1954,
    targetId: 2,
    targetTitle: "The Lord of the Rings: The Fellowship of the Ring",
    targetType: "Movie",
    targetYear: 2001,
    connectionType: "Adaptation",
    description: "Peter Jackson's film adaptation of J.R.R. Tolkien's epic fantasy novel.",
    submittedBy: "fantasy_fan",
    submittedAt: "2023-09-15T14:32:00Z",
    upvotes: 127
  },
  {
    id: 2,
    sourceId: 3,
    sourceTitle: "1984",
    sourceType: "Book",
    sourceYear: 1949,
    targetId: 4,
    targetTitle: "V for Vendetta",
    targetType: "Movie",
    targetYear: 2005,
    connectionType: "Inspiration",
    description: "The dystopian themes and authoritarian government in V for Vendetta were inspired by George Orwell's 1984.",
    submittedBy: "bookworm42",
    submittedAt: "2023-10-05T09:23:45Z",
    upvotes: 89
  },
  {
    id: 3,
    sourceId: 5,
    sourceTitle: "Pride and Prejudice",
    sourceType: "Book",
    sourceYear: 1813,
    targetId: 6,
    targetTitle: "Bridget Jones's Diary",
    targetType: "Movie",
    targetYear: 2001,
    connectionType: "Modern Retelling",
    description: "Bridget Jones's Diary is a modern interpretation of Jane Austen's Pride and Prejudice.",
    submittedBy: "classic_lover",
    submittedAt: "2023-08-28T16:44:12Z",
    upvotes: 76
  }
];

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulate fetching data
  useEffect(() => {
    const fetchConnections = async () => {
      // In a real app, this would be an API call
      setLoading(true);
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setConnections(mockConnections);
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Cultural Connections
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore the relationships between different cultural works
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          to="/connections/create"
        >
          Add Connection
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>Loading connections...</Typography>
        </Box>
      ) : connections.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <LinkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Connections Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Be the first to add a cultural connection to our database.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            component={Link}
            to="/connections/create"
          >
            Add Connection
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {connections.map((connection) => (
            <Grid item xs={12} key={connection.id}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={connection.connectionType}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Submitted by {connection.submittedBy} on {formatDate(connection.submittedAt)}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 2
                  }}
                >
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      flex: 1,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {connection.sourceType === 'Movie' ? 
                        <MovieIcon fontSize="small" /> : 
                        <BookIcon fontSize="small" />
                      }
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {connection.sourceType} ({connection.sourceYear})
                      </Typography>
                    </Box>
                    <Typography variant="h6">
                      {connection.sourceTitle}
                    </Typography>
                  </Paper>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 1
                    }}
                  >
                    <LinkIcon color="action" />
                  </Box>
                  
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      flex: 1,
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {connection.targetType === 'Movie' ? 
                        <MovieIcon fontSize="small" /> : 
                        <BookIcon fontSize="small" />
                      }
                      <Typography variant="subtitle2" sx={{ ml: 1 }}>
                        {connection.targetType} ({connection.targetYear})
                      </Typography>
                    </Box>
                    <Typography variant="h6">
                      {connection.targetTitle}
                    </Typography>
                  </Paper>
                </Box>
                
                <Typography variant="body1" paragraph>
                  {connection.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    icon={<AddIcon />}
                    label={`${connection.upvotes} upvotes`}
                    variant="outlined"
                    size="small"
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    component={Link}
                    to={`/connections/${connection.id}`}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ConnectionsPage;