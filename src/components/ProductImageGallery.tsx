import React from 'react';

interface ProductImageGalleryProps {
  images?: string[];
  selectedImage: string | null;
  setSelectedImage: (img: string) => void;
  title: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, selectedImage, setSelectedImage, title }) => (
  <div>
    {selectedImage ? (
      <img
        src={selectedImage}
        alt={title}
        className="w-full h-96 object-cover rounded-lg"
      />
    ) : (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <span className="text-gray-400 text-2xl">No Image</span>
      </div>
    )}
    {images && images.length > 1 && (
      <div className="mt-4 grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`relative rounded-md overflow-hidden ${selectedImage === image ? 'ring-2 ring-purple-500' : ''}`}
          >
            <img
              src={image}
              alt={`${title} ${index + 1}`}
              className="w-full h-20 object-cover"
            />
          </button>
        ))}
      </div>
    )}
  </div>
);
