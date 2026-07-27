import { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { invitation } from "@/data/invitation";

/**
 * 사진첩.
 *
 * react-image-gallery(약 40KB + 자체 CSS)를 걷어내고 CSS scroll-snap으로
 * 대체했다. 스와이프는 브라우저의 네이티브 스크롤이 그대로 처리하고,
 * 화면 밖 사진은 lazy loading으로 미룰 수 있다(기존에는 6장 2.9MB가
 * 한꺼번에 로드됐다).
 *
 * 다만 네이티브 스크롤만으로는 마우스 사용자가 "사진이 더 있다"는 사실도
 * 넘기는 방법도 알 수 없다. 라이브러리가 기본 제공하던 좌우 이동과 현재
 * 위치 표시는 직접 만들어 붙인다.
 */
export function Gallery() {
  const { gallery } = invitation;
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const syncCurrent = useCallback(() => {
    const track = trackRef.current;
    if (track === null || track.clientWidth === 0) return;

    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  }, []);

  const scrollBy = useCallback((step: number) => {
    const track = trackRef.current;
    if (track === null) return;

    track.scrollBy({ left: track.clientWidth * step, behavior: "smooth" });
  }, []);

  const lastIndex = gallery.length - 1;

  return (
    <Container>
      <Section title="우리의 아름다운 순간">
        {/*
          이 영역은 이미 Section이 만든 section 랜드마크 안에 있으므로
          role="region"을 또 두면 같은 사진을 가리키는 랜드마크가 둘이 된다.
          group으로 낮춘다.
        */}
        <Track
          ref={trackRef}
          onScroll={syncCurrent}
          /* 스크롤 컨테이너에 초점을 줘야 키보드로 좌우 탐색이 가능하다. */
          tabIndex={0}
          role="group"
          aria-label="웨딩 사진"
        >
          <Slides role="list">
            {gallery.map((photo, index) => (
              <Slide key={photo.src}>
                <Photo
                  src={photo.src}
                  alt={photo.alt}
                  /*
                   * 원본 비율(3:2)을 속성으로 알려 이미지가 도착하기 전에도
                   * 자리를 차지하게 한다. 없으면 로드될 때마다 아래 내용이
                   * 밀려 내려간다(CLS).
                   */
                  width={1200}
                  height={800}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </Slide>
            ))}
          </Slides>
        </Track>

        <Controls>
          <NavButton
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={current === 0}
            aria-label="이전 사진"
          >
            <Chevron direction="left" />
          </NavButton>

          {/* 점은 장식이고, 위치 정보는 옆의 텍스트가 전달한다. */}
          <Dots aria-hidden="true">
            {gallery.map((photo, index) => (
              <Dot key={photo.src} $active={index === current} />
            ))}
          </Dots>
          <Position>
            {current + 1} / {gallery.length}
          </Position>

          <NavButton
            type="button"
            onClick={() => scrollBy(1)}
            disabled={current === lastIndex}
            aria-label="다음 사진"
          >
            <Chevron direction="right" />
          </NavButton>
        </Controls>
      </Section>
    </Container>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const Track = styled.div`
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  /* iOS에서 스크롤 막대가 레이아웃을 밀지 않게 한다. */
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Slides = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.space[2]};
`;

const Slide = styled.li`
  flex: 0 0 100%;
  scroll-snap-align: center;
`;

const Photo = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.04);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.space[2]};
  margin-top: ${({ theme }) => theme.space[3]};
`;

const NavButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.color.accent};
  cursor: pointer;

  &:disabled {
    color: ${({ theme }) => theme.color.textSubtle};
    cursor: default;
  }
`;

const Dots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space[1]};
`;

const Dot = styled.span<{ $active: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme, $active }) =>
    $active ? theme.color.accent : theme.color.border};
  transition: background-color ${({ theme }) => theme.motion.duration.fast} ease;
`;

const Position = styled.p`
  margin-left: ${({ theme }) => theme.space[2]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-variant-numeric: tabular-nums;
`;
