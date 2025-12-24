#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing via brew..."
    brew install imagemagick
fi

# Create icons with LinkedIn blue background and white "LT" text
for size in 16 48 128; do
    convert -size ${size}x${size} xc:"#0073b1" \
            -gravity center \
            -pointsize $((size/2)) \
            -font Arial-Bold \
            -fill white \
            -annotate +0+0 "LT" \
            icon${size}.png
done

echo "Icons created successfully!"
