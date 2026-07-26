import styled from "styled-components";
import BackgroundVideo from "@/assets/BackgroundVideo.mp4";
import { Container } from "@/components/layout/Container";
import { invitation } from "@/data/invitation";
import { formatCeremonyDateTime, toDateTimeAttribute } from "@/lib/ceremony";

/**
 * 첫 화면. 신랑·신부 이름과 예식 일시를 알린다.
 *
 * 예식 일시 문자열은 데이터의 ISO 시각에서 파생된다. 요일을 사람이 적지
 * 않으므로 날짜와 요일이 어긋날 수 없다.
 */
export function Hero() {
  const { couple, ceremony, venue } = invitation;

  return (
    <Header>
      <Container>
        <Eyebrow>WEDDING INVITATION</Eyebrow>
        <Names>
          {couple.groom.name} &amp; {couple.bride.name}
        </Names>
        <Schedule>
          <time dateTime={toDateTimeAttribute(ceremony.startsAt)}>
            {formatCeremonyDateTime(ceremony.startsAt)}
          </time>
          <br />
          {venue.name} {venue.hall}
        </Schedule>
      </Container>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption --
          소리가 없는 장식용 배경 영상이라 전달할 대사가 없다.
          aria-hidden으로 접근성 트리에서 제외한다. */}
      <BackdropVideo
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={BackgroundVideo} type="video/mp4" />
      </BackdropVideo>
    </Header>
  );
}

const Header = styled.header`
  padding-top: ${({ theme }) => theme.space[12]};
  text-align: center;
  animation: fade-in ${({ theme }) => theme.motion.duration.slow} ease-out both;

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Eyebrow = styled.p`
  margin-bottom: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.color.textSubtle};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: 0.12em;
`;

const Names = styled.h1`
  margin-bottom: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: 700;
`;

const Schedule = styled.p`
  margin-bottom: ${({ theme }) => theme.space[6]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const BackdropVideo = styled.video`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  /* 영상이 로드되기 전에도 자리를 차지해 레이아웃이 밀리지 않게 한다. */
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background-color: ${({ theme }) => theme.color.background};
`;
