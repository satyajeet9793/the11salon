const fs = require('fs');

const width = 1200;
const height = 800;
const strokeColor = '#c4791b'; // Gold/bronze from the site

let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
`;

// Add multiple sweeping, elegant curves
for (let i = 0; i < 20; i++) {
    // Generate sweeping bezier curves
    // y offset to space them out vertically
    const yOffset = i * 20 - 100;
    
    // Slight random variations for organic feel
    const cp1x = 300 + Math.random() * 200;
    const cp1y = 100 + yOffset + Math.random() * 150;
    const cp2x = 800 + Math.random() * 200;
    const cp2y = 600 + yOffset - Math.random() * 150;
    
    const startY = 300 + yOffset;
    const endY = 400 + yOffset;
    
    svgContent += `  <path d="M-100,${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} 1300,${endY}" stroke="${strokeColor}" stroke-width="0.75" opacity="0.25" />\n`;
}

// Add a second set of curves flowing in a slightly different direction for depth
for (let i = 0; i < 15; i++) {
    const yOffset = i * 30;
    const cp1x = 400 + Math.random() * 200;
    const cp1y = 700 + yOffset - Math.random() * 100;
    const cp2x = 900 + Math.random() * 200;
    const cp2y = 100 + yOffset + Math.random() * 100;
    
    const startY = 600 + yOffset;
    const endY = 200 + yOffset;
    
    svgContent += `  <path d="M-100,${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} 1300,${endY}" stroke="${strokeColor}" stroke-width="0.5" opacity="0.15" />\n`;
}

svgContent += `</svg>`;

fs.writeFileSync('public/images/bg-swirls.svg', svgContent);
console.log('Created bg-swirls.svg');
