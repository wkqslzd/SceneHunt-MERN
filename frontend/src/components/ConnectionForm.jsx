import React, { useState, useEffect } from 'react';
import { 
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  FormHelperText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardMedia,
  IconButton
} from '@mui/material';
import {
  Link as LinkIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Movie as MovieIcon,
  Book as BookIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Mock media search function - would be replaced with API calls in a real app
const searchMedia = async (query, type = 'all') => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const allMedia = [
    {
      id: 1,
      title: "The Lord of the Rings: The Fellowship of the Ring",
      type: "Movie",
      year: 2001,
      director: "Peter Jackson",
      image: "https://source.unsplash.com/random/300x450?movie",
    },
    {
      id: 2,
      title: "The Lord of the Rings",
      type: "Book",
      year: 1954,
      author: "J.R.R. Tolkien",
      image: "https://source.unsplash.com/random/300x450?book",
    },
    {
      id: 3,
      title: "The Shawshank Redemption",
      type: "Movie",
      year: 1994,
      director: "Frank Darabont",
      image: "https://source.unsplash.com/random/300x450?prison",
    },
    {
      id: 4,
      title: "1984",
      type: "Book",
      year: 1949,
      author: "George Orwell",
      image: "https://source.unsplash.com/random/300x450?dystopia",
    },
    {
      id: 5,
      title: "The Great Gatsby",
      type: "Book",
      year: 1925,
      author: "F. Scott Fitzgerald",
      image: "https://source.unsplash.com/random/300x450?gatsby",
    },
    {
      id: 6,
      title: "Inception",
      type: "Movie",
      year: 2010,
      director: "Christopher Nolan",
      image: "https://source.unsplash.com/random/300x450?dream",
    }
  ];
  
  // Filter by type if specified
  let filteredMedia = allMedia;
  if (type !== 'all') {
    filteredMedia = allMedia.filter(item => item.type.toLowerCase() === type.toLowerCase());
  }
  
  // Filter by query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredMedia = filteredMedia.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.director && item.director.toLowerCase().includes(lowerQuery)) ||
      (item.author && item.author.toLowerCase().includes(lowerQuery))
    );
  }
  
  return filteredMedia;
};

// Connection types
const connectionTypes = [
  "Adaptation",
  "Inspiration",
  "Reference",
  "Homage",
  "Parody",
  "Sequel",
  "Prequel",
  "Remake",
  "Reboot",
  "Spin-off",
  "Shared Universe"
];

const ConnectionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const sourceParam = queryParams.get('source');
  
  // Get current step from URL or default to 0
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state
  const [sourceMedia, setSourceMedia] = useState(null);
  const [targetMedia, setTargetMedia] = useState(null);
  const [connectionType, setConnectionType] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFor, setSearchFor] = useState('source'); // 'source' or 'target'
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Load source media from URL parameter if provided
  useEffect(() => {
    const loadSourceFromParam = async () => {
      if (sourceParam) {
        const [type, id] = sourceParam.split('-');
        if (type && id) {
          // In a real app, you would fetch the media details from your API
          const allMedia = await searchMedia('');
          const foundMedia = allMedia.find(
            media => media.id.toString() === id && media.type.toLowerCase() === type
          );
          
          if (foundMedia) {
            setSourceMedia(foundMedia);
            setSearchFor('target');
          }
        }
      }
    };
    
    loadSourceFromParam();
  }, [sourceParam]);
  
  // Handle search
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await searchMedia(searchQuery, searchType);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Select media for source or target
  const handleSelectMedia = (media) => {
    if (searchFor === 'source') {
      setSourceMedia(media);
      setSearchFor('target');
      setSearchQuery('');
      setSearchResults([]);
    } else {
      setTargetMedia(media);
      setActiveStep(1);
      setSearchQuery('');
      setSearchResults([]);
    }
  };
  
  // Clear selected media
  const handleClearMedia = (type) => {
    if (type === 'source') {
      setSourceMedia(null);
      setSearchFor('source');
    } else {
      setTargetMedia(null);
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!connectionType) {
      newErrors.connectionType = 'Please select a connection type';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (description.length < 10) {
      newErrors.description = 'Description is too short';
    }
    
    if (!evidence.trim()) {
      newErrors.evidence = 'Please provide supporting evidence';
    } else if (evidence.length < 20) {
      newErrors.evidence = 'Evidence is too brief';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to save the connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful submission
      setSubmitSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setActiveStep(2);
      }, 1000);
      
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step content - Step 1: Select media
  const renderSelectMediaStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Source and Target
      </Typography>
      <Typography variant="body1" paragraph>
        Choose two works to establish a cultural connection between them.
      </Typography>
      
      {/* Selected media display */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Source media */}
        <Grid item xs={12} sm={5}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Source:
          </Typography>
          {sourceMedia ? (
            <Card sx={{ display: 'flex', position: 'relative' }}>
              <CardMedia
                component="img"
                sx={{ width: 80 }}
                image={sourceMedia.image}
                alt={sourceMedia.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                  <Typography component="div" variant="subtitle1">
                    {sourceMedia.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sourceMedia.type} ({sourceMedia.year})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sourceMedia.type === 'Movie' ? sourceMedia.director : sourceMedia.author}
                  </Typography>
                </CardContent>
              </Box>
              <IconButton 
                aria-label="clear" 
                onClick={() => handleClearMedia('source')}
                sx={{ position: 'absolute', top: 5, right: 5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Card>
          ) : (
            <Paper
              variant="outlined"
              sx={{ 
                p: 2, 
                height: 120, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: searchFor === 'source' ? 'action.selected' : 'inherit'
              }}
              onClick={() => setSearchFor('source')}
            >
              <Typography color="text.secondary" align="center">
                {searchFor === 'source' ? 'Searching for source...' : 'Click to search for source'}
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* Arrow */}
        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowForwardIcon fontSize="large" color="action" />
        </Grid>
        
        {/* Target media */}
        <Grid item xs={12} sm={5}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Target:
          </Typography>
          {targetMedia ? (
            <Card sx={{ display: 'flex', position: 'relative' }}>
              <CardMedia
                component="img"
                sx={{ width: 80 }}
                image={targetMedia.image}
                alt={targetMedia.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                  <Typography component="div" variant="subtitle1">
                    {targetMedia.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {targetMedia.type} ({targetMedia.year})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {targetMedia.type === 'Movie' ? targetMedia.director : targetMedia.author}
                  </Typography>
                </CardContent>
              </Box>
              <IconButton 
                aria-label="clear" 
                onClick={() => handleClearMedia('target')}
                sx={{ position: 'absolute', top: 5, right: 5 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Card>
          ) : (
            <Paper
              variant="outlined"
              sx={{ 
                p: 2, 
                height: 120, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: searchFor === 'target' ? 'action.selected' : 'inherit'
              }}
              onClick={() => setSearchFor('target')}
            >
              <Typography color="text.secondary" align="center">
                {searchFor === 'target' ? 'Searching for target...' : 'Click to search for target'}
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Search box */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search for {searchFor === 'source' ? 'Source' : 'Target'} Media
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Title, author, or director..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Type</InputLabel>
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="movie">Screens</MenuItem>
                <MenuItem value="book">Books</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={isSearching}
              sx={{ height: '56px' }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Search results */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Search Results
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((media) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={`${media.type}-${media.id}`}>
                <Card 
                  sx={{ 
                    display: 'flex', 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleSelectMedia(media)}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 80 }}
                    image={media.image}
                    alt={media.title}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="subtitle1">
                        {media.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {media.type} ({media.year})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {media.type === 'Movie' ? media.director : media.author}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          disabled={!sourceMedia || !targetMedia}
          onClick={() => setActiveStep(1)}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
  
  // Step 2: Connection details
  const renderConnectionDetailsStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Define the Connection
      </Typography>
      <Typography variant="body1" paragraph>
        Explain how these works are connected and provide supporting evidence.
      </Typography>
      
      {/* Selected media summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography variant="subtitle1" fontWeight="bold">
              {sourceMedia.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sourceMedia.type} ({sourceMedia.year})
            </Typography>
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LinkIcon color="primary" />
          </Grid>
          <Grid item xs={5}>
            <Typography variant="subtitle1" fontWeight="bold">
              {targetMedia.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {targetMedia.type} ({targetMedia.year})
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <form onSubmit={handleSubmit}>
        {/* Connection type */}
        <FormControl 
          fullWidth 
          variant="outlined" 
          sx={{ mb: 3 }}
          error={!!errors.connectionType}
        >
          <InputLabel>Connection Type</InputLabel>
          <Select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            label="Connection Type"
          >
            {connectionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.connectionType}</FormHelperText>
        </FormControl>
        
        {/* Description */}
        <TextField
          fullWidth
          variant="outlined"
          label="Description"
          placeholder="Describe how these works are connected..."
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          sx={{ mb: 3 }}
        />
        
        {/* Evidence */}
        <TextField
          fullWidth
          variant="outlined"
          label="Supporting Evidence"
          placeholder="Provide concrete examples, quotes, scenes, or other evidence to support this connection..."
          multiline
          rows={5}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          error={!!errors.evidence}
          helperText={errors.evidence}
          sx={{ mb: 3 }}
        />
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setActiveStep(0)}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Connection'}
          </Button>
        </Box>
      </form>
    </Box>
  );
  
  // Step 3: Success
  const renderSuccessStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Connection Submitted Successfully!
      </Typography>
      <Typography variant="body1" paragraph>
        Thank you for contributing to our cultural knowledge base. Your submission will be reviewed by our team.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          component={Link}
          to="/"
        >
          Return Home
        </Button>
        <Button
          variant="contained"
          component={Link}
          to={`/${sourceMedia.type.toLowerCase()}/${sourceMedia.id}`}
        >
          View Source Page
        </Button>
      </Box>
    </Box>
  );
  
  // Render different content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderSelectMediaStep();
      case 1:
        return renderConnectionDetailsStep();
      case 2:
        return renderSuccessStep();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Create Cultural Connection
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Contribute to our knowledge base by identifying connections between different cultural works.
        </Typography>
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Select Works</StepLabel>
          </Step>
          <Step>
            <StepLabel>Define Connection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Step content */}
        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default ConnectionForm;