import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import image from '../assets/image.png';
import ImageEditor from './ImageEditor';

const UploadPage = ({ onSave, hasExistingImages, onCancel }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUploadClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsEditorOpen(true);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedFile(null);
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-white relative">
        {hasExistingImages && (
          <button
            onClick={onCancel}
            className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        <div className="text-center">
          <div className="w-full flex items-center justify-center">
            <img
              src={image}
              alt="Upload Illustration"
              className="w-96 h-96"
            />
          </div>
          <p className="mt-4 text-gray-400 text-lg font-semibold">Add Assets here</p>
          <button
            onClick={handleUploadClick}
            className="mt-6 px-8 py-3 bg-slate-600 text-white rounded-lg shadow-lg hover:bg-slate-300"
          >
            + Add
          </button>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </div>

      <ImageEditor
        isOpen={isEditorOpen}
        onClose={handleEditorClose}
        imageFile={selectedFile}
        onSave={onSave}
      />
    </>
  );
};

export default UploadPage;