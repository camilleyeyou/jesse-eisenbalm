#!/bin/bash

# Video Optimization Script for Jesse A. Eisenbalm Website
# This script helps optimize your hero video for fast web loading

echo "🎬 Jesse A. Eisenbalm - Video Optimization Script"
echo "=================================================="
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: FFmpeg is not installed!"
    echo ""
    echo "Please install FFmpeg:"
    echo "  Mac: brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    exit 1
fi

echo "✅ FFmpeg is installed"
echo ""

# Get input file
if [ -z "$1" ]; then
    echo "Usage: ./optimize-video.sh <input-video.mp4>"
    echo ""
    echo "Example:"
    echo "  ./optimize-video.sh hero-background.mp4"
    exit 1
fi

INPUT_FILE="$1"

# Check if file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: File '$INPUT_FILE' not found!"
    exit 1
fi

# Get file info
echo "📊 Analyzing input file..."
FILE_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
echo "  Current size: $FILE_SIZE"

# Get video dimensions
DIMENSIONS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$INPUT_FILE")
echo "  Dimensions: $DIMENSIONS"

# Get duration
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_FILE")
DURATION_FORMATTED=$(printf '%02d:%02d' $((${DURATION%.*}/60)) $((${DURATION%.*}%60)))
echo "  Duration: $DURATION_FORMATTED"
echo ""

# Set output filename
OUTPUT_FILE="${INPUT_FILE%.*}-optimized.mp4"

echo "🔧 Starting optimization..."
echo "  Output file: $OUTPUT_FILE"
echo ""

# Optimize video
# - Scale to 1920x1080 if larger
# - Use H.264 codec
# - CRF 28 for good quality/size balance
# - Fast start for web streaming
# - 2-pass encoding for better quality

echo "⏳ This may take a few minutes..."
echo ""

ffmpeg -i "$INPUT_FILE" \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:v libx264 \
  -preset medium \
  -crf 28 \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  -y \
  "$OUTPUT_FILE" \
  2>&1 | grep -E "time=|speed="

echo ""

if [ ! -f "$OUTPUT_FILE" ]; then
    echo "❌ Error: Optimization failed!"
    exit 1
fi

# Compare file sizes
NEW_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo ""
echo "✅ Optimization complete!"
echo "  Original size: $FILE_SIZE"
echo "  New size: $NEW_SIZE"
echo ""

# Calculate size reduction
OLD_BYTES=$(stat -f%z "$INPUT_FILE" 2>/dev/null || stat -c%s "$INPUT_FILE" 2>/dev/null)
NEW_BYTES=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
REDUCTION=$(echo "scale=1; 100 - ($NEW_BYTES * 100 / $OLD_BYTES)" | bc)
echo "  Size reduction: ${REDUCTION}%"
echo ""

# Create poster image
POSTER_FILE="${INPUT_FILE%.*}-poster.jpg"
echo "📸 Creating poster image..."
ffmpeg -i "$OUTPUT_FILE" -ss 00:00:01 -vframes 1 -q:v 2 "$POSTER_FILE" -y 2>/dev/null

if [ -f "$POSTER_FILE" ]; then
    POSTER_SIZE=$(du -h "$POSTER_FILE" | cut -f1)
    echo "✅ Poster image created: $POSTER_FILE ($POSTER_SIZE)"
else
    echo "⚠️  Warning: Could not create poster image"
fi

echo ""
echo "🎉 All done!"
echo ""
echo "Next steps:"
echo "1. Replace your original video with: $OUTPUT_FILE"
echo "2. Use this poster image: $POSTER_FILE"
echo "3. Update your video tag with:"
echo "   <video src='/videos/$OUTPUT_FILE' poster='/images/$POSTER_FILE'>"
echo ""
echo "💡 Pro tip: For even faster loading, consider uploading to a CDN!"