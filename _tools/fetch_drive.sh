#!/usr/bin/env bash
# Download every id\tname pair in /tmp/dl_all.tsv from Google Drive via curl.
# Handles the large-file "confirm" interstitial. Skips files already present.
set -u
OUT="_drive_raw"
mkdir -p "$OUT"
MAP="/tmp/dl_all.tsv"

dl_one() {
  local id="$1" name="$2"
  local safe="${name//[^A-Za-z0-9._-]/_}"
  local dest="$OUT/$safe"
  [ -s "$dest" ] && return 0
  local jar; jar="$(mktemp)"
  curl -sL -c "$jar" "https://drive.google.com/uc?export=download&id=${id}" -o "$dest" 2>/dev/null
  # If we got an HTML confirm page, extract the token and retry
  if head -c 15 "$dest" | grep -qi "<!DOCTYPE\|<html"; then
    local token uuid
    token="$(grep -o 'confirm=[0-9A-Za-z_-]\+' "$dest" | head -1 | cut -d= -f2)"
    uuid="$(grep -o 'uuid=[0-9A-Za-z_-]\+' "$dest" | head -1 | cut -d= -f2)"
    if [ -n "$token" ]; then
      curl -sL -b "$jar" \
        "https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=${token}${uuid:+&uuid=$uuid}" \
        -o "$dest" 2>/dev/null
    fi
  fi
  rm -f "$jar"
  if head -c 15 "$dest" | grep -qi "<!DOCTYPE\|<html"; then
    rm -f "$dest"; echo "FAIL $safe"; return 1
  fi
  return 0
}
export -f dl_one
export OUT

cat "$MAP" | tr '\t' '\034' | \
  xargs -P 8 -I{} bash -c 'IFS=$'"'"'\034'"'"' read -r id name <<< "{}"; dl_one "$id" "$name"'

echo "downloaded: $(find "$OUT" -type f | wc -l) / $(wc -l < "$MAP")"
du -sh "$OUT"
