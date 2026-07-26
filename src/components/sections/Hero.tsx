import styled from "styled-components";
import BackgroundVideo from "@/assets/BackgroundVideo.mp4";
import BackgroundPoster from "@/assets/BackgroundVideoPoster.webp";
import { Container } from "@/components/layout/Container";
import { invitation } from "@/data/invitation";
import { useDaysUntilCeremony } from "@/hooks/useDaysUntilCeremony";
import { formatCeremonyDateTime, toDateTimeAttribute } from "@/lib/ceremony";

/**
 * 첫 화면. 신랑·신부 이름과 예식 일시를 알린다.
 *
 * 예식 일시 문자열은 데이터의 ISO 시각에서 파생된다. 요일을 사람이 적지
 * 않으므로 날짜와 요일이 어긋날 수 없다.
 */
export function Hero() {
  const { couple, ceremony, venue } = invitation;
  const daysLeft = useDaysUntilCeremony(ceremony.startsAt);

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
        {/*
          남은 일수는 마운트 이후에야 정해지므로(SSG 특성상 렌더 중 계산 불가),
          조건부로 끼워 넣으면 hydration 직후 아래 내용이 통째로 밀려 내려간다.
          바로 아래가 이 페이지의 LCP 후보인 배경 영상이라 그 이동이 CLS로 잡힌다.
          자리를 미리 잡아 두고 내용만 채운다.
        */}
        <Countdown>
          {daysLeft !== null && daysLeft > 0
            ? `예식까지 ${daysLeft}일 남았습니다`
            : null}
        </Countdown>
      </Container>

      {/* 소리도 대사도 없는 장식용 배경 영상이므로 접근성 트리에서 제외한다. */}
      <BackdropVideo
        autoPlay
        loop
        muted
        playsInline
        /*
         * poster 덕분에 영상 데이터가 도착하기 전에도 첫 화면이 채워진다.
         * 32KB짜리 정지 이미지가 490KB 영상보다 훨씬 먼저 그려지므로
         * LCP가 영상 다운로드에 묶이지 않는다.
         */
        poster={BackgroundPoster}
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
  margin-bottom: ${({ theme }) => theme.space[4]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Countdown = styled.p`
  /* 비어 있을 때도 한 줄 높이를 유지해 내용이 채워져도 레이아웃이 움직이지 않는다. */
  min-height: 1.75em;
  margin-bottom: ${({ theme }) => theme.space[6]};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.xs};
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
