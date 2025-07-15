# YouTube Intro Slide Generator

A web-based tool for creating professional YouTube intro slides with flat design and rectangular highlights.

## Features

- **Real-time Preview**: See changes instantly as you edit
- **Multiple Themes**: Claude Code, Tech Blue, and Dark Mode themes
- **Customizable Text**: Edit title and subtitle
- **Flat Design**: Modern rectangular highlights and clean typography
- **Responsive**: Works on desktop and mobile devices
- **Export Ready**: Download slides as PNG images

## Usage

1. Open `index.html` in your web browser
2. Customize the title and subtitle text
3. Select your preferred theme
4. Click "Download Slide" to save as PNG

## Themes

- **Claude Code**: Orange and navy theme with Claude branding
- **Tech Blue**: Blue and dark theme for tech content
- **Dark Mode**: Green and dark theme for modern look

## Technical Details

- Slide dimensions: 480x270px (16:9 aspect ratio)
- Export resolution: 1920x1080px for HD quality
- Built with vanilla HTML, CSS, and JavaScript
- Uses CSS transforms for skewed rectangular highlights
- Animated text elements with smooth transitions

## Browser Support

Works in all modern browsers. For download functionality, include html2canvas library:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

Add this script tag to the HTML head for full download support.