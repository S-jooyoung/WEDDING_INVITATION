import { useEffect, useState } from "react";
import { loadScript } from "@/lib/loadScript";
import type { KakaoMapEmbed } from "@/types/invitation";

/** 카카오가 지정한 지도 퍼가기 배포 버전. 임베드 코드에 함께 발급된다. */
const ROUGHMAP_CDN = "16137cec";
const ROUGHMAP_SCRIPT = `https://t1.daumcdn.net/kakaomapweb/place/jscss/roughmap/${ROUGHMAP_CDN}/roughmapLander.js`;

export type MapStatus = "idle" | "loading" | "ready" | "failed";

/**
 * 임베드 컨테이너가 가져야 하는 속성.
 *
 * 카카오 스크립트는 정해진 id 규칙과 클래스명으로 요소를 찾는다. 이 계약을
 * 호출부에 하드코딩하면 벤더 연동을 바꿀 때 컴포넌트·훅·CSS 세 곳을 동시에
 * 고쳐야 하므로, 훅이 함께 넘겨준다.
 */
export interface MapContainerProps {
  readonly id: string;
  readonly className: string;
}

/** 임베드 높이. src/styles/index.css의 max-height와 같은 값이어야 한다. */
const MAP_HEIGHT = "240";
const MAP_WIDTH = "640";

/**
 * 카카오맵 지도 퍼가기 임베드를 렌더링한다.
 *
 * 기존 구현에서 세 가지를 고쳤다.
 *
 * 1. 문자열을 <script> 태그로 주입해 실행하던 것을 직접 호출로 바꿨다.
 *    기존에는 `new daum.roughmap.Lander({...}).render()` 를 텍스트 노드로
 *    만들어 document.body에 붙였다. eval과 다를 바 없고, 실행 실패를
 *    감지할 수도 없었다.
 *
 * 2. 실패를 상태로 표현한다. 기존에는 네트워크 오류 시 지도 자리가 그냥
 *    빈 칸으로 남아, 하객은 예식장 위치를 확인할 방법이 없었다.
 *    이제 호출부가 status를 보고 주소 텍스트로 대체할 수 있다.
 *
 * 3. 재마운트에서 복구된다. 기존의 중복 방지 가드는 window.daum.roughmap이
 *    존재하면 곧바로 return했는데, 전역 객체는 남아 있고 실제 지도는
 *    사라진 상태(재마운트)에서 지도가 영영 다시 그려지지 않았다.
 */
export function useKakaoRoughMap(embed: KakaoMapEmbed | null): {
  status: MapStatus;
  containerProps: MapContainerProps | null;
} {
  const [status, setStatus] = useState<MapStatus>(
    embed === null ? "idle" : "loading",
  );

  useEffect(() => {
    if (embed === null) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    /* 스크립트가 읽는 전역 설정. 로드 전에 준비돼 있어야 한다. */
    window.daum = window.daum ?? {};
    window.daum.roughmap = {
      ...window.daum.roughmap,
      cdn: ROUGHMAP_CDN,
      URL_KEY_DATA_LOAD_PRE: "https://t1.daumcdn.net/roughmap/",
      /*
       * 슬래시를 붙이지 않는다. lander 스크립트가 이 값을 두 곳에서 쓰는데,
       * 하나는 URL 문자열 연결이고 다른 하나는 `"https:" === url_protocal`
       * 동등 비교다. 비교가 실패하면 응답 페이로드의 http:// 링크를 https로
       * 바꾸는 처리가 통째로 건너뛰어져, HTTPS 페이지에서 mixed content로
       * 차단된다. 그때도 render()는 성공하므로 실패 폴백조차 뜨지 않는다.
       */
      url_protocal: "https:",
    };

    loadScript(ROUGHMAP_SCRIPT)
      .then(() => {
        /* 언마운트된 뒤 도착한 응답은 무시한다. */
        if (cancelled) return;

        const Lander = window.daum?.roughmap?.Lander;
        if (Lander === undefined) {
          throw new Error("카카오맵 Lander를 찾을 수 없습니다.");
        }

        new Lander({
          timestamp: embed.timestamp,
          key: embed.key,
          mapWidth: MAP_WIDTH,
          mapHeight: MAP_HEIGHT,
        }).render();

        setStatus("ready");
      })
      .catch((error: unknown) => {
        /* 실패 원인을 남긴다. 화면에는 대체 UI만 보이므로 로그가 유일한 단서다. */
        console.warn("카카오맵을 불러오지 못했습니다.", error);
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [embed]);

  const containerProps: MapContainerProps | null =
    embed === null
      ? null
      : {
          id: `daumRoughmapContainer${embed.timestamp}`,
          className: "root_daum_roughmap root_daum_roughmap_landing",
        };

  return { status, containerProps };
}
