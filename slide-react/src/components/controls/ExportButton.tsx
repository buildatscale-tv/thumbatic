import React, { useState } from 'react';
import { useThumbnailStore } from '../../store/thumbnailStore';
import { domToCanvas } from 'modern-screenshot';

// Function to ensure fonts are loaded
const ensureFontsLoaded = async (): Promise<void> => {
  // Wait for document fonts to be ready
  await document.fonts.ready;
  
  // Check if critical fonts are loaded
  const fontTests = [
    { family: 'Geist', weight: '400' },
    { family: 'Geist', weight: '500' },
    { family: 'Geist', weight: '600' },
    { family: 'Geist', weight: '800' },
    { family: 'Montserrat', weight: '400' },
    { family: 'Montserrat', weight: '500' },
    { family: 'Montserrat', weight: '600' },
    { family: 'Montserrat', weight: '800' }
  ];
  
  const fontChecks = fontTests.map(({ family, weight }) => {
    return document.fonts.check(`${weight} 16px "${family}"`);
  });
  
  // If any fonts aren't loaded, force load them
  if (!fontChecks.every(Boolean)) {
    // Create a hidden test element to force font loading
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      font-size: 72px !important;
      visibility: hidden !important;
      z-index: -1 !important;
    `;
    
    // Add text with each font and weight to force loading
    fontTests.forEach(({ family, weight }) => {
      const span = document.createElement('span');
      span.style.fontFamily = `"${family}", Arial, sans-serif`;
      span.style.fontWeight = weight;
      span.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      testDiv.appendChild(span);
    });
    
    document.body.appendChild(testDiv);
    testDiv.offsetHeight; // Force repaint
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    document.body.removeChild(testDiv);
  }
  
  // Final font ready check
  await document.fonts.ready;
};

export const ExportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { elements } = useThumbnailStore();

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Ensure Google Fonts are loaded before capturing
      await ensureFontsLoaded();
      
      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get thumbnail element
      const thumbnailElement = document.getElementById('thumbnail');
      if (!thumbnailElement) {
        throw new Error('Thumbnail element not found');
      }
      
      // Force apply computed font styles to all text elements before export
      const domTextElements = thumbnailElement.querySelectorAll('.subtitle, .title, .accent-label, .selectable-element');
      const originalStyles: Array<{element: HTMLElement, originalFontWeight: string, originalFontFamily: string}> = [];
      
      domTextElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        // Store original style
        originalStyles.push({
          element: htmlEl,
          originalFontWeight: htmlEl.style.fontWeight || '',
          originalFontFamily: htmlEl.style.fontFamily || ''
        });
        
        // Force the computed font styles as inline styles (highest priority)
        htmlEl.style.fontWeight = computedStyle.fontWeight;
        htmlEl.style.fontFamily = computedStyle.fontFamily;
      });
      
      // Temporarily remove the scale transform for capture
      const originalTransform = thumbnailElement.style.transform;
      thumbnailElement.style.transform = 'scale(1)';
      thumbnailElement.style.transformOrigin = 'top left';
      
      // Wait for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Wait for fonts to fully load (removed redundant CSS injection)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use modern-screenshot with simplified options
      const canvas = await domToCanvas(thumbnailElement, {
        scale: 4,
        backgroundColor: null,
        debug: false // Disable debug to reduce noise
      });
      
      // Restore original styles (removed font cleanup)
      
      thumbnailElement.style.transform = originalTransform;
      originalStyles.forEach(({element, originalFontWeight, originalFontFamily}) => {
        element.style.fontWeight = originalFontWeight;
        element.style.fontFamily = originalFontFamily;
      });
      
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
      const filename = titleText.replace(/[^a-zA-Z0-9]/g, '-') || 'thumbnail';
      link.download = `${filename}-intro-thumbnail.png`;
      link.href = targetCanvas.toDataURL('image/png', 1.0);
      link.click();
      
    } catch (error) {
      console.error('Error generating image:', error);
      console.log('Falling back to simpler approach...');
      
      // Fallback to basic approach
      try {
        // Ensure fonts are ready in fallback too
        await ensureFontsLoaded();
        
        const thumbnailElement = document.getElementById('thumbnail');
        if (thumbnailElement) {
          const canvas = await domToCanvas(thumbnailElement, {});
          
          const link = document.createElement('a');
          // Generate filename from text elements
          const textElements = elements.filter(el => el.type === 'text');
          const titleElements = textElements.filter(el => (el.properties as any).textType === 'title');
          const titleText = titleElements.map(el => (el.properties as any).content).join(' ');
          const filename = titleText.replace(/[^a-zA-Z0-9]/g, '-') || 'thumbnail';
          link.download = `${filename}-intro-thumbnail.png`;
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
      {isGenerating ? 'Generating...' : 'Download Thumbnail'}
    </button>
  );
};