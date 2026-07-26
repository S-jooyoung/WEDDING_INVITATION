import { loadScript } from "@/lib/loadScript";
import type { KakaoSdk } from "@/types/kakao";

/**
 * 카카오 JavaScript SDK 로더.
 *
 * 기존 구현의 문제:
 *
 *   - SDK를 페이지 컴포넌트(index.js)에서 로드하고 사용은 share에서 해,
 *     "로드가 끝났는지" 확인할 계약이 없었다. share는 window.Kakao가
 *     없으면 조용히 아무 일도 하지 않았고, 사용자는 버튼을 눌러도
 *     아무 반응을 얻지 못했다.
 *   - URL이 https://developers.kakao.com/sdk/js/kakao.min.js 로,
 *     버전이 고정되지 않은 레거시 엔드포인트였다. 카카오가 배포를 바꾸면
 *     예고 없이 동작이 달라진다.
 *   - Kakao.Link는 v1 API로, 현재는 Kakao.Share로 대체됐다.
 *
 * 여기서는 버전과 SRI 해시를 고정하고, 로드·초기화 결과를 Promise로 돌려준다.
 */
const SDK_VERSION = "2.7.6";
const SDK_URL = `https://t1.kakaocdn.net/kakao_js_sdk/${SDK_VERSION}/kakao.min.js`;
const SDK_INTEGRITY =
  "sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm";

export async function loadKakaoSdk(javaScriptKey: string): Promise<KakaoSdk> {
  await loadScript(SDK_URL, { integrity: SDK_INTEGRITY });

  const kakao = window.Kakao;
  if (kakao === undefined) {
    throw new Error("카카오 SDK를 초기화하지 못했습니다.");
  }

  if (!kakao.isInitialized()) {
    kakao.init(javaScriptKey);
  }

  return kakao;
}

export interface ShareInvitationParams {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

/**
 * 카카오톡 공유창을 연다.
 *
 * 기존 구현은 createDefaultButton으로 버튼에 핸들러를 붙인 뒤,
 * setTimeout 100ms 후에 그 버튼을 프로그램적으로 클릭했다. 이 방식은
 * 사용자 제스처 컨텍스트를 잃어버려 브라우저가 팝업을 차단할 수 있고,
 * 100ms 안에 SDK가 준비되지 않으면 그냥 실패했다.
 *
 * sendDefault는 클릭 핸들러 안에서 직접 호출하면 되므로 그 우회가 필요 없다.
 */
export function shareInvitation(
  kakao: KakaoSdk,
  { title, description, imageUrl, url }: ShareInvitationParams,
): void {
  if (kakao.Share === undefined) {
    throw new Error("카카오 SDK에 공유 기능이 없습니다.");
  }

  kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: "청첩장 열기",
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
    installTalk: true,
  });
}
