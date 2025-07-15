// src/components/Card.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const MediaCard = ({ id, title, type, rating, description, image, year, director, author, genres }) => {
  const [saved, setSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Build the link path of the detail page
  const detailPath = `/${type.toLowerCase()}/${id}`;
  
  // Click the "Handle Collection" button
  const handleSaveClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    setSaved(!saved);
  };
  
  // Handle the click of the share button
  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`share《${title}》`);
  };
  
  return (
    <div 
      className="paper" 
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-8px)' : 'none',
        position: 'relative',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        backgroundImage: image ? `url(${process.env.VITE_BACKEND_URL}${image})` : `url(https://via.placeholder.com/300x180?text=${encodeURIComponent(title)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top area - Title and labels */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 2,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}>
        {/* Type and year labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{
            borderRadius: '50px',
            padding: '4px 12px',
            backgroundColor: type === 'Movie' ? '#1976d2' : '#9c27b0',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem'
          }}>
            {type}
          </div>
          
          {year && (
            <div style={{
              borderRadius: '50px',
              padding: '4px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '0.75rem'
            }}>
              {year}
            </div>
          )}
        </div>

        <Link to={detailPath} style={{ textDecoration: 'none', color: 'white' }}>
          <h2 style={{ 
            fontWeight: 'bold', 
            margin: '0',
            fontSize: '1.5rem',
            color: 'white',
            lineHeight: '1.2',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}>
            {title}
          </h2>
        </Link>
      </div>

      {/* Middle area - Author information and type labels */}
      <div style={{
        position: 'absolute',
        top: '65%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        padding: '0 20px',
        textAlign: 'center',
        zIndex: 2,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}>
        <Link to={detailPath} style={{ textDecoration: 'none' }}>
          <p style={{ 
            margin: '0 0 12px 0',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1rem',
            lineHeight: '1.4',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}>
            {type === 'screen' ? 'director: ' : 'author: '}
            {type === 'screen' ? director : author}
          </p>
        </Link>
        
        {/* Type labels */}
        {genres && genres.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px', 
            justifyContent: 'center',
            marginBottom: '12px' 
          }}>
            {genres.map((genre, idx) => (
              <span 
                key={idx} 
                style={{ 
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        
        <p style={{ 
          margin: '0',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          {description.length > 100 ? description.slice(0, 100) + '...' : description}
        </p>
      </div>
      
      {/* Bottom area - Operation buttons */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 2,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <button 
              style={{ 
                background: 'none',
                border: 'none',
                color: saved ? '#1976d2' : 'white',
                cursor: 'pointer',
                padding: '8px',
                margin: '0 4px 0 0'
              }}
              onClick={handleSaveClick}
            >
              {saved ? <BookmarkIcon style={{ fontSize: '24px' }} /> : <BookmarkBorderIcon style={{ fontSize: '24px' }} />}
            </button>
            <button 
              style={{ 
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px'
              }}
              onClick={handleShareClick}
            >
              <ShareIcon style={{ fontSize: '24px' }} />
            </button>
          </div>
          
          <Link 
            to={detailPath}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              padding: '8px 12px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '20px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              e.target.style.textDecoration = 'none';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
              e.target.style.textDecoration = 'none';
            }}
            onClick={(e) => e.stopPropagation()}
          >
            View Details
            <ArrowForwardIcon style={{ fontSize: '18px', marginLeft: '6px' }} />
          </Link>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 70,
        right: 20,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '6px 14px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 3
      }}>
        <StarIcon style={{ color: '#f5c518', fontSize: '20px', marginRight: '4px' }} />
        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {rating ? (rating * 2).toFixed(1) : '0.0'}
        </span>
      </div>
    </div>
  );
};

export default MediaCard;