import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}) => {
  const baseClasses = 'ui-badge';
  const variantClasses = `ui-badge--${variant}`;
  const sizeClasses = `ui-badge--${size}`;
  
  const combinedClasses = [baseClasses, variantClasses, sizeClasses, className].join(' ');

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};