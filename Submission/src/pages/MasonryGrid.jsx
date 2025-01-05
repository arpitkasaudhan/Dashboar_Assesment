import React, { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import ImageEditor from './ImageEditor';

const MasonryGrid = ({ images, onAddImage }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);

  const handleAddClick = () => {
    // Trigger hidden file input for image upload
    document.getElementById('image-upload-input').click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const timestamp = new Date().toISOString();
      const newImage = {
        file,
        title: file.name.split('.')[0],
        description: '',
        timestamp,
      };
      setUploadingImage(newImage);
      setIsEditorOpen(true); // Open the editor
    }
  };

  const handleSaveImage = (imageData) => {
    if (onAddImage) onAddImage(imageData); // Save the image using callback
    setIsEditorOpen(false); // Close the editor
    setUploadingImage(null); // Reset the uploaded image
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Image</span>
        </button>
        {/* Hidden file input */}
        <input
          type="file"
          id="image-upload-input"
          className="hidden"
          onChange={handleImageUpload}
          accept="image/*"
        />
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="break-inside-avoid mb-4 relative group"
            onClick={() => handleImageClick(image)}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={URL.createObjectURL(image.file)}
                alt={image.title}
                className="w-full h-auto"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{image.title}</h3>
                {image.description && (
                  <p className="mt-1 text-sm text-gray-500">{image.description}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(image.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* Like button */}
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="w-6 h-6 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No images uploaded yet.</p>
          <button
            onClick={handleAddClick}
            className="mt-4 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Upload your first image
          </button>
        </div>
      )}

      {/* Image Editor */}
      {isEditorOpen && (
        <ImageEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          imageFile={uploadingImage.file}
          onSave={handleSaveImage}
        />
      )}

      {/* Image Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            <button
              className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              onClick={closeImageViewer}
            >
              <Plus className="w-6 h-6 transform rotate-45" />
            </button>
            <img
              src={URL.createObjectURL(selectedImage.file)}
              alt={selectedImage.title}
              className="w-full max-h-96 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-bold text-gray-900">{selectedImage.title}</h3>
            {selectedImage.description && (
              <p className="mt-2 text-sm text-gray-600">{selectedImage.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
