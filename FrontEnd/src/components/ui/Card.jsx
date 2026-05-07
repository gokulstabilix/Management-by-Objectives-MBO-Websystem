import { forwardRef } from 'react';

export const Card = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`} {...props}>
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-100 flex flex-col space-y-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center ${className}`} {...props}>
    {children}
  </div>
);
