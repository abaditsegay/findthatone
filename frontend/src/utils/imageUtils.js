// Utility function to resolve profile picture URL
export const resolveProfilePictureUrl = (profilePhotoUrl) => {
  if (!profilePhotoUrl || profilePhotoUrl === 'null' || profilePhotoUrl === 'undefined') {
    return '/avatars/avatar1.svg';
  }
  
  // Fix old IP address URLs to use localhost
  if (profilePhotoUrl.includes('192.168.1.230:8091')) {
    profilePhotoUrl = profilePhotoUrl.replace('http://192.168.1.230:8091', 'http://localhost:8091');
  }
  
  // Fix URLs that go through API but should be direct static serving
  if (profilePhotoUrl.includes('/api/photos/uploads/')) {
    profilePhotoUrl = profilePhotoUrl.replace('/api/photos/uploads/', '/uploads/photos/');
  }
  
  // Convert absolute localhost URLs to relative URLs for static serving
  if (profilePhotoUrl.startsWith('http://localhost:8091/uploads/')) {
    profilePhotoUrl = profilePhotoUrl.replace('http://localhost:8091', '');
  }
  
  // If it's a relative path to uploads, serve from backend server
  if (profilePhotoUrl.startsWith('/uploads/')) {
    return `http://localhost:8091${profilePhotoUrl}`;
  }
  
  // If it's a relative path to avatars, serve from frontend public folder
  if (profilePhotoUrl.startsWith('/avatars/')) {
    return profilePhotoUrl;
  }
  
  // If it's still a full URL (e.g., external image), use it as is
  if (profilePhotoUrl.startsWith('http://') || profilePhotoUrl.startsWith('https://')) {
    return profilePhotoUrl;
  }
  
  // Default fallback
  return '/avatars/avatar1.svg';
};
