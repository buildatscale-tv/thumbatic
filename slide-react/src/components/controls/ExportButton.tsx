import React, { useState } from 'react';
import { useSlideStore } from '../../store/slideStore';
import { domToCanvas } from 'modern-screenshot';

export const ExportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { elements } = useSlideStore();

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get slide element
      const slideElement = document.getElementById('slide');
      if (!slideElement) {
        throw new Error('Slide element not found');
      }
      
      // Temporarily remove the scale transform for capture
      const originalTransform = slideElement.style.transform;
      slideElement.style.transform = 'scale(1)';
      slideElement.style.transformOrigin = 'top left';
      
      // Wait for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use modern-screenshot which handles CORS better
      const canvas = await domToCanvas(slideElement, {
        scale: 4,
        backgroundColor: null,
        debug: false
      });
      
      // Restore the original transform
      slideElement.style.transform = originalTransform;
      
      // Create a new canvas with exact YouTube dimensions
      const targetCanvas = document.createElement('canvas');
      const targetCtx = targetCanvas.getContext('2d');
      if (!targetCtx) {
        throw new Error('Could not get canvas context');
      }
      
      targetCanvas.width = 1280;
      targetCanvas.height = 720;
      
      // Enable high quality scaling
      targetCtx.imageSmoothingEnabled = true;
      targetCtx.imageSmoothingQuality = 'high';
      
      // Draw the captured canvas onto the target canvas with proper scaling
      targetCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 1280, 720);
      
      // Create download link
      const link = document.createElement('a');
      // Generate filename from text elements
      const textElements = elements.filter(el => el.type === 'text');
      const titleElements = textElements.filter(el => (el.properties as any).textType === 'title');
      const titleText = titleElements.map(el => (el.properties as any).content).join(' ');
      const filename = titleText.replace(/[^a-zA-Z0-9]/g, '-') || 'slide';
      link.download = `${filename}-intro-slide.png`;
      link.href = targetCanvas.toDataURL('image/png', 1.0);
      link.click();
      
    } catch (error) {
      console.error('Error generating image:', error);
      console.log('Falling back to simpler approach...');
      
      // Fallback to basic approach
      try {
        const slideElement = document.getElementById('slide');
        if (slideElement) {
          const canvas = await domToCanvas(slideElement);
          
          const link = document.createElement('a');
          // Generate filename from text elements
          const textElements = elements.filter(el => el.type === 'text');
          const titleElements = textElements.filter(el => (el.properties as any).textType === 'title');
          const titleText = titleElements.map(el => (el.properties as any).content).join(' ');
          const filename = titleText.replace(/[^a-zA-Z0-9]/g, '-') || 'slide';
          link.download = `${filename}-intro-slide.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Error generating image. Please try again or use browser screenshot.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      className="download-button"
      onClick={handleExport}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Download Slide'}
    </button>
  );
};