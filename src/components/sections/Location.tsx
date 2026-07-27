import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui";
import { invitation } from "@/data/invitation";
import { useKakaoRoughMap } from "@/hooks/useKakaoRoughMap";

/** 예식장 위치와 교통편. */
export function Location() {
  const { venue } = invitation;
  const { status, containerProps } = useKakaoRoughMap(venue.map);

  const kakaoMapUrl = `https://map.kakao.com/?q=${encodeURIComponent(venue.address)}`;

  return (
    <Container>
      <Section title="오시는 길" ornament>
        {containerProps !== null && status !== "failed" && (
          <MapFrame {...containerProps} />
        )}

        {status === "failed" && (
          <MapFallback>지도를 불러오지 못했습니다.</MapFallback>
        )}

        {/*
          임베드된 약도는 확대도 길찾기도 되지 않고(컨트롤을 숨긴다),
          스크린 리더에는 아무 정보도 주지 않는다. 지도가 정상일 때도
          외부 지도로 나갈 경로가 필요하다. 예전에는 이 링크가 실패했을
          때만 나와서, 실패한 쪽이 성공한 쪽보다 쓸모 있는 상태였다.
        */}
        <MapLink href={kakaoMapUrl} target="_blank" rel="noreferrer noopener">
          카카오맵에서 길찾기
        </MapLink>

        <Reveal>
          <Address>
            {venue.address}
            <br />
            {venue.name} {venue.hall}
          </Address>

          {venue.transit.map((guide) => (
            <TransitGroup key={guide.label}>
              <TransitLabel>{guide.label} 이용 시</TransitLabel>
              <TransitList role="list">
                {guide.directions.map((direction) => (
                  <li key={direction}>{direction}</li>
                ))}
              </TransitList>
            </TransitGroup>
          ))}
        </Reveal>
      </Section>
    </Container>
  );
}

const MapFrame = styled.div`
  width: 100%;
  /* 지도가 그려지기 전에도 자리를 잡아 아래 내용이 밀리지 않게 한다. */
  min-height: 240px;
`;

const MapFallback = styled.p`
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[4]};
  border: 1px dashed ${({ theme }) => theme.color.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`;

const MapLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  /* 손가락으로 누를 수 있는 최소 높이 */
  min-height: 44px;
  margin-top: ${({ theme }) => theme.space[3]};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const Address = styled.p`
  margin: ${({ theme }) => theme.space[10]} 0;
  color: ${({ theme }) => theme.color.text};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`;

const TransitGroup = styled.div`
  & + & {
    margin-top: ${({ theme }) => theme.space[8]};
  }
`;

/**
 * 교통편 제목.
 *
 * 기존에는 <p> 안에 <span>으로 들어가 있어 시각적으로만 제목이었다.
 * 섹션 제목(h2) 아래 단계이므로 h3으로 둔다.
 */
const TransitLabel = styled.h3`
  margin-bottom: ${({ theme }) => theme.space[2]};
  color: ${({ theme }) => theme.color.accent};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 700;
  text-align: center;
`;

const TransitList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[1]};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;
`;
