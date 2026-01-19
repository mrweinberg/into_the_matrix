#!/bin/bash
# Batch resize all 5:4 images to 4:3

echo "🔄 Starting batch resize of 5:4 images to 4:3..."
echo ""

count=0
for f in public/cards/*.png; do
  w=$(sips -g pixelWidth "$f" 2>/dev/null | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$f" 2>/dev/null | awk '/pixelHeight/{print $2}')
  if [ -n "$w" ] && [ -n "$h" ]; then
    ratio=$(echo "scale=4; $w/$h" | bc 2>/dev/null)
    if [ "$ratio" = "1.2413" ]; then
      echo "[$count] Resizing: $(basename $f)"
      node resize_art.mjs "$f"
      count=$((count + 1))
      # Small delay to avoid rate limiting
      sleep 0.5
    fi
  fi
done

echo ""
echo "✅ Completed! Resized $count images."
