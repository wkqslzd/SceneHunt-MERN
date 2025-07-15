// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import MediaCard from '../components/Card';
import { useLocation, useNavigate } from 'react-router-dom';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  // Parse URL parameters
  function getParamsFromUrl() {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const title = params.get('title') || '';
    const year = params.get('year') || '';
    let tab = 'all';
    if (type === 'movie') tab = 'screens';
    if (type === 'book') tab = 'books';
    return { tab, title, year };
  }
  const [{ tab: activeTab, title: searchTitle, year: searchYear }, setTabState] = useState(getParamsFromUrl());
  const [displayedMedia, setDisplayedMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Listen for URL parameter changes and automatically switch tabs and search
  useEffect(() => {
    setTabState(getParamsFromUrl());
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    console.log('Start getting the works list...');
    fetch('/api/works', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('Receive response:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Backend returns data:', data);
        // Only keep book and screen types
        let filteredData = data.filter(item => item.type === 'book' || item.type === 'screen');
        console.log('Filtered data:', filteredData);
        // Type filtering
        if (activeTab === 'screens') {
          filteredData = filteredData.filter(item => item.type === 'screen');
        } else if (activeTab === 'books') {
          filteredData = filteredData.filter(item => item.type === 'book');
        }
        // Keyword filtering
        if (searchTitle) {
          const kw = searchTitle.toLowerCase();
          filteredData = filteredData.filter(item =>
            item.title && item.title.toLowerCase().includes(kw)
          );
        }
        // Year filtering
        if (searchYear) {
          filteredData = filteredData.filter(item => String(item.year) === String(searchYear));
        }
        setDisplayedMedia(filteredData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to obtain the works list:', error);
        setDisplayedMedia([]);
        setLoading(false);
      });
  }, [activeTab, searchTitle, searchYear]);
  
  return (
    <div style={{ 
      width: '100vw', 
      maxWidth: '100%',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Page title */}
      {/* Display sections */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p>loading...</p>
        </div>
      ) : displayedMedia.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: '1.2rem' }}>
          No relevant content found
        </div>
      ) : activeTab === 'all' ? (
        <>
          {/* Film and TV Works Block */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 4, color: '#222' }}>Screens</Typography>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              maxWidth: '1100px',
              width: '100%'
            }}>
              {displayedMedia.filter(item => item.type === 'screen').map((item) => (
                <div key={item._id} style={{ height: '100%', width: '100%' }}>
                  <MediaCard
                    id={item._id}
                    title={item.title}
                    type={item.type}
                    rating={item.averageRating}
                    description={item.description}
                    image={item.coverImages ? item.coverImages[0] : ''}
                    year={item.year}
                    director={item.director}
                    author={item.author}
                    genres={item.genres}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Books section */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 6, color: '#222' }}>Books</Typography>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              maxWidth: '1100px',
              width: '100%'
            }}>
              {displayedMedia.filter(item => item.type === 'book').map((item) => (
                <div key={item._id} style={{ height: '100%', width: '100%' }}>
                  <MediaCard
                    id={item._id}
                    title={item.title}
                    type={item.type}
                    rating={item.averageRating}
                    description={item.description}
                    image={item.coverImages ? item.coverImages[0] : ''}
                    year={item.year}
                    director={item.director}
                    author={item.author}
                    genres={item.genres}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '100%'
        }}>
          {displayedMedia.map((item) => (
            <div key={item._id} style={{ height: '100%', width: '100%' }}>
              <MediaCard
                id={item._id}
                title={item.title}
                type={item.type}
                rating={item.averageRating}
                description={item.description}
                image={item.coverImages && item.coverImages.length > 0 ? item.coverImages[0] : ''}
                year={item.year}
                director={item.director}
                author={item.author}
                genres={item.genres}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Show more button */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button 
          style={{ 
            backgroundColor: '#f5c518',
            color: '#000',
            padding: '12px 32px',
            border: 'none',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background-color 0.3s'
          }}
        >
          Load More
        </button>
      </div>
    </div>
  );
}

export default Home;