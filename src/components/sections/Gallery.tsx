import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { invitation } from "@/data/invitation";

/**
 * 사진첩.
 *
 * react-image-gallery(약 40KB + 자체 CSS)를 걷어내고 CSS scroll-snap으로
 * 대체했다. 라이브러리가 제공하던 스와이프·인디케이터는 브라우저의 네이티브
 * 스크롤로 그대로 얻을 수 있고, 다음 두 가지가 덤으로 따라온다.
 *
 *   - 키보드 사용자가 화살표 키로 스크롤할 수 있다. 라이브러리의 커스텀
 *     버튼은 "Previous Slide" 같은 영어 레이블만 제공했다.
 *   - 화면 밖 사진을 lazy loading으로 미룰 수 있다. 기존에는 6장(2.9MB)이
 *     한꺼번에 로드됐다.
 */
export function Gallery() {
  const { gallery } = invitation;

  return (
    <Container>
      <Section title="우리의 아름다운 순간">
        {/*
          이 영역은 이미 Section이 만든 section 랜드마크 안에 있으므로
          role="region"을 또 두면 같은 사진을 가리키는 랜드마크가 둘이 된다.
          group으로 낮춘다. 이름에 "좌우로 넘기세요" 같은 조작 안내를 넣지
          않는 이유는, 포커스가 닿을 때마다 읽히는 데다 키보드 사용자에게는
          해당하지 않는 동작이기 때문이다.
        */}
        <Track
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
      </Section>
    </Container>
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
