import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, FlipHorizontal, FlipVertical, Upload, Edit, Check, Crop } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageEditor = ({ isOpen, onClose, imageFile, onSave }) => {
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [image, setImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [showEditTools, setShowEditTools] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isCropping, setIsCropping] = useState(false);
  const [aspect, setAspect] = useState(undefined);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Initialize image when imageFile changes
  useEffect(() => {
    if (imageFile) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        initializeCanvas(img);
        setTitle(imageFile.name.split('.')[0]);
      };
      img.src = URL.createObjectURL(imageFile);
      return () => URL.revokeObjectURL(img.src);
    }
  }, [imageFile]);

  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  // Initialize canvas with image
  const initializeCanvas = (img) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;

    setCanvas(canvas);
    setContext(ctx);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);
  };

  // Draw image on canvas
  const drawImage = () => {
    if (!context || !image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((rotation * Math.PI) / 180);
    context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    context.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );
    context.restore();
  };

  // Effect to redraw image when transformations change
  useEffect(() => {
    if (!isCropping) {
      drawImage();
    }
  }, [rotation, flipH, flipV, isCropping]);

  // Handle image transformations
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipH = () => {
    setFlipH((prev) => !prev);
  };

  const handleFlipV = () => {
    setFlipV((prev) => !prev);
  };

  const handleCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const handleCropClick = () => {
    setIsCropping(!isCropping);
    if (isCropping && completedCrop && imgRef.current) {
      // Apply crop to canvas
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Create new image from cropped canvas
      const croppedImage = new Image();
      croppedImage.onload = () => {
        setImage(croppedImage);
        initializeCanvas(croppedImage);
      };
      croppedImage.src = canvas.toDataURL();
    }
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  // Handle file replacement
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        initializeCanvas(img);
        setTitle(file.name.split('.')[0]);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  // Handle description input with character limit
  const handleDescriptionChange = (e) => {
    const input = e.target.value;
    if (input.length <= 200) {
      setDescription(input);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!title.trim()) {
      alert('Please enter a title for the image');
      return;
    }

    if (!canvasRef.current) {
      alert('Image not loaded properly');
      return;
    }

    setIsUploading(true);

    try {
      const blob = await new Promise((resolve, reject) => {
        canvasRef.current.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.95
        );
      });

      const file = new File([blob], `${title.trim()}.jpg`, {
        type: 'image/jpeg',
        lastModified: new Date().getTime(),
      });

      const imageData = {
        file,
        title: title.trim(),
        description: description.trim(),
        timestamp: new Date().toISOString(),
      };

      if (typeof onSave === 'function') {
        await onSave(imageData);
        handleClose();
      } else {
        throw new Error('onSave function not provided');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle editor close
  const handleClose = () => {
    if (isUploading) return;

    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTitle('');
    setDescription('');
    setShowEditTools(false);
    setIsCropping(false);
    setCrop(undefined);
    setCompletedCrop(undefined);

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-3/4 lg:w-2/3 bg-white shadow-xl transform 
      ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} 
      transition-all duration-300 ease-in-out z-50`}>
      <div className="h-16 border-b flex items-center justify-between px-6">
        <h2 className="text-xl font-semibold">Edit Asset</h2>
        <button 
          onClick={handleClose} 
          className="p-2 hover:bg-gray-100 rounded-full"
          disabled={isUploading}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex h-[calc(100%-4rem)]">
        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            {isCropping ? (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => handleCropComplete(c)}
                aspect={aspect}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={URL.createObjectURL(imageFile)}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-full"
                />
              </ReactCrop>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full border shadow-sm"
              />
            )}
            
            <button
              onClick={() => setShowEditTools(!showEditTools)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              disabled={isUploading}
            >
              {showEditTools ? <Check className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>

            {showEditTools && (
              <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
                <button 
                  onClick={handleCropClick} 
                  className={`p-2 hover:bg-gray-100 rounded-full ${isCropping ? 'bg-blue-100' : ''}`}
                  disabled={isUploading}
                  title={isCropping ? "Apply Crop" : "Crop"}
                >
                  <Crop className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleRotate} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  disabled={isUploading || isCropping}
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleFlipH} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  disabled={isUploading || isCropping}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleFlipV} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  disabled={isUploading || isCropping}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  disabled={isUploading || isCropping}
                  title="Replace Image"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-80 border-l p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
              placeholder="Enter image title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
              <span className="text-gray-500 text-sm ml-2">
                ({description.length}/200)
              </span>
            </label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              rows={4}
              maxLength={200}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
              placeholder="Enter image description (optional)"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || !title.trim() || isCropping}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 
              ${isUploading || !title.trim() || isCropping
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'} 
              text-white rounded-lg transition-colors`}
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;