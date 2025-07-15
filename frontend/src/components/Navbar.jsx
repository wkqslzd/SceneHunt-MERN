// src/components/Navbar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Container,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchType, setSearchType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState('');
  const [menuTab, setMenuTab] = useState('all');
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  // Menu switch
  const handleMenuTab = (val) => {
    setMenuTab(val);
    // Optional: jump to the main interface and filter content
    if (val === 'all') navigate('/');
    else navigate(`/?type=${val}`);
  };

  // Search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('search triggered', keyword, searchType);
    const params = [];
    if (searchType !== 'all') params.push(`type=${searchType}`);
    if (keyword) params.push(`title=${encodeURIComponent(keyword)}`);
    if (year) params.push(`year=${encodeURIComponent(year)}`);
    navigate(`/?${params.join('&')}`);
  };

  const menuItems = [
    {
      key: 'user-management',
      label: 'User Management',
      icon: <UserOutlined />,
      onClick: () => {
        navigate('/admin/profile');
        handleClose();
      }
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: '#121212', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Container maxWidth={false} sx={{ px: { xs: 1, md: 6 } }}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          {/* Left Logo+menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="h5" component={Link} to="/" sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              mr: 2
            }}>
              SceneHunt
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={menuTab === 'all' ? 'contained' : 'text'}
                sx={{
                  bgcolor: menuTab === 'all' ? '#f5c518' : 'transparent',
                  color: menuTab === 'all' ? '#222' : '#fff',
                  fontWeight: menuTab === 'all' ? 'bold' : 'normal',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    bgcolor: menuTab === 'all' ? '#e5b408' : '#222',
                    color: '#f5c518'
                  }
                }}
                onClick={() => handleMenuTab('all')}
              >
                All
              </Button>
              <Button
                variant={menuTab === 'movie' ? 'contained' : 'text'}
                sx={{
                  bgcolor: menuTab === 'movie' ? '#f5c518' : 'transparent',
                  color: menuTab === 'movie' ? '#222' : '#fff',
                  fontWeight: menuTab === 'movie' ? 'bold' : 'normal',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    bgcolor: menuTab === 'movie' ? '#e5b408' : '#222',
                    color: '#f5c518'
                  }
                }}
                onClick={() => handleMenuTab('movie')}
              >
                Screens
              </Button>
                <Button
                variant={menuTab === 'book' ? 'contained' : 'text'}
                  sx={{
                  bgcolor: menuTab === 'book' ? '#f5c518' : 'transparent',
                  color: menuTab === 'book' ? '#222' : '#fff',
                  fontWeight: menuTab === 'book' ? 'bold' : 'normal',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                    bgcolor: menuTab === 'book' ? '#e5b408' : '#222',
                      color: '#f5c518'
                    }
                  }}
                onClick={() => handleMenuTab('book')}
                >
                Books
                </Button>
            </Box>
          </Box>

          {/* Right search+login */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 80, bgcolor: '#fff', borderRadius: 1 }}>
                <Select
                  value={searchType}
                  onChange={e => setSearchType(e.target.value)}
                  displayEmpty
                  sx={{ height: 40 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="movie">Screens</MenuItem>
                  <MenuItem value="book">Books</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                placeholder="Search..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                sx={{
                  width: 200,
                  bgcolor: '#fff',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    height: 40
                  }
                }}
              />
              <IconButton
                type="submit"
                sx={{
                  bgcolor: '#f5c518',
                  color: '#222',
                  '&:hover': {
                    bgcolor: '#e5b408'
                  }
                }}
              >
                <SearchIcon />
              </IconButton>
            </Box>

            {/* User avatar and menu */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleClick}
                  sx={{ ml: 2, bgcolor: '#fff', '&:hover': { bgcolor: '#f5f5f5' } }}
                >
                  <Avatar
                    src={user?.avatar}
                    sx={{ width: 32, height: 32, backgroundColor: '#fff', padding: '4px', boxShadow: '0 0 0 2px #fff' }}
                  />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {menuItems.map(item => (
                    <MenuItem key={item.key} onClick={item.onClick}>
                      {item.icon}
                      <span style={{ marginLeft: 8 }}>{item.label}</span>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#fff',
                    borderColor: '#fff',
                    '&:hover': {
                      borderColor: '#f5c518',
                      color: '#f5c518'
                    }
                  }}
            >
              Login
            </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{
                    bgcolor: '#f5c518',
                    color: '#222',
                    '&:hover': {
                      bgcolor: '#e5b408'
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;