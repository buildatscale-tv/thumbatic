import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = 'ui-button';
  const variantClasses = `ui-button--${variant}`;
  const sizeClasses = `ui-button--${size}`;
  
  const combinedClasses = [baseClasses, variantClasses, sizeClasses, className].join(' ');

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};