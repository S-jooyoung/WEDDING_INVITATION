#!/usr/bin/env bash
#
# 갤러리 사진을 실제 표시 크기에 맞게 다시 인코딩한다.
#
# 원본은 카메라에서 나온 6000x4000 그대로였다. 청첩장은 최대 480px 폭으로
# 표시하므로, 2배 밀도 화면을 감안해도 1200px이면 충분하다. 브라우저는
# 6000px 이미지를 받아서 디코딩한 뒤 축소해 그리는데, 이때 쓰는 메모리는
# 파일 크기가 아니라 픽셀 수에 비례한다(6000x4000x4바이트 = 96MB/장).
#
# 필요 도구: webp (brew install webp)
#
# 사용법: ./scripts/optimize-images.sh

set -euo pipefail

MAX_WIDTH=1200
QUALITY=80
ASSETS="$(cd "$(dirname "$0")/.." && pwd)/src/assets"

command -v cwebp >/dev/null || { echo "cwebp가 필요합니다: brew install webp"; exit 1; }
command -v dwebp >/dev/null || { echo "dwebp가 필요합니다: brew install webp"; exit 1; }

total_before=0
total_after=0

for source in "$ASSETS"/Gallery_Photo_*.webp; do
  [ -e "$source" ] || continue

  name="$(basename "$source")"
  before=$(wc -c < "$source" | tr -d ' ')
  temp_png="$(mktemp -t gallery).png"

  # cwebp는 webp 입력을 받지 못하므로 PNG로 한 번 편다.
  dwebp "$source" -o "$temp_png" -quiet
  cwebp -q "$QUALITY" -resize "$MAX_WIDTH" 0 -metadata none "$temp_png" -o "$source" -quiet
  rm -f "$temp_png"

  after=$(wc -c < "$source" | tr -d ' ')
  total_before=$((total_before + before))
  total_after=$((total_after + after))

  printf "%-24s %6dKB → %5dKB\n" "$name" $((before / 1024)) $((after / 1024))
done

printf "\n합계 %dKB → %dKB (%d%% 감소)\n" \
  $((total_before / 1024)) \
  $((total_after / 1024)) \
  $(((total_before - total_after) * 100 / total_before))
