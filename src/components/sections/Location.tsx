import styled from "styled-components";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/ui/Reveal";
import { invitation } from "@/data/invitation";
import { getMapContainerId, useKakaoRoughMap } from "@/hooks/useKakaoRoughMap";

/** 예식장 위치와 교통편. */
export function Location() {
  const { venue } = invitation;
  const mapStatus = useKakaoRoughMap(venue.map);

  return (
    <Container>
      <Section title="오시는 길" ornament>
        {venue.map !== null && mapStatus !== "failed" && (
          <MapFrame
            id={getMapContainerId(venue.map)}
            className="root_daum_roughmap root_daum_roughmap_landing"
          />
        )}

        {mapStatus === "failed" && (
          /*
           * 지도를 못 불러왔다고 위치 안내까지 사라지면 안 된다.
           * 카카오맵 웹 검색으로 연결해 대체 경로를 준다.
           */
          <MapFallback>
            <p>지도를 불러오지 못했습니다.</p>
            <a
              href={`https://map.kakao.com/?q=${encodeURIComponent(venue.address)}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              카카오맵에서 예식장 위치 보기
            </a>
          </MapFallback>
        )}

        <Reveal>
          <Address>
            {venue.address}
            <br />
            {venue.name} {venue.hall}
          </Address>

          {venue.transit.map((guide) => (
            <TransitGroup key={guide.label}>
              <TransitLabel>{guide.label} 이용 시</TransitLabel>
              <TransitList>
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

const MapFallback = styled.div`
  padding: ${({ theme }) => theme.space[8]} ${({ theme }) => theme.space[4]};
  border: 1px dashed ${({ theme }) => theme.color.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.color.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm};
  text-align: center;

  a {
    display: inline-block;
    margin-top: ${({ theme }) => theme.space[2]};
    color: ${({ theme }) => theme.color.accent};
  }
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
