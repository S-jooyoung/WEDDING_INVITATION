/**
 * 배포 · 외부 연동 설정.
 *
 * 청첩장의 "내용"(src/data/invitation.ts)과 달리, 여기 있는 값은
 * 배포 환경마다 달라지므로 환경 변수로 주입받는다.
 * 값이 없어도 빌드는 성공해야 하며, 해당 기능만 비활성화된다.
 */

export interface SiteConfig {
  readonly title: string;
  readonly description: string;
  /** 배포 주소. OG 태그의 canonical URL과 공유 링크에 쓰인다. */
  readonly url: string;
  /** 링크 미리보기 이미지의 사이트 기준 상대 경로. */
  readonly ogImagePath: string;
  readonly locale: string;
  readonly kakao: {
    /**
     * 카카오 JavaScript 키.
     *
     * 이 키는 클라이언트에 노출되는 것을 전제로 발급되며(도메인 화이트리스트로
     * 보호된다) 그 자체로 비밀 값은 아니다. 그럼에도 소스에 상수로 박지 않는 이유는
     * 포크한 사람이 원저장소의 키로 요청을 보내게 되고, 키를 교체할 때
     * 코드 수정과 재배포가 강제되기 때문이다.
     *
     * 미설정 시 null이며, 카카오톡 공유 버튼은 링크 복사로 자동 대체된다.
     */
    readonly javaScriptKey: string | null;
  };
}

const DEVELOPMENT_URL = "http://localhost:8000";

function resolveSiteUrl(): string {
  /*
   * 배포 플랫폼이 넣어 주는 주소를 폴백으로 받는다. Netlify는 빌드 환경에
   * URL(운영)과 DEPLOY_PRIME_URL(미리보기 배포)을 주입한다. 이 값들은
   * GATSBY_ 접두사가 없어 브라우저 번들에는 실리지 않지만, OG 태그는
   * 빌드 시점에 확정되므로 그것으로 충분하다. 브라우저에서 필요한 주소는
   * toAbsoluteUrl과 getShareUrl이 window.location에서 직접 읽는다.
   */
  const configured = (
    process.env.GATSBY_SITE_URL ??
    process.env.URL ??
    process.env.DEPLOY_PRIME_URL
  )?.trim();

  if (configured !== undefined && configured !== "") {
    return configured.replace(/\/$/, "");
  }

  /*
   * 프로덕션 빌드인데 주소가 없으면 OG 태그가 localhost를 가리킨다.
   * 링크 미리보기가 조용히 깨지므로 빌드 로그에 크게 남긴다.
   */
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[site] GATSBY_SITE_URL이 설정되지 않았습니다. " +
        "링크 미리보기(OG) 이미지와 canonical URL이 localhost를 가리킵니다. " +
        ".env.example을 참고해 배포 주소를 지정하세요.",
    );
  }

  return DEVELOPMENT_URL;
}

export const siteConfig: SiteConfig = {
  title: "○○○ ♥ ○○○ 결혼합니다",
  description:
    "저희 두 사람이 사랑의 이름으로 지켜나갈 수 있게 앞날을 축복해 주세요.",
  url: resolveSiteUrl(),
  /*
   * 링크 미리보기 이미지. webp가 아니라 jpg인 이유는 카카오톡을 비롯한
   * 일부 메신저의 미리보기 수집기가 webp를 렌더링하지 못하기 때문이다.
   */
  ogImagePath: "/og-image.jpg",
  locale: "ko_KR",
  kakao: {
    javaScriptKey: process.env.GATSBY_KAKAO_JAVASCRIPT_KEY ?? null,
  },
};

/**
 * 사이트 기준 상대 경로를 절대 URL로 바꾼다. OG 태그는 절대 URL을 요구한다.
 *
 * 브라우저에서는 지금 열려 있는 주소를 기준으로 삼는다. 빌드 시점 설정이
 * 비어 있어도 카카오톡 공유 이미지 같은 런타임 URL이 localhost를 가리키지
 * 않는다. 서버 렌더에서는 설정값을 쓴다.
 */
export function toAbsoluteUrl(pathname: string): string {
  const base =
    typeof window === "undefined" ? siteConfig.url : window.location.origin;

  return new URL(pathname, `${base}/`).toString();
}

/**
 * 하객에게 공유할 주소.
 *
 * 브라우저에서는 지금 열려 있는 실제 주소를 쓴다. 빌드 시점 설정에 기대면
 * 설정을 빠뜨렸을 때 하객의 클립보드에 http://localhost:8000 이 들어간다.
 * 기존 구현이 실제로 그랬다. 런타임 값이 언제나 정확하므로 이쪽을 우선한다.
 */
export function getShareUrl(): string {
  if (typeof window !== "undefined") {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}`;
  }

  return siteConfig.url;
}
