import { useEffect, useState } from "react";
import { getDaysUntilCeremony } from "@/lib/ceremony";

/**
 * 예식까지 남은 일수. 계산이 끝나기 전에는 null이다.
 *
 * 값을 렌더 중에 구하지 않고 effect로 미루는 이유가 두 가지다.
 *
 *   1. 이 사이트는 정적 생성(SSG)이라 서버 렌더는 빌드 시점에 한 번만
 *      일어난다. 렌더 중에 new Date()를 읽으면 "D-30"이 HTML에 박제되어
 *      배포 이후 영원히 그 값으로 남는다.
 *   2. 서버가 계산한 값과 브라우저가 계산한 값이 다르면 hydration이 어긋난다.
 *      첫 렌더에서 null을 돌려 양쪽을 일치시키고, 마운트 후에 채운다.
 */
export function useDaysUntilCeremony(startsAt: string): number | null {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(getDaysUntilCeremony(startsAt, new Date()));
  }, [startsAt]);

  return days;
}
