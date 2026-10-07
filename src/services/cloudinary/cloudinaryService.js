/**
 * Cloudinary Media Service for CMCart
 * Handles single/multiple image uploads, responsive transformations,
 * thumbnail generation, and image optimization.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original image URL or Cloudinary public ID
 * @param {object} options - width, height, crop, quality, format
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  
  // If it's already an Unsplash or external URL, return with sizing parameters
  if (url.includes('unsplash.com')) {
    const w = options.width || 600;
    const q = options.quality || 80;
    return `${url.split('?')[0]}?w=${w}&auto=format&fit=crop&q=${q}`;
  }

  // If it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    transformations.push('q_auto', 'f_auto');

    const transformStr = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformStr}/`);
  }

  return url;
}

/**
 * Upload single image (Cloudinary direct or fallback local preview)
 * @param {File} file 
 * @returns {Promise<{url: string, public_id: string}>}
 */
export async function uploadImageToCloudinary(file) {
  // If user provided a real upload preset and cloud name, attempt real API upload
  if (UPLOAD_PRESET && CLOUD_NAME && CLOUD_NAME !== 'demo') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Cloudinary upload failed');
      const data = await response.json();
      return {
        url: data.secure_url,
        public_id: data.public_id,
        bytes: data.bytes,
        format: data.format,
      };
    } catch (err) {
      console.warn('Direct Cloudinary upload error, using local data URL fallback:', err);
    }
  }

  // Safe FileReader fallback for local/demo/preview usage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result,
        public_id: `cmcart_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload multiple images with progress reporting
 * @param {FileList|File[]} files 
 */
export async function uploadMultipleImages(files, onProgress) {
  const list = Array.from(files);
  const results = [];
  
  for (let i = 0; i < list.length; i++) {
    const uploaded = await uploadImageToCloudinary(list[i]);
    results.push(uploaded);
    if (onProgress) {
      onProgress(Math.round(((i + 1) / list.length) * 100));
    }
  }

  return results;
}
