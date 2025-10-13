import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  error,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          onChange?.(options[focusedIndex].value);
          setIsOpen(false);
          setFocusedIndex(-1);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => (prev + 1) % options.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => prev <= 0 ? options.length - 1 : prev - 1);
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const selectClasses = [
    'ui-select',
    isOpen && 'ui-select--open',
    error && 'ui-select--error',
    disabled && 'ui-select--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="ui-select-wrapper">
      {label && (
        <label className="ui-select__label">
          {label}
        </label>
      )}
      <div
        ref={selectRef}
        className={selectClasses}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="ui-select__trigger">
          <span className={selectedOption ? 'ui-select__value' : 'ui-select__placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="ui-select__arrow">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {isOpen && (
          <div ref={optionsRef} className="ui-select__options" role="listbox">
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`ui-select__option ${
                  index === focusedIndex ? 'ui-select__option--focused' : ''
                } ${
                  option.value === value ? 'ui-select__option--selected' : ''
                }`}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="ui-select__error">
          {error}
        </div>
      )}
    </div>
  );
};