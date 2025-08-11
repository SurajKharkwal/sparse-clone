#!/bin/bash

WALLPAPER_DIR="$HOME/Pictures/Wallpapers"
DELAY=300  # Delay between wallpapers in seconds

main() {
  # Include both image and video files
  mapfile -t WALLPAPERS < <(find "$WALLPAPER_DIR" -type f \( \
    -iname '*.jpg' -o -iname '*.png' -o -iname '*.jpeg' -o -iname '*.webp' -o \
    -iname '*.mp4' -o -iname '*.webm' -o -iname '*.mkv' -o -iname '*.avi' -o -iname '*.mov' \
    \) | sort)

  if [[ ${#WALLPAPERS[@]} -eq 0 ]]; then
    echo "❌ No wallpapers found in $WALLPAPER_DIR"
    exit 1
  fi

  echo "📸 Starting slideshow with ${#WALLPAPERS[@]} wallpapers."

  while true; do
    for SELECTED in "${WALLPAPERS[@]}"; do
      echo "🎨 Setting wallpaper: $SELECTED"
      ~/.config/quickshell/ii/scripts/colors/switchwall.sh --image "$SELECTED"
      sleep "$DELAY"
    done
  done
}

main
