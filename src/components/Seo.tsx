import { siteConfig, toAbsoluteUrl } from "@/config/site";
import { invitation } from "@/data/invitation";
import { formatCeremonyDateShort } from "@/lib/ceremony";

export interface SeoProps {
  /** 페이지 고유 제목. 생략하면 사이트 제목을 그대로 쓴다. */
  title?: string;
  description?: string;
  /** 사이트 기준 경로. canonical URL과 og:url에 쓰인다. */
  pathname?: string;
}

/**
 * 문서 head 메타데이터.
 *
 * 청첩장은 검색이 아니라 카카오톡으로 링크가 전달되어 열린다. 즉 링크
 * 미리보기 카드가 곧 첫인상인데, 기존에는 메타태그가 하나도 없어서
 * 카드가 아예 생성되지 않았다. 제목 없는 회색 링크 한 줄만 나갔다.
 *
 * Gatsby 5의 Head API로 구현한다. 이 트리는 앱과 분리되어 렌더되므로
 * 여기서는 styled-components나 React 컨텍스트를 쓸 수 없다.
 */
export function Seo({ title, description, pathname = "/" }: SeoProps) {
  const pageTitle = title ?? siteConfig.title;
  const pageDescription = description ?? siteConfig.description;
  const canonical = toAbsoluteUrl(pathname);
  const ogImage = toAbsoluteUrl(siteConfig.ogImagePath);
  const ceremonyDate = formatCeremonyDateShort(invitation.ceremony.startsAt);

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonical} />

      {/*
        청첩장은 검색 노출이 목적이 아니고, 하객의 개인 정보(예식장·계좌)가
        담긴다. 다만 robots.txt로 크롤러를 통째로 막으면 카카오톡·페이스북의
        미리보기 봇까지 차단되어 링크 카드가 깨진다. 색인만 거부하고
        미리보기 수집은 허용하는 noindex 메타태그가 맞는 선택이다.
      */}
      <meta name="robots" content="noindex, follow" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      {/* 카카오톡·페이스북은 크기를 알면 자리를 먼저 잡아 카드가 덜 깜빡인다. */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={`${invitation.couple.groom.name}, ${invitation.couple.bride.name} 결혼식 청첩장`}
      />
      <meta property="og:locale" content={siteConfig.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* 모바일 브라우저 주소창을 배경색과 맞춘다. */}
      <meta name="theme-color" content="#efebe9" />

      {/*
        구조화 데이터. 검색엔진과 메신저가 "언제 어디서 열리는 행사"인지
        이해할 수 있게 한다.
      */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: pageTitle,
          startDate: invitation.ceremony.startsAt,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          image: [ogImage],
          description: `${ceremonyDate} ${invitation.venue.name}`,
          location: {
            "@type": "Place",
            name: `${invitation.venue.name} ${invitation.venue.hall}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: invitation.venue.address,
              addressCountry: "KR",
            },
          },
        })}
      </script>
    </>
  );
}
