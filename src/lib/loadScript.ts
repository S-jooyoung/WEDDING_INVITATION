const pending = new Map<string, Promise<void>>();

export interface LoadScriptOptions {
  /**
   * Subresource Integrity 해시.
   *
   * CDN이 침해되거나 중간에서 응답이 바뀌면 브라우저가 실행 자체를 거부한다.
   * 서드파티 스크립트는 우리 페이지와 같은 권한으로 실행되므로,
   * 버전을 고정할 수 있는 경우 해시도 함께 고정한다.
   */
  integrity?: string;
}

/**
 * 외부 스크립트를 한 번만 로드하고, 결과를 Promise로 돌려준다.
 *
 * 기존 코드에는 이 함수가 하는 일이 두 컴포넌트에 흩어져 있었고 세 가지가 빠져 있었다.
 *
 *   - onerror 처리가 없어 네트워크 실패를 알 수 없었다. 지도는 그냥 빈 칸으로
 *     남았고, 사용자도 코드도 실패했다는 사실을 몰랐다.
 *   - 중복 로드 방지가 window 전역 플래그에 의존해, 한 번 실패하면 플래그만
 *     남아 재시도가 영구히 차단됐다.
 *   - 로드가 끝나기 전에 컴포넌트가 사라져도 콜백이 그대로 실행됐다.
 *
 * 같은 URL에 대한 요청은 첫 Promise를 공유하고, 실패한 Promise는 캐시에서
 * 지워 다음 마운트에서 다시 시도할 수 있게 한다.
 */
export function loadScript(
  src: string,
  { integrity }: LoadScriptOptions = {},
): Promise<void> {
  const cached = pending.get(src);
  if (cached !== undefined) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    /* 다른 경로로 이미 삽입된 스크립트가 있으면 재사용한다. */
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing !== null && existing.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;

    if (integrity !== undefined) {
      script.integrity = integrity;
      /* SRI 검증에는 CORS 응답이 필요하다. */
      script.crossOrigin = "anonymous";
    }

    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });

    script.addEventListener("error", () => {
      script.remove();
      reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`));
    });

    if (existing === null) document.head.appendChild(script);
  });

  /* 실패는 캐시하지 않는다. 다음 시도가 막히면 복구할 방법이 없다. */
  promise.catch(() => pending.delete(src));

  pending.set(src, promise);
  return promise;
}

/** 테스트에서 모듈 수준 캐시를 비운다. */
export function resetScriptCache(): void {
  pending.clear();
}
