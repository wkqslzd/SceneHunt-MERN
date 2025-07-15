import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkSearchBox from './WorkSearchBox';

const ImageUploadBox = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed #ccc',
  borderRadius: 8,
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#f5c518',
  },
}));

const WorkInfoBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: '#f9f9f9',
  borderRadius: 4,
}));

function ConnectionSubmissionForm({ currentWork, onSubmit }) {
  const [searchParams] = useSearchParams();
  const connectionType = searchParams.get('type') || 'Other';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    workAImage: null,
    workBImage: null,
    workBId: '',
    workBTitle: '',
    workBType: '',
    workBYear: '',
    direction: '',
    connectionType,
    explanation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [workSearchKey, setWorkSearchKey] = useState(0);
  const [success, setSuccess] = useState(false);

  // A function for calculating the number of English words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Handle the change of the explanation text
  const handleExplanationChange = (e) => {
    const text = e.target.value;
    const words = countWords(text);
    setWordCount(words);
    setFormData(prev => ({ ...prev, explanation: text }));
  };

  // Handle the selection of works
  const handleWorkSelect = (selectedWork) => {
    setFormData(prev => ({
      ...prev,
      workBId: selectedWork._id,
      workBTitle: selectedWork.title,
      workBType: selectedWork.type,
      workBYear: selectedWork.year
    }));
    setWorkSearchKey(prev => prev + 1);
  };

  const handleImageUpload = (work, event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [work]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all required fields
    if (!formData.workAImage || !formData.workBImage ||
        !formData.workBId || !formData.workBTitle || !formData.workBType || !formData.workBYear ||
        !formData.direction || !formData.connectionType || !formData.explanation) {
      setError('Please complete all required fields before submitting.');
      return;
    }
    // Validate the number of words
    if (wordCount > 100) {
      setError('Explanation cannot exceed 100 words');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const workAObj = {
        _id: currentWork._id,
        title: currentWork.title,
        type: currentWork.type,
        year: currentWork.year
      };
      const workBObj = {
        _id: formData.workBId,
        title: formData.workBTitle,
        type: formData.workBType,
        year: formData.workBYear
      };
      console.log('DEBUG workA:', workAObj);
      console.log('DEBUG workB:', workBObj);
      const formDataToSend = new FormData();
      // workA
      formDataToSend.append('workA', JSON.stringify(workAObj));
      if (formData.workAImage) {
        formDataToSend.append('workAImage', formData.workAImage);
      }
      // workB
      formDataToSend.append('workB', JSON.stringify(workBObj));
      if (formData.workBImage) {
        formDataToSend.append('workBImage', formData.workBImage);
      }
      // Other fields
      formDataToSend.append('direction', formData.direction);
      formDataToSend.append('type', formData.connectionType);
      formDataToSend.append('userComment', formData.explanation);

      await onSubmit(formDataToSend);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('Failed to submit connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Share Your Discovery
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Connection Evidence
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your connection has been submitted successfully! Redirecting to the home page...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Image upload area */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* Work A */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work A (current work page)
            </Typography>
            <ImageUploadBox component="label">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload('workAImage', e)}
              />
              {formData.workAImage ? (
                <img
                  src={URL.createObjectURL(formData.workAImage)}
                  alt="Work A"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography color="textSecondary">
                  Upload an image or scene from the current work (fragment or specific moment).
                </Typography>
              )}
            </ImageUploadBox>
            <WorkInfoBox>
              <Typography variant="subtitle2">Title: {currentWork.title}</Typography>
              <Typography variant="body2">
                Type: {currentWork.type} | Year: {currentWork.year}
              </Typography>
            </WorkInfoBox>
          </Box>

          {/* Work B */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Work B
            </Typography>
            <ImageUploadBox component="label">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload('workBImage', e)}
              />
              {formData.workBImage ? (
                <img
                  src={URL.createObjectURL(formData.workBImage)}
                  alt="Work B"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography color="textSecondary">
                  Upload an image or scene from the work you want to link (fragment or specific moment).
                </Typography>
              )}
            </ImageUploadBox>
            <WorkInfoBox>
              {formData.workBTitle ? (
                <>
                  <Typography variant="subtitle2">Title: {formData.workBTitle}</Typography>
                  <Typography variant="body2">
                    Type: {formData.workBType} | Year: {formData.workBYear}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Please select a work below
                </Typography>
              )}
            </WorkInfoBox>
            <Box sx={{ mt: 2 }}>
              <WorkSearchBox key={workSearchKey} onSelect={handleWorkSelect} />
            </Box>
          </Box>
        </Box>

        {/* Warning message about year order */}
        <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
          <Typography variant="body2" color="#856404">
            Note: The year of the inspiring work (upstream) should not be later than the inspired work (downstream). Otherwise, you will receive an error: "Failed to submit connection. Please try again".
          </Typography>
        </Box>

        {/* Select the direction of influence */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Direction of Influence</InputLabel>
          <Select
            value={formData.direction}
            onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value }))}
            label="Select Direction of Influence"
          >
            <MenuItem value="Work A (current page) is the inspiration for Work B (selected).">
              Work A (current page) is the inspiration for Work B (selected).
            </MenuItem>
            <MenuItem value="Work B (selected) is the inspiration for Work A (current page).">
              Work B (selected) is the inspiration for Work A (current page).
            </MenuItem>
          </Select>
        </FormControl>

        {/* Display the type of connection (read-only) */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Type of Connection
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#666' }}>
            {connectionType}
          </Typography>
        </Box>

        {/* Explanation input box */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Provide Evidence or Explanation"
            placeholder="Briefly explain how these two works are connected. Provide specific details or examples (100 words max)."
            value={formData.explanation}
            onChange={handleExplanationChange}
            error={wordCount > 100}
            helperText={`${wordCount}/100 words`}
          />
          {wordCount > 100 && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              Your explanation exceeds the 100-word limit. Please shorten it.
            </Typography>
          )}
        </Box>

        {/* Submit button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || wordCount > 100}
            sx={{
              bgcolor: '#f5c518',
              color: '#000',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: '#e6b800',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Connection'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default ConnectionSubmissionForm; 