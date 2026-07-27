import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadKakaoSdk, shareInvitation } from "@/lib/kakao";
import { resetScriptCache } from "@/lib/loadScript";
import type { KakaoSdk } from "@/types/kakao";

const SDK_URL_PATTERN = /kakao_js_sdk\/[\d.]+\/kakao\.min\.js$/;

function fireScriptLoad(): void {
  const script = document.querySelector<HTMLScriptElement>(
    'script[src*="kakao_js_sdk"]',
  );
  if (script === null) throw new Error("SDK script가 삽입되지 않았습니다.");
  script.dispatchEvent(new Event("load"));
}

function stubKakao(overrides: Partial<KakaoSdk> = {}): KakaoSdk {
  const kakao: KakaoSdk = {
    init: vi.fn(),
    isInitialized: vi.fn().mockReturnValue(false),
    Share: { sendDefault: vi.fn() },
    ...overrides,
  };
  window.Kakao = kakao;
  return kakao;
}

beforeEach(() => {
  resetScriptCache();
});

afterEach(() => {
  document.querySelectorAll("script").forEach((node) => node.remove());
  Reflect.deleteProperty(window, "Kakao");
  vi.restoreAllMocks();
});

describe("loadKakaoSdk", () => {
  it("버전이 고정된 URL과 SRI 해시로 SDK를 불러온다", async () => {
    const promise = loadKakaoSdk("test-key");

    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="kakao_js_sdk"]',
    );
    /*
     * 기존 구현은 버전이 없는 레거시 엔드포인트를 썼다. 카카오가 배포를
     * 바꾸면 예고 없이 동작이 달라진다.
     */
    expect(script?.src).toMatch(SDK_URL_PATTERN);
    expect(script?.integrity).toMatch(/^sha384-/);
    expect(script?.crossOrigin).toBe("anonymous");

    stubKakao();
    fireScriptLoad();
    await promise;
  });

  it("로드 후 전달받은 키로 초기화한다", async () => {
    const promise = loadKakaoSdk("test-key");
    const kakao = stubKakao();
    fireScriptLoad();

    await expect(promise).resolves.toBe(kakao);
    expect(kakao.init).toHaveBeenCalledWith("test-key");
  });

  it("이미 초기화됐으면 다시 초기화하지 않는다", async () => {
    const promise = loadKakaoSdk("test-key");
    const kakao = stubKakao({ isInitialized: vi.fn().mockReturnValue(true) });
    fireScriptLoad();

    await promise;
    expect(kakao.init).not.toHaveBeenCalled();
  });

  it("스크립트는 로드됐지만 전역이 없으면 원인을 알리며 실패한다", async () => {
    const promise = loadKakaoSdk("test-key");
    fireScriptLoad();

    await expect(promise).rejects.toThrow(/초기화하지 못했습니다/);
  });
});

describe("shareInvitation", () => {
  const params = {
    title: "○○○ ♥ ○○○ 결혼식에 초대합니다",
    description: "청첩장 열기",
    imageUrl: "https://example.com/og-image.jpg",
    url: "https://example.com/",
  };

  it("현재 SDK의 Share.sendDefault를 쓴다", () => {
    const kakao = stubKakao();

    shareInvitation(kakao, params);

    /* 구버전이 쓰던 Kakao.Link.createDefaultButton은 폐기된 v1 API다. */
    expect(kakao.Share?.sendDefault).toHaveBeenCalledTimes(1);
  });

  it("피드 형식과 링크를 규격에 맞게 넘긴다", () => {
    const kakao = stubKakao();

    shareInvitation(kakao, params);

    expect(kakao.Share?.sendDefault).toHaveBeenCalledWith(
      expect.objectContaining({
        objectType: "feed",
        content: expect.objectContaining({
          title: params.title,
          imageUrl: params.imageUrl,
          link: { mobileWebUrl: params.url, webUrl: params.url },
        }),
      }),
    );
  });

  it("공유 기능이 없는 SDK면 조용히 넘어가지 않고 실패한다", () => {
    const kakao = stubKakao({ Share: undefined });

    /*
     * 기존 구현은 window.Kakao가 없으면 아무 일도 하지 않았다. 사용자는
     * 버튼을 눌렀는데 반응이 없어 고장인지 알 수 없었다.
     */
    expect(() => shareInvitation(kakao, params)).toThrow(
      /공유 기능이 없습니다/,
    );
  });
});
