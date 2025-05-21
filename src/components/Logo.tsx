
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center text-white font-bold`}>
        <span className="text-white">CR</span>
      </div>
      {withText && (
        <span className={`font-bold ${textSizes[size]} gradient-heading`}>
          ContentReview.AI
        </span>
      )}
    </div>
  );
};

export default Logo;
