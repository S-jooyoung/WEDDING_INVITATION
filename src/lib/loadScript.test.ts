import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadScript, resetScriptCache } from "@/lib/loadScript";

const SRC = "https://example.test/sdk.js";

/** jsdom은 스크립트를 실제로 받지 않으므로 load/error를 직접 발생시킨다. */
function fireOn(src: string, event: "load" | "error"): void {
  const script = document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`,
  );
  if (script === null) throw new Error("삽입된 script를 찾을 수 없습니다.");
  script.dispatchEvent(new Event(event));
}

beforeEach(() => {
  resetScriptCache();
});

afterEach(() => {
  document.querySelectorAll("script").forEach((node) => node.remove());
});

describe("loadScript", () => {
  it("로드가 끝나면 resolve한다", async () => {
    const promise = loadScript(SRC);
    fireOn(SRC, "load");

    await expect(promise).resolves.toBeUndefined();
  });

  it("같은 URL을 두 번 요청해도 script는 하나만 삽입한다", async () => {
    const first = loadScript(SRC);
    const second = loadScript(SRC);

    expect(document.querySelectorAll(`script[src="${SRC}"]`)).toHaveLength(1);

    fireOn(SRC, "load");
    await Promise.all([first, second]);
  });

  it("네트워크 실패를 reject로 알린다", async () => {
    const promise = loadScript(SRC);
    fireOn(SRC, "error");

    /*
     * 기존 구현에는 onerror 처리가 없어 실패를 알 방법이 자체가 없었다.
     * 지도는 그냥 빈 칸으로 남았다.
     */
    await expect(promise).rejects.toThrow(/불러오지 못했습니다/);
  });

  it("실패한 뒤에는 다시 시도할 수 있다", async () => {
    const failing = loadScript(SRC);
    fireOn(SRC, "error");
    await expect(failing).rejects.toThrow();

    /*
     * 기존의 window 전역 플래그 방식은 한 번 실패해도 플래그만 남아
     * 재시도가 영구히 차단됐다. 실패한 Promise는 캐시하지 않는다.
     */
    const retry = loadScript(SRC);
    fireOn(SRC, "load");
    await expect(retry).resolves.toBeUndefined();
  });

  it("integrity를 주면 SRI 속성과 crossOrigin을 함께 설정한다", async () => {
    const promise = loadScript(SRC, { integrity: "sha384-abc" });

    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC}"]`,
    );
    expect(script?.integrity).toBe("sha384-abc");
    /* SRI 검증에는 CORS 응답이 필요하다. 빠뜨리면 스크립트가 차단된다. */
    expect(script?.crossOrigin).toBe("anonymous");

    fireOn(SRC, "load");
    await promise;
  });
});
