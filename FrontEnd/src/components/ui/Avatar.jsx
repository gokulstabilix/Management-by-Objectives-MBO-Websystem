import { forwardRef } from 'react';

const Avatar = forwardRef(({ src, alt, fallback, size = 'md', className = '', ...props }, ref) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-indigo-100 ${sizes[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="font-medium text-indigo-700">
          {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
export default Avatar;
