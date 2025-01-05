import React, { useState } from 'react';
import UploadPage from './pages/UploadPage';
import MasonryGrid from './pages/MasonryGrid';

const App = () => {
  const [images, setImages] = useState([]);
  const [showUploadPage, setShowUploadPage] = useState(true);

  // Handle saving an image from either UploadPage or MasonryGrid
  const handleSaveImage = (imageData) => {
    console.log('Saving image:', imageData); // For debugging
    setImages((prev) => [...prev, imageData]);
    setShowUploadPage(false);
  };

  // Open UploadPage for adding new images
  const handleAddClick = () => {
    setShowUploadPage(true);
  };

  // Handle cancel action in UploadPage
  const handleCancel = () => {
    setShowUploadPage(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showUploadPage ? (
        <UploadPage
          onSave={handleSaveImage} // Pass the save handler
          hasExistingImages={images.length > 0}
          onCancel={handleCancel}
        />
      ) : (
        <MasonryGrid
          images={images} // Pass the images state to MasonryGrid
          onAddImage={handleSaveImage} // Allow adding images directly in MasonryGrid
          onAddClick={handleAddClick} // Trigger UploadPage from MasonryGrid
        />
      )}
    </div>
  );
};

export default App;
