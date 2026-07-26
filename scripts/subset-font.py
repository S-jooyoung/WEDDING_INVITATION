#!/usr/bin/env python3
"""손글씨 폰트를 실사용 문자 범위로 서브셋한다.

원본 mom_to_daughter 폰트는 한글 음절 11,172자를 모두 담고 있어
woff2만 2.9MB, woff까지 합치면 6.3MB다. 이 폰트는 인용구 섹션의
문장 하나에만 쓰이는데, 그 한 문장을 위해 모든 방문자가 2.9MB를 받는다.

여기서는 KS X 1001 완성형 한글 2,350자로 줄인다. 이 집합은 실제
한국어 문서에 쓰이는 음절을 사실상 전부 포함하므로, 템플릿 사용자가
인용구 문구를 바꿔도 글자가 빠지지 않는다. 실사용 문자만 남기는 방식이
더 작지만, 그렇게 하면 문구를 고치는 순간 폰트가 무용지물이 된다.

사용법:
    pip install fonttools brotli
    python3 scripts/subset-font.py
"""

from pathlib import Path
import sys

try:
    from fontTools.subset import main as subset_main
except ImportError:
    sys.exit("fontTools가 필요합니다: pip install fonttools brotli")

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src/assets/fonts/mom_to_daughter.woff2"
OUTPUT = ROOT / "src/assets/fonts/mom_to_daughter.subset.woff2"


def ksx1001_syllables() -> str:
    """KS X 1001에 포함된 한글 음절 2,350자.

    EUC-KR 2바이트 완성형 한글 영역(0xB0A1~0xC8FE)을 직접 훑는다.
    Python의 "euc-kr" 코덱은 실제로 CP949(확장 완성형)로 동작해
    11,172자를 모두 인코딩하므로, 인코딩 가능 여부로는 걸러낼 수 없다.
    """
    syllables = []
    for lead in range(0xB0, 0xC9):
        for trail in range(0xA1, 0xFF):
            try:
                char = bytes([lead, trail]).decode("euc-kr")
            except UnicodeDecodeError:
                continue
            if "가" <= char <= "힣":
                syllables.append(char)
    return "".join(syllables)


def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"원본 폰트를 찾을 수 없습니다: {SOURCE}")

    # 한글 음절 + 자모 + ASCII + 한국어 문서에 흔한 문장부호
    text = (
        ksx1001_syllables()
        + "".join(chr(c) for c in range(0x0020, 0x007F))
        + "".join(chr(c) for c in range(0x3131, 0x3164))
        + "「」『』·…—–‘’“”※·°"
    )

    subset_main(
        [
            str(SOURCE),
            f"--text={text}",
            "--flavor=woff2",
            f"--output-file={OUTPUT}",
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
        ]
    )

    before = SOURCE.stat().st_size
    after = OUTPUT.stat().st_size
    print(
        f"\n{before / 1024:.0f}KB → {after / 1024:.0f}KB "
        f"({(1 - after / before) * 100:.1f}% 감소)"
    )


if __name__ == "__main__":
    main()
