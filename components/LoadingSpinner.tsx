import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = React.memo(({ 
  size = 'md', 
  message = 'Carregando...', 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinner = (
    <>
      <div className={`animate-spin rounded-full border-b-2 border-c6-yellow mx-auto mb-4 ${sizeClasses[size]}`} />
      {message && <p className="text-c6-gray-400">{message}</p>}
    </>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-c6-black text-white flex items-center justify-center">
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      {spinner}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;

