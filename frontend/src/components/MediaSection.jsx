// src/components/MediaSection.jsx
import React, { useState } from 'react';

const MediaSection = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const openUploadModal = () => {
    setUploadModalOpen(true);
  };
  
  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };
  
  // Handle click on blank area to close modal
  const handleModalClick = (e) => {
    if (e.target.className === 'media-upload-modal') {
      closeUploadModal();
    }
  };
  
  return (
    <div className="media-section" style={{
      margin: '20px 0',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="media-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <h2 className="media-title" style={{
          fontSize: '1.5rem',
          color: '#121212',
          margin: 0,
          fontWeight: 'bold'
        }}>相关视频和图片</h2>
        <button 
          className="media-upload-btn" 
          style={{
            padding: '8px 16px',
            backgroundColor: '#f5c518',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
          onClick={openUploadModal}
        >上传</button>
      </div>
      
      <div className="media-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '20px',
        padding: '20px'
      }}>
        <div className="media-item video" style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}>
          <img 
            src="https://static.tvtropes.org/pmwiki/pub/images/rsz_much_ado.jpg" 
            alt="预告片4" 
            style={{
              width: '100%',
              height: '150px',
              objectFit: 'cover'
            }}
          />
          <div className="media-item-info" style={{
            padding: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            fontSize: '0.9rem'
          }}>相关视频</div>
        </div>
        
        <div className="media-item" style={{
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}>
          <img 
            src="https://static.tvtropes.org/pmwiki/pub/images/rsz_much_ado.jpg" 
            alt="剧照38" 
            style={{
              width: '100%',
              height: '150px',
              objectFit: 'cover'
            }}
          />
          <div className="media-item-info" style={{
            padding: '10px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            fontSize: '0.9rem'
          }}>相关图片</div>
        </div>
      </div>
      
      {/* Upload media modal */}
      <div 
        className="media-upload-modal" 
        style={{
          display: uploadModalOpen ? 'block' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000
        }}
        onClick={handleModalClick}
      >
        <div className="media-upload-content" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px'
        }}>
          <span 
            className="media-upload-close" 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
            onClick={closeUploadModal}
          >&times;</span>
          
          <h3 style={{ marginBottom: '20px' }}>上传视频/图片</h3>
          
          <form className="media-upload-form" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <select 
              name="mediaType" 
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            >
              <option value="">选择类型</option>
              <option value="video">视频</option>
              <option value="image">图片</option>
            </select>
            
            <input 
              type="file" 
              name="mediaFile" 
              accept="video/*,image/*" 
              required
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            
            <input 
              type="text" 
              name="description" 
              placeholder="添加描述" 
              required
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            
            <button 
              type="submit" 
              className="media-upload-btn"
              style={{
                padding: '10px 0',
                backgroundColor: '#f5c518',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >上传</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MediaSection;