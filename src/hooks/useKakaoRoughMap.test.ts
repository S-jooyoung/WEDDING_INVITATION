import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKakaoRoughMap } from "@/hooks/useKakaoRoughMap";
import { loadScript } from "@/lib/loadScript";
import type { KakaoMapEmbed } from "@/types/invitation";

/* 스크립트 로딩 자체는 loadScript.test.ts가 검증한다. 여기서는 그 결과에
   따라 훅이 어떤 상태와 동작을 내놓는지만 본다. */
vi.mock("@/lib/loadScript", () => ({
  loadScript: vi.fn(),
  resetScriptCache: vi.fn(),
}));

const loadScriptMock = vi.mocked(loadScript);

const EMBED: KakaoMapEmbed = { timestamp: "1652464367301", key: "2a8fe" };

const render = vi.fn();

/*
 * 훅이 `new Lander(...)`로 호출하므로 생성자로 쓸 수 있어야 한다.
 * 화살표 함수는 [[Construct]]가 없어 TypeError가 난다.
 */
const Lander = vi.fn(function LanderMock() {
  return { render };
});

/**
 * 스크립트가 성공적으로 로드되고 전역에 Lander가 준비된 상태를 만든다.
 *
 * 훅은 전역 설정을 spread로 병합하므로, 미리 심어 둔 Lander가 살아남는다.
 */
function givenScriptLoads(): void {
  window.daum = { roughmap: { Lander } };
  loadScriptMock.mockResolvedValue(undefined);
}

beforeEach(() => {
  loadScriptMock.mockReset();
  render.mockClear();
  Lander.mockClear();
});

afterEach(() => {
  Reflect.deleteProperty(window, "daum");
});

describe("useKakaoRoughMap", () => {
  it("임베드 값이 없으면 아무것도 로드하지 않는다", () => {
    const { result } = renderHook(() => useKakaoRoughMap(null));

    expect(result.current.status).toBe("idle");
    expect(result.current.containerProps).toBeNull();
    expect(loadScriptMock).not.toHaveBeenCalled();
  });

  it("컨테이너가 가져야 할 id와 클래스를 함께 돌려준다", () => {
    givenScriptLoads();
    const { result } = renderHook(() => useKakaoRoughMap(EMBED));

    /*
     * 카카오 스크립트가 이 규칙으로 요소를 찾는다. 호출부에 하드코딩하면
     * 벤더 연동을 바꿀 때 훅·컴포넌트·CSS를 동시에 고쳐야 한다.
     */
    expect(result.current.containerProps).toEqual({
      id: `daumRoughmapContainer${EMBED.timestamp}`,
      className: "root_daum_roughmap root_daum_roughmap_landing",
    });
  });

  it("프로토콜 설정에 슬래시를 붙이지 않는다", () => {
    givenScriptLoads();
    renderHook(() => useKakaoRoughMap(EMBED));

    /*
     * lander 스크립트가 이 값을 `"https:" === url_protocal`로 비교한다.
     * "https://"로 넘기면 비교가 실패해 응답의 http:// 링크를 https로 바꾸는
     * 처리가 통째로 건너뛰어지고, HTTPS 페이지에서 mixed content로 차단된다.
     * 그때도 render()는 성공하므로 실패 폴백조차 뜨지 않는다.
     */
    expect(window.daum?.roughmap?.url_protocal).toBe("https:");
  });

  it("스크립트가 로드되면 Lander를 직접 호출해 지도를 그린다", async () => {
    givenScriptLoads();
    const { result } = renderHook(() => useKakaoRoughMap(EMBED));

    await waitFor(() => expect(result.current.status).toBe("ready"));

    /* 문자열을 <script>로 주입해 실행하던 방식을 직접 호출로 바꿨다. */
    expect(Lander).toHaveBeenCalledWith(
      expect.objectContaining({ timestamp: EMBED.timestamp, key: EMBED.key }),
    );
    expect(render).toHaveBeenCalledTimes(1);
  });

  it("요청 높이를 CSS 상한과 같은 값으로 맞춘다", async () => {
    givenScriptLoads();
    const { result } = renderHook(() => useKakaoRoughMap(EMBED));

    await waitFor(() => expect(result.current.status).toBe("ready"));

    /* 240은 src/styles/index.css의 max-height와 같아야 한다. */
    expect(Lander).toHaveBeenCalledWith(
      expect.objectContaining({ mapHeight: "240" }),
    );
  });

  it("스크립트 로드에 실패하면 failed 상태를 알린다", async () => {
    loadScriptMock.mockRejectedValue(new Error("네트워크 실패"));
    const { result } = renderHook(() => useKakaoRoughMap(EMBED));

    /*
     * 기존 구현은 실패를 감지할 방법이 없어 지도 자리가 빈 칸으로 남았다.
     * 호출부가 이 상태를 보고 주소·길찾기 링크로 대체한다.
     */
    await waitFor(() => expect(result.current.status).toBe("failed"));
  });

  it("전역은 있지만 Lander가 없으면 실패로 처리한다", async () => {
    loadScriptMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useKakaoRoughMap(EMBED));

    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(render).not.toHaveBeenCalled();
  });
});
