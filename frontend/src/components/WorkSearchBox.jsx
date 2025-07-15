import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const WorkSearchBox = ({ onSelect, compact = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/works/search?title=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.works);
      }
    } catch (error) {
      console.error('Error searching works:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (work) => {
    if (onSelect) {
      onSelect({
        _id: work._id,
        title: work.title,
        type: work.type,
        year: work.year,
        url: `/${work.type}/${work._id}`
      });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 1,
        mb: compact ? 1 : 2
      }}>
        <FormControl 
          size={compact ? "small" : "medium"} 
          sx={{ minWidth: 120 }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            value={searchType}
            label="Type"
            onChange={(e) => setSearchType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="screen">Screens</MenuItem>
            <MenuItem value="book">Books</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          size={compact ? "small" : "medium"}
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {searchResults.length > 0 && (
        <Paper 
          elevation={3} 
          sx={{ 
            mt: 1,
            maxHeight: 300,
            overflow: 'auto'
          }}
        >
          <List>
            {searchResults.map((work) => (
              <ListItem 
                button 
                key={work._id}
                onClick={() => handleSelect(work)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemText
                  primary={work.title}
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {work.type} ({work.year})
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default WorkSearchBox; 