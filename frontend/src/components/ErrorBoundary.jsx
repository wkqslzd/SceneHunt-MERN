// src/components/ErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update the state to display the error UI on the next render
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can record the error information here
    console.error("Component error:", error);
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom error display
      return (
        <Paper sx={{ p: 3, borderRadius: 1, bgcolor: '#fff8f8' }}>
          <Typography variant="h6" color="error" gutterBottom>
            组件加载失败
          </Typography>
          <Typography variant="body1" paragraph>
            抱歉，此部分内容暂时无法显示。我们正在修复此问题。
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => this.setState({ hasError: false, error: null })}
              sx={{ mr: 1 }}
            >
              重试
            </Button>
          </Box>
        </Paper>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;