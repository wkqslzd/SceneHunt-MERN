// src/components/MediaModal.jsx
import React from 'react';

const MediaModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="media-modal" 
      style={{
        display: isOpen ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        cursor: 'zoom-out'
      }}
      onClick={onClose}
    >
      <span 
        className="media-modal-close" 
        style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          color: '#fff',
          fontSize: '30px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={onClose}
      >&times;</span>
      <img 
        src={imageUrl} 
        alt="Zoomed image" 
        style={{
          maxWidth: '90%',
          maxHeight: '90vh',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default MediaModal;