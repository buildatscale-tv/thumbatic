import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input: React.FC<InputProps> = ({ 
  label,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasIcon = !!icon;
  
  const inputClasses = [
    'ui-input',
    hasIcon && `ui-input--with-icon ui-input--icon-${iconPosition}`,
    error && 'ui-input--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="ui-input-wrapper">
      {label && (
        <label htmlFor={inputId} className="ui-input__label">
          {label}
        </label>
      )}
      <div className="ui-input__container">
        {icon && iconPosition === 'left' && (
          <div className="ui-input__icon ui-input__icon--left">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="ui-input__icon ui-input__icon--right">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <div className="ui-input__error">
          {error}
        </div>
      )}
    </div>
  );
};