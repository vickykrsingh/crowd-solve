// Utility function to get the correct image URL
export const getImageUrl = (imageUrl) => {
  // If it's already a full URL (Cloudinary), return as is
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  
  // If it's a relative path (local uploads), prepend the API URL
  if (imageUrl && imageUrl.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
    return `${baseUrl}${imageUrl}`;
  }
  
  // Return empty string if no image
  return '';
};

// Utility function to check if an image URL is from Cloudinary
export const isCloudinaryUrl = (imageUrl) => {
  return imageUrl && imageUrl.includes('cloudinary.com');
};