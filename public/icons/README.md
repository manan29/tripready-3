# PWA Icons

These icons are used for Progressive Web App (PWA) functionality.

## Required Sizes:
- icon-72.png (72x72)
- icon-96.png (96x96)
- icon-128.png (128x128)
- icon-144.png (144x144)
- icon-152.png (152x152)
- icon-192.png (192x192) - Android
- icon-384.png (384x384)
- icon-512.png (512x512) - Android

## Generate Icons:

### Option 1: Use online tool
1. Go to https://realfavicongenerator.net/
2. Upload icon.svg
3. Generate and download all sizes

### Option 2: Use ImageMagick (if installed)
```bash
cd public/icons
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}.png
done
```

### Option 3: Use Figma/Design tool
1. Open icon.svg
2. Export as PNG at each required size
3. Name files as icon-{size}.png

## Current Status:
✅ icon.svg created (gradient purple-pink with airplane emoji)
⚠️  PNG files need to be generated

The app will work without icons, but won't be installable until PNGs are added.
