import React, { useState, useEffect } from 'react';
import { Card, Spin } from 'antd';
import {
  EnvironmentOutlined,
  CarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

// The main application component for the image display.
const App = (props) => {
  const {
    leftImageUrl,
    rightImageUrl,
    filePathLargeEn,
    filePathLargeKh,
    largeImageEn,
    largeImageKh,
    filePathSmallEn,
    filePathSmallKh,
    smallImageEn,
    smallImageKh,
    getFileImage,
  } = props;

  // State to track the index of the currently displayed image in the large slideshow mode.
  const [currentLargeImageIndex, setCurrentLargeImageIndex] = useState(0);
  // State to track the index of the currently displayed image in the small slideshow mode.
  const [currentSmallImageIndex, setCurrentSmallImageIndex] = useState(0);
  // State to track the current view mode: 'slideshow' or 'grid'.
  const [viewMode, setViewMode] = useState('slideshow');

  // Loading states
  const [mainLoading, setMainLoading] = useState(true);
  const [thumbLoading, setThumbLoading] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Helper to resolve correct URL from (path, file) or already full urls
  const resolveImage = (path, file) => {
    const candidate = file || path;
    if (!candidate) return null;

    // If API already returns full URL (like your new data), just use it
    if (typeof candidate === 'string' && candidate.startsWith('http')) {
      return candidate;
    }

    // Fallback to old behavior if you still use filePath + fileName
    if (getFileImage && path && file) {
      return getFileImage(`${path}/${file}`);
    }

    if (getFileImage) {
      return getFileImage(candidate);
    }

    return candidate;
  };

  // Inject props into arrays (large mode) – keep existing logic
  const largeImages = [
    ...(leftImageUrl ? [leftImageUrl] : []),
    ...(rightImageUrl ? [rightImageUrl] : []),
    resolveImage(filePathLargeEn, largeImageEn),
    resolveImage(filePathLargeKh, largeImageKh),
  ].filter(Boolean);

  const smallImages = [
    ...(leftImageUrl ? [leftImageUrl] : []),
    ...(rightImageUrl ? [rightImageUrl] : []),
    resolveImage(filePathSmallEn, smallImageEn),
    resolveImage(filePathSmallKh, smallImageKh),
  ].filter(Boolean);

  // Use resolved URLs for the thumbnail gallery
  const allImages = [
    resolveImage(filePathLargeEn, largeImageEn),
    resolveImage(filePathLargeKh, largeImageKh),
    resolveImage(filePathSmallEn, smallImageEn),
    resolveImage(filePathSmallKh, smallImageKh),
  ].filter(Boolean);

  // Reset thumbnail loading + main loading when image list changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setMainLoading(true);
    setThumbLoading(allImages.map(() => true));
  }, [allImages.length]);

  // A useEffect hook to handle the automatic progression for the large image slideshow.
  useEffect(() => {
    let intervalId;
    if (viewMode === 'slideshow' && largeImages.length > 0) {
      setCurrentLargeImageIndex((prevIndex) =>
        largeImages.length === 0 ? 0 : (prevIndex + 1) % largeImages.length
      );
    }
    return () => clearInterval(intervalId);
  }, [largeImages.length, viewMode]);

  // A separate useEffect hook for the automatic progression of the small image slideshow.
  useEffect(() => {
    let intervalId;
    if (viewMode === 'grid' && smallImages.length > 0) {
      setCurrentSmallImageIndex((prevIndex) =>
        smallImages.length === 0 ? 0 : (prevIndex + 1) % smallImages.length
      );
    }
    return () => clearInterval(intervalId);
  }, [smallImages.length, viewMode]);

  // Function to navigate to the previous large image.
  const goToPreviousLarge = () => {
    if (!largeImages.length) return;
    setCurrentLargeImageIndex((prevIndex) =>
      prevIndex === 0 ? largeImages.length - 1 : prevIndex - 1
    );
  };

  // Function to navigate to the next large image.
  const goToNextLarge = () => {
    if (!largeImages.length) return;
    setCurrentLargeImageIndex(
      (prevIndex) => (prevIndex + 1) % largeImages.length
    );
  };

  // Function to navigate to the previous small image.
  const goToPreviousSmall = () => {
    if (!smallImages.length) return;
    setCurrentSmallImageIndex((prevIndex) =>
      prevIndex === 0 ? smallImages.length - 1 : prevIndex - 1
    );
  };

  // Function to navigate to the next small image.
  const goToNextSmall = () => {
    if (!smallImages.length) return;
    setCurrentSmallImageIndex(
      (prevIndex) => (prevIndex + 1) % smallImages.length
    );
  };

  // When main image index changes, show spinner again
  useEffect(() => {
    if (allImages.length > 0) {
      setMainLoading(true);
    }
  }, [selectedImageIndex, allImages.length]);

  const handleMainLoad = () => {
    setMainLoading(false);
  };

  const handleThumbLoad = (index) => {
    setThumbLoading((prev) => {
      const copy = [...prev];
      copy[index] = false;
      return copy;
    });
  };

  // (kept for future if you use viewMode somewhere)
  const renderContent = () => {
    if (viewMode === 'slideshow') {
      if (!largeImages.length) {
        return (
          <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center h-64 bg-gray-100">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        );
      }

      return (
        <>
          <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl">
            {mainLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                <Spin />
              </div>
            )}
            <img
              src={largeImages[currentLargeImageIndex]}
              alt={`Slideshow image ${currentLargeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500 ease-in-out"
              onLoad={handleMainLoad}
              onError={handleMainLoad}
            />
            <button
              onClick={goToPreviousLarge}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={goToNextLarge}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </>
      );
    } else {
      if (!smallImages.length) {
        return (
          <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center h-64 bg-gray-100">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        );
      }

      return (
        <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl">
          {mainLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
              <Spin />
            </div>
          )}
          <img
            src={smallImages[currentSmallImageIndex]}
            alt={`Small slideshow image ${currentSmallImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500 ease-in-out"
            onLoad={handleMainLoad}
            onError={handleMainLoad}
          />
          <button
            onClick={goToPreviousSmall}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous small image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={goToNextSmall}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next small image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      );
    }
  };

  const productData = {
    title: 'New Relaxed Fit Sweatshirt Vol. III',
    rating: 4.5,
    totalReviews: 623, // Renamed to avoid a duplicate key
    said: 1919,
    price: 899,
    currency: '$',
    availableColors: ['#000000', '#2C3E50', '#808080', '#A52A2A'],
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock: 5,
    images: {
      main: 'https://placehold.co/400x534/2C3E50/ADADAD?text=Main+Product',
      thumbnails: [
        'https://placehold.co/100x133/2C3E50/ADADAD?text=Thumb+1',
        'https://placehold.co/100x133/2C3E50/ADADAD?text=Thumb+2',
      ],
    },
    description: [
      'Long-sleeve dress shirt in classic fit featuring button-down collar',
      'Comfortable and quality dress shirt',
      'Go To Classic button down shirt for all special occasions',
    ],
    shipping: [
      {
        icon: <EnvironmentOutlined />,
        label: 'Delivery',
        value: 'Jakarta, Indonesia',
      },
      {
        icon: <CarOutlined />,
        label: 'Shipping',
        value: 'International Shipping',
      },
      {
        icon: <ClockCircleOutlined />,
        label: 'Arrive',
        value: 'Estimated on 27 Oct 2022',
      },
    ],
    reviews: [
      {
        name: 'Alex Mathie',
        date: '13 Oct 2024',
        stars: 5,
        comment:
          '"NextGen\'s dedication to sustainability and ethical practices resonates strongly with today\'s consumers, positioning the brand as a responsible choice in the fashion world."',
      },
      {
        name: 'Alex Mathie',
        date: '13 Oct 2024',
        stars: 5,
        comment:
          '"NextGen\'s dedication to sustainability and ethical practices resonates strongly with today\'s consumers, positioning the brand as a responsible choice in the fashion world."',
      },
    ],
  };

  return (
    <div className="w-full flex justify-center">
      <Card
        style={{ border: 'none', padding: '0px' }}
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl"
      >
        <div className="flex justify-center">
          <div className="space-y-4 w-full">
            {/* Main image */}
            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
              {mainLoading && allImages.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                  <Spin />
                </div>
              )}
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImageIndex]}
                  alt="Main Product"
                  className="w-full h-full object-cover"
                  onLoad={handleMainLoad}
                  onError={handleMainLoad}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                  No image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3">
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setMainLoading(true);
                    }}
                    className="relative aspect-[4/5] rounded-lg overflow-hidden border-2 cursor-pointer transition-colors duration-300"
                    style={{
                      borderColor:
                        index === selectedImageIndex ? '#1890ff' : 'transparent',
                    }}
                  >
                    {thumbLoading[index] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 z-10">
                        <Spin size="small" />
                      </div>
                    )}
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => handleThumbLoad(index)}
                      onError={() => handleThumbLoad(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default App;
