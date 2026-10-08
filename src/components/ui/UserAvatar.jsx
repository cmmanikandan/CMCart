import React, { useState } from 'react';

/**
 * Robust User Avatar component with Google DP protection (referrerPolicy="no-referrer"),
 * metadata hash stripping, and automated initials fallback.
 */
export function UserAvatar({
  src,
  alt = 'User avatar',
  name = '',
  className = 'w-10 h-10 rounded-full object-cover',
  ...props
}) {
  const [hasError, setHasError] = useState(false);

  // Clean URL if it has #cm= metadata fragment
  const cleanSrc = React.useMemo(() => {
    if (!src || typeof src !== 'string') return '';
    return src.split('#cm=')[0].trim();
  }, [src]);

  // Fallback avatar using dicebear initials
  const fallbackUrl = React.useMemo(() => {
    const seed = encodeURIComponent(name || alt || 'Customer');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=e63946&textColor=ffffff`;
  }, [name, alt]);

  const displaySrc = hasError || !cleanSrc ? fallbackUrl : cleanSrc;

  return (
    <img
      src={displaySrc}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={className}
      {...props}
    />
  );
}

export default UserAvatar;
