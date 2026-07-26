/**
 * 카카오가 제공하는 두 개의 전역 SDK에 대한 타입 선언.
 *
 * 선언이 없으면 window에서 꺼내 쓰는 순간 any가 되어, 오타나 시그니처
 * 변경을 타입 검사로 잡을 수 없다.
 */

/** 지도 퍼가기(roughmap) 임베드 */
export interface DaumRoughmapLanderOptions {
  timestamp: string;
  key: string;
  mapWidth: string;
  mapHeight: string;
}

export interface DaumRoughmapLander {
  render(): void;
}

export interface DaumRoughmapNamespace {
  cdn?: string;
  URL_KEY_DATA_LOAD_PRE?: string;
  url_protocal?: string;
  Lander?: new (options: DaumRoughmapLanderOptions) => DaumRoughmapLander;
}

/** JavaScript SDK — 공유 기능 */
export interface KakaoShareContent {
  title: string;
  description: string;
  imageUrl: string;
  link: { mobileWebUrl: string; webUrl: string };
}

export interface KakaoShareButton {
  title: string;
  link: { mobileWebUrl: string; webUrl: string };
}

export interface KakaoSdk {
  init(javaScriptKey: string): void;
  isInitialized(): boolean;
  Share?: {
    sendDefault(settings: {
      objectType: "feed";
      content: KakaoShareContent;
      buttons?: KakaoShareButton[];
      installTalk?: boolean;
    }): void;
  };
}

declare global {
  interface Window {
    daum?: { roughmap?: DaumRoughmapNamespace };
    Kakao?: KakaoSdk;
  }
}
