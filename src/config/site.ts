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

const DEFAULT_URL = "http://localhost:8000";

export const siteConfig: SiteConfig = {
  title: "○○○ ♥ ○○○ 결혼합니다",
  description:
    "저희 두 사람이 사랑의 이름으로 지켜나갈 수 있게 앞날을 축복해 주세요.",
  url: (process.env.GATSBY_SITE_URL ?? DEFAULT_URL).replace(/\/$/, ""),
  ogImagePath: "/og-image.jpg",
  locale: "ko_KR",
  kakao: {
    javaScriptKey: process.env.GATSBY_KAKAO_JAVASCRIPT_KEY ?? null,
  },
};

/** 사이트 기준 상대 경로를 절대 URL로 바꾼다. OG 태그는 절대 URL을 요구한다. */
export function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, `${siteConfig.url}/`).toString();
}
