// Create simple PNG icons using canvas (requires canvas package)
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - LinkedIn blue
  ctx.fillStyle = '#0073b1';
  ctx.fillRect(0, 0, size, size);

  // Text - white "LT"
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LT', size / 2, size / 2);

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon${size}.png`, buffer);
  console.log(`Created icon${size}.png`);
}

try {
  [16, 48, 128].forEach(size => createIcon(size));
  console.log('\nAll PNG icons created successfully!');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('Canvas module not found. Installing...');
    console.log('Run: npm install canvas');
    console.log('\nAlternatively, use the SVG icons or create PNG icons manually.');
  } else {
    console.error('Error:', error.message);
  }
}
