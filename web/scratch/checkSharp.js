const sharp = require('sharp');
console.log('Sharp versions:', sharp.versions);
sharp.format.heif ? console.log('HEIF supported') : console.log('HEIF NOT supported');
