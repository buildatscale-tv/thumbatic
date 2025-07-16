document.addEventListener('DOMContentLoaded', function() {
    const titleBeforeInput = document.getElementById('titleBefore');
    const titleHighlightInput = document.getElementById('titleHighlight');
    const titleAfterInput = document.getElementById('titleAfter');
    const subtitleInput = document.getElementById('subtitle');
    const versionInput = document.getElementById('version');
    const logoUrlInput = document.getElementById('logoUrl');
    const logoTypeSelect = document.getElementById('logoType');
    const logoLibraryCheckboxes = document.querySelectorAll('#logoLibraryGroup input[type="checkbox"]');
    const randomizeLogosBtn = document.getElementById('randomizeLogos');
    const logoSizeSlider = document.getElementById('logoSize');
    const logoSizeValue = document.getElementById('logoSizeValue');
    const decorativeIconsSelect = document.getElementById('decorativeIcons');
    const randomizeIconsBtn = document.getElementById('randomizeIcons');
    const iconSizeSlider = document.getElementById('iconSize');
    const iconSizeValue = document.getElementById('iconSizeValue');
    const themeSelect = document.getElementById('theme');
    const cornerStyleSelect = document.getElementById('cornerStyle');
    const slideTitleBefore = document.getElementById('slideTitleBefore');
    const slideTitleHighlight = document.getElementById('slideTitleHighlight');
    const slideTitleAfter = document.getElementById('slideTitleAfter');
    const slideSubtitle = document.getElementById('slideSubtitle');
    const slideAccentLabel = document.getElementById('slideAccentLabel');
    const logoImage = document.getElementById('logoImage');
    const multipleLogosContainer = document.getElementById('multipleLogosContainer');
    const decorativeIconsContainer = document.getElementById('decorativeIconsContainer');
    const slide = document.getElementById('slide');
    const downloadBtn = document.getElementById('download');
    
    // Element Selection System
    const elementSelectionPanel = document.getElementById('elementSelectionPanel');
    const selectedElementName = document.getElementById('selectedElementName');
    const clearSelectionBtn = document.getElementById('clearSelection');
    const textElementProperties = document.getElementById('textElementProperties');
    const logoElementProperties = document.getElementById('logoElementProperties');
    const elementFontSize = document.getElementById('elementFontSize');
    const elementFontSizeValue = document.getElementById('elementFontSizeValue');
    const elementBgColor = document.getElementById('elementBgColor');
    const elementBgStyle = document.getElementById('elementBgStyle');
    const elementCornerStyle = document.getElementById('elementCornerStyle');
    const elementOpacity = document.getElementById('elementOpacity');
    const elementOpacityValue = document.getElementById('elementOpacityValue');
    const elementSize = document.getElementById('elementSize');
    const elementSizeValue = document.getElementById('elementSizeValue');
    const elementRotation = document.getElementById('elementRotation');
    const elementRotationValue = document.getElementById('elementRotationValue');
    const elementOpacityLogo = document.getElementById('elementOpacityLogo');
    const elementOpacityLogoValue = document.getElementById('elementOpacityLogoValue');
    
    // Selected element tracking
    let selectedElement = null;
    let isShiftPressed = false;
    let isRotating = false;
    let rotationStartAngle = 0;
    let initialRotation = 0;
    
    // Element properties storage
    const elementProperties = new Map();
    
    // Element Selection System
    function initializeElementSelection() {
        // Add click listeners to all selectable elements
        const selectableElements = document.querySelectorAll('.selectable-element');
        selectableElements.forEach(element => {
            // Remove existing listener if any
            element.removeEventListener('click', handleElementSelection);
            // Add new listener
            element.addEventListener('click', handleElementSelection);
        });
        
        // Clear selection when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.selectable-element') && !e.target.closest('.element-selection-panel')) {
                clearSelection();
            }
        });
        
        // Clear selection button
        clearSelectionBtn.addEventListener('click', clearSelection);
        
        // Keyboard listeners for shift key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Shift') {
                isShiftPressed = true;
            }
        });
        
        document.addEventListener('keyup', function(e) {
            if (e.key === 'Shift') {
                isShiftPressed = false;
            }
        });
    }
    
    function handleElementSelection(e) {
        e.stopPropagation();
        const element = e.target;
        
        // Clear previous selection
        clearSelection();
        
        // Select new element
        selectedElement = element;
        element.classList.add('selected');
        
        // Show element properties panel
        showElementProperties(element);
    }
    
    function clearSelection() {
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            
            // Check if subtitle has custom background styles, if not restore wrapper
            if (selectedElement.id === 'slideSubtitle') {
                const hasCustomBg = selectedElement.classList.contains('bg-style-highlight') ||
                                  selectedElement.classList.contains('bg-style-drop-shadow');
                const props = elementProperties.get(selectedElement.id);
                if (!hasCustomBg || (props && props.backgroundStyle === 'none')) {
                    restoreSubtitleWrapperBackground(selectedElement);
                }
            }
            
            selectedElement = null;
        }
        elementSelectionPanel.style.display = 'none';
        textElementProperties.style.display = 'none';
        logoElementProperties.style.display = 'none';
    }
    
    function showElementProperties(element) {
        const elementType = element.dataset.elementType;
        const elementName = element.dataset.elementName;
        
        selectedElementName.textContent = elementName;
        elementSelectionPanel.style.display = 'block';
        
        // Initialize element properties if not exists
        if (!elementProperties.has(element.id)) {
            const currentProps = getCurrentElementProperties(element, elementType);
            elementProperties.set(element.id, currentProps);
        }
        
        const props = elementProperties.get(element.id);
        
        if (elementType === 'text') {
            textElementProperties.style.display = 'block';
            logoElementProperties.style.display = 'none';
            
            // Update controls with current values
            elementFontSize.value = props.fontSize;
            elementFontSizeValue.textContent = props.fontSize + 'px';
            elementBgColor.value = props.backgroundColor;
            elementBgStyle.value = props.backgroundStyle;
            elementCornerStyle.value = props.cornerStyle;
            elementOpacity.value = props.opacity;
            elementOpacityValue.textContent = props.opacity + '%';
            
        } else if (elementType === 'logo' || elementType === 'icon') {
            textElementProperties.style.display = 'none';
            logoElementProperties.style.display = 'block';
            
            // Update controls with current values
            elementSize.value = props.size;
            elementSizeValue.textContent = props.size + 'px';
            elementRotation.value = props.rotation;
            elementRotationValue.textContent = props.rotation + '°';
            elementOpacityLogo.value = props.opacity;
            elementOpacityLogoValue.textContent = props.opacity + '%';
        }
    }
    
    function getCurrentElementProperties(element, elementType) {
        if (elementType === 'text') {
            // Extract current properties from the element
            let currentFontSize;
            const defaultSize = element.id === 'slideSubtitle' ? 48 : 72;
            
            let computedStyle;
            if (element.id === 'slideSubtitle' && element.classList.contains('subtitle-wrapper')) {
                // For subtitle wrapper, get font size from the text span inside
                const textSpan = element.querySelector('.subtitle-text');
                if (textSpan) {
                    const textComputedStyle = window.getComputedStyle(textSpan);
                    currentFontSize = parseInt(textComputedStyle.fontSize) || defaultSize;
                } else {
                    currentFontSize = defaultSize;
                }
                computedStyle = window.getComputedStyle(element);
            } else {
                computedStyle = window.getComputedStyle(element);
                currentFontSize = parseInt(computedStyle.fontSize) || defaultSize;
            }
            
            const currentOpacity = Math.round(parseFloat(computedStyle.opacity || 1) * 100);
            
            // Determine current background style
            let currentBackgroundStyle = 'none';
            if (element.classList.contains('bg-style-highlight')) {
                currentBackgroundStyle = 'highlight';
            } else if (element.classList.contains('bg-style-drop-shadow')) {
                currentBackgroundStyle = 'drop-shadow';
            }
            
            // Get current background color from CSS custom property or computed style
            const currentBgColor = element.style.getPropertyValue('--element-bg-color') || '#ff6b35';
            
            // Determine corner style
            const currentCornerStyle = element.classList.contains('corner-style-sharp') ? 'sharp' : 'rounded';
            
            return {
                fontSize: currentFontSize,
                backgroundColor: currentBgColor,
                backgroundStyle: currentBackgroundStyle,
                cornerStyle: currentCornerStyle,
                opacity: currentOpacity
            };
        } else if (elementType === 'logo' || elementType === 'icon') {
            const computedStyle = window.getComputedStyle(element);
            const currentSize = parseInt(computedStyle.width) || 128;
            const currentOpacity = Math.round(parseFloat(computedStyle.opacity || 1) * 100);
            
            // Extract rotation from transform
            let currentRotation = 0;
            const transform = element.style.transform;
            if (transform) {
                const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
                if (rotateMatch) {
                    currentRotation = parseInt(rotateMatch[1]) || 0;
                }
            }
            
            return {
                size: currentSize,
                rotation: currentRotation,
                opacity: currentOpacity
            };
        }
        return {};
    }
    
    function getDefaultElementProperties(element, elementType) {
        if (elementType === 'text') {
            const defaultSize = element.id === 'slideSubtitle' ? 48 : 72;
            return {
                fontSize: defaultSize,
                backgroundColor: '#ff6b35',
                backgroundStyle: element.id === 'slideSubtitle' ? 'none' : 'highlight',
                cornerStyle: 'rounded',
                opacity: 100
            };
        } else if (elementType === 'logo' || elementType === 'icon') {
            return {
                size: 128,
                rotation: 0,
                opacity: 100
            };
        }
        return {};
    }
    
    function applyElementProperties(element, props) {
        if (props.fontSize) {
            if (element.id === 'slideSubtitle' && element.classList.contains('subtitle-wrapper')) {
                // For subtitle wrapper, apply font size to the text span inside
                const textSpan = element.querySelector('.subtitle-text');
                if (textSpan) {
                    textSpan.style.fontSize = props.fontSize + 'px';
                }
            } else {
                element.style.fontSize = props.fontSize + 'px';
            }
        }
        if (props.backgroundColor) {
            element.style.setProperty('--element-bg-color', props.backgroundColor);
            
            // Set contrasting text color for background styles
            if (props.backgroundStyle && props.backgroundStyle !== 'none') {
                const textColor = getContrastingColor(props.backgroundColor);
                element.style.setProperty('--element-text-color', textColor);
            }
            
            // Set contrasting shadow color for drop-shadow style
            if (props.backgroundStyle === 'drop-shadow') {
                const shadowColor = getContrastingColor(props.backgroundColor);
                element.style.setProperty('--element-shadow-color', shadowColor);
            }
        }
        if (props.backgroundStyle) {
            element.className = element.className.replace(/\s*bg-style-\w+/g, '');
            
            if (props.backgroundStyle === 'none') {
                // Remove all background styling and restore subtitle wrapper if needed
                if (element.id === 'slideSubtitle') {
                    restoreSubtitleWrapperBackground(element);
                }
                element.style.removeProperty('--element-bg-color');
                element.style.removeProperty('--element-shadow-color');
                element.style.removeProperty('--element-text-color');
            } else {
                element.classList.add('bg-style-' + props.backgroundStyle);
                
                // Set contrasting text and shadow colors
                if (props.backgroundColor) {
                    const textColor = getContrastingColor(props.backgroundColor);
                    element.style.setProperty('--element-text-color', textColor);
                    
                    if (props.backgroundStyle === 'drop-shadow') {
                        const shadowColor = getContrastingColor(props.backgroundColor);
                        element.style.setProperty('--element-shadow-color', shadowColor);
                    } else {
                        // Clear shadow color for non-drop-shadow styles
                        element.style.removeProperty('--element-shadow-color');
                    }
                }
                
                // Handle subtitle special case - the element itself is now the wrapper
                if (element.id === 'slideSubtitle' && element.classList.contains('subtitle-wrapper')) {
                    // We'll apply the background styling directly to the wrapper
                    // No additional processing needed here
                }
            }
        }
        if (props.cornerStyle) {
            element.className = element.className.replace(/\s*corner-style-\w+/g, '');
            element.classList.add('corner-style-' + props.cornerStyle);
        }
        if (props.opacity !== undefined) {
            element.style.opacity = props.opacity / 100;
        }
        if (props.size) {
            element.style.width = props.size + 'px';
            element.style.height = props.size + 'px';
        }
        if (props.rotation !== undefined) {
            const currentTransform = element.style.transform || '';
            const newTransform = currentTransform.replace(/rotate\([^)]+\)/g, '') + ` rotate(${props.rotation}deg)`;
            element.style.transform = newTransform.trim();
        }
    }
    
    function restoreSubtitleWrapperBackground(element) {
        if (element.id === 'slideSubtitle' && element.classList.contains('subtitle-wrapper')) {
            // Remove inline styles to restore theme-based styling
            element.style.background = '';
            element.style.boxShadow = '';
        }
    }
    
    // Color brightness detection - translated from Ruby
    function getContrastingColor(hexColor) {
        // Remove # if present
        const color = hexColor.replace('#', '');
        
        // Parse RGB values
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        
        // Calculate brightness using the same formula as Ruby
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        // Return opposing color
        return brightness > 186 ? '#000000' : '#ffffff';
    }

    // Update slide content
    function updateSlide() {
        slideTitleBefore.textContent = titleBeforeInput.value || '';
        slideTitleHighlight.textContent = titleHighlightInput.value || '';
        slideTitleAfter.textContent = titleAfterInput.value || '';
        
        // Ensure empty text elements are still clickable by adding a minimum height and display
        [slideTitleBefore, slideTitleAfter].forEach(element => {
            if (!element.textContent.trim()) {
                element.style.minHeight = '20px';
                element.style.minWidth = '20px';
                element.style.display = 'inline-block';
            } else {
                element.style.minHeight = '';
                element.style.minWidth = '';
                element.style.display = '';
            }
        });
        const subtitleTextSpan = slideSubtitle.querySelector('.subtitle-text');
        if (subtitleTextSpan) {
            subtitleTextSpan.textContent = subtitleInput.value || 'AI-Powered Development Tool';
        }
        
        // Handle accent label
        if (versionInput.value) {
            slideAccentLabel.textContent = versionInput.value;
            slideAccentLabel.style.display = 'block';
        } else {
            slideAccentLabel.style.display = 'none';
        }
    }

    // Update logo type visibility
    function updateLogoType() {
        const logoUrlGroup = document.getElementById('logoUrlGroup');
        const logoLibraryGroup = document.getElementById('logoLibraryGroup');
        
        if (logoTypeSelect.value === 'library') {
            logoUrlGroup.style.display = 'none';
            logoLibraryGroup.style.display = 'block';
            logoImage.style.display = 'none';
            updateMultipleLogos();
        } else {
            logoUrlGroup.style.display = 'block';
            logoLibraryGroup.style.display = 'none';
            multipleLogosContainer.innerHTML = '';
            updateLogo();
        }
    }

    // Update single logo
    function updateLogo() {
        const logoUrl = logoUrlInput.value;
        
        if (logoUrl) {
            logoImage.src = logoUrl;
            logoImage.style.display = 'block';
        } else {
            logoImage.style.display = 'none';
        }
    }

    // Update multiple logos
    function updateMultipleLogos() {
        const selectedLogos = Array.from(logoLibraryCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        // Get existing logos and their URLs
        const existingLogos = Array.from(multipleLogosContainer.querySelectorAll('.random-logo'));
        const existingLogoUrls = existingLogos.map(logo => logo.querySelector('img').src);
        
        // Remove logos that are no longer selected
        existingLogos.forEach(logo => {
            const logoUrl = logo.querySelector('img').src;
            if (!selectedLogos.includes(logoUrl)) {
                logo.remove();
            }
        });
        
        // Add new logos that were just selected
        const newLogos = [];
        selectedLogos.forEach((logoUrl, index) => {
            if (!existingLogoUrls.includes(logoUrl)) {
                const logoDiv = document.createElement('div');
                logoDiv.className = 'random-logo selectable-element';
                logoDiv.dataset.elementType = 'logo';
                logoDiv.dataset.elementName = `Logo ${index + 1}`;
                logoDiv.id = `logo-${Date.now()}-${index}`; // Use timestamp to avoid ID conflicts
                logoDiv.innerHTML = `<img src="${logoUrl}" alt="Logo ${index + 1}">`;
                logoDiv.addEventListener('click', handleElementSelection);
                multipleLogosContainer.appendChild(logoDiv);
                newLogos.push(logoDiv);
            }
        });
        
        // Only randomize positions for new logos
        if (newLogos.length > 0) {
            randomizeSpecificLogoPositions(newLogos);
        }
        
        // Update all logo sizes
        updateLogoSizes();
    }

    // Check if position is in center exclusion zone
    function isInCenterExclusionZone(x, y) {
        const slideWidth = 1280; // Current slide width
        const slideHeight = 720; // Current slide height
        const exclusionWidth = 900; // Scaled up proportionally
        const exclusionHeight = 400; // Scaled up proportionally
        
        const exclusionLeft = (slideWidth - exclusionWidth) / 2;
        const exclusionTop = (slideHeight - exclusionHeight) / 2;
        const exclusionRight = exclusionLeft + exclusionWidth;
        const exclusionBottom = exclusionTop + exclusionHeight;
        
        // Convert percentage to pixels
        const pixelX = (x / 100) * slideWidth;
        const pixelY = (y / 100) * slideHeight;
        
        return pixelX >= exclusionLeft && pixelX <= exclusionRight && 
               pixelY >= exclusionTop && pixelY <= exclusionBottom;
    }

    // Generate safe position outside center exclusion zone
    function generateSafePosition() {
        let x, y;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            x = Math.random() * 80 + 10; // 10-90%
            y = Math.random() * 80 + 10; // 10-90%
            attempts++;
        } while (isInCenterExclusionZone(x, y) && attempts < maxAttempts);
        
        return { x, y };
    }

    // Randomize logo positions and rotations
    function randomizeLogoPositions() {
        const logos = multipleLogosContainer.querySelectorAll('.random-logo');
        randomizeSpecificLogoPositions(logos);
    }
    
    function randomizeSpecificLogoPositions(logos) {
        logos.forEach(logo => {
            const { x, y } = generateSafePosition();
            const rotation = Math.random() * 30 - 15; // -15 to 15 degrees
            const scale = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
            
            logo.style.left = `${x}%`;
            logo.style.top = `${y}%`;
            logo.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
        });
    }

    // Icon libraries
    const iconLibrary = {
        tech: [
            '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M16 8L8 16M8 8L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        ],
        shapes: [
            '<div class="shape-circle"></div>',
            '<div class="shape-triangle"></div>',
            '<div class="shape-square"></div>',
            '<div class="shape-diamond"></div>',
            '<div class="shape-star"></div>'
        ],
        arrows: [
            '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12L12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><path d="M17 7L7 17M7 7L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
        ]
    };

    // Update decorative icons
    function updateDecorativeIcons() {
        decorativeIconsContainer.innerHTML = '';
        
        const iconType = decorativeIconsSelect.value;
        
        if (iconType === 'none') return;
        
        let iconsToUse = [];
        
        if (iconType === 'mixed') {
            iconsToUse = [
                ...iconLibrary.tech.slice(0, 2),
                ...iconLibrary.shapes.slice(0, 2),
                ...iconLibrary.arrows.slice(0, 2)
            ];
        } else if (iconLibrary[iconType]) {
            iconsToUse = iconLibrary[iconType];
        }
        
        // Create 4-6 random icons
        const numIcons = Math.floor(Math.random() * 3) + 4; // 4-6 icons
        
        for (let i = 0; i < numIcons; i++) {
            const randomIcon = iconsToUse[Math.floor(Math.random() * iconsToUse.length)];
            const iconDiv = document.createElement('div');
            iconDiv.className = 'decorative-icon random-icon selectable-element';
            iconDiv.dataset.elementType = 'icon';
            iconDiv.dataset.elementName = `Icon ${i + 1}`;
            iconDiv.id = `icon-${i}`;
            iconDiv.innerHTML = randomIcon;
            iconDiv.addEventListener('click', handleElementSelection);
            decorativeIconsContainer.appendChild(iconDiv);
        }
        
        randomizeIconPositions();
    }

    // Randomize icon positions, sizes, and rotations
    function randomizeIconPositions() {
        const icons = decorativeIconsContainer.querySelectorAll('.random-icon');
        const baseSize = parseInt(iconSizeSlider.value);
        
        icons.forEach(icon => {
            const x = Math.random() * 90 + 5; // 5-95%
            const y = Math.random() * 90 + 5; // 5-95%
            const rotation = Math.random() * 360; // 0-360 degrees
            const scale = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
            const size = baseSize + Math.floor(Math.random() * 16) - 8; // ±8px variation
            
            icon.style.left = `${x}%`;
            icon.style.top = `${y}%`;
            icon.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
            icon.style.width = `${size}px`;
            icon.style.height = `${size}px`;
        });
    }

    // Update logo sizes
    function updateLogoSizes() {
        const logos = multipleLogosContainer.querySelectorAll('.random-logo');
        const size = parseInt(logoSizeSlider.value);
        
        logos.forEach(logo => {
            logo.style.width = `${size}px`;
            logo.style.height = `${size}px`;
        });
        
        logoSizeValue.textContent = `${size}px`;
    }

    // Update icon sizes
    function updateIconSizes() {
        const icons = decorativeIconsContainer.querySelectorAll('.random-icon');
        const baseSize = parseInt(iconSizeSlider.value);
        
        icons.forEach(icon => {
            const currentSize = baseSize + Math.floor(Math.random() * 16) - 8; // ±8px variation
            icon.style.width = `${currentSize}px`;
            icon.style.height = `${currentSize}px`;
        });
        
        iconSizeValue.textContent = `${baseSize}px`;
    }

    // Drag functionality
    let isDragging = false;
    let dragElement = null;
    let offset = { x: 0, y: 0 };

    function initializeDragAndDrop() {
        slide.addEventListener('mousedown', handleMouseDown);
        slide.addEventListener('mousemove', handleMouseMove);
        slide.addEventListener('mouseup', handleMouseUp);
        slide.addEventListener('mouseleave', handleMouseUp);
    }

    function handleMouseDown(e) {
        const target = e.target.closest('.random-logo, .random-icon');
        if (!target) return;

        isDragging = true;
        dragElement = target;
        
        const rect = slide.getBoundingClientRect();
        const elementRect = target.getBoundingClientRect();
        
        if (isShiftPressed) {
            // Rotation mode
            isRotating = true;
            const centerX = elementRect.left + elementRect.width / 2;
            const centerY = elementRect.top + elementRect.height / 2;
            rotationStartAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            
            // Get current rotation or default to 0
            const currentTransform = target.style.transform || '';
            const rotateMatch = currentTransform.match(/rotate\(([^)]+)deg\)/);
            initialRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        } else {
            // Drag mode
            isRotating = false;
            offset.x = e.clientX - elementRect.left - elementRect.width / 2;
            offset.y = e.clientY - elementRect.top - elementRect.height / 2;
        }
        
        target.style.zIndex = '1000';
        e.preventDefault();
    }

    function handleMouseMove(e) {
        if (!isDragging || !dragElement) return;

        const rect = slide.getBoundingClientRect();
        
        if (isRotating) {
            // Rotation mode
            const elementRect = dragElement.getBoundingClientRect();
            const centerX = elementRect.left + elementRect.width / 2;
            const centerY = elementRect.top + elementRect.height / 2;
            const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const angleDiff = (currentAngle - rotationStartAngle) * (180 / Math.PI);
            const newRotation = initialRotation + angleDiff;
            
            // Update element rotation
            const currentTransform = dragElement.style.transform || '';
            const newTransform = currentTransform.replace(/rotate\([^)]+\)/g, '') + ` rotate(${newRotation}deg)`;
            dragElement.style.transform = newTransform.trim();
            
            // Update properties if this element is selected
            if (dragElement === selectedElement && elementProperties.has(dragElement.id)) {
                const props = elementProperties.get(dragElement.id);
                props.rotation = Math.round(newRotation);
                elementRotation.value = props.rotation;
                elementRotationValue.textContent = props.rotation + '°';
            }
        } else {
            // Drag mode
            const x = ((e.clientX - rect.left - offset.x) / rect.width) * 100;
            const y = ((e.clientY - rect.top - offset.y) / rect.height) * 100;

            // Constrain within slide boundaries
            const constrainedX = Math.max(5, Math.min(95, x));
            const constrainedY = Math.max(5, Math.min(95, y));

            dragElement.style.left = `${constrainedX}%`;
            dragElement.style.top = `${constrainedY}%`;
        }
    }

    function handleMouseUp(e) {
        if (isDragging && dragElement) {
            dragElement.style.zIndex = '';
            isDragging = false;
            isRotating = false;
            dragElement = null;
        }
    }

    // Update theme
    function updateTheme() {
        slide.className = 'slide';
        switch(themeSelect.value) {
            case 'claude':
                slide.classList.add('claude-theme');
                break;
            case 'tech':
                slide.classList.add('tech-theme');
                break;
            case 'dark':
                slide.classList.add('dark-theme');
                break;
            case 'blueprint':
                slide.classList.add('blueprint-theme');
                break;
        }
        updateCornerStyle();
    }

    // Update corner style
    function updateCornerStyle() {
        if (cornerStyleSelect.value === 'sharp') {
            slide.classList.add('sharp-corners');
        } else {
            slide.classList.remove('sharp-corners');
        }
    }

    // Event listeners
    titleBeforeInput.addEventListener('input', updateSlide);
    titleHighlightInput.addEventListener('input', updateSlide);
    titleAfterInput.addEventListener('input', updateSlide);
    subtitleInput.addEventListener('input', updateSlide);
    versionInput.addEventListener('input', updateSlide);
    logoTypeSelect.addEventListener('change', updateLogoType);
    logoUrlInput.addEventListener('input', updateLogo);
    logoLibraryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateMultipleLogos);
    });
    randomizeLogosBtn.addEventListener('click', randomizeLogoPositions);
    logoSizeSlider.addEventListener('input', updateLogoSizes);
    decorativeIconsSelect.addEventListener('change', updateDecorativeIcons);
    randomizeIconsBtn.addEventListener('click', randomizeIconPositions);
    iconSizeSlider.addEventListener('input', updateIconSizes);
    themeSelect.addEventListener('change', updateTheme);
    cornerStyleSelect.addEventListener('change', updateCornerStyle);

    // Download functionality using modern-screenshot
    downloadBtn.addEventListener('click', async function() {
        try {
            // Show loading state
            downloadBtn.textContent = 'Generating...';
            downloadBtn.disabled = true;
            
            // Wait for any images to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get slide element
            const slideElement = document.getElementById('slide');
            
            // Temporarily remove the scale transform for capture
            const originalTransform = slideElement.style.transform;
            slideElement.style.transform = 'scale(1)';
            slideElement.style.transformOrigin = 'top left';
            
            // Wait for the DOM to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Use modern-screenshot which handles CORS better
            const canvas = await modernScreenshot.domToCanvas(slideElement, {
                scale: 4,
                backgroundColor: null,
                debug: false
            });
            
            // Restore the original transform
            slideElement.style.transform = originalTransform;
            
            // Create a new canvas with exact YouTube dimensions
            const targetCanvas = document.createElement('canvas');
            const targetCtx = targetCanvas.getContext('2d');
            targetCanvas.width = 1280;
            targetCanvas.height = 720;
            
            // Enable high quality scaling
            targetCtx.imageSmoothingEnabled = true;
            targetCtx.imageSmoothingQuality = 'high';
            
            // Draw the captured canvas onto the target canvas with proper scaling
            targetCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 1280, 720);
            
            // Create download link
            const link = document.createElement('a');
            const filename = `${titleBeforeInput.value || ''}${titleHighlightInput.value || ''}${titleAfterInput.value || ''}`.replace(/[^a-zA-Z0-9]/g, '-') || 'slide';
            link.download = `${filename}-intro-slide.png`;
            link.href = targetCanvas.toDataURL('image/png', 1.0);
            link.click();
            
        } catch (error) {
            console.error('Error generating image:', error);
            console.log('Falling back to simpler approach...');
            
            // Fallback to basic approach
            try {
                const slideElement = document.getElementById('slide');
                const canvas = await modernScreenshot.domToCanvas(slideElement);
                
                const link = document.createElement('a');
                const filename = `${titleBeforeInput.value || ''}${titleHighlightInput.value || ''}${titleAfterInput.value || ''}`.replace(/[^a-zA-Z0-9]/g, '-') || 'slide';
                link.download = `${filename}-intro-slide.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                alert('Error generating image. Please try again or use browser screenshot.');
            }
        } finally {
            // Reset button state
            downloadBtn.textContent = 'Download Slide';
            downloadBtn.disabled = false;
        }
    });

    // Element property control listeners
    elementFontSize.addEventListener('input', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.fontSize = parseInt(this.value);
            elementFontSizeValue.textContent = this.value + 'px';
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementBgColor.addEventListener('input', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.backgroundColor = this.value;
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementBgStyle.addEventListener('change', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.backgroundStyle = this.value;
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementCornerStyle.addEventListener('change', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.cornerStyle = this.value;
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementOpacity.addEventListener('input', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.opacity = parseInt(this.value);
            elementOpacityValue.textContent = this.value + '%';
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementSize.addEventListener('input', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.size = parseInt(this.value);
            elementSizeValue.textContent = this.value + 'px';
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementRotation.addEventListener('input', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.rotation = parseInt(this.value);
            elementRotationValue.textContent = this.value + '°';
            applyElementProperties(selectedElement, props);
        }
    });
    
    elementOpacityLogo.addEventListener('input', function() {
        if (selectedElement) {
            const props = elementProperties.get(selectedElement.id);
            props.opacity = parseInt(this.value);
            elementOpacityLogoValue.textContent = this.value + '%';
            applyElementProperties(selectedElement, props);
        }
    });

    // Initialize
    updateSlide();
    updateLogoType();
    updateLogo();
    updateDecorativeIcons();
    updateTheme();
    initializeDragAndDrop();
    initializeElementSelection();
    
    // Initialize slider values
    logoSizeValue.textContent = `${logoSizeSlider.value}px`;
    iconSizeValue.textContent = `${iconSizeSlider.value}px`;
    
    // Update existing elements with new sizes
    updateLogoSizes();
    updateIconSizes();
});