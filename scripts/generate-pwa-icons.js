const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create a simple SVG icon with ScolPay style (blue gradient with "S")
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#grad)"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="280" font-weight="bold" text-anchor="middle" fill="white">S</text>
  <circle cx="256" cy="140" r="20" fill="white" opacity="0.3"/>
</svg>
`;

async function generateIcons() {
    console.log('Generating PWA icons...');

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        await sharp(Buffer.from(svgIcon))
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✓ Generated icon-${size}x${size}.png`);
    }

    // Generate favicon.ico (32x32)
    await sharp(Buffer.from(svgIcon))
        .resize(32, 32)
        .png()
        .toFile(path.join(outputDir, 'favicon.png'));

    console.log('✓ Generated favicon.png');
    console.log('\nAll PWA icons generated successfully! 🎉');
}

generateIcons().catch(console.error);
