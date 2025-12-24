// Simple SVG to PNG icon creator using Node.js
const fs = require('fs');

function createSVGIcon(size) {
  const fontSize = Math.floor(size * 0.5);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0073b1"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">LT</text>
</svg>`;

  fs.writeFileSync(`icon${size}.svg`, svg);
  console.log(`Created icon${size}.svg`);
}

// Create SVG icons for all sizes
[16, 48, 128].forEach(size => createSVGIcon(size));

console.log('\nSVG icons created! You can use these directly or convert them to PNG using:');
console.log('- Online converter: https://cloudconvert.com/svg-to-png');
console.log('- Or rename them to .png and Chrome will accept SVG icons');
