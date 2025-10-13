import React, { useState } from 'react';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardContent } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Badge } from './components/ui/Badge';
import './styles/ui-components.css';

const ComponentPreview: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [inputWithIconValue, setInputWithIconValue] = useState('');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
        UI Components Preview
      </h1>
      
      {/* Button Components */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Buttons</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Components */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Inputs</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <Input
              label="Basic Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <Input
              label="Input with Icon"
              placeholder="Search..."
              icon={<SearchIcon />}
              iconPosition="left"
              value={inputWithIconValue}
              onChange={(e) => setInputWithIconValue(e.target.value)}
            />
            
            <Input
              label="Input with Error"
              placeholder="Enter text..."
              error="This field is required"
            />
            
            <Input
              label="Disabled Input"
              placeholder="Disabled..."
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Select Components */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Select</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <Select
              label="Basic Select"
              options={selectOptions}
              value={selectValue}
              onChange={setSelectValue}
              placeholder="Choose an option..."
            />
            
            <Select
              label="Select with Error"
              options={selectOptions}
              error="Please select an option"
              placeholder="Choose an option..."
            />
            
            <Select
              label="Disabled Select"
              options={selectOptions}
              disabled
              placeholder="Disabled..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Badge Components */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Badges</h2>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500' }}>Variants</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '500' }}>Sizes</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge variant="primary" size="sm">Small</Badge>
              <Badge variant="primary" size="md">Medium</Badge>
              <Badge variant="primary" size="lg">Large</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Components */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Cards</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <Card>
              <CardHeader>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '500' }}>Simple Card</h3>
              </CardHeader>
              <CardContent>
                <p style={{ margin: 0, color: 'var(--ui-gray-600)' }}>
                  This is a basic card with header and content sections.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '500' }}>Content Only</h3>
                <p style={{ margin: 0, color: 'var(--ui-gray-600)' }}>
                  This card only has content, no header.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Component Combinations */}
      <Card>
        <CardHeader>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Component Combinations</h2>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'end', gap: '1rem', flexWrap: 'wrap' }}>
              <Input
                label="Search Term"
                placeholder="Enter search term..."
                icon={<SearchIcon />}
                iconPosition="left"
              />
              <Button variant="primary">Search</Button>
              <Button variant="outline">Clear</Button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Status:</span>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Inactive</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentPreview;