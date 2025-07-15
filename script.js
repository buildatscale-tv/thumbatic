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
    const slideVersion = document.getElementById('slideVersion');
    const logoImage = document.getElementById('logoImage');
    const multipleLogosContainer = document.getElementById('multipleLogosContainer');
    const decorativeIconsContainer = document.getElementById('decorativeIconsContainer');
    const slide = document.getElementById('slide');
    const downloadBtn = document.getElementById('download');

    // Update slide content
    function updateSlide() {
        slideTitleBefore.textContent = titleBeforeInput.value || '';
        slideTitleHighlight.textContent = titleHighlightInput.value || '';
        slideTitleAfter.textContent = titleAfterInput.value || '';
        slideSubtitle.textContent = subtitleInput.value || 'AI-Powered Development Tool';
        
        // Handle version badge
        if (versionInput.value) {
            slideVersion.textContent = versionInput.value;
            slideVersion.style.display = 'block';
        } else {
            slideVersion.style.display = 'none';
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
        
        multipleLogosContainer.innerHTML = '';
        
        selectedLogos.forEach((logoUrl, index) => {
            const logoDiv = document.createElement('div');
            logoDiv.className = 'random-logo';
            logoDiv.innerHTML = `<img src="${logoUrl}" alt="Logo ${index + 1}">`;
            multipleLogosContainer.appendChild(logoDiv);
        });
        
        randomizeLogoPositions();
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
            iconDiv.className = 'decorative-icon random-icon';
            iconDiv.innerHTML = randomIcon;
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
        
        offset.x = e.clientX - elementRect.left - elementRect.width / 2;
        offset.y = e.clientY - elementRect.top - elementRect.height / 2;
        
        target.style.zIndex = '1000';
        e.preventDefault();
    }

    function handleMouseMove(e) {
        if (!isDragging || !dragElement) return;

        const rect = slide.getBoundingClientRect();
        const x = ((e.clientX - rect.left - offset.x) / rect.width) * 100;
        const y = ((e.clientY - rect.top - offset.y) / rect.height) * 100;

        // Constrain within slide boundaries
        const constrainedX = Math.max(5, Math.min(95, x));
        const constrainedY = Math.max(5, Math.min(95, y));

        dragElement.style.left = `${constrainedX}%`;
        dragElement.style.top = `${constrainedY}%`;
    }

    function handleMouseUp(e) {
        if (isDragging && dragElement) {
            dragElement.style.zIndex = '';
            isDragging = false;
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

    // Download functionality
    downloadBtn.addEventListener('click', function() {
        // Get slide element
        const slideElement = document.getElementById('slide');
        
        // Use html2canvas library if available, otherwise show message
        if (typeof html2canvas !== 'undefined') {
            html2canvas(slideElement, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                logging: false,
                removeContainer: true,
                backgroundColor: null
            }).then(function(canvas) {
                // Create a new canvas with the exact YouTube thumbnail dimensions
                const targetCanvas = document.createElement('canvas');
                const targetCtx = targetCanvas.getContext('2d');
                targetCanvas.width = 1280;
                targetCanvas.height = 720;
                
                // Enable image smoothing for better quality downsampling
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
            }).catch(function(error) {
                console.error('Error generating image:', error);
                alert('Error generating image. Please try again.');
            });
        } else {
            alert('To enable download functionality, please include html2canvas library. For now, you can take a screenshot of the slide.');
        }
    });

    // Initialize
    updateSlide();
    updateLogoType();
    updateLogo();
    updateDecorativeIcons();
    updateTheme();
    initializeDragAndDrop();
    
    // Initialize slider values
    logoSizeValue.textContent = `${logoSizeSlider.value}px`;
    iconSizeValue.textContent = `${iconSizeSlider.value}px`;
    
    // Update existing elements with new sizes
    updateLogoSizes();
    updateIconSizes();
});